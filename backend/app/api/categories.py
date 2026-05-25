from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.models.category import Category
from app.schemas import CategoryOut

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.parent_id.isnot(None), Category.name.asc()).all()
