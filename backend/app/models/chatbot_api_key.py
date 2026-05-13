from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class ChatbotApiKey(Base):
    __tablename__ = "chatbot_api_keys"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    provider = Column(String(50), nullable=False, default="deepseek")
    api_key = Column(Text, nullable=False)
    base_url = Column(String(255), nullable=False, default="https://api.deepseek.com")
    model = Column(String(120), nullable=False, default="deepseek-v4-pro")
    reasoning_effort = Column(String(20), nullable=False, default="max")
    is_active = Column(Boolean, nullable=False, default=True)
    note = Column(Text, nullable=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    last_error = Column(Text, nullable=True)
    failure_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
