from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --- User ---
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str]
    role: str
    is_active: bool
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# --- Category ---
class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    image_url: Optional[str]
    class Config:
        from_attributes = True

# --- Brand ---
class BrandOut(BaseModel):
    id: int
    name: str
    logo_url: Optional[str]
    class Config:
        from_attributes = True

# --- Product ---
class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    category_id: Optional[int]
    brand_id: Optional[int]
    retail_price: float
    wholesale_price: Optional[float]
    badge: Optional[str]
    stock: int
    is_active: bool
    category: Optional[CategoryOut] = None
    brand: Optional[BrandOut] = None
    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    retail_price: float
    wholesale_price: Optional[float] = None
    badge: Optional[str] = None
    stock: int = 100

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    retail_price: Optional[float] = None
    wholesale_price: Optional[float] = None
    badge: Optional[str] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None

# --- Order ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: list[OrderItemCreate]

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[ProductOut] = None
    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    user_id: int
    total_amount: float
    applied_price_type: str
    status: str
    created_at: Optional[datetime]
    items: list[OrderItemOut] = []
    class Config:
        from_attributes = True

# --- Discount Setting ---
class DiscountSettingOut(BaseModel):
    id: int
    wholesale_threshold: float
    class Config:
        from_attributes = True

class DiscountSettingUpdate(BaseModel):
    wholesale_threshold: float
