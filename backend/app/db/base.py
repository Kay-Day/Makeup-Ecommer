# Import all models so Base.metadata knows about them
from app.db.database import Base
from app.models.user import User
from app.models.category import Category
from app.models.brand import Brand
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.discount_setting import DiscountSetting
