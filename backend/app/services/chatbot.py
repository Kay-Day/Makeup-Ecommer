from __future__ import annotations

from datetime import datetime, timezone
import re
from typing import Iterable

from openai import OpenAI
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.models.brand import Brand
from app.models.category import Category
from app.models.chatbot_api_key import ChatbotApiKey
from app.models.product import Product
from app.models.user import User
from app.services.pricing import get_customer_pricing_status


def mask_api_key(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 10:
        return "*" * len(value)
    return f"{value[:6]}{'*' * max(4, len(value) - 10)}{value[-4:]}"


def serialize_chatbot_key(key: ChatbotApiKey) -> dict:
    return {
        "id": key.id,
        "name": key.name,
        "provider": key.provider,
        "masked_key": mask_api_key(key.api_key),
        "base_url": key.base_url,
        "model": key.model,
        "reasoning_effort": key.reasoning_effort,
        "is_active": key.is_active,
        "note": key.note,
        "last_used_at": key.last_used_at,
        "last_error": key.last_error,
        "failure_count": key.failure_count,
        "created_at": key.created_at,
        "updated_at": key.updated_at,
    }


def ensure_default_chatbot_key(db: Session) -> None:
    if db.query(ChatbotApiKey).first():
        return
    if not settings.DEEPSEEK_API_KEY:
        return
    db.add(
        ChatbotApiKey(
            name="DeepSeek Primary",
            provider="deepseek",
            api_key=settings.DEEPSEEK_API_KEY,
            base_url=settings.DEEPSEEK_BASE_URL,
            model=settings.DEEPSEEK_DEFAULT_MODEL,
            reasoning_effort="max",
            is_active=True,
            note="Auto imported from environment variable.",
        )
    )
    db.commit()


def get_active_chatbot_keys(db: Session) -> list[ChatbotApiKey]:
    return (
        db.query(ChatbotApiKey)
        .filter(ChatbotApiKey.is_active == True)
        .order_by(ChatbotApiKey.last_used_at.asc().nullsfirst(), ChatbotApiKey.id.asc())
        .all()
    )


def _tokenize(text: str) -> list[str]:
    return [part for part in re.split(r"[^a-zA-Z0-9À-ỹ]+", text.lower()) if len(part) >= 2]


def find_relevant_products(db: Session, question: str, limit: int = 8) -> list[Product]:
    products = (
        db.query(Product)
        .options(joinedload(Product.category), joinedload(Product.brand))
        .filter(Product.is_active == True)
        .all()
    )
    keywords = _tokenize(question)
    if not keywords:
        return products[:limit]

    scored: list[tuple[int, Product]] = []
    for product in products:
        haystack = " ".join(
            filter(
                None,
                [
                    product.name,
                    product.description or "",
                    product.badge or "",
                    product.category.name if product.category else "",
                    product.brand.name if product.brand else "",
                ],
            )
        ).lower()
        score = 0
        for keyword in keywords:
            if keyword in haystack:
                score += 2 if keyword in product.name.lower() else 1
        if score > 0:
            scored.append((score, product))

    if not scored:
        return products[:limit]

    scored.sort(key=lambda item: (-item[0], item[1].retail_price))
    return [product for _, product in scored[:limit]]


def build_product_context(products: Iterable[Product]) -> str:
    lines = []
    for product in products:
        wholesale = f", giá sỉ {int(product.wholesale_price):,}đ".replace(",", ".") if product.wholesale_price else ""
        lines.append(
            f"- #{product.id} | {product.name} | hãng {product.brand.name if product.brand else 'N/A'} | "
            f"danh mục {product.category.name if product.category else 'N/A'} | "
            f"giá lẻ {int(product.retail_price):,}đ{wholesale} | tồn kho {product.stock}"
        .replace(",", "."))
    return "\n".join(lines)


def build_category_context(db: Session) -> str:
    categories = db.query(Category).order_by(Category.name.asc()).all()
    if not categories:
        return "Chưa có danh mục nào."
    return "\n".join(f"- {category.name}" for category in categories)

def build_system_prompt(db: Session, products: list[Product], current_user: User | None, pricing_status: dict | None) -> str:
    pricing_note = ""
    if current_user and pricing_status:
        current_tier = pricing_status.get("current_tier")
        next_tier = pricing_status.get("next_tier")
        pricing_note = (
            f"\nThông tin khách hàng hiện tại: {current_user.full_name}, tổng mua tích luỹ {int(pricing_status['lifetime_spend']):,}đ."
            f"\nMốc hiện tại: {current_tier.name if current_tier else 'chưa có'}."
            f"\nMốc tiếp theo: {next_tier.name if next_tier else 'không có'}, cần thêm {int(pricing_status['amount_to_next_tier']):,}đ."
        ).replace(",", ".")

    return (
        "Bạn là chatbot tư vấn sản phẩm cao cấp cho TMC Medical E-Commerce."
        "\nNhiệm vụ:"
        "\n- Tư vấn sản phẩm mỹ phẩm/chăm sóc da phù hợp nhu cầu khách hàng."
        "\n- Chỉ được giới thiệu sản phẩm có trong dữ liệu được cung cấp."
        "\n- Khi nhắc đến giá, luôn nói rõ giá lẻ, giá sỉ hoặc mốc ưu đãi nếu có."
        "\n- Ưu tiên trả lời bằng tiếng Việt tự nhiên, lịch sự, ngắn gọn nhưng thuyết phục."
        "\n- Nếu khách hỏi sản phẩm cho bệnh lý hoặc vấn đề y khoa nghiêm trọng, phải khuyên tham khảo bác sĩ/chuyên gia."
        "\n- Nếu có thể, hãy đề xuất tối đa 3 sản phẩm kèm lý do phù hợp."
        f"{pricing_note}"
        "\nDanh mục hiện có trong database:\n"
        f"{build_category_context(db)}"
        "\nDữ liệu sản phẩm hiện có:\n"
        f"{build_product_context(products)}"
    )


def build_fallback_reply(products: list[Product], pricing_status: dict | None = None) -> str:
    if not products:
        return "Mình chưa tìm thấy sản phẩm phù hợp ngay lúc này. Bạn có thể nói rõ hơn về nhu cầu da, mức giá hoặc loại sản phẩm cần tìm để mình tư vấn sát hơn."

    lines = ["Mình gợi ý bạn một vài lựa chọn phù hợp đang có trong hệ thống:"]
    for product in products[:3]:
        brand = product.brand.name if product.brand else "Thương hiệu khác"
        lines.append(
            f"- {product.name} của {brand}: giá lẻ {int(product.retail_price):,}đ".replace(",", ".")
            + (f", giá sỉ {int(product.wholesale_price):,}đ" if product.wholesale_price else "")
        )
    if pricing_status and pricing_status.get("next_tier"):
        lines.append(
            f"Bạn cần thêm {int(pricing_status['amount_to_next_tier']):,}đ để đạt mốc {pricing_status['next_tier'].name}."
            .replace(",", ".")
        )
    lines.append("Nếu bạn muốn, mình có thể tiếp tục lọc theo da dầu, da nhạy cảm, chống lão hoá hoặc ngân sách cụ thể hơn.")
    return "\n".join(lines)


def sanitize_chatbot_reply(reply: str) -> str:
    cleaned = reply.replace("**", "").replace("__", "")
    cleaned = re.sub(r"(?m)^[ \t]*\*[ \t]+", "- ", cleaned)
    cleaned = cleaned.replace("*", "")
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def call_chatbot_model(
    db: Session,
    *,
    messages: list[dict],
    current_user: User | None = None,
):
    last_user_message = next((item["content"] for item in reversed(messages) if item["role"] == "user"), "")
    products = find_relevant_products(db, last_user_message)
    pricing_status = get_customer_pricing_status(db, current_user.id) if current_user else None

    active_keys = get_active_chatbot_keys(db)
    if not active_keys:
        raise RuntimeError("Chưa có API key DeepSeek nào đang hoạt động.")

    system_prompt = build_system_prompt(db, products, current_user, pricing_status)
    request_messages = [{"role": "system", "content": system_prompt}, *messages[-12:]]

    last_error = None
    for key in active_keys:
        client = OpenAI(api_key=key.api_key, base_url=key.base_url)
        try:
            response = client.chat.completions.create(
                model=key.model or settings.DEEPSEEK_DEFAULT_MODEL,
                messages=request_messages,
                stream=False,
                reasoning_effort=key.reasoning_effort or "max",
                extra_body={"thinking": {"type": "enabled"}},
            )
            key.last_used_at = datetime.now(timezone.utc)
            key.last_error = None
            key.failure_count = 0
            db.commit()

            message = response.choices[0].message
            reply = (message.content or "").strip()
            if not reply:
                reply = build_fallback_reply(products, pricing_status)
            reply = sanitize_chatbot_reply(reply)
            return {
                "reply": reply,
                "used_model": key.model or settings.DEEPSEEK_DEFAULT_MODEL,
                "used_key_name": key.name,
                "product_suggestions": [
                    {
                        "id": product.id,
                        "name": product.name,
                        "brand_name": product.brand.name if product.brand else None,
                        "category_name": product.category.name if product.category else None,
                        "retail_price": product.retail_price,
                        "wholesale_price": product.wholesale_price,
                        "image_url": product.image_url,
                    }
                    for product in products[:3]
                ],
            }
        except Exception as exc:  # noqa: BLE001
            key.failure_count = int(key.failure_count or 0) + 1
            key.last_error = str(exc)[:500]
            key.last_used_at = datetime.now(timezone.utc)
            db.commit()
            last_error = exc
            continue

    raise RuntimeError(f"Chatbot không thể gọi DeepSeek với các key hiện có. Lỗi cuối: {last_error}")
