from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.models.brand import Brand
from app.schemas import BrandOut

router = APIRouter(prefix="/brands", tags=["Brands"])

@router.get("", response_model=list[BrandOut])
def list_brands(db: Session = Depends(get_db)):
    return db.query(Brand).order_by(Brand.name.asc()).all()
