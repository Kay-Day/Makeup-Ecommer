from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_admin
from app.models.user import User
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.services.pricing import calculate_order_total, should_apply_wholesale
from app.schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderOut)
def create_order(data: OrderCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    # Step 1: Calculate retail total
    retail_total, retail_lines = calculate_order_total(db, data.items, use_wholesale=False)

    # Step 2: Check if wholesale should apply
    use_wholesale = should_apply_wholesale(db, retail_total)

    if use_wholesale:
        final_total, final_lines = calculate_order_total(db, data.items, use_wholesale=True)
        price_type = "wholesale"
    else:
        final_total, final_lines = retail_total, retail_lines
        price_type = "retail"

    # Step 3: Create order
    order = Order(user_id=user.id, total_amount=final_total, applied_price_type=price_type)
    db.add(order)
    db.flush()

    for line in final_lines:
        item = OrderItem(
            order_id=order.id,
            product_id=line["product"].id,
            quantity=line["quantity"],
            unit_price=line["unit_price"],
        )
        db.add(item)

    db.commit()
    db.refresh(order)
    return order

@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role == "admin":
        return db.query(Order).order_by(Order.created_at.desc()).all()
    return db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if user.role != "admin" and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return order
