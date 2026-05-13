from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_optional, get_db, require_admin
from app.models.chatbot_api_key import ChatbotApiKey
from app.models.user import User
from app.schemas import (
    ChatbotApiKeyCreate,
    ChatbotApiKeyOut,
    ChatbotApiKeyUpdate,
    ChatRequest,
    ChatResponse,
)
from app.services.chatbot import call_chatbot_model, serialize_chatbot_key

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/messages", response_model=ChatResponse)
def send_chat_message(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    cleaned_messages = [
        {"role": item.role, "content": item.content.strip()}
        for item in data.messages
        if item.content.strip() and item.role in {"user", "assistant"}
    ]
    if not cleaned_messages:
        raise HTTPException(status_code=400, detail="Không có nội dung để gửi cho chatbot.")
    try:
        return call_chatbot_model(db, messages=cleaned_messages, current_user=current_user)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/admin/keys", response_model=list[ChatbotApiKeyOut])
def list_chatbot_keys(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    keys = db.query(ChatbotApiKey).order_by(ChatbotApiKey.created_at.desc()).all()
    return [serialize_chatbot_key(key) for key in keys]


@router.post("/admin/keys", response_model=ChatbotApiKeyOut)
def create_chatbot_key(
    data: ChatbotApiKeyCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if not data.api_key.strip():
        raise HTTPException(status_code=400, detail="API key không được để trống.")
    key = ChatbotApiKey(**data.model_dump())
    db.add(key)
    db.commit()
    db.refresh(key)
    return serialize_chatbot_key(key)


@router.put("/admin/keys/{key_id}", response_model=ChatbotApiKeyOut)
def update_chatbot_key(
    key_id: int,
    data: ChatbotApiKeyUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    key = db.query(ChatbotApiKey).filter(ChatbotApiKey.id == key_id).first()
    if not key:
        raise HTTPException(status_code=404, detail="Chatbot key không tồn tại.")
    updates = data.model_dump(exclude_unset=True)
    if "api_key" in updates and not str(updates["api_key"]).strip():
        updates.pop("api_key")
    for field, value in updates.items():
        setattr(key, field, value)
    db.commit()
    db.refresh(key)
    return serialize_chatbot_key(key)


@router.delete("/admin/keys/{key_id}")
def delete_chatbot_key(
    key_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    key = db.query(ChatbotApiKey).filter(ChatbotApiKey.id == key_id).first()
    if not key:
        raise HTTPException(status_code=404, detail="Chatbot key không tồn tại.")
    db.delete(key)
    db.commit()
    return {"detail": "Đã xoá chatbot key."}
