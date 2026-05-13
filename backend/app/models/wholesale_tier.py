from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class WholesaleTier(Base):
    __tablename__ = "wholesale_tiers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    min_order_total = Column(Float, nullable=False, default=0.0)
    max_order_total = Column(Float, nullable=True)
    discount_percent = Column(Float, nullable=False, default=0.0)
    is_active = Column(Boolean, nullable=False, default=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
