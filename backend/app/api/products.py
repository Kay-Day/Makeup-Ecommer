from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.core.deps import get_db, require_admin
from app.models.product import Product
from app.schemas import ProductOut, ProductCreate, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=list[ProductOut])
def list_products(
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    badge: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    q = db.query(Product).options(joinedload(Product.category), joinedload(Product.brand)).filter(Product.is_active == True)
    if category_id:
        q = q.filter(Product.category_id == category_id)
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
    return q.offset(offset).limit(limit).all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).options(joinedload(Product.category), joinedload(Product.brand)).filter(Product.id == product_id).first()
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
