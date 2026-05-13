from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.models.banner import Banner
from app.schemas import BannerOut

router = APIRouter(prefix="/banners", tags=["Banners"])


@router.get("", response_model=list[BannerOut])
def list_banners(db: Session = Depends(get_db)):
    return (
        db.query(Banner)
        .filter(Banner.is_active == True)
        .order_by(Banner.sort_order.asc(), Banner.id.asc())
        .all()
    )
