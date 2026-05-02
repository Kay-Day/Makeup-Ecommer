from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas import UserCreate, UserLogin, UserOut, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role="customer",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}
