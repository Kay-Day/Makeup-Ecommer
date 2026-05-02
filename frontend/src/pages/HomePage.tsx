import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { productApi } from '../services/api';
import type { Product } from '../services/api';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

// --- MOCK DATA ---
const HERO_BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=1920',
    subtitle: 'home.hero_subtitle',
    title: 'home.hero_title',
    desc: 'home.hero_desc',
  },
  {
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=1920',
    subtitle: 'NÉT ĐẸP RẠNG RỠ',
    title: 'SKINCARE ESSENTIALS',
    desc: 'Khám phá bí quyết chăm sóc da chuẩn chuyên gia, mang lại làn da căng mướt rạng ngời.',
  },
  {
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1920',
    subtitle: 'DẤU ẤN CÁ NHÂN',
    title: 'SIGNATURE SCENTS',
    desc: 'Bộ sưu tập nước hoa độc quyền, đánh thức mọi giác quan của bạn.',
  }
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Son Môi', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=400', link: '/shop?category=lips' },
  { id: 2, name: 'Chăm Sóc Da', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400', link: '/shop?category=skincare' },
  { id: 3, name: 'Trang Điểm Mặt', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400', link: '/shop?category=face' },
  { id: 4, name: 'Nước Hoa', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400', link: '/shop?category=fragrance' },
];

const MOCK_BRANDS = [
  { id: 1, name: 'MAC', logo: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=200' },
  { id: 2, name: 'Dior', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=200' },
  { id: 3, name: 'Chanel', logo: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200' },
  { id: 4, name: 'Estee Lauder', logo: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=200' },
  { id: 5, name: 'YSL', logo: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200' },
  { id: 6, name: 'NARS', logo: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=200' },
];

// Product data will be fetched from API

const MOCK_BLOGS = [
  { id: 1, title: 'Bí Quyết Chọn Son Đỏ Cho Từng Tông Da', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600', date: '10/05/2026' },
  { id: 2, title: '5 Bước Skincare Cấp Ẩm Cho Mùa Hanh Khô', image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=600', date: '08/05/2026' },
  { id: 3, title: 'Xu Hướng Trang Điểm Tự Nhiên Glass Skin', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=600', date: '05/05/2026' },
];

// Motion Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function HomePage() {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productApi.getAll({ limit: 12 }).then(res => setProducts(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-surface pb-20">
      {/* 1. Hero Banner (Swiper Slider) */}
      <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={true}
          className="w-full h-full"
        >
          {HERO_BANNERS.map((banner, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <motion.img 
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 6, ease: "easeOut" }}
                  src={banner.image} 
                  alt={banner.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-center px-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <span className="text-white font-label-caps tracking-widest text-sm mb-4 block animate-pulse">
                      {banner.subtitle.includes('.') ? t(banner.subtitle) : banner.subtitle}
                    </span>
                    <h1 className="text-white font-h1 text-5xl md:text-7xl font-bold mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-float">
                      {banner.title.includes('.') ? t(banner.title) : banner.title}
                    </h1>
                    <p className="text-white text-lg md:text-xl max-w-2xl mb-8 drop-shadow-md mx-auto">
                      {banner.desc.includes('.') ? t(banner.desc) : banner.desc}
                    </p>
                    <Link to="/shop" className="inline-block bg-white text-primary px-10 py-4 rounded-full font-bold hover:bg-surface-container transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-glow active:scale-95">
                      {t('home.shop_now')}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 2. Danh Mục (Categories) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="max-w-[1440px] mx-auto px-8 md:px-16 py-20"
      >
        <motion.h2 variants={fadeInUp} className="font-h2 text-3xl font-bold text-center mb-12 text-on-surface">{t('home.categories_title')}</motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {MOCK_CATEGORIES.map((cat, idx) => (
            <motion.div key={cat.id} variants={fadeInUp}>
              <Link to={cat.link} className="group flex flex-col items-center">
                <div className="w-36 h-36 md:w-52 md:h-52 rounded-full overflow-hidden mb-6 shadow-md group-hover:shadow-[0_0_30px_rgba(255,100,150,0.3)] transition-all duration-500 border-4 border-white animate-float" style={{animationDelay: `${idx * 0.5}s`}}>
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="font-h3 text-lg font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity animate-sparkle">auto_awesome</span>
                  {cat.name}
                  <span className="material-symbols-outlined text-sm text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity animate-sparkle">auto_awesome</span>
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 3. Flash Deals */}
      <section className="bg-error-container/20 py-20 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-[1440px] mx-auto px-8 md:px-16"
        >
          <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-error/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <h2 className="font-h2 text-3xl font-bold text-error flex items-center gap-2">
                <span className="material-symbols-outlined text-5xl animate-pulse text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">bolt</span>
                {t('home.flash_deals_title')}
              </h2>
              <div className="flex gap-2 text-white font-bold bg-error p-3 rounded-xl shadow-md animate-glow">
                <div className="px-2 py-1 bg-white/20 rounded text-xl animate-pulse">{String(timeLeft.hours).padStart(2, '0')}</div>
                <span className="text-white font-bold text-xl">:</span>
                <div className="px-2 py-1 bg-white/20 rounded text-xl animate-pulse" style={{animationDelay: '0.2s'}}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                <span className="text-white font-bold text-xl">:</span>
                <div className="px-2 py-1 bg-white/20 rounded text-xl animate-pulse" style={{animationDelay: '0.4s'}}>{String(timeLeft.seconds).padStart(2, '0')}</div>
              </div>
            </div>
            <Link to="/shop?sale=true" className="text-error font-bold hover:bg-error/10 px-6 py-3 rounded-full transition-colors flex items-center">
              {t('home.view_all')} <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product, idx) => (
              <motion.div key={`flash-${product.id}`} variants={fadeInUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. Thương Hiệu (Brands) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-[1440px] mx-auto px-8 md:px-16 py-20"
      >
        <motion.h2 variants={fadeInUp} className="font-h2 text-3xl font-bold text-center mb-12 text-on-surface">{t('home.brands_title')}</motion.h2>
        <div className="flex flex-wrap justify-center gap-8">
          {MOCK_BRANDS.map(brand => (
            <motion.div key={brand.id} variants={fadeInUp} whileHover={{ y: -5 }} className="w-24 h-24 md:w-36 md:h-36 rounded-2xl bg-white shadow-sm flex items-center justify-center p-6 hover:shadow-xl transition-all duration-300 grayscale hover:grayscale-0 overflow-hidden border border-outline-variant/20">
              <Link to={`/search?brand=${brand.id}`}>
                <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 7. Chương trình khuyến mãi (Promo Banners) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-[1440px] mx-auto px-8 md:px-16 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={fadeInUp}>
            <Link to="/shop" className="relative h-72 rounded-3xl overflow-hidden group block shadow-lg">
              <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Promo 1"/>
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-10">
                <span className="text-white font-bold bg-primary px-4 py-1.5 rounded-full w-max text-xs mb-4 tracking-widest uppercase shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse">{t('home.promo_gift_tag')}</span>
                <h3 className="text-white text-3xl font-bold mb-3 drop-shadow-md animate-float">{t('home.promo_gift_title')}</h3>
                <p className="text-white/90 text-sm">{t('home.promo_gift_desc')}</p>
              </div>
            </Link>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Link to="/shop" className="relative h-72 rounded-3xl overflow-hidden group block shadow-lg">
              <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Promo 2"/>
              <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent flex flex-col justify-center items-end text-right p-10">
                <span className="text-white font-bold bg-error px-4 py-1.5 rounded-full w-max text-xs mb-4 tracking-widest uppercase shadow-[0_0_15px_rgba(255,0,0,0.5)] animate-pulse">{t('home.promo_sale_tag')}</span>
                <h3 className="text-white text-3xl font-bold mb-3 drop-shadow-md animate-float" style={{animationDelay: '1s'}}>{t('home.promo_sale_title')}</h3>
                <p className="text-white/90 text-sm">{t('home.promo_sale_desc')}</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* 5, 6, 8. Sản Phẩm (Tabs Example) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-[1440px] mx-auto px-8 md:px-16 py-20"
      >
        <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-center items-center mb-12 gap-6 border-b border-outline-variant/30 pb-6">
          <div className="flex gap-8 md:gap-16 overflow-x-auto w-full md:w-auto hide-scrollbar">
            <button className="text-2xl font-bold text-primary border-b-4 border-primary pb-2 whitespace-nowrap">{t('home.tab_new')}</button>
            <button className="text-2xl font-bold text-outline hover:text-primary transition-colors whitespace-nowrap">{t('home.tab_bestseller')}</button>
            <button className="text-2xl font-bold text-outline hover:text-primary transition-colors whitespace-nowrap">{t('home.tab_favorite')}</button>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 8).map(product => (
            <motion.div key={`tab-${product.id}`} variants={fadeInUp}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 10. Tin Tức (Blog) */}
      <section className="bg-surface-container-low py-20 border-t border-outline-variant/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-[1440px] mx-auto px-8 md:px-16"
        >
          <motion.div variants={fadeInUp} className="flex justify-between items-end mb-12">
            <div>
              <span className="font-label-caps tracking-widest text-primary text-xs font-bold uppercase mb-2 block">{t('home.editorial')}</span>
              <h2 className="font-h2 text-4xl font-bold text-on-surface">{t('home.blog_title')}</h2>
            </div>
            <Link to="/blog" className="text-primary font-bold hover:bg-primary/10 px-6 py-3 rounded-full transition-colors flex items-center">
              {t('home.blog_view_all')} <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {MOCK_BLOGS.map((blog, idx) => (
              <motion.div key={blog.id} variants={fadeInUp}>
                <Link to={`/blog/${blog.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 block">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="p-8">
                    <p className="text-outline text-xs mb-3 font-bold uppercase tracking-widest">{blog.date}</p>
                    <h3 className="font-h3 text-xl font-bold text-on-surface mb-4 line-clamp-2 group-hover:text-primary transition-colors">{blog.title}</h3>
                    <span className="text-primary text-sm font-bold flex items-center group-hover:translate-x-2 transition-transform">{t('home.blog_read_more')} <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span></span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 9. Gợi ý sản phẩm (Recommended) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-[1440px] mx-auto px-8 md:px-16 py-20"
      >
        <motion.h2 variants={fadeInUp} className="font-h2 text-3xl font-bold text-center mb-12 text-on-surface">{t('home.recommended_title')}</motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).reverse().map(product => (
            <motion.div key={`rec-${product.id}`} variants={fadeInUp}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </motion.section>

    </div>
  );
}

// Reusable Product Card Component
function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-outline-variant/30 group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 relative flex flex-col h-full hover:-translate-y-2">
      {/* Tag */}
      {product.badge && (
        <div className={`absolute top-4 left-4 z-10 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-md ${product.badge.includes('SALE') ? 'bg-error' : 'bg-primary'}`}>
          {product.badge === 'BEST SELLER' ? t('product.badge_bestseller') : 
           product.badge === 'NEW IN' ? t('product.badge_newin') : 
           product.badge === 'SALE' ? t('product.badge_sale') : product.badge}
        </div>
      )}
      
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block aspect-[4/5] overflow-hidden relative">
        <img src={product.image_url || ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="bg-white text-primary rounded-full p-4 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <Link to={`/product/${product.id}`} className="block mb-4">
          <h3 className="font-h3 text-lg font-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-3 mt-auto">
          <span className="font-bold text-primary text-xl">
            {product.retail_price.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>
    </div>
  );
}
