from datetime import datetime, timezone
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.deps import get_db, get_current_user
from app.models.discount_setting import DiscountSetting
from app.models.user import User
from app.models.discount_code import DiscountCode
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.payment import Payment
from app.models.product import Product
from app.models.combo import Combo
from app.models.combo_item import ComboItem
from app.services.notifications import create_notification, notify_admins
from app.services.pricing import (
    calculate_order_total,
    enrich_order_pricing,
    enrich_orders_pricing,
    get_customer_pricing_status,
    get_order_with_relations,
    resolve_pricing_rule,
)
from app.schemas import CheckoutSettingsOut, CustomerPricingStatusOut, OrderCreate, OrderOut, OrderQuoteCreate, OrderQuoteOut
from app.services.sepay import make_payment_code

router = APIRouter(prefix="/orders", tags=["Orders"])


STATUS_LABELS = {
    "pending": "Chờ xác nhận",
    "confirmed": "Đã xác nhận",
    "shipped": "Đang giao",
    "delivered": "Đã giao",
    "cancelled": "Đã huỷ",
}


def get_default_shipping_fee(db: Session) -> float:
    setting = db.query(DiscountSetting).first()
    return round(float(setting.default_shipping_fee or 30000), 2) if setting else 30000.0


def build_combo_map(db: Session, items: list) -> dict[int, dict]:
    combo_map: dict[int, dict] = {}
    for item in items:
        if item.combo_id:
            combo = db.query(Combo).filter(Combo.id == item.combo_id, Combo.is_active == True).first()
            if not combo:
                raise HTTPException(status_code=400, detail=f"Combo {item.combo_id} not found or inactive")
            combo_item = db.query(ComboItem).filter(
                ComboItem.combo_id == item.combo_id,
                ComboItem.product_id == item.product_id
            ).first()
            if not combo_item:
                raise HTTPException(status_code=400, detail=f"Product {item.product_id} does not belong to combo {item.combo_id}")
            combo_map[item.product_id] = {"combo_id": combo.id, "discount_percent": combo.discount_percent}
    return combo_map


def validate_order_items(db: Session, items: list) -> None:
    requested: dict[tuple[int, str | None], dict] = {}
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {product.name} is not available")
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
        available_stock = product.stock
        normalized_variant_code = item.variant_code.strip() if item.variant_code else None
        if item.variant_code and product.variant_options:
            try:
                variants = json.loads(product.variant_options)
            except (TypeError, ValueError):
                variants = []
            variant = next(
                (
                    option for option in variants
                    if str(option.get("code") or option.get("sku") or option.get("name") or "").strip().lower()
                    == item.variant_code.strip().lower()
                ),
                None,
            )
            if not variant:
                raise HTTPException(status_code=400, detail=f"Mã sản phẩm '{item.variant_code}' không tồn tại")
            available_stock = int(variant.get("stock") or 0)
            normalized_variant_code = str(variant.get("code") or variant.get("sku") or variant.get("name") or item.variant_code).strip()
        if available_stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Sản phẩm '{product.name}' không đủ tồn kho (còn {available_stock} sản phẩm, bạn đặt {item.quantity})")
        key = (product.id, normalized_variant_code)
        current = requested.setdefault(
            key,
            {"quantity": 0, "available_stock": available_stock, "name": product.name},
        )
        current["quantity"] += item.quantity
        if current["quantity"] > current["available_stock"]:
            variant_label = f" mã {normalized_variant_code}" if normalized_variant_code else ""
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Sản phẩm '{product.name}'{variant_label} không đủ tồn kho "
                    f"(còn {current['available_stock']} sản phẩm, bạn đặt {current['quantity']})"
                ),
            )


def decrement_variant_stock(product: Product, variant_code: str | None, quantity: int) -> None:
    if not variant_code or not product.variant_options:
        return
    try:
        variants = json.loads(product.variant_options)
    except (TypeError, ValueError):
        return
    if not isinstance(variants, list):
        return
    normalized = variant_code.strip().lower()
    changed = False
    for variant in variants:
        code = str(variant.get("code") or variant.get("sku") or variant.get("name") or "").strip().lower()
        if code == normalized:
            variant["stock"] = max(0, int(variant.get("stock") or 0) - quantity)
            changed = True
            break
    if changed:
        product.variant_options = json.dumps(variants, ensure_ascii=False)


def calculate_checkout_quote(db: Session, user: User, items: list, discount_code_value: str | None = None) -> dict:
    combo_map = build_combo_map(db, items)
    validate_order_items(db, items)

    retail_total, _ = calculate_order_total(db, items, combo_map=combo_map)
    pricing_rule = resolve_pricing_rule(db, user.id, retail_total)
    final_total, final_lines = calculate_order_total(db, items, pricing_rule, combo_map=combo_map)

    discount_code = None
    item_subtotal = round(sum(line["unit_price"] * line["quantity"] for line in final_lines), 2)
    discount_code_amount = 0.0
    if discount_code_value:
        discount_code = (
            db.query(DiscountCode)
            .filter(DiscountCode.code == discount_code_value.upper(), DiscountCode.is_active == True)
            .first()
        )
        if not discount_code:
            raise HTTPException(status_code=400, detail="Discount code is invalid")
        if discount_code.expires_at and discount_code.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Discount code has expired")
        if discount_code.max_usage is not None and discount_code.current_usage >= discount_code.max_usage:
            raise HTTPException(status_code=400, detail="Discount code usage limit reached")
        if final_total < discount_code.min_order_amount:
            raise HTTPException(status_code=400, detail="Order does not meet minimum amount for this code")

        if discount_code.discount_type == "percent":
            discount_code_amount = final_total * discount_code.discount_value / 100
        else:
            discount_code_amount = discount_code.discount_value
        final_total = max(0, round(final_total - discount_code_amount, 2))
        discount_code_amount = round(item_subtotal - final_total, 2)

    shipping_fee = get_default_shipping_fee(db)
    order_total = round(final_total + shipping_fee, 2)
    pricing_discount_amount = round(max(0.0, retail_total - item_subtotal), 2)

    return {
        "retail_total": retail_total,
        "pricing_rule": pricing_rule,
        "final_lines": final_lines,
        "discount_code": discount_code,
        "item_subtotal": item_subtotal,
        "discount_code_amount": discount_code_amount,
        "shipping_fee": shipping_fee,
        "order_total": order_total,
        "subtotal_after_discount": final_total,
        "pricing_discount_amount": pricing_discount_amount,
    }


def serialize_checkout_quote(quote: dict) -> dict:
    pricing_rule = quote["pricing_rule"]
    subtotal_after_discount = quote["subtotal_after_discount"]
    total_discount_amount = round(max(0.0, quote["retail_total"] - subtotal_after_discount), 2)
    return {
        "total_amount": quote["order_total"],
        "applied_price_type": pricing_rule.price_type,
        "pricing_label": pricing_rule.label,
        "pricing_rule_name": pricing_rule.rule_name,
        "pricing_discount_percent": pricing_rule.discount_percent,
        "subtotal_before_discount": quote["retail_total"],
        "item_subtotal": quote["item_subtotal"],
        "pricing_discount_amount": quote["pricing_discount_amount"],
        "discount_code_amount": quote["discount_code_amount"],
        "total_discount_amount": total_discount_amount,
        "shipping_fee": quote["shipping_fee"],
        "subtotal_after_discount": subtotal_after_discount,
        "items": [
            {
                "product_id": line["product"].id,
                "variant_code": line.get("variant_code"),
                "variant_name": line.get("variant_name"),
                "quantity": line["quantity"],
                "unit_price": line["unit_price"],
                "line_total": round(line["unit_price"] * line["quantity"], 2),
                "retail_unit_price": line["retail_unit_price"],
                "base_unit_price": round(line["base_unit_price"], 2),
                "combo_id": line.get("combo_id"),
                "combo_discount_percent": line.get("combo_discount_percent"),
            }
            for line in quote["final_lines"]
        ],
    }


@router.get("/checkout-settings", response_model=CheckoutSettingsOut)
def get_checkout_settings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return {
        "default_shipping_fee": get_default_shipping_fee(db),
        "payment_methods": ["cod", "sepay"],
    }


@router.post("/quote", response_model=OrderQuoteOut)
def quote_order(data: OrderQuoteCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not data.items:
        raise HTTPException(status_code=400, detail="Đơn hàng phải có ít nhất một sản phẩm")
    quote = calculate_checkout_quote(db, user, data.items, data.discount_code)
    return serialize_checkout_quote(quote)


@router.post("", response_model=OrderOut)
def create_order(data: OrderCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not data.items:
        raise HTTPException(status_code=400, detail="Đơn hàng phải có ít nhất một sản phẩm")
    if data.payment_method not in {"cod", "sepay"}:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ thanh toán COD hoặc SePay")
    if not data.shipping_full_name.strip():
        raise HTTPException(status_code=400, detail="Vui lòng nhập họ tên người nhận")
    if not data.shipping_phone.strip():
        raise HTTPException(status_code=400, detail="Vui lòng nhập số điện thoại người nhận")
    if not data.shipping_address.strip():
        raise HTTPException(status_code=400, detail="Vui lòng nhập địa chỉ giao hàng")
    if not data.shipping_city.strip():
        raise HTTPException(status_code=400, detail="Vui lòng nhập tỉnh/thành phố")

    quote = calculate_checkout_quote(db, user, data.items, data.discount_code)
    pricing_rule = quote["pricing_rule"]
    final_lines = quote["final_lines"]
    price_type = pricing_rule.price_type
    discount_code = quote["discount_code"]
    item_subtotal = quote["item_subtotal"]
    discount_code_amount = quote["discount_code_amount"]
    shipping_fee = quote["shipping_fee"]
    order_total = quote["order_total"]

    order = Order(
        user_id=user.id,
        total_amount=order_total,
        applied_price_type=price_type,
        discount_code_id=discount_code.id if discount_code else None,
        payment_method=data.payment_method,
        payment_status="pending",
        shipping_fee=shipping_fee,
        shipping_full_name=data.shipping_full_name.strip(),
        shipping_phone=data.shipping_phone.strip(),
        shipping_address=data.shipping_address.strip(),
        shipping_city=data.shipping_city.strip(),
        shipping_postal_code=(data.shipping_postal_code or "").strip() or None,
    )
    db.add(order)
    db.flush()
    if data.payment_method == "sepay":
        order.payment_code = make_payment_code(order.id)
        db.add(
            Payment(
                order_id=order.id,
                payment_method="sepay",
                amount=order_total,
                status="pending",
            )
        )

    for line in final_lines:
        line["product"].stock -= line["quantity"]
        decrement_variant_stock(line["product"], line.get("variant_code"), line["quantity"])
        item = OrderItem(
            order_id=order.id,
            product_id=line["product"].id,
            quantity=line["quantity"],
            unit_price=line["unit_price"],
            variant_code=line.get("variant_code"),
            variant_name=line.get("variant_name"),
            combo_id=line.get("combo_id"),
            combo_discount_percent=line.get("combo_discount_percent"),
        )
        db.add(item)

    if discount_code:
        discount_code.current_usage += 1

    pricing_savings = quote["pricing_discount_amount"]
    status_label = STATUS_LABELS.get(order.status, order.status)
    create_notification(
        db,
        user_id=user.id,
        title="Đơn hàng đã được tạo",
        message=(
            f"Đơn hàng #{order.id} đã tạo thành công. Trạng thái hiện tại: {status_label}. "
            f"Hình thức thanh toán: {'SePay QR' if data.payment_method == 'sepay' else 'Thanh toán khi nhận hàng'}. "
            f"Giá áp dụng: {pricing_rule.label}. "
            f"Phí vận chuyển: {shipping_fee:,.0f}đ. "
            f"Tiết kiệm từ chính sách giá: {pricing_savings:,.0f}đ. "
            f"Giảm thêm từ mã giảm giá: {discount_code_amount:,.0f}đ."
        ).replace(",", "."),
        link=f"/account?order={order.id}",
    )
    notify_admins(
        db,
        title="Có đơn hàng mới",
        message=(
            f"Khách hàng {user.full_name} vừa tạo đơn hàng #{order.id} "
            f"({pricing_rule.label}) với tổng tiền {order_total:,.0f}đ, "
            f"thanh toán {'SePay QR' if data.payment_method == 'sepay' else 'COD'} tại {data.shipping_city.strip()}."
        ).replace(",", "."),
        link="/admin",
    )

    db.commit()
    saved_order = get_order_with_relations(db, order.id)
    if not saved_order:
        raise HTTPException(status_code=404, detail="Order not found after creation")
    return enrich_order_pricing(db, saved_order)


@router.get("/pricing-status", response_model=CustomerPricingStatusOut)
def get_my_pricing_status(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_customer_pricing_status(db, user.id)

@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role == "admin":
        orders = (
            db.query(Order)
            .options(
                joinedload(Order.user),
                joinedload(Order.discount_code),
                joinedload(Order.items).joinedload(OrderItem.product),
                joinedload(Order.items).joinedload(OrderItem.combo),
            )
            .order_by(Order.created_at.desc())
            .all()
        )
        return enrich_orders_pricing(db, orders)
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.discount_code),
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.items).joinedload(OrderItem.combo),
        )
        .filter(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return enrich_orders_pricing(db, orders)

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = get_order_with_relations(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if user.role != "admin" and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return enrich_order_pricing(db, order)


@router.put("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending orders can be cancelled")

    for item in order.items:
        if item.product:
            item.product.stock += item.quantity

    order.status = "cancelled"
    status_label = STATUS_LABELS.get(order.status, order.status)
    create_notification(
        db,
        user_id=user.id,
        title="Đơn hàng đã huỷ",
        message=f"Bạn đã huỷ đơn hàng #{order.id}. Trạng thái hiện tại: {status_label}.",
        link=f"/account?order={order.id}",
    )
    notify_admins(
        db,
        title="Khách hàng huỷ đơn",
        message=f"Khách hàng {user.full_name} đã huỷ đơn hàng #{order.id}.",
        link="/admin",
    )
    db.commit()
    saved_order = get_order_with_relations(db, order.id)
    if not saved_order:
        raise HTTPException(status_code=404, detail="Order not found after cancellation")
    return enrich_order_pricing(db, saved_order)
