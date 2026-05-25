from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session
from app.models.user import User
from app.models.category import Category
from app.models.brand import Brand
from app.models.product import Product
from app.models.discount_code import DiscountCode
from app.models.discount_setting import DiscountSetting
from app.models.pricing_tier import PricingTier
from app.models.wholesale_tier import WholesaleTier
from app.models.chatbot_api_key import ChatbotApiKey
from app.models.blog_category import BlogCategory
from app.models.blog_article import BlogArticle
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product_discount import ProductDiscount
from app.models.combo import Combo
from app.models.combo_item import ComboItem
from app.models.product_image import ProductImage
from app.models.product_review import ProductReview
from app.models.banner import Banner
from app.models.notification import Notification
from app.models.wishlist_item import WishlistItem
from app.core.config import settings
from app.core.security import get_password_hash


def ensure_default_discount_setting(db: Session):
    setting = db.query(DiscountSetting).first()
    if setting:
        if setting.default_shipping_fee is None:
            setting.default_shipping_fee = 30000
            db.commit()
        return

    admin = db.query(User).filter(User.role == "admin").order_by(User.id.asc()).first()
    setting = DiscountSetting(
        wholesale_threshold=5000000,
        default_shipping_fee=30000,
        updated_by=admin.id if admin else None,
    )
    db.add(setting)
    db.commit()


def ensure_default_pricing_tiers(db: Session):
    if db.query(PricingTier).first():
        return
    db.add_all(
        [
            PricingTier(
                name="Silver 2M",
                min_total_spent=2000000,
                discount_percent=0,
                use_wholesale_price=True,
                note="Khách đạt tổng mua 2 triệu sẽ được áp dụng giá sỉ nếu sản phẩm có giá sỉ.",
            ),
            PricingTier(
                name="Gold 5M",
                min_total_spent=5000000,
                discount_percent=5,
                use_wholesale_price=True,
                note="Giá sỉ + giảm thêm 5% cho khách hàng thân thiết.",
            ),
            PricingTier(
                name="Diamond 10M",
                min_total_spent=10000000,
                discount_percent=8,
                use_wholesale_price=True,
                note="Giá sỉ + giảm thêm 8% cho khách VIP.",
            ),
        ]
    )
    db.commit()


def ensure_default_wholesale_tiers(db: Session):
    if db.query(WholesaleTier).first():
        return
    db.add_all(
        [
            WholesaleTier(
                name="Giá sỉ cấp độ 1 (2tr-8tr)",
                min_order_total=2000000,
                max_order_total=8000000,
                discount_percent=5,
                note="Giảm 5% mỗi sản phẩm cho đơn hàng từ 2 triệu đến 8 triệu.",
            ),
            WholesaleTier(
                name="Giá sỉ cấp độ 2 (8tr-15tr)",
                min_order_total=8000000,
                max_order_total=15000000,
                discount_percent=10,
                note="Giảm 10% mỗi sản phẩm cho đơn hàng từ 8 triệu đến 15 triệu.",
            ),
            WholesaleTier(
                name="Giá sỉ cấp độ 3 (15tr-25tr)",
                min_order_total=15000000,
                max_order_total=25000000,
                discount_percent=13,
                note="Giảm 13% mỗi sản phẩm cho đơn hàng từ 15 triệu đến 25 triệu.",
            ),
            WholesaleTier(
                name="Giá sỉ cấp độ 4 (25tr-35tr)",
                min_order_total=25000000,
                max_order_total=35000000,
                discount_percent=15,
                note="Giảm 15% mỗi sản phẩm cho đơn hàng từ 25 triệu đến 35 triệu.",
            ),
            WholesaleTier(
                name="Giá sỉ cấp độ 5 (35tr-50tr)",
                min_order_total=35000000,
                max_order_total=50000000,
                discount_percent=18,
                note="Giảm 18% mỗi sản phẩm cho đơn hàng từ 35 triệu đến 50 triệu.",
            ),
        ]
    )
    db.commit()


def ensure_default_chatbot_key(db: Session):
    if db.query(ChatbotApiKey).first():
        return
    if not settings.DEEPSEEK_API_KEY:
        return
    db.add(
        ChatbotApiKey(
            name="DeepSeek Primary",
            provider="deepseek",
            api_key=settings.DEEPSEEK_API_KEY,
            base_url=settings.DEEPSEEK_BASE_URL,
            model=settings.DEEPSEEK_DEFAULT_MODEL,
            reasoning_effort="max",
            is_active=True,
            note="Auto imported from environment variable.",
        )
    )
    db.commit()


def ensure_default_admin_user(db: Session) -> User:
    admin = db.query(User).filter(User.role == "admin").order_by(User.id.asc()).first()
    if admin:
        return admin
    admin = User(
        email="admin@tmc.vn",
        hashed_password=get_password_hash("admin123"),
        full_name="TMC Admin",
        phone="0766669266",
        role="admin",
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


def get_or_create_user(db: Session, *, email: str, password: str, full_name: str, phone: str, role: str = "customer") -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        phone=phone,
        role=role,
    )
    db.add(user)
    db.flush()
    return user


def get_or_create_category(db: Session, *, name: str, slug: str, image_url: str, parent_id: Optional[int] = None) -> Category:
    category = db.query(Category).filter(Category.slug == slug).first()
    if category:
        category.image_url = image_url
        category.parent_id = parent_id
        db.flush()
        return category
    category = Category(name=name, slug=slug, image_url=image_url, parent_id=parent_id)
    db.add(category)
    db.flush()
    return category


def get_or_create_brand(db: Session, *, name: str, logo_url: str) -> Brand:
    brand = db.query(Brand).filter(Brand.name == name).first()
    if brand:
        brand.logo_url = logo_url
        db.flush()
        return brand
    brand = Brand(name=name, logo_url=logo_url)
    db.add(brand)
    db.flush()
    return brand


def get_or_create_product(db: Session, **payload) -> Product:
    product = db.query(Product).filter(Product.name == payload["name"]).first()
    if product:
        if payload.get("variant_options") and not getattr(product, "variant_options", None):
            product.variant_options = payload["variant_options"]
            db.flush()
        return product
    product = Product(**payload)
    db.add(product)
    db.flush()
    return product


def get_or_create_banner(db: Session, **payload) -> Banner:
    banner = db.query(Banner).filter(Banner.title == payload["title"]).first()
    if banner:
        for key, value in payload.items():
            setattr(banner, key, value)
        db.flush()
        return banner
    banner = Banner(**payload)
    db.add(banner)
    db.flush()
    return banner


def get_or_create_product_image(db: Session, *, product_id: int, image_url: str, sort_order: int = 0) -> ProductImage:
    image = (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id, ProductImage.image_url == image_url)
        .first()
    )
    if image:
        image.sort_order = sort_order
        db.flush()
        return image
    image = ProductImage(product_id=product_id, image_url=image_url, sort_order=sort_order)
    db.add(image)
    db.flush()
    return image


def get_or_create_review(db: Session, *, product_id: int, user_id: int, rating: int, comment: str) -> ProductReview:
    review = (
        db.query(ProductReview)
        .filter(ProductReview.product_id == product_id, ProductReview.user_id == user_id)
        .first()
    )
    if review:
        return review
    review = ProductReview(product_id=product_id, user_id=user_id, rating=rating, comment=comment)
    db.add(review)
    db.flush()
    return review


def get_or_create_notification(db: Session, *, user_id: int, title: str, message: str, link: str | None = None) -> Notification:
    notification = (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.title == title)
        .first()
    )
    if notification:
        return notification
    notification = Notification(user_id=user_id, title=title, message=message, link=link)
    db.add(notification)
    db.flush()
    return notification


def get_or_create_wishlist_item(db: Session, *, user_id: int, product_id: int) -> WishlistItem:
    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
        .first()
    )
    if item:
        return item
    item = WishlistItem(user_id=user_id, product_id=product_id)
    db.add(item)
    db.flush()
    return item


def get_or_create_discount_code(db: Session, **payload) -> DiscountCode:
    code = db.query(DiscountCode).filter(DiscountCode.code == payload["code"]).first()
    if code:
        return code
    code = DiscountCode(**payload)
    db.add(code)
    db.flush()
    return code


def get_or_create_blog_category(db: Session, *, name: str, slug: str, description: str) -> BlogCategory:
    category = db.query(BlogCategory).filter(BlogCategory.slug == slug).first()
    if category:
        return category
    category = BlogCategory(name=name, slug=slug, description=description)
    db.add(category)
    db.flush()
    return category


def get_or_create_blog_article(db: Session, **payload) -> BlogArticle:
    article = db.query(BlogArticle).filter(BlogArticle.slug == payload["slug"]).first()
    if article:
        return article
    article = BlogArticle(**payload)
    db.add(article)
    db.flush()
    return article


def create_demo_order(
    db: Session,
    *,
    user: User,
    status: str,
    shipping_full_name: str,
    shipping_phone: str,
    shipping_address: str,
    shipping_city: str,
    shipping_postal_code: str,
    items: list[tuple[Product, int]],
    payment_method: str = "cod",
    shipping_fee: float = 30000,
    applied_price_type: str = "retail",
    created_at: Optional[datetime] = None,
) -> None:
    if db.query(Order).filter(Order.user_id == user.id, Order.shipping_full_name == shipping_full_name, Order.status == status).first():
        return

    item_total = 0.0
    order = Order(
        user_id=user.id,
        total_amount=0.0,
        applied_price_type=applied_price_type,
        status=status,
        payment_method=payment_method,
        shipping_fee=shipping_fee,
        shipping_full_name=shipping_full_name,
        shipping_phone=shipping_phone,
        shipping_address=shipping_address,
        shipping_city=shipping_city,
        shipping_postal_code=shipping_postal_code,
        created_at=created_at or datetime.now(timezone.utc),
    )
    db.add(order)
    db.flush()

    for product, quantity in items:
        unit_price = float(product.retail_price)
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
            )
        )
        if product.stock >= quantity:
            product.stock -= quantity
        item_total += unit_price * quantity

    order.total_amount = round(item_total + shipping_fee, 2)
    db.flush()


def ensure_expanded_seed_data(db: Session) -> None:
    admin = db.query(User).filter(User.role == "admin").order_by(User.id.asc()).first()
    if not admin:
        return

    customers = [
      get_or_create_user(db, email="customer1@tmc.vn", password="user123", full_name="Lê Minh Khánh", phone="0901112233"),
      get_or_create_user(db, email="customer2@tmc.vn", password="user123", full_name="Trần Bảo Ngọc", phone="0902445566"),
      get_or_create_user(db, email="customer3@tmc.vn", password="user123", full_name="Phạm Thu Hà", phone="0903778899"),
      get_or_create_user(db, email="spa.hanoi@tmc.vn", password="user123", full_name="An Nhiên Spa Hà Nội", phone="0912888777"),
      get_or_create_user(db, email="salon.danang@tmc.vn", password="user123", full_name="Mộc Salon Đà Nẵng", phone="0935666888"),
      get_or_create_user(db, email="daily.hcm@tmc.vn", password="user123", full_name="Đại lý TMC Sài Gòn", phone="0977999000"),
    ]

    categories = {
        "son-moi": get_or_create_category(
            db,
            name="Son Môi",
            slug="son-moi",
            image_url="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800",
        ),
        "cham-soc-da": get_or_create_category(
            db,
            name="Chăm Sóc Da",
            slug="cham-soc-da",
            image_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
        ),
        "nuoc-hoa": get_or_create_category(
            db,
            name="Nước Hoa",
            slug="nuoc-hoa",
            image_url="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
        ),
        "trang-diem-mat": get_or_create_category(
            db,
            name="Trang Điểm Mắt",
            slug="trang-diem-mat",
            image_url="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800",
        ),
        "phan-nen": get_or_create_category(
            db,
            name="Phấn Nền",
            slug="phan-nen",
            image_url="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
        ),
        "dung-cu": get_or_create_category(
            db,
            name="Dụng Cụ",
            slug="dung-cu",
            image_url="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
        ),
    }
    for slug, name in [
        ("son-li", "Son Lì"),
        ("son-thoi", "Son Thỏi"),
        ("son-bong", "Son Bóng"),
    ]:
        categories[slug] = get_or_create_category(
            db,
            name=name,
            slug=slug,
            image_url=categories["son-moi"].image_url,
            parent_id=categories["son-moi"].id,
        )
    for slug, name in [
        ("tay-trang", "Tẩy Trang"),
        ("kem-chong-nang", "Kem Chống Nắng"),
        ("serum", "Serum"),
        ("kem-duong", "Kem Dưỡng"),
    ]:
        categories[slug] = get_or_create_category(
            db,
            name=name,
            slug=slug,
            image_url=categories["cham-soc-da"].image_url,
            parent_id=categories["cham-soc-da"].id,
        )
    for slug, name in [
        ("phan-ma", "Phấn Má"),
        ("ke-mat", "Kẻ Mắt"),
        ("mascara", "Mascara"),
    ]:
        categories[slug] = get_or_create_category(
            db,
            name=name,
            slug=slug,
            image_url=categories["trang-diem-mat"].image_url,
            parent_id=categories["trang-diem-mat"].id,
        )

    brands = {
        "MAC": get_or_create_brand(
            db,
            name="MAC",
            logo_url="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=200",
        ),
        "Clinique": get_or_create_brand(
            db,
            name="Clinique",
            logo_url="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=200",
        ),
        "L'Oréal": get_or_create_brand(
            db,
            name="L'Oréal",
            logo_url="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=200",
        ),
        "La Roche-Posay": get_or_create_brand(
            db,
            name="La Roche-Posay",
            logo_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=200",
        ),
        "Bioderma": get_or_create_brand(
            db,
            name="Bioderma",
            logo_url="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80&w=200",
        ),
        "Maybelline": get_or_create_brand(
            db,
            name="Maybelline",
            logo_url="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=200",
        ),
        "The Ordinary": get_or_create_brand(
            db,
            name="The Ordinary",
            logo_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200",
        ),
        "CeraVe": get_or_create_brand(
            db,
            name="CeraVe",
            logo_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=200",
        ),
        "Vichy": get_or_create_brand(
            db,
            name="Vichy",
            logo_url="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=200",
        ),
        "Dior": get_or_create_brand(
            db,
            name="Dior",
            logo_url="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=200",
        ),
        "Romand": get_or_create_brand(
            db,
            name="Romand",
            logo_url="https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=200",
        ),
        "Innisfree": get_or_create_brand(
            db,
            name="Innisfree",
            logo_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=200",
        ),
    }

    product_specs = [
        {
            "name": "La Roche-Posay Cicaplast Baume B5+",
            "description": "Kem phục hồi da khô rát, kích ứng và sau treatment với kết cấu êm dịu.",
            "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
            "category_id": categories["cham-soc-da"].id,
            "brand_id": brands["La Roche-Posay"].id,
            "retail_price": 395000,
            "wholesale_price": 320000,
            "badge": "BEST SELLER",
            "stock": 180,
        },
        {
            "name": "Bioderma Sensibio H2O",
            "description": "Nước tẩy trang dịu nhẹ cho da nhạy cảm, làm sạch lớp trang điểm và bụi bẩn hiệu quả.",
            "image_url": "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
            "category_id": categories["cham-soc-da"].id,
            "brand_id": brands["Bioderma"].id,
            "retail_price": 420000,
            "wholesale_price": 340000,
            "badge": "NEW IN",
            "stock": 210,
        },
        {
            "name": "Maybelline Sky High Mascara",
            "description": "Mascara làm dài mi nổi tiếng với đầu chải linh hoạt, giúp mi cong tơi tự nhiên.",
            "image_url": "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800",
            "category_id": categories["trang-diem-mat"].id,
            "brand_id": brands["Maybelline"].id,
            "retail_price": 289000,
            "wholesale_price": 230000,
            "badge": "BEST SELLER",
            "stock": 260,
        },
        {
            "name": "MAC Locked Kiss Ink 24HR",
            "description": "Son tint lì bền màu 24 giờ, chất son mỏng nhẹ nhưng lên màu đậm nét.",
            "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800",
            "category_id": categories["son-moi"].id,
            "brand_id": brands["MAC"].id,
            "retail_price": 780000,
            "wholesale_price": 620000,
            "badge": "SALE",
            "stock": 130,
        },
        {
            "name": "Clinique Take The Day Off Cleansing Balm",
            "description": "Sáp tẩy trang tan chảy trên da, cuốn sạch kem chống nắng và lớp makeup lâu trôi.",
            "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
            "category_id": categories["cham-soc-da"].id,
            "brand_id": brands["Clinique"].id,
            "retail_price": 890000,
            "wholesale_price": 720000,
            "badge": "NEW IN",
            "stock": 85,
        },
        {
            "name": "L'Oréal Panorama Mascara",
            "description": "Mascara làm dày và mở rộng chiều ngang của mắt, phù hợp makeup sắc nét.",
            "image_url": "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800",
            "category_id": categories["trang-diem-mat"].id,
            "brand_id": brands["L'Oréal"].id,
            "retail_price": 329000,
            "wholesale_price": 255000,
            "badge": "NEW IN",
            "stock": 190,
        },
        {
            "name": "La Roche-Posay Anthelios UVMune 400",
            "description": "Kem chống nắng phổ rộng, kết cấu mỏng nhẹ, hỗ trợ bảo vệ da tối ưu mỗi ngày.",
            "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
            "category_id": categories["cham-soc-da"].id,
            "brand_id": brands["La Roche-Posay"].id,
            "retail_price": 515000,
            "wholesale_price": 410000,
            "badge": "BEST SELLER",
            "stock": 230,
        },
        {
            "name": "Bioderma Atoderm Intensive Gel-Cream",
            "description": "Gel cream dưỡng ẩm cho da khô nhạy cảm, thấm nhanh và giảm cảm giác ngứa rát.",
            "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
            "category_id": categories["cham-soc-da"].id,
            "brand_id": brands["Bioderma"].id,
            "retail_price": 610000,
            "wholesale_price": 490000,
            "stock": 120,
        },
        {
            "name": "Maybelline Vinyl Ink Witty",
            "description": "Son kem bóng giữ màu lâu, bề mặt căng mướt với sắc nâu hồng dễ dùng hằng ngày.",
            "image_url": "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800",
            "category_id": categories["son-moi"].id,
            "brand_id": brands["Maybelline"].id,
            "retail_price": 299000,
            "wholesale_price": 235000,
            "stock": 170,
        },
        {
            "name": "Clinique Aromatics Elixir",
            "description": "Nước hoa cổ điển, chiều sâu hương thảo mộc và hoa trắng tinh tế, bám lâu.",
            "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
            "category_id": categories["nuoc-hoa"].id,
            "brand_id": brands["Clinique"].id,
            "retail_price": 2150000,
            "wholesale_price": 1820000,
            "stock": 55,
        },
    ]
    product_specs.extend(
        [
            {
                "name": "Romand Juicy Lasting Tint Figfig",
                "description": "Son tint bóng màu hồng đất, bề mặt căng mọng nhưng vẫn nhẹ môi, phù hợp makeup hằng ngày.",
                "image_url": "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["son-bong"].id,
                "brand_id": brands["Romand"].id,
                "retail_price": 260000,
                "wholesale_price": 198000,
                "variant_options": '[{"name":"Figfig","image_url":"https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800","stock":80},{"name":"Juicy Papaya","image_url":"https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800","stock":60},{"name":"Bare Grape","image_url":"https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800","stock":55}]',
                "badge": "BEST SELLER",
                "stock": 240,
            },
            {
                "name": "Dior Addict Lip Glow 001 Pink",
                "description": "Son dưỡng có màu giúp môi mềm ẩm, hiệu ứng hồng tự nhiên và dễ dùng cho mọi tông da.",
                "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["son-thoi"].id,
                "brand_id": brands["Dior"].id,
                "retail_price": 980000,
                "wholesale_price": 820000,
                "variant_options": '[{"name":"001 Pink","image_url":"https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800","stock":35},{"name":"004 Coral","image_url":"https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800","stock":25},{"name":"012 Rosewood","image_url":"https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800","stock":30}]',
                "badge": "NEW IN",
                "stock": 90,
            },
            {
                "name": "MAC Powder Kiss Velvet Blur Slim Stick",
                "description": "Son lì dạng thỏi với hiệu ứng mờ mềm, lên màu rõ nhưng không làm môi nặng bí.",
                "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["son-li"].id,
                "brand_id": brands["MAC"].id,
                "retail_price": 720000,
                "wholesale_price": 575000,
                "variant_options": '[{"name":"Ruby New","image_url":"https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800","stock":45},{"name":"Marrakesh","image_url":"https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800","stock":50},{"name":"Velvet Teddy","image_url":"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800","stock":55}]',
                "badge": "SALE",
                "stock": 150,
            },
            {
                "name": "CeraVe Hydrating Cleanser",
                "description": "Sữa rửa mặt cấp ẩm dịu nhẹ với ceramide, phù hợp da khô nhạy cảm và da sau treatment.",
                "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["cham-soc-da"].id,
                "brand_id": brands["CeraVe"].id,
                "retail_price": 365000,
                "wholesale_price": 285000,
                "badge": "BEST SELLER",
                "stock": 260,
            },
            {
                "name": "CeraVe Moisturising Cream",
                "description": "Kem dưỡng phục hồi hàng rào bảo vệ da, kết cấu giàu ẩm cho da khô và da yếu.",
                "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["kem-duong"].id,
                "brand_id": brands["CeraVe"].id,
                "retail_price": 420000,
                "wholesale_price": 335000,
                "stock": 210,
            },
            {
                "name": "Vichy Mineral 89 Hyaluronic Booster",
                "description": "Serum cấp ẩm cô đặc, hỗ trợ làm dịu da và tăng cảm giác căng khỏe sau làm sạch.",
                "image_url": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["serum"].id,
                "brand_id": brands["Vichy"].id,
                "retail_price": 760000,
                "wholesale_price": 610000,
                "badge": "NEW IN",
                "stock": 125,
            },
            {
                "name": "The Ordinary AHA 30% BHA 2% Peeling Solution",
                "description": "Tẩy da chết hóa học nồng độ cao, dùng theo hướng dẫn để hỗ trợ da sáng mịn hơn.",
                "image_url": "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["serum"].id,
                "brand_id": brands["The Ordinary"].id,
                "retail_price": 330000,
                "wholesale_price": 250000,
                "badge": "SALE",
                "stock": 180,
            },
            {
                "name": "The Ordinary Retinol 0.5% in Squalane",
                "description": "Tinh chất retinol trong nền squalane, hỗ trợ cải thiện bề mặt da và dấu hiệu lão hóa.",
                "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["serum"].id,
                "brand_id": brands["The Ordinary"].id,
                "retail_price": 360000,
                "wholesale_price": 275000,
                "stock": 160,
            },
            {
                "name": "La Roche-Posay Effaclar Duo+",
                "description": "Kem hỗ trợ chăm sóc da mụn, giảm cảm giác bít tắc và làm dịu vùng da có khuyết điểm.",
                "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["kem-duong"].id,
                "brand_id": brands["La Roche-Posay"].id,
                "retail_price": 465000,
                "wholesale_price": 370000,
                "badge": "BEST SELLER",
                "stock": 220,
            },
            {
                "name": "La Roche-Posay Micellar Water Ultra",
                "description": "Nước tẩy trang dịu nhẹ cho da nhạy cảm, hỗ trợ làm sạch kem chống nắng và bụi mịn.",
                "image_url": "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["tay-trang"].id,
                "brand_id": brands["La Roche-Posay"].id,
                "retail_price": 395000,
                "wholesale_price": 315000,
                "stock": 190,
            },
            {
                "name": "Bioderma Atoderm Creme Ultra",
                "description": "Kem dưỡng ẩm hằng ngày cho da khô, giúp da mềm mượt và giảm cảm giác căng rát.",
                "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["kem-duong"].id,
                "brand_id": brands["Bioderma"].id,
                "retail_price": 560000,
                "wholesale_price": 445000,
                "stock": 130,
            },
            {
                "name": "Vichy Capital Soleil UV-Age Daily SPF50+",
                "description": "Kem chống nắng hằng ngày với finish nhẹ, phù hợp dùng dưới lớp trang điểm.",
                "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["kem-chong-nang"].id,
                "brand_id": brands["Vichy"].id,
                "retail_price": 720000,
                "wholesale_price": 580000,
                "badge": "NEW IN",
                "stock": 115,
            },
            {
                "name": "Innisfree Green Tea Seed Serum",
                "description": "Serum trà xanh cấp nước nhanh, kết cấu mỏng nhẹ cho da thiếu ẩm và xỉn màu.",
                "image_url": "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["serum"].id,
                "brand_id": brands["Innisfree"].id,
                "retail_price": 590000,
                "wholesale_price": 470000,
                "stock": 150,
            },
            {
                "name": "Innisfree No-Sebum Mineral Powder",
                "description": "Phấn phủ kiềm dầu mỏng nhẹ, giúp lớp nền khô thoáng hơn trong thời tiết nóng ẩm.",
                "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["phan-nen"].id,
                "brand_id": brands["Innisfree"].id,
                "retail_price": 210000,
                "wholesale_price": 158000,
                "badge": "BEST SELLER",
                "stock": 300,
            },
            {
                "name": "Dior Forever Skin Glow Foundation",
                "description": "Kem nền finish căng sáng, độ che phủ vừa phải và giữ lớp nền sang trọng nhiều giờ.",
                "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["phan-nen"].id,
                "brand_id": brands["Dior"].id,
                "retail_price": 1550000,
                "wholesale_price": 1280000,
                "badge": "NEW IN",
                "stock": 70,
            },
            {
                "name": "Romand Better Than Cheek Blueberry Chip",
                "description": "Phấn má màu hồng lạnh nhẹ nhàng, chất phấn mịn tạo hiệu ứng má trong trẻo.",
                "image_url": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["phan-ma"].id,
                "brand_id": brands["Romand"].id,
                "retail_price": 220000,
                "wholesale_price": 168000,
                "stock": 175,
            },
            {
                "name": "Maybelline Fit Me Matte + Poreless Foundation",
                "description": "Kem nền kiềm dầu, che phủ lỗ chân lông và phù hợp da dầu hỗn hợp.",
                "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["phan-nen"].id,
                "brand_id": brands["Maybelline"].id,
                "retail_price": 285000,
                "wholesale_price": 218000,
                "badge": "SALE",
                "stock": 260,
            },
            {
                "name": "Maybelline Hyper Sharp Liner",
                "description": "Bút kẻ mắt đầu mảnh, dễ điều khiển và cho đường eyeliner sắc nét.",
                "image_url": "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["ke-mat"].id,
                "brand_id": brands["Maybelline"].id,
                "retail_price": 229000,
                "wholesale_price": 172000,
                "stock": 190,
            },
            {
                "name": "Clinique High Impact Mascara",
                "description": "Mascara tạo độ dày và dài tự nhiên, phù hợp lối makeup công sở tinh gọn.",
                "image_url": "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["mascara"].id,
                "brand_id": brands["Clinique"].id,
                "retail_price": 690000,
                "wholesale_price": 545000,
                "stock": 95,
            },
            {
                "name": "MAC 170 Synthetic Rounded Slant Brush",
                "description": "Cọ nền đầu vát giúp tán kem nền nhanh, đều và hạn chế vệt cọ.",
                "image_url": "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
                "category_id": categories["dung-cu"].id,
                "brand_id": brands["MAC"].id,
                "retail_price": 980000,
                "wholesale_price": 790000,
                "stock": 65,
            },
        ]
    )
    products = [get_or_create_product(db, **spec) for spec in product_specs]

    ensure_product_discounts(db, products)
    ensure_combo_seed_data(db, products)

    get_or_create_discount_code(
        db,
        code="FREESHIP30",
        discount_type="fixed_amount",
        discount_value=30000,
        min_order_amount=250000,
        max_usage=1000,
        is_active=True,
    )
    get_or_create_discount_code(
        db,
        code="VIP15",
        discount_type="percent",
        discount_value=15,
        min_order_amount=1200000,
        max_usage=200,
        expires_at=datetime.now(timezone.utc) + timedelta(days=180),
        is_active=True,
    )
    get_or_create_discount_code(
        db,
        code="SKINCARE50",
        discount_type="fixed_amount",
        discount_value=50000,
        min_order_amount=500000,
        max_usage=600,
        is_active=True,
    )
    get_or_create_discount_code(
        db,
        code="LIPLOVE12",
        discount_type="percent",
        discount_value=12,
        min_order_amount=350000,
        max_usage=450,
        expires_at=datetime.now(timezone.utc) + timedelta(days=120),
        is_active=True,
    )
    get_or_create_discount_code(
        db,
        code="B2B200",
        discount_type="fixed_amount",
        discount_value=200000,
        min_order_amount=3000000,
        max_usage=180,
        expires_at=datetime.now(timezone.utc) + timedelta(days=150),
        is_active=True,
    )
    get_or_create_discount_code(
        db,
        code="TMCNEW",
        discount_type="percent",
        discount_value=8,
        min_order_amount=250000,
        max_usage=1000,
        is_active=True,
    )

    content_categories = {
        "cham-soc-da": get_or_create_blog_category(
            db,
            name="Chăm Sóc Da",
            slug="cham-soc-da",
            description="Kiến thức chăm sóc da chuyên sâu.",
        ),
        "xu-huong": get_or_create_blog_category(
            db,
            name="Xu Hướng Làm Đẹp",
            slug="xu-huong-lam-dep",
            description="Cập nhật sản phẩm, xu hướng và routine mới.",
        ),
        "review-san-pham": get_or_create_blog_category(
            db,
            name="Review Sản Phẩm",
            slug="review-san-pham",
            description="Đánh giá nhanh các sản phẩm nổi bật được khách hàng quan tâm.",
        ),
    }

    get_or_create_blog_article(
        db,
        title="Routine phục hồi da sau treatment trong 7 ngày đầu",
        slug="routine-phuc-hoi-da-sau-treatment",
        content="Sau treatment, điều quan trọng nhất là phục hồi hàng rào bảo vệ da, giảm kích ứng và bảo vệ khỏi ánh nắng. Ưu tiên sữa rửa mặt dịu nhẹ, kem phục hồi, xịt khoáng và kem chống nắng quang phổ rộng.",
        image_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
        author_id=admin.id,
        category_id=content_categories["cham-soc-da"].id,
        is_published=True,
    )
    get_or_create_blog_article(
        db,
        title="Top 5 món makeup nền nhẹ mặt đang được khách hỏi nhiều",
        slug="top-5-mon-makeup-nen-nhe-mat",
        content="Xu hướng nền trong trẻo, mỏng nhẹ tiếp tục lên ngôi. Các lựa chọn được yêu thích thường có độ bám tốt, ít xuống tông và không gây bí da sau nhiều giờ.",
        image_url="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
        author_id=admin.id,
        category_id=content_categories["xu-huong"].id,
        is_published=True,
    )
    get_or_create_blog_article(
        db,
        title="Bioderma Sensibio H2O có hợp da treatment không?",
        slug="bioderma-sensibio-h2o-co-hop-da-treatment-khong",
        content="Đây là lựa chọn khá an toàn cho da nhạy cảm và da đang treatment nếu dùng đúng cách, không chà xát mạnh và luôn làm sạch lại khi cần.",
        image_url="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
        author_id=admin.id,
        category_id=content_categories["review-san-pham"].id,
        is_published=True,
    )
    get_or_create_blog_article(
        db,
        title="Cách chọn kem chống nắng khi phải trang điểm mỗi ngày",
        slug="cach-chon-kem-chong-nang-khi-trang-diem-moi-ngay",
        content="Khi dùng kem chống nắng dưới lớp nền, nên ưu tiên kết cấu mỏng, ít vón, có khả năng bám tốt và không làm nền xuống tông nhanh. Nếu da dầu, hãy chọn finish ráo hoặc bán lì.",
        image_url="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
        author_id=admin.id,
        category_id=content_categories["cham-soc-da"].id,
        is_published=True,
    )
    get_or_create_blog_article(
        db,
        title="Son lì, son thỏi, son bóng khác nhau thế nào?",
        slug="son-li-son-thoi-son-bong-khac-nhau-the-nao",
        content="Son lì cho độ bám màu cao và hiệu ứng sang trọng, son thỏi dễ dùng mỗi ngày, còn son bóng tạo bề mặt căng mọng. Chọn chất son nên dựa vào độ khô môi, phong cách makeup và thời lượng cần bám màu.",
        image_url="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800",
        author_id=admin.id,
        category_id=content_categories["xu-huong"].id,
        is_published=True,
    )
    get_or_create_blog_article(
        db,
        title="Checklist nhập sỉ mỹ phẩm cho spa và salon nhỏ",
        slug="checklist-nhap-si-my-pham-cho-spa-salon-nho",
        content="Với đơn sỉ, hãy ưu tiên nhóm sản phẩm có vòng quay nhanh như tẩy trang, chống nắng, son và kem dưỡng cơ bản. Kiểm tra hạn dùng, mức chiết khấu theo tổng đơn và nhu cầu khách hàng địa phương trước khi nhập sâu.",
        image_url="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
        author_id=admin.id,
        category_id=content_categories["review-san-pham"].id,
        is_published=True,
    )

    shipping_fee = 30000
    if len(products) >= 6:
        create_demo_order(
            db,
            user=customers[0],
            status="pending",
            shipping_full_name="Lê Minh Khánh",
            shipping_phone="0901112233",
            shipping_address="15 Nguyễn Huệ, Quận 1",
            shipping_city="TP. Hồ Chí Minh",
            shipping_postal_code="700000",
            items=[(products[0], 1), (products[2], 2)],
            shipping_fee=shipping_fee,
            created_at=datetime.now(timezone.utc) - timedelta(days=1),
        )
        create_demo_order(
            db,
            user=customers[1],
            status="confirmed",
            shipping_full_name="Trần Bảo Ngọc",
            shipping_phone="0902445566",
            shipping_address="88 Lý Tự Trọng, Hải Châu",
            shipping_city="Đà Nẵng",
            shipping_postal_code="550000",
            items=[(products[3], 1), (products[5], 1)],
            shipping_fee=shipping_fee,
            created_at=datetime.now(timezone.utc) - timedelta(days=4),
        )
        create_demo_order(
            db,
            user=customers[2],
            status="shipped",
            shipping_full_name="Phạm Thu Hà",
            shipping_phone="0903778899",
            shipping_address="120 Trần Hưng Đạo, Ninh Kiều",
            shipping_city="Cần Thơ",
            shipping_postal_code="900000",
            items=[(products[1], 1), (products[6], 1), (products[8], 1)],
            shipping_fee=shipping_fee,
            created_at=datetime.now(timezone.utc) - timedelta(days=8),
        )
        create_demo_order(
            db,
            user=customers[0],
            status="delivered",
            shipping_full_name="Lê Minh Khánh VIP",
            shipping_phone="0901112233",
            shipping_address="72 Pasteur, Quận 3",
            shipping_city="TP. Hồ Chí Minh",
            shipping_postal_code="700000",
            items=[(products[4], 2), (products[9], 1)],
            shipping_fee=shipping_fee,
            created_at=datetime.now(timezone.utc) - timedelta(days=14),
        )
        create_demo_order(
            db,
            user=customers[1],
            status="cancelled",
            shipping_full_name="Trần Bảo Ngọc Huỷ",
            shipping_phone="0902445566",
            shipping_address="12 Nguyễn Văn Linh, Hải Châu",
            shipping_city="Đà Nẵng",
            shipping_postal_code="550000",
            items=[(products[7], 1)],
            shipping_fee=shipping_fee,
            created_at=datetime.now(timezone.utc) - timedelta(days=20),
        )
    if len(products) >= 18 and len(customers) >= 6:
        create_demo_order(
            db,
            user=customers[3],
            status="confirmed",
            shipping_full_name="An Nhiên Spa Hà Nội",
            shipping_phone="0912888777",
            shipping_address="32 Nguyễn Chí Thanh, Đống Đa",
            shipping_city="Hà Nội",
            shipping_postal_code="100000",
            items=[(products[10], 12), (products[11], 8), (products[12], 6)],
            shipping_fee=shipping_fee,
            applied_price_type="wholesale_tier_1",
            created_at=datetime.now(timezone.utc) - timedelta(days=3),
        )
        create_demo_order(
            db,
            user=customers[4],
            status="shipped",
            shipping_full_name="Mộc Salon Đà Nẵng",
            shipping_phone="0935666888",
            shipping_address="18 Phan Châu Trinh, Hải Châu",
            shipping_city="Đà Nẵng",
            shipping_postal_code="550000",
            items=[(products[13], 10), (products[14], 6), (products[15], 5)],
            shipping_fee=shipping_fee,
            applied_price_type="wholesale_tier_2",
            created_at=datetime.now(timezone.utc) - timedelta(days=9),
        )
        create_demo_order(
            db,
            user=customers[5],
            status="delivered",
            shipping_full_name="Đại lý TMC Sài Gòn",
            shipping_phone="0977999000",
            shipping_address="45 Nguyễn Trãi, Quận 5",
            shipping_city="TP. Hồ Chí Minh",
            shipping_postal_code="700000",
            items=[(products[2], 20), (products[8], 15), (products[16], 12), (products[17], 8)],
            shipping_fee=shipping_fee,
            applied_price_type="wholesale_tier_3",
            created_at=datetime.now(timezone.utc) - timedelta(days=16),
        )

    db.commit()

def ensure_product_discounts(db: Session, products: list[Product]) -> None:
    """Seed demo product discounts with different time windows so the feature is visible immediately."""
    now = datetime.now(timezone.utc)

    def upsert(product: Product, discount_percent: float, start_time: datetime, end_time: datetime, is_active: bool = True) -> None:
        discount = db.query(ProductDiscount).filter(ProductDiscount.product_id == product.id).first()
        if discount:
            return
        db.add(
            ProductDiscount(
                product_id=product.id,
                discount_percent=discount_percent,
                start_time=start_time,
                end_time=end_time,
                is_active=is_active,
            )
        )

    schedule = [
        (0, 20, now - timedelta(days=3), now + timedelta(days=4)),
        (3, 35, now - timedelta(days=1), now + timedelta(hours=12)),
        (6, 15, now - timedelta(days=1), now + timedelta(days=6)),
        (8, 25, now + timedelta(days=2), now + timedelta(days=10)),
        (1, 50, now - timedelta(days=10), now - timedelta(days=1)),
        (10, 12, now - timedelta(days=2), now + timedelta(days=5)),
        (14, 18, now - timedelta(hours=8), now + timedelta(days=7)),
        (18, 10, now - timedelta(days=1), now + timedelta(days=3)),
        (22, 22, now + timedelta(days=1), now + timedelta(days=8)),
        (26, 16, now - timedelta(days=4), now + timedelta(days=2)),
    ]
    for index, discount_percent, start_time, end_time in schedule:
        if len(products) > index:
            upsert(products[index], discount_percent, start_time, end_time)

    db.commit()


def get_or_create_combo(db: Session, *, name: str, **payload) -> Combo:
    combo = db.query(Combo).filter(Combo.name == name).first()
    if combo:
        return combo
    combo = Combo(name=name, **payload)
    db.add(combo)
    db.flush()
    return combo


def ensure_combo_seed_data(db: Session, products: list) -> None:
    """Seed sample combo product bundles."""

    def find_product(name_contains: str):
        return db.query(Product).filter(Product.name.ilike(f"%{name_contains}%")).first()

    def add_items(combo: Combo, items_spec: list[tuple[str, int]]):
        """Add items to a combo if not already populated. Each spec is (product_name_fragment, quantity)."""
        if db.query(ComboItem).filter(ComboItem.combo_id == combo.id).first():
            return
        for name, qty in items_spec:
            p = find_product(name)
            if p:
                db.add(ComboItem(combo_id=combo.id, product_id=p.id, quantity=qty))

    # ── SKINCARE COMBOS (8) ──────────────────────────────────────────────

    # 1: Bộ Chăm Sóc Da Cơ Bản (15% off)
    c = get_or_create_combo(
        db,
        name="Bộ Chăm Sóc Da Cơ Bản",
        description="Combo thiết yếu cho routine chăm sóc da hàng ngày: làm sạch sâu với Niacinamide, cấp ẩm với Hyaluronic Acid và khóa ẩm với Moisture Surge. Tiết kiệm 15% so với mua lẻ.",
        image_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
        discount_percent=15,
        is_active=True,
    )
    add_items(c, [("Niacinamide", 1), ("Hyaluronic Acid", 1), ("Moisture Surge", 1)])

    # 2: Bộ Dưỡng Ẩm Chuyên Sâu (12% off)
    c = get_or_create_combo(
        db,
        name="Bộ Dưỡng Ẩm Chuyên Sâu",
        description="Combo cấp ẩm toàn diện cho làn da khô ráp: serum HA cấp nước tức thì, gel dưỡng oil-free Dramatically Different và kem dưỡng Moisture Surge 72h chuyên sâu.",
        image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
        discount_percent=12,
        is_active=True,
    )
    add_items(c, [("Hyaluronic Acid", 1), ("Dramatically Different", 1), ("Moisture Surge", 1)])

    # 3: Skincare Routine Đầy Đủ (18% off)
    c = get_or_create_combo(
        db,
        name="Skincare Routine Đầy Đủ",
        description="Routine chăm sóc da hoàn chỉnh: serum Niacinamide trị mụn, HA cấp ẩm, Revitalift chống lão hóa và kem dưỡng Moisture Surge khóa ẩm suốt 72h.",
        image_url="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800",
        discount_percent=18,
        is_active=True,
    )
    add_items(c, [("Niacinamide", 1), ("Hyaluronic Acid", 1), ("Revitalift", 1), ("Moisture Surge", 1)])

    # 4: Bộ Trị Mụn & Phục Hồi Da (15% off)
    c = get_or_create_combo(
        db,
        name="Bộ Trị Mụn & Phục Hồi Da",
        description="Giải pháp toàn diện cho làn da mụn và tổn thương: Niacinamide kiểm soát bã nhờn, Cicaplast Baume B5+ phục hồi và Sensibio H2O làm sạch dịu nhẹ.",
        image_url="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
        discount_percent=15,
        is_active=True,
    )
    add_items(c, [("Niacinamide", 1), ("Cicaplast", 1), ("Sensibio", 1)])

    # 5: Bộ Chống Lão Hóa Chuyên Sâu (20% off)
    c = get_or_create_combo(
        db,
        name="Bộ Chống Lão Hóa Chuyên Sâu",
        description="Đầu tư cho làn da tương lai: Revitalift Serum vitamin C giảm nếp nhăn, HA cấp ẩm đa tầng và Moisture Surge khóa ẩm liên tục 72h.",
        image_url="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800",
        discount_percent=20,
        is_active=True,
    )
    add_items(c, [("Revitalift", 1), ("Hyaluronic Acid", 1), ("Moisture Surge", 1)])

    # 6: Bộ Bảo Vệ Da Ban Ngày (10% off)
    c = get_or_create_combo(
        db,
        name="Bộ Bảo Vệ Da Ban Ngày",
        description="Lá chắn hoàn hảo mỗi sáng: Anthelios UVMune 400 chống nắng phổ rộng, Moisture Surge dưỡng ẩm nhẹ và Cicaplast phục hồi hàng rào bảo vệ da.",
        image_url="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
        discount_percent=10,
        is_active=True,
    )
    add_items(c, [("Anthelios", 1), ("Moisture Surge", 1), ("Cicaplast", 1)])

    # 7: Bộ Làm Sạch & Dưỡng Ẩm (15% off)
    c = get_or_create_combo(
        db,
        name="Bộ Làm Sạch & Dưỡng Ẩm",
        description="Nền tảng cho làn da khỏe mạnh: Take The Day Off làm sạch sâu, Sensibio H2O tẩy trang dịu nhẹ và Dramatically Different Gel dưỡng ẩm oil-free.",
        image_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
        discount_percent=15,
        is_active=True,
    )
    add_items(c, [("Take The Day Off", 1), ("Sensibio", 1), ("Dramatically Different", 1)])

    # 8: Bộ Dưỡng Ẩm Chuyên Sâu Cho Da Nhạy Cảm (12% off)
    c = get_or_create_combo(
        db,
        name="Bộ Dưỡng Ẩm Cho Da Nhạy Cảm",
        description="Chăm sóc nhẹ nhàng cho làn da nhạy cảm nhất: Atoderm Intensive Gel-Cream dưỡng ẩm sâu, Cicaplast Baume B5+ làm dịu và Sensibio H2O tẩy trang không cồn.",
        image_url="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80&w=800",
        discount_percent=12,
        is_active=True,
    )
    add_items(c, [("Atoderm", 1), ("Cicaplast", 1), ("Sensibio", 1)])

    # ── MAKEUP COMBOS (7) ─────────────────────────────────────────────────

    # 9: Bộ Trang Điểm Cơ Bản (10% off)
    c = get_or_create_combo(
        db,
        name="Bộ Trang Điểm Cơ Bản",
        description="Tất cả những gì bạn cần cho lớp makeup hoàn hảo mỗi ngày: son Ruby Woo huyền thoại, Voluminous Mascara dày mi gấp 5 và bảng phấn mắt 9 ô chuyên nghiệp.",
        image_url="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
        discount_percent=10,
        is_active=True,
    )
    add_items(c, [("Ruby Woo Lipstick", 1), ("Voluminous Mascara", 1), ("Eye Shadow", 1)])

    # 10: Bộ Trang Điểm Mắt Chuyên Nghiệp (18% off)
    c = get_or_create_combo(
        db,
        name="Bộ Trang Điểm Mắt Chuyên Nghiệp",
        description="Bộ sưu tập đầy đủ cho đôi mắt cuốn hút: bảng mắt MAC 9 ô, 3 mascara best-seller và cọ tán 217S blending brush chuyên nghiệp.",
        image_url="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800",
        discount_percent=18,
        is_active=True,
    )
    add_items(c, [("Eye Shadow", 1), ("Voluminous Mascara", 1), ("Sky High", 1), ("Panorama", 1), ("217S", 1)])

    # 11: Bộ Trang Điểm Nền Hoàn Hảo (12% off)
    c = get_or_create_combo(
        db,
        name="Bộ Trang Điểm Nền Hoàn Hảo",
        description="Lớp nền mịn màng không tì vết: True Match Foundation, Studio Fix Powder kiềm dầu, Even Better Foundation dưỡng da và Infallible Blender tán đều.",
        image_url="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
        discount_percent=12,
        is_active=True,
    )
    add_items(c, [("True Match", 1), ("Studio Fix", 1), ("Even Better", 1), ("Infallible Blender", 1)])

    # 12: Bộ Sưu Tập Son Môi Signature (25% off)
    c = get_or_create_combo(
        db,
        name="Bộ Sưu Tập Son Môi Signature",
        description="Bộ ba son môi biểu tượng: đỏ Ruby Woo huyền thoại, Velvet Teddy nâu đất quyến rũ và Color Riche hồng nude tự nhiên cho mọi phong cách.",
        image_url="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800",
        discount_percent=25,
        is_active=True,
    )
    add_items(c, [("Ruby Woo Lipstick", 1), ("Velvet Teddy", 1), ("Color Riche", 1)])

    # 13: Bộ Son Môi Tông Tây Sang Trọng (15% off)
    c = get_or_create_combo(
        db,
        name="Bộ Son Môi Tông Tây Sang Trọng",
        description="Ba sắc son chuẩn gu Tây: MAC Locked Kiss đỏ rực rỡ, Maybelline Vinyl Ink Witty nâu hồng bóng mướt và Clinique Pop Lip cam đào thanh lịch.",
        image_url="https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800",
        discount_percent=15,
        is_active=True,
    )
    add_items(c, [("Locked Kiss", 1), ("Vinyl Ink", 1), ("Pop Lip", 1)])

    # 14: Bộ Trang Điểm Tự Nhiên Hằng Ngày (12% off)
    c = get_or_create_combo(
        db,
        name="Bộ Trang Điểm Tự Nhiên Hằng Ngày",
        description="Vẻ đẹp tự nhiên chỉ trong 5 phút: True Match Foundation nền mịn, Voluminous Mascara mi cong và Color Riche Satin son dưỡng mềm môi.",
        image_url="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800",
        discount_percent=12,
        is_active=True,
    )
    add_items(c, [("True Match", 1), ("Voluminous Mascara", 1), ("Color Riche", 1)])

    # 15: Bộ Trang Điểm Dự Tiệc (18% off)
    c = get_or_create_combo(
        db,
        name="Bộ Trang Điểm Dự Tiệc",
        description="Tỏa sáng mọi bữa tiệc: Studio Fix Powder nền lì hoàn hảo, Eye Shadow x9 Palette mắt khói quyến rũ và Ruby Woo son đỏ huyền thoại.",
        image_url="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
        discount_percent=18,
        is_active=True,
    )
    add_items(c, [("Studio Fix", 1), ("Eye Shadow", 1), ("Ruby Woo Lipstick", 1)])

    # ── FRAGRANCE COMBOS (4) ──────────────────────────────────────────────

    # 16: Cặp Nước Hoa Cao Cấp (20% off)
    c = get_or_create_combo(
        db,
        name="Cặp Nước Hoa Cao Cấp",
        description="Bộ đôi nước hoa tinh tế: Paradise Garden hương hoa quả tươi mát cho nàng và Shadescents Velvet Teddy hương gỗ ấm áp cho chàng.",
        image_url="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
        discount_percent=20,
        is_active=True,
    )
    add_items(c, [("Paradise Garden", 1), ("Shadescents", 1)])

    # 17: Bộ Sưu Tập Nước Hoa Sang Trọng (22% off)
    c = get_or_create_combo(
        db,
        name="Bộ Sưu Tập Nước Hoa Sang Trọng",
        description="Trọn bộ 4 nước hoa đẳng cấp: Paradise Garden tươi mát, Happy cam quýt năng động, Shadescents Velvet Teddy gỗ ấm và Aromatics Elixir cổ điển tinh tế.",
        image_url="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
        discount_percent=22,
        is_active=True,
    )
    add_items(c, [("Paradise Garden", 1), ("Happy", 1), ("Shadescents", 1), ("Aromatics Elixir", 1)])

    # 18: Nước Hoa Ngày & Đêm (15% off)
    c = get_or_create_combo(
        db,
        name="Nước Hoa Ngày & Đêm",
        description="Một cặp cho mọi thời khắc: Clinique Happy tươi sáng rạng rỡ ban ngày và Shadescents Velvet Teddy ấm áp quyến rũ cho buổi tối.",
        image_url="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
        discount_percent=15,
        is_active=True,
    )
    add_items(c, [("Happy", 1), ("Shadescents", 1)])

    # 19: Cặp Nước Hoa Tươi Mát (12% off)
    c = get_or_create_combo(
        db,
        name="Cặp Nước Hoa Tươi Mát",
        description="Bộ đôi hương thơm thanh khiết: Paradise Garden hoa quả vườn địa đàng và Clinique Happy cam quýt sảng khoái - hoàn hảo cho mùa hè.",
        image_url="https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&q=80&w=800",
        discount_percent=12,
        is_active=True,
    )
    add_items(c, [("Paradise Garden", 1), ("Happy", 1)])

    # ── CROSS-CATEGORY / GIFT COMBOS (6) ──────────────────────────────────

    # 20: Combo Tân Trang Toàn Diện (18% off)
    c = get_or_create_combo(
        db,
        name="Combo Tân Trang Toàn Diện",
        description="Trọn bộ makeup từ A-Z: True Match nền mịn, Eye Shadow 9 ô, Ruby Woo son đỏ, Voluminous Mascara mi dày và cọ 217S chuyên nghiệp.",
        image_url="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
        discount_percent=18,
        is_active=True,
    )
    add_items(c, [("True Match", 1), ("Eye Shadow", 1), ("Ruby Woo Lipstick", 1), ("Voluminous Mascara", 1), ("217S", 1)])

    # 21: Combo Quà Tặng Cao Cấp (20% off)
    c = get_or_create_combo(
        db,
        name="Combo Quà Tặng Cao Cấp",
        description="Món quà hoàn hảo cho người thương: Shadescents Velvet Teddy nước hoa sang trọng, Ruby Woo son đỏ biểu tượng và Eye Shadow x9 bảng mắt chuyên nghiệp.",
        image_url="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
        discount_percent=20,
        is_active=True,
    )
    add_items(c, [("Shadescents", 1), ("Ruby Woo Lipstick", 1), ("Eye Shadow", 1)])

    # 22: Combo Chăm Sóc Bản Thân Trọn Vẹn (12% off)
    c = get_or_create_combo(
        db,
        name="Combo Chăm Sóc Bản Thân Trọn Vẹn",
        description="Nuông chiều bản thân từ trong ra ngoài: Cicaplast phục hồi da, Anthelios bảo vệ da, Happy Perfume nước hoa tươi vui và Vinyl Ink Witty son môi rạng rỡ.",
        image_url="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
        discount_percent=12,
        is_active=True,
    )
    add_items(c, [("Cicaplast", 1), ("Anthelios", 1), ("Happy", 1), ("Vinyl Ink", 1)])

    # 23: Combo Mùa Hè Rực Rỡ (15% off)
    c = get_or_create_combo(
        db,
        name="Combo Mùa Hè Rực Rỡ",
        description="Sẵn sàng cho mùa hè năng động: Anthelios UVMune 400 chống nắng tối ưu, Paradise Garden nước hoa tươi mát, Sky High Mascara mi dài và Pop Lip Colour cam đào.",
        image_url="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
        discount_percent=15,
        is_active=True,
    )
    add_items(c, [("Anthelios", 1), ("Paradise Garden", 1), ("Sky High", 1), ("Pop Lip", 1)])

    # 24: Combo Cô Dâu (25% off)
    c = get_or_create_combo(
        db,
        name="Combo Cô Dâu Lộng Lẫy",
        description="Tỏa sáng trong ngày trọng đại: Even Better Foundation nền dưỡng da, Studio Fix Powder kiềm dầu bền suốt ngày, Eye Shadow x9 tạo điểm nhấn và Ruby Woo son đỏ cô dâu.",
        image_url="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
        discount_percent=25,
        is_active=True,
    )
    add_items(c, [("Even Better", 1), ("Studio Fix", 1), ("Eye Shadow", 1), ("Ruby Woo Lipstick", 1)])

    # 25: Combo Skincare & Makeup Cơ Bản (15% off)
    c = get_or_create_combo(
        db,
        name="Combo Skincare & Makeup Cơ Bản",
        description="Khởi đầu hoàn hảo cho người mới bắt đầu: Niacinamide trị mụn, Moisture Surge dưỡng ẩm, True Match nền mịn và Color Riche son nude tự nhiên.",
        image_url="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
        discount_percent=15,
        is_active=True,
    )
    add_items(c, [("Niacinamide", 1), ("Moisture Surge", 1), ("True Match", 1), ("Color Riche", 1)])

    db.commit()


def ensure_content_seed_data(db: Session) -> None:
    """Seed banners, reviews, product images, notifications and wishlist items."""
    products = db.query(Product).order_by(Product.id.asc()).limit(40).all()
    if not products:
        return

    for banner in [
        {
            "title": "Bộ Sưu Tập Mùa Hè 2026",
            "subtitle": "Khám phá sắc màu rực rỡ với ưu đãi lên đến 30%",
            "description": "Son, nền và chống nắng cho những ngày nắng nóng.",
            "image_url": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200",
            "link_url": "/shop",
            "is_active": True,
            "sort_order": 1,
        },
        {
            "title": "Chăm Sóc Da Chuyên Sâu",
            "subtitle": "Giải pháp toàn diện cho làn da khỏe mạnh từ TMC",
            "description": "Routine phục hồi, cấp ẩm và bảo vệ da nhạy cảm.",
            "image_url": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200",
            "link_url": "/shop?category=cham-soc-da",
            "is_active": True,
            "sort_order": 2,
        },
        {
            "title": "Combo Tiết Kiệm",
            "subtitle": "Mua theo bộ - Tiết kiệm đến 25%",
            "description": "Các combo makeup và skincare đã được phối sẵn.",
            "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200",
            "link_url": "/combos",
            "is_active": True,
            "sort_order": 3,
        },
        {
            "title": "Nhập Sỉ Mỹ Phẩm TMC",
            "subtitle": "Mức sỉ theo tổng đơn từ 2 triệu",
            "description": "Bảng giá sỉ linh hoạt cho spa, salon và đại lý nhỏ.",
            "image_url": "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=1200",
            "link_url": "/shop",
            "is_active": True,
            "sort_order": 4,
        },
        {
            "title": "Son Môi Trending",
            "subtitle": "Son lì, son thỏi, son bóng đang bán chạy",
            "description": "Từ sắc đỏ cổ điển đến tint bóng hồng đất dễ dùng.",
            "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=1200",
            "link_url": "/shop?category=son-moi",
            "is_active": True,
            "sort_order": 5,
        },
    ]:
        get_or_create_banner(db, **banner)

    for index, product in enumerate(products[:24]):
        if not product.image_url:
            continue
        get_or_create_product_image(db, product_id=product.id, image_url=product.image_url, sort_order=0)
        get_or_create_product_image(
            db,
            product_id=product.id,
            image_url=f"{product.image_url}&seed-gallery={index + 1}",
            sort_order=1,
        )

    # Product Reviews
    customers = db.query(User).filter(User.role == "customer").order_by(User.id.asc()).limit(6).all()
    review_comments = [
        (5, "Sản phẩm dùng rất ổn, đóng gói kỹ và giao nhanh."),
        (4, "Chất lượng tốt, đúng mô tả, sẽ mua lại khi hết."),
        (5, "Kết cấu dễ dùng, màu/finish đẹp hơn mong đợi."),
        (4, "Giá hợp lý, phù hợp routine hằng ngày."),
        (5, "Shop tư vấn nhiệt tình, sản phẩm còn hạn xa."),
        (4, "Mua để thử nhưng khá hài lòng với hiệu quả."),
    ]
    for product_index, product in enumerate(products[:18]):
        for customer_index, customer in enumerate(customers[:3]):
            rating, comment = review_comments[(product_index + customer_index) % len(review_comments)]
            get_or_create_review(product_id=product.id, user_id=customer.id, rating=rating, comment=comment, db=db)

    # Notifications
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        get_or_create_notification(
            db,
            user_id=admin.id,
            title="Chào mừng đến với TMC Admin",
            message="Hệ thống quản trị đã sẵn sàng. Bạn có thể quản lý sản phẩm, đơn hàng và nội dung.",
            link="/admin",
        )
        get_or_create_notification(
            db,
            user_id=admin.id,
            title="Seed dữ liệu demo đã được cập nhật",
            message="Catalog đã có thêm sản phẩm, banner, review, mã giảm giá và dữ liệu sỉ để kiểm thử sau deploy.",
            link="/admin",
        )
    for customer in customers:
        get_or_create_notification(
            db,
            user_id=customer.id,
            title="Chào mừng đến với TMC!",
            message="Cảm ơn bạn đã đăng ký tài khoản. Khám phá bộ sưu tập mỹ phẩm cao cấp của chúng tôi.",
            link="/shop",
        )
        get_or_create_notification(
            db,
            user_id=customer.id,
            title="Ưu đãi nhập sỉ theo tổng đơn",
            message="Đơn hàng từ 2 triệu sẽ tự động được gợi ý mức giá sỉ phù hợp.",
            link="/shop",
        )

    # Wishlist Items
    for customer_index, customer in enumerate(customers):
        for product in products[customer_index:customer_index + 4]:
            get_or_create_wishlist_item(db, user_id=customer.id, product_id=product.id)

    db.commit()


def seed_database(db: Session):
    """Seed initial data if database is empty."""
    is_empty_database = db.query(User).first() is None
    if not is_empty_database:
        ensure_default_admin_user(db)

    # Check if already seeded
    if not is_empty_database:
        ensure_default_discount_setting(db)
        ensure_default_pricing_tiers(db)
        ensure_default_wholesale_tiers(db)
        ensure_expanded_seed_data(db)
        ensure_content_seed_data(db)
        ensure_default_chatbot_key(db)
        return

    # --- Users ---
    admin = User(email="admin@tmc.vn", hashed_password=get_password_hash("admin123"), full_name="TMC Admin", phone="0766669266", role="admin")
    customer = User(email="user@tmc.vn", hashed_password=get_password_hash("user123"), full_name="Nguyen Van A", phone="0901234567", role="customer")
    db.add_all([admin, customer])
    db.flush()

    # --- Categories ---
    categories = [
        Category(name="Son Môi", slug="son-moi", image_url="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800"),
        Category(name="Phấn Nền", slug="phan-nen", image_url="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"),
        Category(name="Chăm Sóc Da", slug="cham-soc-da", image_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800"),
        Category(name="Nước Hoa", slug="nuoc-hoa", image_url="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800"),
        Category(name="Trang Điểm Mắt", slug="trang-diem-mat", image_url="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800"),
        Category(name="Dụng Cụ", slug="dung-cu", image_url="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800"),
    ]
    db.add_all(categories)
    db.flush()
    db.add_all(
        [
            Category(name="Son Lì", slug="son-li", image_url=categories[0].image_url, parent_id=categories[0].id),
            Category(name="Son Thỏi", slug="son-thoi", image_url=categories[0].image_url, parent_id=categories[0].id),
            Category(name="Son Bóng", slug="son-bong", image_url=categories[0].image_url, parent_id=categories[0].id),
        ]
    )
    db.flush()

    # --- Brands ---
    brands = [
        Brand(name="MAC", logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/MAC_Cosmetics_logo.svg/200px-MAC_Cosmetics_logo.svg.png"),
        Brand(name="Clinique", logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Clinique_logo.svg/200px-Clinique_logo.svg.png"),
        Brand(name="L'Oréal", logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/L%27Or%C3%A9al_logo.svg/200px-L%27Or%C3%A9al_logo.svg.png"),
        Brand(name="The Ordinary", logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/The_Ordinary_Logo.svg/200px-The_Ordinary_Logo.svg.png"),
    ]
    db.add_all(brands)
    db.flush()

    cat_son, cat_phan, cat_da, cat_hoa, cat_mat, cat_dc = categories
    br_mac, br_clinique, br_loreal, br_ordinary = brands

    # --- Products (20+ items) ---
    products = [
        # Son Môi
        Product(name="MAC Ruby Woo Lipstick", description="Son lì đỏ thuần huyền thoại, bám màu lâu trôi, phù hợp mọi tông da.", image_url="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800", category_id=cat_son.id, brand_id=br_mac.id, retail_price=580000, wholesale_price=450000, variant_options='[{"name":"Ruby Woo","image_url":"https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800","stock":70},{"name":"Chili","image_url":"https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800","stock":65},{"name":"Velvet Teddy","image_url":"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800","stock":65}]', badge="BEST SELLER", stock=200),
        Product(name="L'Oréal Color Riche Satin", description="Son mềm mịn màu hồng nude tự nhiên, dưỡng ẩm môi suốt ngày dài.", image_url="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800", category_id=cat_son.id, brand_id=br_loreal.id, retail_price=320000, wholesale_price=240000, variant_options='[{"name":"Nude Beige","image_url":"https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800","stock":50},{"name":"Rose Satin","image_url":"https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800","stock":50},{"name":"Brown Terre","image_url":"https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800","stock":50}]', stock=150),
        Product(name="Clinique Pop Lip Colour", description="Son lì nhẹ môi với công nghệ giữ ẩm, tông cam đào sang trọng.", image_url="https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800", category_id=cat_son.id, brand_id=br_clinique.id, retail_price=650000, wholesale_price=520000, variant_options='[{"name":"Poppy Pop","image_url":"https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800","stock":40},{"name":"Berry Pop","image_url":"https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800","stock":40},{"name":"Nude Pop","image_url":"https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800","stock":40}]', badge="NEW IN", stock=120),
        Product(name="MAC Velvet Teddy", description="Son lì tông nâu đất quyến rũ, hoàn hảo cho makeup hàng ngày.", image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800", category_id=cat_son.id, brand_id=br_mac.id, retail_price=580000, wholesale_price=450000, stock=180),

        # Phấn Nền
        Product(name="L'Oréal True Match Foundation", description="Kem nền siêu mịn, hòa quyện với da tự nhiên, che phủ hoàn hảo suốt 24h.", image_url="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800", category_id=cat_phan.id, brand_id=br_loreal.id, retail_price=450000, wholesale_price=340000, badge="BEST SELLER", stock=160),
        Product(name="MAC Studio Fix Powder", description="Phấn nền dạng nén kiểm dầu, tạo lớp nền mịn lì tự nhiên.", image_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800", category_id=cat_phan.id, brand_id=br_mac.id, retail_price=890000, wholesale_price=720000, stock=90),
        Product(name="Clinique Even Better Foundation", description="Kem nền dưỡng da, cải thiện sắc tố da không đều sau 12 tuần.", image_url="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800", category_id=cat_phan.id, brand_id=br_clinique.id, retail_price=1050000, wholesale_price=880000, badge="NEW IN", stock=75),

        # Chăm Sóc Da
        Product(name="The Ordinary Niacinamide 10%", description="Serum niacinamide giảm mụn, thu nhỏ lỗ chân lông, sáng da.", image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800", category_id=cat_da.id, brand_id=br_ordinary.id, retail_price=210000, wholesale_price=160000, badge="BEST SELLER", stock=300),
        Product(name="Clinique Moisture Surge", description="Kem dưỡng ẩm 72h, công nghệ Auto-Replenishing cấp nước sâu.", image_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800", category_id=cat_da.id, brand_id=br_clinique.id, retail_price=980000, wholesale_price=800000, stock=110),
        Product(name="L'Oréal Revitalift Serum", description="Serum chống lão hóa vitamin C, giảm nếp nhăn, tăng độ đàn hồi.", image_url="https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800", category_id=cat_da.id, brand_id=br_loreal.id, retail_price=520000, wholesale_price=400000, stock=140),
        Product(name="The Ordinary Hyaluronic Acid 2%", description="Serum cấp ẩm đa tầng với hyaluronic acid nồng độ cao.", image_url="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800", category_id=cat_da.id, brand_id=br_ordinary.id, retail_price=180000, wholesale_price=135000, stock=250),
        Product(name="Clinique Dramatically Different Gel", description="Gel dưỡng ẩm oil-free, kiểm soát dầu nhờn, da khỏe mỗi ngày.", image_url="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800", category_id=cat_da.id, brand_id=br_clinique.id, retail_price=720000, wholesale_price=580000, stock=95),

        # Nước Hoa
        Product(name="L'Oréal Paradise Garden EDP", description="Nước hoa nữ hương hoa quả tươi mát, lưu hương 8-10 tiếng.", image_url="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800", category_id=cat_hoa.id, brand_id=br_loreal.id, retail_price=1650000, wholesale_price=1350000, badge="NEW IN", stock=60),
        Product(name="Clinique Happy Perfume Spray", description="Nước hoa unisex hương cam quýt, năng động và tươi trẻ.", image_url="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800", category_id=cat_hoa.id, brand_id=br_clinique.id, retail_price=1200000, wholesale_price=980000, stock=80),
        Product(name="MAC Shadescents Velvet Teddy", description="Nước hoa lấy cảm hứng từ son Velvet Teddy, hương gỗ ấm áp.", image_url="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800", category_id=cat_hoa.id, brand_id=br_mac.id, retail_price=1850000, wholesale_price=1500000, stock=45),

        # Trang Điểm Mắt
        Product(name="MAC Eye Shadow x9 Palette", description="Bảng phấn mắt 9 ô với tông trung tính, dễ blend, lên màu chuẩn.", image_url="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800", category_id=cat_mat.id, brand_id=br_mac.id, retail_price=1250000, wholesale_price=1000000, badge="BEST SELLER", stock=70),
        Product(name="L'Oréal Voluminous Mascara", description="Mascara dày mi gấp 5 lần, chống nước, không vón cục.", image_url="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800", category_id=cat_mat.id, brand_id=br_loreal.id, retail_price=280000, wholesale_price=210000, stock=200),
        Product(name="Clinique Lash Power Mascara", description="Mascara bền màu 24h, không trôi, dễ tẩy bằng nước ấm.", image_url="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800", category_id=cat_mat.id, brand_id=br_clinique.id, retail_price=620000, wholesale_price=500000, stock=100),

        # Dụng Cụ
        Product(name="MAC 217S Blending Brush", description="Cọ tán phấn mắt chuyên nghiệp, lông tổng hợp siêu mềm.", image_url="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800", category_id=cat_dc.id, brand_id=br_mac.id, retail_price=750000, wholesale_price=600000, stock=85),
        Product(name="L'Oréal Infallible Blender", description="Mút tán nền cao cấp, thấm hút tốt, tạo lớp nền mịn không vệt.", image_url="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800", category_id=cat_dc.id, brand_id=br_loreal.id, retail_price=190000, wholesale_price=140000, stock=220),
    ]
    db.add_all(products)

    # --- Discount Codes ---
    db.add(
        DiscountCode(
            code="WELCOME10",
            discount_type="percent",
            discount_value=10,
            min_order_amount=300000,
            max_usage=500,
            is_active=True,
        )
    )

    # --- Discount Setting ---
    setting = DiscountSetting(wholesale_threshold=5000000, default_shipping_fee=30000, updated_by=admin.id)
    db.add(setting)

    ensure_default_pricing_tiers(db)
    ensure_default_wholesale_tiers(db)

    # --- Blog Categories ---
    blog_categories = [
        BlogCategory(name="Chăm Sóc Da", slug="cham-soc-da", description="Kiến thức chăm sóc da chuyên sâu."),
        BlogCategory(name="Điều Trị", slug="dieu-tri", description="Bài viết về liệu trình và công nghệ làm đẹp."),
        BlogCategory(name="Bác Sĩ Giải Đáp", slug="bac-si-giai-dap", description="Các câu hỏi thường gặp từ khách hàng."),
    ]
    db.add_all(blog_categories)
    db.flush()

    db.add_all(
        [
            BlogArticle(
                title="Niacinamide có thực sự phù hợp với da dầu mụn?",
                slug="niacinamide-cho-da-dau-mun",
                content="Niacinamide là hoạt chất hỗ trợ điều tiết bã nhờn, làm dịu viêm và hỗ trợ cải thiện lỗ chân lông. Khi kết hợp với routine làm sạch, dưỡng ẩm và chống nắng hợp lý, đây là lựa chọn rất phù hợp cho da dầu mụn.",
                image_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
                author_id=admin.id,
                category_id=blog_categories[0].id,
                is_published=True,
            ),
            BlogArticle(
                title="Khi nào nên chọn laser thay vì treatment bôi tại nhà?",
                slug="khi-nao-nen-chon-laser",
                content="Laser phù hợp hơn khi tình trạng sắc tố, sẹo rỗ hoặc lão hóa cần can thiệp sâu. Việc lựa chọn cần dựa trên tình trạng da, mục tiêu và khả năng nghỉ dưỡng sau điều trị.",
                image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
                author_id=admin.id,
                category_id=blog_categories[1].id,
                is_published=True,
            ),
            BlogArticle(
                title="5 hiểu lầm phổ biến về mụn tuổi trưởng thành",
                slug="hieu-lam-ve-mun-tuoi-truong-thanh",
                content="Mụn ở tuổi trưởng thành không chỉ liên quan đến vệ sinh da. Nội tiết, stress, giấc ngủ và sản phẩm sử dụng đều có thể là nguyên nhân quan trọng.",
                image_url="https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800",
                author_id=admin.id,
                category_id=blog_categories[2].id,
                is_published=True,
            ),
        ]
    )

    db.commit()
    ensure_expanded_seed_data(db)
    ensure_content_seed_data(db)
    ensure_default_chatbot_key(db)
    print("✅ Database seeded with users, catalog, discounts, and blog content!")
