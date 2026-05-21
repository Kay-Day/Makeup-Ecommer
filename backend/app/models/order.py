from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
from app.services.sepay import make_qr_url

class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')",
            name="ck_order_status",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    applied_price_type = Column(String(20), default="retail")
    discount_code_id = Column(Integer, ForeignKey("discount_codes.id"), nullable=True)
    status = Column(String(20), default="pending")
    payment_method = Column(String(20), default="cod")
    payment_status = Column(String(20), default="pending")
    payment_code = Column(String(50), nullable=True, unique=True, index=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    sepay_transaction_id = Column(String(100), nullable=True, unique=True)
    shipping_fee = Column(Float, default=30000)
    shipping_full_name = Column(String(255), nullable=True)
    shipping_phone = Column(String(50), nullable=True)
    shipping_address = Column(String(255), nullable=True)
    shipping_city = Column(String(120), nullable=True)
    shipping_postal_code = Column(String(50), nullable=True)
    tracking_number = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    discount_code = relationship("DiscountCode", backref="orders")

    user = relationship("User", backref="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    @property
    def sepay_qr_url(self):
        if self.payment_method != "sepay" or not self.payment_code:
            return None
        return make_qr_url(self.total_amount, self.payment_code)
