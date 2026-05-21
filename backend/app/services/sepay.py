from urllib.parse import urlencode

from app.core.config import settings


def make_payment_code(order_id: int) -> str:
    prefix = (settings.SEPAY_PAYMENT_PREFIX or "TMC").upper()
    return f"{prefix}{order_id:06d}"


def make_qr_url(amount: float, payment_code: str) -> str | None:
    if not settings.SEPAY_BANK_ACCOUNT or not settings.SEPAY_BANK_NAME:
        return None

    query = urlencode(
        {
            "acc": settings.SEPAY_BANK_ACCOUNT,
            "bank": settings.SEPAY_BANK_NAME,
            "amount": int(round(amount)),
            "des": payment_code,
        }
    )
    return f"https://qr.sepay.vn/img?{query}"
