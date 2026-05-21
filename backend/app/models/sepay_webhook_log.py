from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class SePayWebhookLog(Base):
    __tablename__ = "sepay_webhook_logs"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(100), unique=True, nullable=False, index=True)
    payment_code = Column(String(50), nullable=True, index=True)
    transfer_amount = Column(Integer, nullable=False, default=0)
    transfer_type = Column(String(20), nullable=True)
    account_number = Column(String(100), nullable=True)
    reference_code = Column(String(255), nullable=True)
    status = Column(String(30), nullable=False, default="received")
    message = Column(String(255), nullable=True)
    raw_payload = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
