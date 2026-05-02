from sqlalchemy.orm import Session
from app.models.user import User
from app.models.category import Category
from app.models.brand import Brand
from app.models.product import Product
from app.models.discount_setting import DiscountSetting
from app.core.security import get_password_hash

def seed_database(db: Session):
    """Seed initial data if database is empty."""
    # Check if already seeded
    if db.query(User).first():
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
        Product(name="MAC Ruby Woo Lipstick", description="Son lì đỏ thuần huyền thoại, bám màu lâu trôi, phù hợp mọi tông da.", image_url="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800", category_id=cat_son.id, brand_id=br_mac.id, retail_price=580000, wholesale_price=450000, badge="BEST SELLER", stock=200),
        Product(name="L'Oréal Color Riche Satin", description="Son mềm mịn màu hồng nude tự nhiên, dưỡng ẩm môi suốt ngày dài.", image_url="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800", category_id=cat_son.id, brand_id=br_loreal.id, retail_price=320000, wholesale_price=240000, stock=150),
        Product(name="Clinique Pop Lip Colour", description="Son lì nhẹ môi với công nghệ giữ ẩm, tông cam đào sang trọng.", image_url="https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800", category_id=cat_son.id, brand_id=br_clinique.id, retail_price=650000, wholesale_price=520000, badge="NEW IN", stock=120),
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

    # --- Discount Setting ---
    setting = DiscountSetting(wholesale_threshold=5000000, updated_by=admin.id)
    db.add(setting)

    db.commit()
    print("✅ Database seeded with 20+ products, 6 categories, 4 brands, 2 users!")
