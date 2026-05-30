from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from typing import Optional
from datetime import datetime
from app.core.deps import get_db, require_admin, get_current_user
from app.models.product import Product
from app.models.category import Category
from app.models.user import User
from app.models.product_review import ProductReview
from app.models.product_image import ProductImage
from app.models.product_discount import ProductDiscount
from app.models.wholesale_tier import WholesaleTier
from app.schemas import ProductOut, ProductCreate, ProductUpdate, ReviewCreate, ReviewOut, ProductImageOut, WholesaleTierOut

router = APIRouter(prefix="/products", tags=["Products"])

def apply_product_filters(q, db: Session, category_id=None, brand_id=None, search=None, min_price=None, max_price=None, badge=None, sale: bool | None = None):
    if category_id:
        child_ids = [row.id for row in db.query(Category.id).filter(Category.parent_id == category_id).all()]
        q = q.filter(Product.category_id.in_([category_id, *child_ids]))
    if brand_id:
        q = q.filter(Product.brand_id == brand_id)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))
    if min_price is not None:
        q = q.filter(Product.retail_price >= min_price)
    if max_price is not None:
        q = q.filter(Product.retail_price <= max_price)
    if badge:
        q = q.filter(Product.badge == badge)
    if sale:
        now = datetime.now()
        q = q.outerjoin(ProductDiscount, ProductDiscount.product_id == Product.id).filter(
            (Product.badge == "SALE")
            | (
                (ProductDiscount.is_active == True)
                & (ProductDiscount.start_time <= now)
                & (ProductDiscount.end_time >= now)
            )
        )
    return q

@router.get("", response_model=list[ProductOut])
def list_products(
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    badge: Optional[str] = None,
    sale: Optional[bool] = None,
    sort: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    q = db.query(Product).options(joinedload(Product.category), joinedload(Product.brand), joinedload(Product.discount)).filter(Product.is_active == True)
    q = apply_product_filters(q, db, category_id, brand_id, search, min_price, max_price, badge, sale)
    if sort == "price_asc":
        q = q.order_by(Product.retail_price.asc(), Product.id.desc())
    elif sort == "price_desc":
        q = q.order_by(Product.retail_price.desc(), Product.id.desc())
    elif sort == "created_at":
        q = q.order_by(Product.created_at.desc(), Product.id.desc())
    elif sort == "sold":
        q = q.order_by(desc(Product.badge == "BEST SELLER"), Product.id.desc())
    elif sort == "rating":
        q = q.order_by(Product.id.desc())
    else:
        q = q.order_by(Product.id.desc())
    return q.offset(offset).limit(limit).all()

@router.get("/count")
def count_products(
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    badge: Optional[str] = None,
    sale: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    q = db.query(func.count(func.distinct(Product.id))).filter(Product.is_active == True)
    q = apply_product_filters(q, db, category_id, brand_id, search, min_price, max_price, badge, sale)
    return {"count": int(q.scalar() or 0)}

@router.get("/wholesale-tiers", response_model=list[WholesaleTierOut])
def list_public_wholesale_tiers(db: Session = Depends(get_db)):
    return (
        db.query(WholesaleTier)
        .filter(WholesaleTier.is_active == True)
        .order_by(WholesaleTier.min_order_total.asc(), WholesaleTier.id.asc())
        .all()
    )

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).options(joinedload(Product.category), joinedload(Product.brand), joinedload(Product.discount)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductOut)
def create_product(data: ProductCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"detail": "Product deleted"}


# --- Product Reviews ---

@router.get("/{product_id}/reviews", response_model=list[ReviewOut])
def list_product_reviews(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return (
        db.query(ProductReview)
        .options(joinedload(ProductReview.user))
        .filter(ProductReview.product_id == product_id)
        .order_by(ProductReview.created_at.desc())
        .all()
    )


@router.post("/{product_id}/reviews", response_model=ReviewOut)
def create_product_review(
    product_id: int,
    data: ReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    existing = (
        db.query(ProductReview)
        .filter(ProductReview.product_id == product_id, ProductReview.user_id == user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

    review = ProductReview(
        product_id=product_id,
        user_id=user.id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return (
        db.query(ProductReview)
        .options(joinedload(ProductReview.user))
        .filter(ProductReview.id == review.id)
        .first()
    )


# --- Product Images ---

@router.get("/{product_id}/images", response_model=list[ProductImageOut])
def list_product_images(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id)
        .order_by(ProductImage.sort_order.asc(), ProductImage.id.asc())
        .all()
    )
