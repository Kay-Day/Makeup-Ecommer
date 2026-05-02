from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    payment_method = Column(String(50), nullable=False) # e.g., 'bank_transfer', 'cod', 'momo'
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="pending") # pending, completed, failed
    transaction_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", backref="payment")
