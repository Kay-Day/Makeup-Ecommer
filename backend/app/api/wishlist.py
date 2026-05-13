from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.wishlist_item import WishlistItem
from app.schemas import WishlistItemCreate, WishlistItemOut

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=list[WishlistItemOut])
def list_wishlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return (
        db.query(WishlistItem)
        .options(
            joinedload(WishlistItem.product)
            .joinedload(Product.category),
            joinedload(WishlistItem.product)
            .joinedload(Product.brand),
        )
        .filter(WishlistItem.user_id == user.id)
        .order_by(WishlistItem.created_at.desc())
        .all()
    )


@router.post("", response_model=WishlistItemOut)
def add_to_wishlist(data: WishlistItemCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user.id, WishlistItem.product_id == data.product_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")

    item = WishlistItem(user_id=user.id, product_id=data.product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return (
        db.query(WishlistItem)
        .options(
            joinedload(WishlistItem.product)
            .joinedload(Product.category),
            joinedload(WishlistItem.product)
            .joinedload(Product.brand),
        )
        .filter(WishlistItem.id == item.id)
        .first()
    )


@router.delete("/{product_id}")
def remove_from_wishlist(product_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user.id, WishlistItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    db.delete(item)
    db.commit()
    return {"detail": "Removed from wishlist"}
