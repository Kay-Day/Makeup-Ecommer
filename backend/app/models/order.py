from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    applied_price_type = Column(String(20), default="retail")  # "retail" | "wholesale"
    discount_code_id = Column(Integer, ForeignKey("discount_codes.id"), nullable=True)
    status = Column(String(20), default="pending")  # pending, confirmed, shipped, delivered, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    discount_code = relationship("DiscountCode", backref="orders")

    user = relationship("User", backref="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
