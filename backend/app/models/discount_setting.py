from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class DiscountSetting(Base):
    __tablename__ = "discount_settings"

    id = Column(Integer, primary_key=True, index=True)
    wholesale_threshold = Column(Float, default=5000000)  # 5 million VND
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
