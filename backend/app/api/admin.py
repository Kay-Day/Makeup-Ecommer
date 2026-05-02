from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.deps import get_db, require_admin
from app.models.user import User
from app.models.discount_setting import DiscountSetting
from app.models.product import Product
from app.models.order import Order
from app.schemas import DiscountSettingOut, DiscountSettingUpdate

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/discount-settings", response_model=DiscountSettingOut)
def get_discount_settings(db: Session = Depends(get_db), admin=Depends(require_admin)):
    setting = db.query(DiscountSetting).first()
    if not setting:
        raise HTTPException(status_code=404, detail="No discount settings found")
    return setting

@router.put("/discount-settings", response_model=DiscountSettingOut)
def update_discount_settings(data: DiscountSettingUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    setting = db.query(DiscountSetting).first()
    if not setting:
        setting = DiscountSetting(wholesale_threshold=data.wholesale_threshold, updated_by=admin.id)
        db.add(setting)
    else:
        setting.wholesale_threshold = data.wholesale_threshold
        setting.updated_by = admin.id
    db.commit()
    db.refresh(setting)
    return setting

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), admin=Depends(require_admin)):
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar()
    total_users = db.query(User).filter(User.role == "customer").count()
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_users": total_users,
    }
