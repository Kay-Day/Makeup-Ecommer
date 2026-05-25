from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("stock >= 0", name="ck_product_stock"),
        CheckConstraint(
            "badge IS NULL OR badge IN ('NEW IN', 'BEST SELLER', 'SALE')",
            name="ck_product_badge",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True)
    retail_price = Column(Float, nullable=False)
    wholesale_price = Column(Float, nullable=True)
    variant_options = Column(Text, nullable=True)
    badge = Column(String(50), nullable=True)
    stock = Column(Integer, default=100)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category", backref="products")
    brand = relationship("Brand", backref="products")
    discount = relationship("ProductDiscount", back_populates="product", uselist=False)
