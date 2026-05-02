from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True)
    retail_price = Column(Float, nullable=False)
    wholesale_price = Column(Float, nullable=True)
    badge = Column(String(50), nullable=True)  # "NEW IN", "BEST SELLER", "SALE"
    stock = Column(Integer, default=100)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category", backref="products")
    brand = relationship("Brand", backref="products")
