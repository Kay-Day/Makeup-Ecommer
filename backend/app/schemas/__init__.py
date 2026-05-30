from pydantic import BaseModel, field_validator
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

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str]
    role: str
    is_active: bool
    class Config:
        from_attributes = True

class UserAdminCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "customer"
    is_active: bool = True

class UserAdminUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# --- Chatbot / AI keys ---
class ChatMessageInput(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessageInput]


class ProductSuggestionOut(BaseModel):
    id: int
    name: str
    brand_name: Optional[str] = None
    category_name: Optional[str] = None
    retail_price: float
    wholesale_price: Optional[float] = None
    image_url: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    used_model: str
    used_key_name: str
    product_suggestions: list[ProductSuggestionOut] = []


class ChatbotApiKeyCreate(BaseModel):
    name: str
    api_key: str
    provider: str = "deepseek"
    base_url: str = "https://api.deepseek.com"
    model: str = "deepseek-v4-pro"
    reasoning_effort: str = "max"
    is_active: bool = True
    note: Optional[str] = None


class ChatbotApiKeyUpdate(BaseModel):
    name: Optional[str] = None
    api_key: Optional[str] = None
    provider: Optional[str] = None
    base_url: Optional[str] = None
    model: Optional[str] = None
    reasoning_effort: Optional[str] = None
    is_active: Optional[bool] = None
    note: Optional[str] = None


class ChatbotApiKeyOut(BaseModel):
    id: int
    name: str
    provider: str
    masked_key: str
    base_url: str
    model: str
    reasoning_effort: str
    is_active: bool
    note: Optional[str] = None
    last_used_at: Optional[datetime] = None
    last_error: Optional[str] = None
    failure_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# --- Category ---
class CategoryCreate(BaseModel):
    name: str
    slug: str
    image_url: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    image_url: Optional[str]
    parent_id: Optional[int] = None
    class Config:
        from_attributes = True

# --- Brand ---
class BrandCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None

class BrandOut(BaseModel):
    id: int
    name: str
    logo_url: Optional[str]
    class Config:
        from_attributes = True

# --- Product ---
class ProductImageOut(BaseModel):
    id: int
    product_id: int
    image_url: str
    sort_order: int
    class Config:
        from_attributes = True

class ProductImageCreate(BaseModel):
    image_url: str
    sort_order: int = 0

class ProductImageReorder(BaseModel):
    image_ids: list[int]

class ProductDiscountOut(BaseModel):
    id: int
    product_id: int
    discount_percent: float
    start_time: datetime
    end_time: datetime
    is_active: bool
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True


class ProductDiscountCreate(BaseModel):
    discount_percent: float
    start_time: datetime
    end_time: datetime
    is_active: bool = True


class ProductDiscountUpdate(BaseModel):
    discount_percent: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    is_active: Optional[bool] = None


class ProductOut(BaseModel):
    id: int
    product_code: Optional[str] = None
    name: str
    description: Optional[str]
    image_url: Optional[str]
    category_id: Optional[int]
    brand_id: Optional[int]
    retail_price: float
    wholesale_price: Optional[float]
    variant_options: Optional[str] = None
    badge: Optional[str]
    stock: int
    is_active: bool
    category: Optional[CategoryOut] = None
    brand: Optional[BrandOut] = None
    images: list[ProductImageOut] = []
    avg_rating: Optional[float] = None
    review_count: int = 0
    discount: Optional[ProductDiscountOut] = None
    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    product_code: Optional[str] = None
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    retail_price: float
    wholesale_price: Optional[float] = None
    variant_options: Optional[str] = None
    badge: Optional[str] = None
    stock: int = 100
    is_active: bool = True

class ProductUpdate(BaseModel):
    product_code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    retail_price: Optional[float] = None
    wholesale_price: Optional[float] = None
    variant_options: Optional[str] = None
    badge: Optional[str] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None

# --- Pricing tier ---
class PricingTierCreate(BaseModel):
    name: str
    min_total_spent: float
    discount_percent: float = 0.0
    use_wholesale_price: bool = False
    is_active: bool = True
    note: Optional[str] = None


class PricingTierUpdate(BaseModel):
    name: Optional[str] = None
    min_total_spent: Optional[float] = None
    discount_percent: Optional[float] = None
    use_wholesale_price: Optional[bool] = None
    is_active: Optional[bool] = None
    note: Optional[str] = None


class PricingTierOut(BaseModel):
    id: int
    name: str
    min_total_spent: float
    discount_percent: float
    use_wholesale_price: bool
    is_active: bool
    note: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Order ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    combo_id: Optional[int] = None
    variant_code: Optional[str] = None

class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    discount_code: Optional[str] = None
    shipping_full_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: Optional[str] = None
    payment_method: str = "cod"


class OrderQuoteCreate(BaseModel):
    items: list[OrderItemCreate]
    discount_code: Optional[str] = None


class OrderQuoteItemOut(BaseModel):
    product_id: int
    variant_code: Optional[str] = None
    variant_name: Optional[str] = None
    quantity: int
    unit_price: float
    line_total: float
    retail_unit_price: float
    base_unit_price: float
    combo_id: Optional[int] = None
    combo_discount_percent: Optional[float] = None


class OrderQuoteOut(BaseModel):
    total_amount: float
    applied_price_type: str
    pricing_label: str
    pricing_rule_name: str
    pricing_discount_percent: float
    subtotal_before_discount: float
    item_subtotal: float
    pricing_discount_amount: float
    discount_code_amount: float
    total_discount_amount: float
    shipping_fee: float
    subtotal_after_discount: float
    items: list[OrderQuoteItemOut]


class CheckoutSettingsOut(BaseModel):
    default_shipping_fee: float
    payment_methods: list[str] = ["cod", "sepay"]

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    variant_code: Optional[str] = None
    variant_name: Optional[str] = None
    quantity: int
    unit_price: float
    combo_id: Optional[int] = None
    combo_name: Optional[str] = None
    product: Optional[ProductOut] = None
    class Config:
        from_attributes = True

class DiscountCodeOut(BaseModel):
    id: int
    code: str
    discount_type: str
    discount_value: float
    min_order_amount: float
    max_usage: Optional[int]
    current_usage: int
    expires_at: Optional[datetime]
    is_active: bool
    created_at: Optional[datetime]
    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    user_id: int
    total_amount: float
    applied_price_type: str
    discount_code_id: Optional[int] = None
    status: str
    created_at: Optional[datetime]
    user: Optional[UserOut] = None
    discount_code: Optional[DiscountCodeOut] = None
    items: list[OrderItemOut] = []
    pricing_label: Optional[str] = None
    pricing_rule_name: Optional[str] = None
    pricing_discount_percent: Optional[float] = None
    subtotal_before_discount: Optional[float] = None
    item_subtotal: Optional[float] = None
    pricing_discount_amount: Optional[float] = None
    discount_code_amount: Optional[float] = None
    total_discount_amount: Optional[float] = None
    shipping_fee: float = 0.0
    subtotal_after_discount: Optional[float] = None
    payment_method: str = "cod"
    payment_status: str = "pending"
    payment_code: Optional[str] = None
    sepay_qr_url: Optional[str] = None
    paid_at: Optional[datetime] = None
    sepay_transaction_id: Optional[str] = None
    shipping_full_name: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_postal_code: Optional[str] = None
    tracking_number: Optional[str] = None
    class Config:
        from_attributes = True

class OrderAdminUpdate(BaseModel):
    status: Optional[str] = None
    tracking_number: Optional[str] = None


class SePayPaymentStatusOut(BaseModel):
    order_id: int
    payment_method: str
    payment_status: str
    payment_code: Optional[str] = None
    total_amount: float
    qr_url: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    account_name: Optional[str] = None
    paid_at: Optional[datetime] = None


class SePayWebhookResponse(BaseModel):
    success: bool


class SePayWebhookLogOut(BaseModel):
    id: int
    transaction_id: str
    payment_code: Optional[str] = None
    transfer_amount: int
    transfer_type: Optional[str] = None
    account_number: Optional[str] = None
    reference_code: Optional[str] = None
    status: str
    message: Optional[str] = None
    raw_payload: str
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Notification ---
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    link: Optional[str]
    is_read: bool
    created_at: Optional[datetime]
    class Config:
        from_attributes = True


# --- Wholesale Tier ---
class WholesaleTierCreate(BaseModel):
    name: str
    min_order_total: float
    max_order_total: Optional[float] = None
    discount_percent: float = 0.0
    is_active: bool = True
    note: Optional[str] = None


class WholesaleTierUpdate(BaseModel):
    name: Optional[str] = None
    min_order_total: Optional[float] = None
    max_order_total: Optional[float] = None
    discount_percent: Optional[float] = None
    is_active: Optional[bool] = None
    note: Optional[str] = None


class WholesaleTierOut(BaseModel):
    id: int
    name: str
    min_order_total: float
    max_order_total: Optional[float] = None
    discount_percent: float
    is_active: bool
    note: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True


# --- Discount Setting ---
class DiscountSettingOut(BaseModel):
    id: int
    wholesale_threshold: float
    default_shipping_fee: float
    updated_by: Optional[int] = None
    updated_at: Optional[datetime] = None
    pricing_tiers: list[PricingTierOut] = []
    wholesale_tiers: list[WholesaleTierOut] = []
    class Config:
        from_attributes = True

class DiscountSettingUpdate(BaseModel):
    wholesale_threshold: float
    default_shipping_fee: float


class CustomerPricingStatusOut(BaseModel):
    lifetime_spend: float
    projected_spend: float
    current_tier: Optional[PricingTierOut] = None
    next_tier: Optional[PricingTierOut] = None
    amount_to_next_tier: float
    fallback_wholesale_threshold: float = 0.0
    fallback_amount_to_wholesale: float = 0.0

class DiscountCodeCreate(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    min_order_amount: float = 0.0
    max_usage: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True

class DiscountCodeUpdate(BaseModel):
    code: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_usage: Optional[int] = None
    current_usage: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None

# --- Blog categories ---
class BlogCategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

class BlogCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None

class BlogCategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    class Config:
        from_attributes = True

# --- Blog articles ---
class BlogArticleCreate(BaseModel):
    title: str
    slug: str
    public_slug: Optional[str] = None
    content: str
    image_url: Optional[str] = None
    focus_keyword: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    canonical_url: Optional[str] = None
    og_image_url: Optional[str] = None
    category_id: int
    is_published: bool = False

class BlogArticleUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    focus_keyword: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    canonical_url: Optional[str] = None
    og_image_url: Optional[str] = None
    category_id: Optional[int] = None
    is_published: Optional[bool] = None

class BlogArticleOut(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    image_url: Optional[str]
    focus_keyword: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    canonical_url: Optional[str] = None
    og_image_url: Optional[str] = None
    author_id: int
    category_id: int
    is_published: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    author: Optional[UserOut] = None
    category: Optional[BlogCategoryOut] = None
    class Config:
        from_attributes = True

# --- Product Review ---
class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserOut] = None
    class Config:
        from_attributes = True

# --- Wishlist ---
class WishlistItemOut(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: Optional[datetime] = None
    product: Optional[ProductOut] = None
    class Config:
        from_attributes = True

class WishlistItemCreate(BaseModel):
    product_id: int

# --- Banner ---
class BannerCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True

class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class BannerOut(BaseModel):
    id: int
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True


# --- Combo ---
class ComboItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class ComboItemUpdate(BaseModel):
    product_id: Optional[int] = None
    quantity: Optional[int] = None


class ComboItemOut(BaseModel):
    id: int
    combo_id: int
    product_id: int
    quantity: int
    product: Optional[ProductOut] = None
    class Config:
        from_attributes = True


class ComboCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    discount_percent: int = 0
    is_active: bool = True
    items: list[ComboItemCreate] = []


class ComboUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    discount_percent: Optional[int] = None
    is_active: Optional[bool] = None


class ComboOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    discount_percent: int
    is_active: bool
    created_at: Optional[datetime] = None
    items: list[ComboItemOut] = []
    original_price: Optional[float] = None
    discounted_price: Optional[float] = None
    class Config:
        from_attributes = True
