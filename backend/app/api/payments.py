import hashlib
import hmac
import json
import re
import time
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.models.order import Order
from app.models.payment import Payment
from app.models.sepay_webhook_log import SePayWebhookLog
from app.models.user import User
from app.schemas import SePayPaymentStatusOut, SePayWebhookResponse
from app.services.notifications import create_notification, notify_admins
from app.services.sepay import make_qr_url

router = APIRouter(prefix="/payments", tags=["Payments"])


def _extract_payment_code(payload: dict) -> str | None:
    direct_code = str(payload.get("code") or "").strip().upper()
    if direct_code:
        return direct_code

    prefix = (settings.SEPAY_PAYMENT_PREFIX or "TMC").upper()
    pattern = re.compile(rf"\b{re.escape(prefix)}\d{{6,}}\b", re.IGNORECASE)
    for field in ("content", "description"):
        value = str(payload.get(field) or "")
        match = pattern.search(value)
        if match:
            return match.group(0).upper()
    return None


def _is_order_payment_expired(order: Order) -> bool:
    if order.payment_status != "pending" or not order.created_at:
        return False
    created_at = order.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    deadline = created_at + timedelta(seconds=settings.SEPAY_PAYMENT_TIMEOUT_SECONDS)
    return datetime.now(timezone.utc) > deadline


def _mark_order_payment_expired(db: Session, order: Order) -> None:
    order.payment_status = "expired"
    payment = db.query(Payment).filter(Payment.order_id == order.id, Payment.payment_method == "sepay").first()
    if payment and payment.status == "pending":
        payment.status = "expired"


def _verify_hmac(raw_body: bytes, signature: str | None, timestamp: str | None) -> None:
    if not settings.SEPAY_WEBHOOK_SECRET:
        print("SePay webhook rejected: missing SEPAY_WEBHOOK_SECRET")
        raise HTTPException(status_code=500, detail="SePay webhook secret is not configured")
    if not signature or not timestamp:
        print("SePay webhook rejected: missing HMAC headers")
        raise HTTPException(status_code=401, detail="Missing SePay signature")

    try:
        ts = int(timestamp)
    except ValueError as exc:
        print(f"SePay webhook rejected: invalid timestamp {timestamp!r}")
        raise HTTPException(status_code=401, detail="Invalid SePay timestamp") from exc

    clock_drift = abs(int(time.time()) - ts)
    if clock_drift > 300:
        print(f"SePay webhook rejected: request expired, clock drift {clock_drift}s")
        raise HTTPException(status_code=401, detail="SePay request expired")

    expected = "sha256=" + hmac.new(
        settings.SEPAY_WEBHOOK_SECRET.encode("utf-8"),
        str(ts).encode("utf-8") + b"." + raw_body,
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, signature):
        print("SePay webhook rejected: invalid signature")
        raise HTTPException(status_code=401, detail="Invalid SePay signature")


def _verify_api_key(authorization: str | None) -> None:
    expected = settings.SEPAY_WEBHOOK_API_KEY
    if not expected:
        print("SePay webhook rejected: missing SEPAY_WEBHOOK_API_KEY")
        raise HTTPException(status_code=500, detail="SePay webhook API key is not configured")
    if not authorization or not authorization.startswith("Apikey "):
        print("SePay webhook rejected: missing API key header")
        raise HTTPException(status_code=401, detail="Missing SePay API key")
    if not hmac.compare_digest(authorization[7:], expected):
        print("SePay webhook rejected: invalid API key")
        raise HTTPException(status_code=401, detail="Invalid SePay API key")


def _verify_webhook_auth(
    raw_body: bytes,
    authorization: str | None,
    signature: str | None,
    timestamp: str | None,
) -> None:
    mode = (settings.SEPAY_WEBHOOK_AUTH_MODE or "hmac").lower()
    if mode == "none":
        return
    if mode == "apikey":
        _verify_api_key(authorization)
        return
    _verify_hmac(raw_body, signature, timestamp)


def _log_webhook(db: Session, payload: dict, raw_payload: str, status: str, message: str | None = None) -> SePayWebhookLog | None:
    transaction_id = str(payload.get("id") or "")
    if not transaction_id:
        return None

    log = SePayWebhookLog(
        transaction_id=transaction_id,
        payment_code=_extract_payment_code(payload),
        transfer_amount=int(payload.get("transferAmount") or 0),
        transfer_type=payload.get("transferType"),
        account_number=payload.get("accountNumber"),
        reference_code=payload.get("referenceCode"),
        status=status,
        message=message,
        raw_payload=raw_payload,
    )
    db.add(log)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        return None
    return log


@router.get("/sepay/orders/{order_id}", response_model=SePayPaymentStatusOut)
def get_sepay_payment_status(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if user.role != "admin" and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if _is_order_payment_expired(order):
        _mark_order_payment_expired(db, order)
        db.commit()
        db.refresh(order)

    return {
        "order_id": order.id,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "payment_code": order.payment_code,
        "total_amount": order.total_amount,
        "qr_url": make_qr_url(order.total_amount, order.payment_code or "") if order.payment_code else None,
        "bank_name": settings.SEPAY_BANK_NAME or None,
        "bank_account": settings.SEPAY_BANK_ACCOUNT or None,
        "account_name": settings.SEPAY_ACCOUNT_NAME or None,
        "paid_at": order.paid_at,
    }


@router.post("/sepay/webhook", response_model=SePayWebhookResponse)
async def sepay_webhook(
    request: Request,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
    x_sepay_signature: str | None = Header(default=None),
    x_sepay_timestamp: str | None = Header(default=None),
):
    raw_body = await request.body()
    _verify_webhook_auth(raw_body, authorization, x_sepay_signature, x_sepay_timestamp)

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON payload") from exc

    transaction_id = str(payload.get("id") or "")
    if not transaction_id:
        raise HTTPException(status_code=400, detail="Missing SePay transaction ID")

    raw_payload = raw_body.decode("utf-8")
    existing_log = db.query(SePayWebhookLog).filter(SePayWebhookLog.transaction_id == transaction_id).first()
    if existing_log:
        return {"success": True}

    code = _extract_payment_code(payload)
    transfer_type = payload.get("transferType")
    transfer_amount = int(payload.get("transferAmount") or 0)
    account_number = str(payload.get("accountNumber") or "")

    if transfer_type != "in":
        _log_webhook(db, payload, raw_payload, "ignored", "Not an incoming transfer")
        db.commit()
        return {"success": True}

    if settings.SEPAY_BANK_ACCOUNT and account_number != settings.SEPAY_BANK_ACCOUNT:
        _log_webhook(db, payload, raw_payload, "rejected", "Bank account does not match")
        db.commit()
        return {"success": True}

    if not code:
        _log_webhook(db, payload, raw_payload, "ignored", "Missing payment code")
        db.commit()
        return {"success": True}

    order = db.query(Order).filter(Order.payment_code == code).first()
    if not order:
        _log_webhook(db, payload, raw_payload, "unmatched", "No order matched payment code")
        db.commit()
        return {"success": True}

    if _is_order_payment_expired(order):
        _log_webhook(db, payload, raw_payload, "expired", "Payment window expired")
        _mark_order_payment_expired(db, order)
        db.commit()
        return {"success": True}

    expected_amount = int(round(order.total_amount))
    if transfer_amount != expected_amount:
        _log_webhook(db, payload, raw_payload, "rejected", f"Amount mismatch: expected {expected_amount}")
        db.commit()
        return {"success": True}

    _log_webhook(db, payload, raw_payload, "processed", "Order marked as paid")
    order.payment_status = "paid"
    order.sepay_transaction_id = transaction_id
    order.paid_at = datetime.now(timezone.utc)
    if order.status == "pending":
        order.status = "confirmed"

    payment = db.query(Payment).filter(Payment.order_id == order.id, Payment.payment_method == "sepay").first()
    if payment:
        payment.status = "completed"
        payment.transaction_id = transaction_id

    create_notification(
        db,
        user_id=order.user_id,
        title="Thanh toán SePay thành công",
        message=f"Đơn hàng #{order.id} đã được thanh toán {order.total_amount:,.0f}đ qua SePay.".replace(",", "."),
        link=f"/account?order={order.id}",
    )
    notify_admins(
        db,
        title="Đơn hàng đã thanh toán SePay",
        message=f"Đơn hàng #{order.id} đã nhận thanh toán SePay {order.total_amount:,.0f}đ.".replace(",", "."),
        link="/admin",
    )

    db.commit()
    return {"success": True}
