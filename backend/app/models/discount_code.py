from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class DiscountCode(Base):
    __tablename__ = "discount_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_type = Column(String(20), nullable=False) # 'percent', 'fixed_amount'
    discount_value = Column(Float, nullable=False)
    min_order_amount = Column(Float, default=0.0)
    max_usage = Column(Integer, nullable=True) # None means unlimited
    current_usage = Column(Integer, default=0)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
