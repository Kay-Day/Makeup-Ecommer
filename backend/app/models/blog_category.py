from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

class BlogCategory(Base):
    __tablename__ = "blog_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)

    articles = relationship("BlogArticle", back_populates="category")
