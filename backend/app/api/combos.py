from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_db
from app.models.combo import Combo
from app.models.combo_item import ComboItem
from app.schemas import ComboOut

router = APIRouter(prefix="/combos", tags=["Combos"])


def _compute_combo_pricing(combo: Combo) -> tuple[float, float]:
    original = 0.0
    for item in combo.items:
        if item.product and item.product.is_active:
            price = item.product.retail_price
            if item.product.discount:
                disc = item.product.discount
                now = datetime.now(timezone.utc)
                if disc.is_active and disc.start_time <= now <= disc.end_time:
                    price = price * (1 - disc.discount_percent / 100)
            original += price * item.quantity
    discounted = original * (1 - combo.discount_percent / 100)
    return round(original, 2), round(discounted, 2)


def _enrich_combo(combo: Combo) -> dict:
    original, discounted = _compute_combo_pricing(combo)
    return {
        "id": combo.id,
        "name": combo.name,
        "description": combo.description,
        "image_url": combo.image_url,
        "discount_percent": combo.discount_percent,
        "is_active": combo.is_active,
        "created_at": combo.created_at,
        "items": combo.items,
        "original_price": original,
        "discounted_price": discounted,
    }


@router.get("", response_model=list[ComboOut])
def list_combos(
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    combos = (
        db.query(Combo)
        .options(joinedload(Combo.items).joinedload(ComboItem.product))
        .filter(Combo.is_active == True)
        .order_by(Combo.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [_enrich_combo(c) for c in combos]


@router.get("/{combo_id}", response_model=ComboOut)
def get_combo(combo_id: int, db: Session = Depends(get_db)):
    combo = (
        db.query(Combo)
        .options(joinedload(Combo.items).joinedload(ComboItem.product))
        .filter(Combo.id == combo_id)
        .first()
    )
    if not combo:
        raise HTTPException(status_code=404, detail="Combo not found")
    return _enrich_combo(combo)
