from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    logo_url = Column(String(500), nullable=True)
