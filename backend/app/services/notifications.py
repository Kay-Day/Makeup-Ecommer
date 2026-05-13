from typing import Optional

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User


def create_notification(
    db: Session,
    *,
    user_id: int,
    title: str,
    message: str,
    link: Optional[str] = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        link=link,
    )
    db.add(notification)
    return notification


def notify_admins(
    db: Session,
    *,
    title: str,
    message: str,
    link: Optional[str] = None,
) -> None:
    admin_ids = [admin.id for admin in db.query(User).filter(User.role == "admin", User.is_active == True).all()]
    for admin_id in admin_ids:
        create_notification(db, user_id=admin_id, title=title, message=message, link=link)
