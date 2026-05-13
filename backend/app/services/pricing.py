from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.discount_setting import DiscountSetting
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.pricing_tier import PricingTier
from app.models.product import Product
from app.models.wholesale_tier import WholesaleTier


def _apply_product_discount(price: float, product: Product) -> float:
    """Apply active product-level discount to a price."""
    if not product.discount:
        return price
    disc = product.discount
    now = datetime.now(timezone.utc)
    if disc.is_active and disc.start_time <= now <= disc.end_time:
        return price * (1 - disc.discount_percent / 100)
    return price


@dataclass
class PricingRule:
    price_type: str
    label: str
    rule_name: str
    discount_percent: float = 0.0
    use_wholesale_price: bool = False
    tier_id: Optional[int] = None


def get_customer_lifetime_spend(db: Session, user_id: int) -> float:
    return float(
        db.query(func.coalesce(func.sum(Order.total_amount), 0.0))
        .filter(Order.user_id == user_id, Order.status != "cancelled")
        .scalar()
        or 0.0
    )


def get_wholesale_tier_for_cart_total(db: Session, cart_total: float) -> Optional[WholesaleTier]:
    tiers = (
        db.query(WholesaleTier)
        .filter(WholesaleTier.is_active == True)
        .order_by(WholesaleTier.min_order_total.asc(), WholesaleTier.id.asc())
        .all()
    )
    for tier in tiers:
        min_ok = cart_total >= float(tier.min_order_total)
        max_ok = tier.max_order_total is None or cart_total <= float(tier.max_order_total)
        if min_ok and max_ok:
            return tier
    return None


def get_active_pricing_tiers(db: Session) -> list[PricingTier]:
    return (
        db.query(PricingTier)
        .filter(PricingTier.is_active == True)
        .order_by(PricingTier.min_total_spent.asc(), PricingTier.id.asc())
        .all()
    )


def _get_fallback_wholesale_rule(db: Session, effective_total: float) -> Optional[PricingRule]:
    setting = db.query(DiscountSetting).first()
    if not setting or effective_total < float(setting.wholesale_threshold or 0):
        return None
    threshold_display = int(setting.wholesale_threshold or 0)
    return PricingRule(
        price_type="wholesale",
        label="Giá sỉ mặc định",
        rule_name=f"Giá sỉ từ tổng mua {threshold_display:,.0f}đ".replace(",", "."),
        use_wholesale_price=True,
    )


def resolve_pricing_rule(db: Session, user_id: int, retail_total: float) -> PricingRule:
    lifetime_spend = get_customer_lifetime_spend(db, user_id)
    effective_total = lifetime_spend + retail_total

    # Check wholesale tier based on current cart total first
    wholesale_tier = get_wholesale_tier_for_cart_total(db, retail_total)
    if wholesale_tier:
        return PricingRule(
            price_type=f"wholesale_tier_{wholesale_tier.id}",
            label=wholesale_tier.name,
            rule_name=f"{wholesale_tier.name} (đơn {retail_total:,.0f}đ)".replace(",", "."),
            discount_percent=float(wholesale_tier.discount_percent or 0),
            use_wholesale_price=False,
        )

    best_tier: Optional[PricingTier] = None
    for tier in get_active_pricing_tiers(db):
        if effective_total >= float(tier.min_total_spent):
            best_tier = tier

    if best_tier:
        return PricingRule(
            price_type=f"tier_{best_tier.id}",
            label=best_tier.name,
            rule_name=best_tier.name,
            discount_percent=float(best_tier.discount_percent or 0),
            use_wholesale_price=bool(best_tier.use_wholesale_price),
            tier_id=best_tier.id,
        )

    fallback_rule = _get_fallback_wholesale_rule(db, effective_total)
    if fallback_rule:
        return fallback_rule

    return PricingRule(
        price_type="retail",
        label="Giá bán lẻ",
        rule_name="Giá bán lẻ",
    )


def calculate_order_total(db: Session, items: list, pricing_rule: Optional[PricingRule] = None, combo_map: Optional[dict[int, dict]] = None):
    total = 0.0
    line_items = []
    active_rule = pricing_rule or PricingRule(price_type="retail", label="Giá bán lẻ", rule_name="Giá bán lẻ")
    _combo_map = combo_map or {}

    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue

        retail_unit_price = float(product.retail_price)

        effective_retail = _apply_product_discount(retail_unit_price, product)

        combo_info = _combo_map.get(item.product_id)
        if combo_info:
            effective_retail = effective_retail * (1 - combo_info["discount_percent"] / 100)

        base_unit_price = effective_retail
        if active_rule.use_wholesale_price and product.wholesale_price:
            wholesale_base = _apply_product_discount(float(product.wholesale_price), product)
            if combo_info:
                wholesale_base = wholesale_base * (1 - combo_info["discount_percent"] / 100)
            base_unit_price = wholesale_base

        unit_price = base_unit_price
        if active_rule.discount_percent:
            unit_price = max(0.0, base_unit_price * (1 - (active_rule.discount_percent / 100)))

        unit_price = round(unit_price, 2)
        total += unit_price * item.quantity
        line_items.append(
            {
                "product": product,
                "quantity": item.quantity,
                "unit_price": unit_price,
                "retail_unit_price": retail_unit_price,
                "base_unit_price": base_unit_price,
                "combo_id": combo_info["combo_id"] if combo_info else None,
                "combo_discount_percent": combo_info["discount_percent"] if combo_info else None,
            }
        )

    return round(total, 2), line_items


def get_pricing_rule_display(db: Session, applied_price_type: str) -> tuple[str, str, float]:
    if applied_price_type == "retail":
        return "Giá bán lẻ", "Giá bán lẻ", 0.0
    if applied_price_type == "wholesale":
        fallback_rule = _get_fallback_wholesale_rule(db, float("inf"))
        if fallback_rule:
            return fallback_rule.label, fallback_rule.rule_name, fallback_rule.discount_percent
        return "Giá sỉ mặc định", "Giá sỉ mặc định", 0.0
    if applied_price_type.startswith("wholesale_tier_"):
        try:
            tier_id = int(applied_price_type.split("wholesale_tier_", 1)[1])
        except ValueError:
            return applied_price_type, applied_price_type, 0.0
        tier = db.query(WholesaleTier).filter(WholesaleTier.id == tier_id).first()
        if tier:
            return tier.name, tier.name, float(tier.discount_percent or 0)
    if applied_price_type.startswith("tier_"):
        try:
            tier_id = int(applied_price_type.split("_", 1)[1])
        except ValueError:
            return applied_price_type, applied_price_type, 0.0
        tier = db.query(PricingTier).filter(PricingTier.id == tier_id).first()
        if tier:
            return tier.name, tier.name, float(tier.discount_percent or 0)
    return applied_price_type, applied_price_type, 0.0


def enrich_order_pricing(db: Session, order: Order) -> Order:
    subtotal_before_discount = 0.0
    item_subtotal = 0.0
    for item in order.items:
        retail_unit_price = float(item.product.retail_price) if item.product else float(item.unit_price)
        subtotal_before_discount += retail_unit_price * item.quantity
        item_subtotal += float(item.unit_price) * item.quantity
        if item.combo:
            item.combo_name = item.combo.name

    subtotal_before_discount = round(subtotal_before_discount, 2)
    item_subtotal = round(item_subtotal, 2)
    shipping_fee = round(float(getattr(order, "shipping_fee", 0.0) or 0.0), 2)
    subtotal_after_discount = max(0.0, round(float(order.total_amount) - shipping_fee, 2))
    pricing_discount_amount = max(0.0, round(subtotal_before_discount - item_subtotal, 2))
    discount_code_amount = max(0.0, round(item_subtotal - subtotal_after_discount, 2))
    total_discount_amount = max(0.0, round(subtotal_before_discount - subtotal_after_discount, 2))
    pricing_label, pricing_rule_name, pricing_discount_percent = get_pricing_rule_display(db, order.applied_price_type)

    order.pricing_label = pricing_label
    order.pricing_rule_name = pricing_rule_name
    order.pricing_discount_percent = pricing_discount_percent
    order.subtotal_before_discount = subtotal_before_discount
    order.item_subtotal = item_subtotal
    order.pricing_discount_amount = pricing_discount_amount
    order.discount_code_amount = discount_code_amount
    order.total_discount_amount = total_discount_amount
    order.shipping_fee = shipping_fee
    order.subtotal_after_discount = subtotal_after_discount
    return order


def enrich_orders_pricing(db: Session, orders: Iterable[Order]) -> list[Order]:
    return [enrich_order_pricing(db, order) for order in orders]


def get_customer_pricing_status(db: Session, user_id: int):
    lifetime_spend = get_customer_lifetime_spend(db, user_id)
    tiers = get_active_pricing_tiers(db)
    current_tier = None
    next_tier = None

    for tier in tiers:
        if lifetime_spend >= float(tier.min_total_spent):
            current_tier = tier
        elif next_tier is None:
            next_tier = tier
            break

    setting = db.query(DiscountSetting).first()
    fallback_threshold = float(setting.wholesale_threshold or 0) if setting else 0.0

    return {
        "lifetime_spend": round(lifetime_spend, 2),
        "projected_spend": round(lifetime_spend, 2),
        "current_tier": current_tier,
        "next_tier": next_tier,
        "amount_to_next_tier": round(max(0.0, float(next_tier.min_total_spent) - lifetime_spend), 2) if next_tier else 0.0,
        "fallback_wholesale_threshold": fallback_threshold,
        "fallback_amount_to_wholesale": round(max(0.0, fallback_threshold - lifetime_spend), 2) if fallback_threshold else 0.0,
    }


def get_order_with_relations(db: Session, order_id: int) -> Optional[Order]:
    return (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.discount_code),
            joinedload(Order.items).joinedload(OrderItem.product).joinedload(Product.category),
            joinedload(Order.items).joinedload(OrderItem.product).joinedload(Product.brand),
            joinedload(Order.items).joinedload(OrderItem.combo),
        )
        .filter(Order.id == order_id)
        .first()
    )
