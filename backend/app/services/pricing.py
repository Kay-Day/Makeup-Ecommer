from sqlalchemy.orm import Session
from app.models.discount_setting import DiscountSetting
from app.models.product import Product

def calculate_order_total(db: Session, items: list, use_wholesale: bool = False):
    """Calculate order total. If use_wholesale, apply wholesale prices."""
    total = 0.0
    line_items = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue
        if use_wholesale and product.wholesale_price:
            price = product.wholesale_price
        else:
            price = product.retail_price
        total += price * item.quantity
        line_items.append({"product": product, "quantity": item.quantity, "unit_price": price})
    return total, line_items

def should_apply_wholesale(db: Session, retail_total: float) -> bool:
    """Check if the retail total exceeds the wholesale threshold."""
    setting = db.query(DiscountSetting).first()
    if not setting:
        return False
    return retail_total >= setting.wholesale_threshold
