from collections import defaultdict
from datetime import datetime
import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_db, require_admin
from app.core.security import get_password_hash
from app.models.blog_article import BlogArticle
from app.models.blog_category import BlogCategory
from app.models.brand import Brand
from app.models.category import Category
from app.models.discount_code import DiscountCode
from app.models.discount_setting import DiscountSetting
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.pricing_tier import PricingTier
from app.models.product import Product
from app.models.user import User
from app.models.banner import Banner
from app.models.product_image import ProductImage
from app.models.product_discount import ProductDiscount
from app.models.combo import Combo
from app.models.combo_item import ComboItem
from app.models.wholesale_tier import WholesaleTier
from app.models.sepay_webhook_log import SePayWebhookLog
from app.services.notifications import create_notification
from app.services.pricing import enrich_order_pricing, enrich_orders_pricing, get_pricing_rule_display
from app.utils.slug import normalize_slug
from app.schemas import (
    BannerCreate,
    BannerOut,
    BannerUpdate,
    BlogArticleCreate,
    BlogArticleOut,
    BlogArticleUpdate,
    BlogCategoryCreate,
    BlogCategoryOut,
    BlogCategoryUpdate,
    BrandCreate,
    BrandOut,
    BrandUpdate,
    CategoryCreate,
    CategoryOut,
    CategoryUpdate,
    DiscountCodeCreate,
    DiscountCodeOut,
    DiscountCodeUpdate,
    DiscountSettingOut,
    DiscountSettingUpdate,
    OrderAdminUpdate,
    OrderOut,
    PricingTierCreate,
    PricingTierOut,
    PricingTierUpdate,
    ProductCreate,
    ProductDiscountCreate,
    ProductDiscountOut,
    ProductDiscountUpdate,
    ProductImageCreate,
    ProductImageOut,
    ProductImageReorder,
    ProductOut,
    ProductUpdate,
    SePayWebhookLogOut,
    UserAdminCreate,
    UserAdminUpdate,
    UserOut,
    ComboCreate,
    ComboOut,
    ComboUpdate,
    ComboItemCreate,
    ComboItemUpdate,
    ComboItemOut,
    WholesaleTierCreate,
    WholesaleTierOut,
    WholesaleTierUpdate,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


STATUS_LABELS = {
    "pending": "Chờ xác nhận",
    "confirmed": "Đã xác nhận",
    "shipped": "Đang giao",
    "delivered": "Đã giao",
    "cancelled": "Đã huỷ",
}


def validate_discount_type(discount_type: str) -> None:
    if discount_type not in {"percent", "fixed_amount"}:
        raise HTTPException(status_code=400, detail="discount_type must be percent or fixed_amount")


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar()
    total_users = db.query(User).filter(User.role == "customer").count()
    wholesale_threshold = db.query(DiscountSetting.wholesale_threshold).scalar() or 0
    default_shipping_fee = db.query(DiscountSetting.default_shipping_fee).scalar() or 30000
    pricing_tiers = db.query(PricingTier).order_by(PricingTier.min_total_spent.asc(), PricingTier.id.asc()).all()
    wholesale_tiers = db.query(WholesaleTier).order_by(WholesaleTier.min_order_total.asc(), WholesaleTier.id.asc()).all()

    orders = (
        db.query(Order)
        .options(joinedload(Order.user), joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.items).joinedload(OrderItem.combo))
        .order_by(Order.created_at.desc())
        .all()
    )
    month_map = defaultdict(float)
    status_map = defaultdict(int)
    price_mode_map = defaultdict(lambda: {"count": 0, "revenue": 0.0})
    for order in orders:
        if order.created_at:
            month_key = order.created_at.strftime("%Y-%m")
            month_map[month_key] += order.total_amount
        status_map[order.status] += 1
        label, _, _ = get_pricing_rule_display(db, order.applied_price_type)
        price_mode_map[label]["count"] += 1
        price_mode_map[label]["revenue"] += float(order.total_amount)

    recent_orders = enrich_orders_pricing(db, orders[:8])

    top_products_raw = (
        db.query(
            Product.id,
            Product.name,
            func.coalesce(func.sum(OrderItem.quantity), 0).label("units_sold"),
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.unit_price), 0).label("revenue"),
        )
        .outerjoin(OrderItem, OrderItem.product_id == Product.id)
        .group_by(Product.id)
        .order_by(func.coalesce(func.sum(OrderItem.quantity), 0).desc(), Product.name.asc())
        .limit(5)
        .all()
    )

    return {
        "summary": {
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_users": total_users,
            "wholesale_threshold": wholesale_threshold,
            "default_shipping_fee": default_shipping_fee,
        },
        "revenue_by_month": [
            {"label": label, "value": value}
            for label, value in sorted(month_map.items())
        ],
        "orders_by_status": [
            {"status": status, "count": count}
            for status, count in sorted(status_map.items())
        ],
        "price_modes": [
            {"label": label, "count": data["count"], "revenue": round(data["revenue"], 2)}
            for label, data in sorted(price_mode_map.items(), key=lambda item: item[1]["revenue"], reverse=True)
        ],
        "pricing_tiers": [
            {
                "id": tier.id,
                "name": tier.name,
                "min_total_spent": float(tier.min_total_spent),
                "discount_percent": float(tier.discount_percent or 0),
                "use_wholesale_price": bool(tier.use_wholesale_price),
                "is_active": bool(tier.is_active),
                "note": tier.note,
            }
            for tier in pricing_tiers
        ],
        "wholesale_tiers": [
            {
                "id": wt.id,
                "name": wt.name,
                "min_order_total": float(wt.min_order_total),
                "max_order_total": float(wt.max_order_total) if wt.max_order_total else None,
                "discount_percent": float(wt.discount_percent or 0),
                "is_active": bool(wt.is_active),
                "note": wt.note,
            }
            for wt in wholesale_tiers
        ],
        "recent_orders": recent_orders,
        "top_products": [
            {
                "id": row.id,
                "name": row.name,
                "units_sold": int(row.units_sold or 0),
                "revenue": float(row.revenue or 0),
            }
            for row in top_products_raw
        ],
        "generated_at": datetime.utcnow().isoformat(),
        "requested_by": admin.email,
    }


@router.get("/discount-settings", response_model=DiscountSettingOut)
def get_discount_settings(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    setting = db.query(DiscountSetting).first()
    if not setting:
        raise HTTPException(status_code=404, detail="No discount settings found")
    setting.pricing_tiers = db.query(PricingTier).order_by(PricingTier.min_total_spent.asc(), PricingTier.id.asc()).all()
    setting.wholesale_tiers = db.query(WholesaleTier).order_by(WholesaleTier.min_order_total.asc(), WholesaleTier.id.asc()).all()
    return setting


@router.put("/discount-settings", response_model=DiscountSettingOut)
def update_discount_settings(
    data: DiscountSettingUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    setting = db.query(DiscountSetting).first()
    if not setting:
        setting = DiscountSetting(
            wholesale_threshold=data.wholesale_threshold,
            default_shipping_fee=data.default_shipping_fee,
            updated_by=admin.id,
        )
        db.add(setting)
    else:
        setting.wholesale_threshold = data.wholesale_threshold
        setting.default_shipping_fee = data.default_shipping_fee
        setting.updated_by = admin.id
    if not setting.default_shipping_fee:
        setting.default_shipping_fee = data.default_shipping_fee
    db.commit()
    db.refresh(setting)
    setting.pricing_tiers = db.query(PricingTier).order_by(PricingTier.min_total_spent.asc(), PricingTier.id.asc()).all()
    setting.wholesale_tiers = db.query(WholesaleTier).order_by(WholesaleTier.min_order_total.asc(), WholesaleTier.id.asc()).all()
    return setting


def validate_pricing_tier_payload(name: str, min_total_spent: float, discount_percent: float) -> None:
    if not name.strip():
        raise HTTPException(status_code=400, detail="Tier name is required")
    if min_total_spent < 0:
        raise HTTPException(status_code=400, detail="min_total_spent must be >= 0")
    if discount_percent < 0 or discount_percent > 100:
        raise HTTPException(status_code=400, detail="discount_percent must be between 0 and 100")


@router.get("/pricing-tiers", response_model=list[PricingTierOut])
def list_pricing_tiers(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(PricingTier).order_by(PricingTier.min_total_spent.asc(), PricingTier.id.asc()).all()


@router.post("/pricing-tiers", response_model=PricingTierOut)
def create_pricing_tier(
    data: PricingTierCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    validate_pricing_tier_payload(data.name, data.min_total_spent, data.discount_percent)
    tier = PricingTier(**data.model_dump())
    db.add(tier)
    db.commit()
    db.refresh(tier)
    return tier


@router.put("/pricing-tiers/{tier_id}", response_model=PricingTierOut)
def update_pricing_tier(
    tier_id: int,
    data: PricingTierUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    tier = db.query(PricingTier).filter(PricingTier.id == tier_id).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Pricing tier not found")
    updates = data.model_dump(exclude_unset=True)
    validate_pricing_tier_payload(
        updates.get("name", tier.name),
        float(updates.get("min_total_spent", tier.min_total_spent)),
        float(updates.get("discount_percent", tier.discount_percent)),
    )
    for key, value in updates.items():
        setattr(tier, key, value)
    db.commit()
    db.refresh(tier)
    return tier


@router.delete("/pricing-tiers/{tier_id}")
def delete_pricing_tier(
    tier_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    tier = db.query(PricingTier).filter(PricingTier.id == tier_id).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Pricing tier not found")
    db.delete(tier)
    db.commit()
    return {"detail": "Pricing tier deleted"}


def validate_wholesale_tier_payload(name: str, min_order_total: float, max_order_total: float | None, discount_percent: float) -> None:
    if not name.strip():
        raise HTTPException(status_code=400, detail="Tier name is required")
    if min_order_total < 0:
        raise HTTPException(status_code=400, detail="min_order_total must be >= 0")
    if max_order_total is not None and max_order_total <= min_order_total:
        raise HTTPException(status_code=400, detail="max_order_total must be greater than min_order_total")
    if discount_percent < 0 or discount_percent > 100:
        raise HTTPException(status_code=400, detail="discount_percent must be between 0 and 100")


@router.get("/wholesale-tiers", response_model=list[WholesaleTierOut])
def list_wholesale_tiers(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(WholesaleTier).order_by(WholesaleTier.min_order_total.asc(), WholesaleTier.id.asc()).all()


@router.post("/wholesale-tiers", response_model=WholesaleTierOut)
def create_wholesale_tier(
    data: WholesaleTierCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    validate_wholesale_tier_payload(data.name, data.min_order_total, data.max_order_total, data.discount_percent)
    tier = WholesaleTier(**data.model_dump())
    db.add(tier)
    db.commit()
    db.refresh(tier)
    return tier


@router.put("/wholesale-tiers/{tier_id}", response_model=WholesaleTierOut)
def update_wholesale_tier(
    tier_id: int,
    data: WholesaleTierUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    tier = db.query(WholesaleTier).filter(WholesaleTier.id == tier_id).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Wholesale tier not found")
    updates = data.model_dump(exclude_unset=True)
    min_order = float(updates.get("min_order_total", tier.min_order_total))
    max_order = updates.get("max_order_total", tier.max_order_total)
    if max_order is not None:
        max_order = float(max_order)
    validate_wholesale_tier_payload(
        updates.get("name", tier.name),
        min_order,
        max_order,
        float(updates.get("discount_percent", tier.discount_percent)),
    )
    for key, value in updates.items():
        setattr(tier, key, value)
    db.commit()
    db.refresh(tier)
    return tier


@router.delete("/wholesale-tiers/{tier_id}")
def delete_wholesale_tier(
    tier_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    tier = db.query(WholesaleTier).filter(WholesaleTier.id == tier_id).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Wholesale tier not found")
    db.delete(tier)
    db.commit()
    return {"detail": "Wholesale tier deleted"}


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserOut)
def create_user(data: UserAdminCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=data.role,
        is_active=data.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: UserAdminUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = data.model_dump(exclude_unset=True)
    if "email" in updates:
        existing = db.query(User).filter(User.email == updates["email"], User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
    if "password" in updates:
        user.hashed_password = get_password_hash(updates.pop("password"))
    for key, value in updates.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete the current admin account")
    db.delete(user)
    db.commit()
    return {"detail": "User deleted"}


@router.get("/brands", response_model=list[BrandOut])
def list_admin_brands(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(Brand).order_by(Brand.name.asc()).all()


@router.post("/brands", response_model=BrandOut)
def create_brand(data: BrandCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    brand = Brand(**data.model_dump())
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@router.put("/brands/{brand_id}", response_model=BrandOut)
def update_brand(
    brand_id: int,
    data: BrandUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(brand, key, value)
    db.commit()
    db.refresh(brand)
    return brand


@router.delete("/brands/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    db.delete(brand)
    db.commit()
    return {"detail": "Brand deleted"}


@router.get("/categories", response_model=list[CategoryOut])
def list_admin_categories(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(Category).order_by(Category.parent_id.isnot(None), Category.name.asc()).all()


@router.post("/categories", response_model=CategoryOut)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    slug = normalize_slug(data.slug or data.name)
    existing = db.query(Category).filter(Category.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    if data.parent_id:
        parent = db.query(Category).filter(Category.id == data.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
    category = Category(name=data.name, slug=slug, image_url=data.image_url, parent_id=data.parent_id)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    updates = data.model_dump(exclude_unset=True)
    if "slug" in updates:
        updates["slug"] = normalize_slug(updates["slug"] or category.name)
        existing = db.query(Category).filter(Category.slug == updates["slug"], Category.id != category_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Category slug already exists")
    if updates.get("parent_id"):
        if updates["parent_id"] == category_id:
            raise HTTPException(status_code=400, detail="Category cannot be its own parent")
        parent = db.query(Category).filter(Category.id == updates["parent_id"]).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
    for key, value in updates.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"detail": "Category deleted"}


@router.get("/products", response_model=list[ProductOut])
def list_admin_products(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return (
        db.query(Product)
        .options(joinedload(Product.category), joinedload(Product.brand), joinedload(Product.discount))
        .order_by(Product.id.desc())
        .all()
    )


@router.post("/products", response_model=ProductOut)
def create_admin_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return (
        db.query(Product)
        .options(joinedload(Product.category), joinedload(Product.brand), joinedload(Product.discount))
        .filter(Product.id == product.id)
        .first()
    )


@router.put("/products/{product_id}", response_model=ProductOut)
def update_admin_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return (
        db.query(Product)
        .options(joinedload(Product.category), joinedload(Product.brand), joinedload(Product.discount))
        .filter(Product.id == product.id)
        .first()
    )


@router.delete("/products/{product_id}")
def delete_admin_product(product_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"detail": "Product deleted"}


@router.get("/orders", response_model=list[OrderOut])
def list_admin_orders(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.discount_code),
            joinedload(Order.items).joinedload(OrderItem.product).joinedload(Product.category),
            joinedload(Order.items).joinedload(OrderItem.product).joinedload(Product.brand),
            joinedload(Order.items).joinedload(OrderItem.combo),
        )
        .order_by(Order.created_at.desc())
        .all()
    )
    return enrich_orders_pricing(db, orders)


@router.get("/sepay-webhook-logs", response_model=list[SePayWebhookLogOut])
def list_sepay_webhook_logs(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return (
        db.query(SePayWebhookLog)
        .order_by(SePayWebhookLog.created_at.desc(), SePayWebhookLog.id.desc())
        .limit(100)
        .all()
    )


@router.put("/orders/{order_id}", response_model=OrderOut)
def update_admin_order(
    order_id: int,
    data: OrderAdminUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    previous_status = order.status

    # Handle tracking number update
    if data.tracking_number is not None:
        order.tracking_number = data.tracking_number.strip() or None

    # Handle status change
    if data.status is not None and data.status != previous_status:
        if previous_status != "cancelled" and data.status == "cancelled":
            for item in order.items:
                if item.product:
                    item.product.stock += item.quantity
        elif previous_status == "cancelled" and data.status != "cancelled":
            for item in order.items:
                if item.product and item.product.stock < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Không đủ tồn kho để khôi phục đơn #{order.id} cho sản phẩm {item.product.name}",
                    )
            for item in order.items:
                if item.product:
                    item.product.stock -= item.quantity

        order.status = data.status
        create_notification(
            db,
            user_id=order.user_id,
            title="Đơn hàng được cập nhật",
            message=(
                f"Đơn hàng #{order.id} đã chuyển từ {STATUS_LABELS.get(previous_status, previous_status)} "
                f"sang {STATUS_LABELS.get(data.status, data.status)}."
            ),
            link=f"/account?order={order.id}",
        )

    db.commit()
    refreshed_order = (
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
    return enrich_order_pricing(db, refreshed_order)


@router.delete("/orders/{order_id}")
def delete_admin_order(order_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "cancelled":
        for item in order.items:
            if item.product:
                item.product.stock += item.quantity
    create_notification(
        db,
        user_id=order.user_id,
        title="Đơn hàng đã bị xoá",
        message=f"Đơn hàng #{order.id} đã được admin xoá khỏi hệ thống.",
        link="/account",
    )
    db.delete(order)
    db.commit()
    return {"detail": "Order deleted"}


@router.get("/reports/orders.csv")
def export_orders_report(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.discount_code),
            joinedload(Order.items).joinedload(OrderItem.product).joinedload(Product.brand),
        )
        .order_by(Order.created_at.desc())
        .all()
    )
    orders = enrich_orders_pricing(db, orders)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "order_id",
            "created_at",
            "customer",
            "status",
            "pricing_label",
            "subtotal_before_discount",
            "pricing_discount_amount",
            "discount_code_amount",
            "shipping_fee",
            "total_amount",
            "payment_method",
            "payment_status",
            "payment_code",
            "paid_at",
            "sepay_transaction_id",
            "shipping_full_name",
            "shipping_phone",
            "shipping_address",
            "shipping_city",
            "shipping_postal_code",
            "item_count",
            "products",
        ]
    )

    for order in orders:
        products = "; ".join(
            f"{item.product.name if item.product else f'Product #{item.product_id}'} x{item.quantity}"
            for item in order.items
        )
        writer.writerow(
            [
                order.id,
                order.created_at.isoformat() if order.created_at else "",
                order.user.full_name if order.user else "",
                order.status,
                getattr(order, "pricing_label", ""),
                getattr(order, "subtotal_before_discount", 0),
                getattr(order, "pricing_discount_amount", 0),
                getattr(order, "discount_code_amount", 0),
                getattr(order, "shipping_fee", 0),
                order.total_amount,
                order.payment_method,
                getattr(order, "payment_status", ""),
                getattr(order, "payment_code", ""),
                order.paid_at.isoformat() if getattr(order, "paid_at", None) else "",
                getattr(order, "sepay_transaction_id", ""),
                order.shipping_full_name,
                order.shipping_phone,
                order.shipping_address,
                order.shipping_city,
                order.shipping_postal_code,
                sum(item.quantity for item in order.items),
                products,
            ]
        )

    buffer.seek(0)
    filename = f"orders-report-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/discount-codes", response_model=list[DiscountCodeOut])
def list_discount_codes(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(DiscountCode).order_by(DiscountCode.created_at.desc()).all()


@router.post("/discount-codes", response_model=DiscountCodeOut)
def create_discount_code(
    data: DiscountCodeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    validate_discount_type(data.discount_type)
    existing = db.query(DiscountCode).filter(DiscountCode.code == data.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Discount code already exists")
    code = DiscountCode(
        code=data.code.upper(),
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        min_order_amount=data.min_order_amount,
        max_usage=data.max_usage,
        expires_at=data.expires_at,
        is_active=data.is_active,
    )
    db.add(code)
    db.commit()
    db.refresh(code)
    return code


@router.put("/discount-codes/{discount_code_id}", response_model=DiscountCodeOut)
def update_discount_code(
    discount_code_id: int,
    data: DiscountCodeUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    code = db.query(DiscountCode).filter(DiscountCode.id == discount_code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Discount code not found")
    updates = data.model_dump(exclude_unset=True)
    if "discount_type" in updates:
        validate_discount_type(updates["discount_type"])
    if "code" in updates:
        updates["code"] = updates["code"].upper()
        existing = (
            db.query(DiscountCode)
            .filter(DiscountCode.code == updates["code"], DiscountCode.id != discount_code_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Discount code already exists")
    for key, value in updates.items():
        setattr(code, key, value)
    db.commit()
    db.refresh(code)
    return code


@router.delete("/discount-codes/{discount_code_id}")
def delete_discount_code(
    discount_code_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    code = db.query(DiscountCode).filter(DiscountCode.id == discount_code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Discount code not found")
    db.delete(code)
    db.commit()
    return {"detail": "Discount code deleted"}


@router.get("/blog-categories", response_model=list[BlogCategoryOut])
def list_admin_blog_categories(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(BlogCategory).order_by(BlogCategory.name.asc()).all()


@router.post("/blog-categories", response_model=BlogCategoryOut)
def create_blog_category(
    data: BlogCategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    slug = normalize_slug(data.slug or data.name)
    existing = db.query(BlogCategory).filter(BlogCategory.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Blog category slug already exists")
    category = BlogCategory(name=data.name, slug=slug, description=data.description)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/blog-categories/{category_id}", response_model=BlogCategoryOut)
def update_blog_category(
    category_id: int,
    data: BlogCategoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    category = db.query(BlogCategory).filter(BlogCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Blog category not found")
    updates = data.model_dump(exclude_unset=True)
    if "slug" in updates:
        updates["slug"] = normalize_slug(updates["slug"] or category.name)
        existing = (
            db.query(BlogCategory)
            .filter(BlogCategory.slug == updates["slug"], BlogCategory.id != category_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Blog category slug already exists")
    for key, value in updates.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/blog-categories/{category_id}")
def delete_blog_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    category = db.query(BlogCategory).filter(BlogCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Blog category not found")
    db.delete(category)
    db.commit()
    return {"detail": "Blog category deleted"}


@router.get("/blog-articles", response_model=list[BlogArticleOut])
def list_admin_blog_articles(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return (
        db.query(BlogArticle)
        .options(joinedload(BlogArticle.author), joinedload(BlogArticle.category))
        .order_by(BlogArticle.created_at.desc())
        .all()
    )


@router.post("/blog-articles", response_model=BlogArticleOut)
def create_blog_article(
    data: BlogArticleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    slug = normalize_slug(data.slug or data.title)
    existing = db.query(BlogArticle).filter(BlogArticle.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Blog article slug already exists")
    article = BlogArticle(
        title=data.title,
        slug=slug,
        content=data.content,
        image_url=data.image_url,
        focus_keyword=data.focus_keyword,
        seo_title=data.seo_title,
        seo_description=data.seo_description,
        canonical_url=data.canonical_url,
        og_image_url=data.og_image_url,
        author_id=admin.id,
        category_id=data.category_id,
        is_published=data.is_published,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return (
        db.query(BlogArticle)
        .options(joinedload(BlogArticle.author), joinedload(BlogArticle.category))
        .filter(BlogArticle.id == article.id)
        .first()
    )


@router.put("/blog-articles/{article_id}", response_model=BlogArticleOut)
def update_blog_article(
    article_id: int,
    data: BlogArticleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    article = db.query(BlogArticle).filter(BlogArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Blog article not found")
    updates = data.model_dump(exclude_unset=True)
    if "slug" in updates:
        updates["slug"] = normalize_slug(updates["slug"] or article.title)
        existing = (
            db.query(BlogArticle)
            .filter(BlogArticle.slug == updates["slug"], BlogArticle.id != article_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Blog article slug already exists")
    for key, value in updates.items():
        setattr(article, key, value)
    db.commit()
    db.refresh(article)
    return (
        db.query(BlogArticle)
        .options(joinedload(BlogArticle.author), joinedload(BlogArticle.category))
        .filter(BlogArticle.id == article.id)
        .first()
    )


@router.delete("/blog-articles/{article_id}")
def delete_blog_article(
    article_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    article = db.query(BlogArticle).filter(BlogArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Blog article not found")
    db.delete(article)
    db.commit()
    return {"detail": "Blog article deleted"}


# --- Banners ---

@router.get("/banners", response_model=list[BannerOut])
def list_admin_banners(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(Banner).order_by(Banner.sort_order.asc(), Banner.id.asc()).all()


@router.post("/banners", response_model=BannerOut)
def create_banner(data: BannerCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    banner = Banner(**data.model_dump())
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner


@router.put("/banners/{banner_id}", response_model=BannerOut)
def update_banner(
    banner_id: int,
    data: BannerUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(banner, key, value)
    db.commit()
    db.refresh(banner)
    return banner


@router.delete("/banners/{banner_id}")
def delete_banner(banner_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    db.delete(banner)
    db.commit()
    return {"detail": "Banner deleted"}


# --- Product Images Admin ---

@router.post("/products/{product_id}/images", response_model=ProductImageOut)
def admin_add_product_image(
    product_id: int,
    data: ProductImageCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    image = ProductImage(product_id=product_id, image_url=data.image_url, sort_order=data.sort_order)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.delete("/products/{product_id}/images/{image_id}")
def admin_delete_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    image = (
        db.query(ProductImage)
        .filter(ProductImage.id == image_id, ProductImage.product_id == product_id)
        .first()
    )
    if not image:
        raise HTTPException(status_code=404, detail="Product image not found")
    db.delete(image)
    db.commit()
    return {"detail": "Product image deleted"}


@router.put("/products/{product_id}/images/reorder")
def admin_reorder_product_images(
    product_id: int,
    data: ProductImageReorder,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    images = (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id)
        .all()
    )
    for image in images:
        if image.id in data.image_ids:
            image.sort_order = data.image_ids.index(image.id)
    db.commit()
    return {"detail": "Images reordered"}


# --- Product Discounts Admin ---

@router.get("/product-discounts", response_model=list[ProductDiscountOut])
def list_product_discounts(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    from sqlalchemy.orm import joinedload
    return (
        db.query(ProductDiscount)
        .options(joinedload(ProductDiscount.product))
        .order_by(ProductDiscount.created_at.desc())
        .all()
    )


@router.post("/products/{product_id}/discount", response_model=ProductDiscountOut)
def create_product_discount(
    product_id: int,
    data: ProductDiscountCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if data.discount_percent <= 0 or data.discount_percent > 100:
        raise HTTPException(status_code=400, detail="Discount percent must be between 1 and 100")
    if data.start_time >= data.end_time:
        raise HTTPException(status_code=400, detail="start_time must be before end_time")

    existing = db.query(ProductDiscount).filter(ProductDiscount.product_id == product_id).first()
    if existing:
        existing.discount_percent = data.discount_percent
        existing.start_time = data.start_time
        existing.end_time = data.end_time
        existing.is_active = data.is_active
        db.commit()
        db.refresh(existing)
        return existing

    discount = ProductDiscount(product_id=product_id, **data.model_dump())
    db.add(discount)
    db.commit()
    db.refresh(discount)
    return discount


@router.put("/products/{product_id}/discount", response_model=ProductDiscountOut)
def update_product_discount(
    product_id: int,
    data: ProductDiscountUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    discount = db.query(ProductDiscount).filter(ProductDiscount.product_id == product_id).first()
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found for this product")
    updates = data.model_dump(exclude_unset=True)
    if "discount_percent" in updates and (updates["discount_percent"] <= 0 or updates["discount_percent"] > 100):
        raise HTTPException(status_code=400, detail="Discount percent must be between 1 and 100")
    if "start_time" in updates and "end_time" in updates:
        st = updates["start_time"] or discount.start_time
        et = updates["end_time"] or discount.end_time
        if st >= et:
            raise HTTPException(status_code=400, detail="start_time must be before end_time")
    elif "start_time" in updates:
        if updates["start_time"] >= discount.end_time:
            raise HTTPException(status_code=400, detail="start_time must be before end_time")
    elif "end_time" in updates:
        if discount.start_time >= updates["end_time"]:
            raise HTTPException(status_code=400, detail="start_time must be before end_time")
    for key, value in updates.items():
        setattr(discount, key, value)
    db.commit()
    db.refresh(discount)
    return discount


@router.delete("/products/{product_id}/discount")
def delete_product_discount(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    discount = db.query(ProductDiscount).filter(ProductDiscount.product_id == product_id).first()
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found for this product")
    db.delete(discount)
    db.commit()
    return {"detail": "Product discount deleted"}


# --- Combos Admin ---

def _admin_enrich_combo(combo: Combo) -> dict:
    original = 0.0
    for item in combo.items:
        if item.product:
            price = item.product.retail_price
            if item.product.discount:
                disc = item.product.discount
                now = datetime.now(disc.start_time.tzinfo) if disc.start_time and disc.start_time.tzinfo else datetime.now()
                if disc.is_active and disc.start_time <= now <= disc.end_time:
                    price = price * (1 - disc.discount_percent / 100)
            original += price * item.quantity
    discounted = original * (1 - combo.discount_percent / 100)
    return {
        "id": combo.id,
        "name": combo.name,
        "description": combo.description,
        "image_url": combo.image_url,
        "discount_percent": combo.discount_percent,
        "is_active": combo.is_active,
        "created_at": combo.created_at,
        "items": combo.items,
        "original_price": round(original, 2),
        "discounted_price": round(discounted, 2),
    }


@router.get("/combos", response_model=list[ComboOut])
def list_admin_combos(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    combos = (
        db.query(Combo)
        .options(joinedload(Combo.items).joinedload(ComboItem.product))
        .order_by(Combo.created_at.desc())
        .all()
    )
    return [_admin_enrich_combo(c) for c in combos]


@router.post("/combos", response_model=ComboOut)
def create_combo(
    data: ComboCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if data.discount_percent < 0 or data.discount_percent > 100:
        raise HTTPException(status_code=400, detail="Discount percent must be between 0 and 100")
    combo = Combo(
        name=data.name,
        description=data.description,
        image_url=data.image_url,
        discount_percent=data.discount_percent,
        is_active=data.is_active,
    )
    db.add(combo)
    db.flush()
    for item_data in data.items:
        db.add(ComboItem(combo_id=combo.id, product_id=item_data.product_id, quantity=item_data.quantity))
    db.commit()
    db.refresh(combo)
    combo = (
        db.query(Combo)
        .options(joinedload(Combo.items).joinedload(ComboItem.product))
        .filter(Combo.id == combo.id)
        .first()
    )
    return _admin_enrich_combo(combo)


@router.put("/combos/{combo_id}", response_model=ComboOut)
def update_combo(
    combo_id: int,
    data: ComboUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    combo = db.query(Combo).filter(Combo.id == combo_id).first()
    if not combo:
        raise HTTPException(status_code=404, detail="Combo not found")
    updates = data.model_dump(exclude_unset=True)
    if "discount_percent" in updates:
        dp = updates["discount_percent"]
        if dp < 0 or dp > 100:
            raise HTTPException(status_code=400, detail="Discount percent must be between 0 and 100")
    for key, value in updates.items():
        setattr(combo, key, value)
    db.commit()
    db.refresh(combo)
    combo = (
        db.query(Combo)
        .options(joinedload(Combo.items).joinedload(ComboItem.product))
        .filter(Combo.id == combo.id)
        .first()
    )
    return _admin_enrich_combo(combo)


@router.delete("/combos/{combo_id}")
def delete_combo(
    combo_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    combo = db.query(Combo).filter(Combo.id == combo_id).first()
    if not combo:
        raise HTTPException(status_code=404, detail="Combo not found")
    db.delete(combo)
    db.commit()
    return {"detail": "Combo deleted"}


# --- Combo Items Admin ---

@router.post("/combos/{combo_id}/items", response_model=ComboItemOut)
def add_combo_item(
    combo_id: int,
    data: ComboItemCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    combo = db.query(Combo).filter(Combo.id == combo_id).first()
    if not combo:
        raise HTTPException(status_code=404, detail="Combo not found")
    item = ComboItem(combo_id=combo_id, product_id=data.product_id, quantity=data.quantity)
    db.add(item)
    db.commit()
    db.refresh(item)
    item = (
        db.query(ComboItem)
        .options(joinedload(ComboItem.product))
        .filter(ComboItem.id == item.id)
        .first()
    )
    return item


@router.put("/combos/{combo_id}/items/{item_id}", response_model=ComboItemOut)
def update_combo_item(
    combo_id: int,
    item_id: int,
    data: ComboItemUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = db.query(ComboItem).filter(ComboItem.id == item_id, ComboItem.combo_id == combo_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Combo item not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    item = (
        db.query(ComboItem)
        .options(joinedload(ComboItem.product))
        .filter(ComboItem.id == item.id)
        .first()
    )
    return item


@router.delete("/combos/{combo_id}/items/{item_id}")
def delete_combo_item(
    combo_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = db.query(ComboItem).filter(ComboItem.id == item_id, ComboItem.combo_id == combo_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Combo item not found")
    db.delete(item)
    db.commit()
    return {"detail": "Combo item deleted"}
