import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { productApi, bannerApi, categoryApi, brandApi, blogApi, type Banner, type ProductDiscount } from '../services/api';
import type { Product, Category, Brand, BlogArticle } from '../services/api';
import type { Variants } from 'framer-motion';

function isDiscountActive(discount: ProductDiscount): boolean {
  const now = new Date().getTime();
  const start = new Date(discount.start_time).getTime();
  const end = new Date(discount.end_time).getTime();
  return discount.is_active && now >= start && now <= end;
}

function CountdownBadge({ endTime }: { endTime: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, new Date(endTime).getTime() - now);
  if (diff === 0) return null;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white">
      <span className="material-symbols-outlined text-xs">schedule</span>
      {days > 0 ? `${days}d ` : ''}
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

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
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const FALLBACK_BANNERS = [
  { id: 0, image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=1920', subtitle: 'home.hero_subtitle', title: 'home.hero_title', desc: 'home.hero_desc', link_url: null },
  { id: 1, image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=1920', subtitle: 'NÉT ĐẸP RẠNG RỠ', title: 'SKINCARE ESSENTIALS', desc: 'Khám phá bí quyết chăm sóc da chuẩn chuyên gia.', link_url: null },
  { id: 2, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1920', subtitle: 'DẤU ẤN CÁ NHÂN', title: 'SIGNATURE SCENTS', desc: 'Bộ sưu tập nước hoa độc quyền, đánh thức mọi giác quan của bạn.', link_url: null },
];

export function HomePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [tabProducts, setTabProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [activeProductTab, setActiveProductTab] = useState<'new' | 'bestseller' | 'favorite'>('new');
  const [flashEndTime, setFlashEndTime] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const selectProductTab = (tab: 'new' | 'bestseller' | 'favorite') => {
    setActiveProductTab(tab);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    productApi.getAll({ limit: 12 }).then(res => setProducts(res.data)).catch(console.error);
    bannerApi.getAll().then(res => setBanners(res.data)).catch(() => setBanners([]));
    categoryApi.getAll().then(res => setCategories(res.data)).catch(console.error);
    brandApi.getAll().then(res => setBrands(res.data)).catch(console.error);
    blogApi.getArticles().then(res => setBlogs(res.data.slice(0, 3))).catch(console.error);
  }, []);

  useEffect(() => {
    const sortParam = activeProductTab === 'new' ? undefined : activeProductTab === 'bestseller' ? 'sold' : 'rating';
    productApi.getAll({ limit: 8, sort: sortParam }).then(res => setTabProducts(res.data)).catch(console.error);
  }, [activeProductTab]);

  // Find the earliest-ending active discount for flash deals countdown
  useEffect(() => {
    const activeDiscounts = products
      .filter(p => p.discount && isDiscountActive(p.discount))
      .map(p => p.discount!);
    if (activeDiscounts.length > 0) {
      const earliest = activeDiscounts.reduce((a, b) =>
        new Date(a.end_time).getTime() < new Date(b.end_time).getTime() ? a : b
      );
      setFlashEndTime(earliest.end_time);
    } else {
      // Fallback: 12 hours from now
      setFlashEndTime(new Date(Date.now() + 12 * 3600000).toISOString());
    }
  }, [products]);

  useEffect(() => {
    if (!flashEndTime) return;
    const updateCountdown = () => {
      const diff = Math.max(0, new Date(flashEndTime).getTime() - Date.now());
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [flashEndTime]);

  return (
    <div className="bg-surface pb-20">
      {/* 1. Hero Banner (Swiper Slider) */}
      <section className="relative w-full h-[60vh] sm:h-[75vh] md:h-[85vh] overflow-hidden">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={true}
          className="w-full h-full"
        >
          {(banners.length > 0 ? banners : FALLBACK_BANNERS).map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="relative w-full h-full">
                <motion.img
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 7, ease: 'easeOut' }}
                  src={'image_url' in banner ? (banner as Banner).image_url : (banner as typeof FALLBACK_BANNERS[0]).image}
                  alt={'title' in banner ? banner.title : ''}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10 flex flex-col justify-center items-center text-center px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-3xl"
                  >
                    <span className="text-white/90 font-label-caps tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 block uppercase">
                      {'subtitle' in banner ? (banner.subtitle?.includes('.') ? t(banner.subtitle) : banner.subtitle) : ''}
                    </span>
                    <h1 className="text-white font-h1 text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                      {banner.title.includes('.') ? t(banner.title) : banner.title}
                    </h1>
                    <p className="text-white/80 text-sm sm:text-lg md:text-xl max-w-xl mb-6 sm:mb-8 drop-shadow-md mx-auto leading-relaxed">
                      {'description' in banner ? (banner as Banner).description : (banner as typeof FALLBACK_BANNERS[0]).desc}
                    </p>
                    <Link
                      to={'link_url' in banner && (banner as Banner).link_url ? (banner as Banner).link_url! : '/shop'}
                      className="inline-flex items-center gap-2 bg-white text-emerald-900 px-8 py-3.5 sm:px-10 sm:py-4 rounded-full font-bold hover:bg-stone-100 transition-all shadow-[0_8px_40px_rgba(0,0,0,0.25)] active:scale-95 text-sm sm:text-base"
                    >
                      {t('home.shop_now')}
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
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
        className="max-w-[1440px] mx-auto px-6 md:px-16 py-16 md:py-20"
      >
        <motion.div variants={fadeInUp} className="text-center mb-10 md:mb-12">
          <span className="font-label-caps text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2 block">{t('home.categories_title')}</span>
          <h2 className="font-h2 text-2xl md:text-3xl font-bold text-on-surface">Khám Phá Danh Mục</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
          {(categories.length > 0 ? categories.slice(0, 4) : MOCK_CATEGORIES).map((cat, idx) => (
            <motion.div key={cat.id} variants={fadeInUp}>
              <Link to={'slug' in cat ? `/shop?category=${cat.slug}` : cat.link} className="group flex flex-col items-center">
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-2xl overflow-hidden mb-4 md:mb-6 shadow-md group-hover:shadow-xl transition-all duration-500 border-2 border-white group-hover:border-emerald-200" style={{animationDelay: `${idx * 0.5}s`}}>
                  {'image_url' in cat && cat.image_url
                    ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    : 'image' in cat && cat.image
                    ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    : <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                        <span className="material-symbols-outlined text-3xl text-emerald-500">category</span>
                      </div>
                  }
                </div>
                <h3 className="font-h3 text-sm md:text-lg font-bold text-on-surface group-hover:text-emerald-800 transition-colors flex items-center gap-1.5">
                  {cat.name}
                  <span className="material-symbols-outlined text-sm text-emerald-500 opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1">arrow_forward</span>
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 3. Flash Deals */}
      <section className="bg-gradient-to-b from-red-50/60 to-surface py-16 md:py-20 overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-[1440px] mx-auto px-6 md:px-16"
        >
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-center mb-10 md:mb-12 gap-5 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-red-100">
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
              <h2 className="font-h2 text-2xl md:text-3xl font-bold text-red-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl md:text-4xl animate-pulse text-yellow-500 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">bolt</span>
                {t('home.flash_deals_title')}
              </h2>
              <div className="flex gap-1.5 text-white font-bold bg-red-500 p-2.5 md:p-3 rounded-xl shadow-lg">
                <div className="px-2 py-1 bg-white/15 rounded-lg text-lg md:text-xl font-mono tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</div>
                <span className="text-white/80 font-bold text-lg md:text-xl self-center">:</span>
                <div className="px-2 py-1 bg-white/15 rounded-lg text-lg md:text-xl font-mono tabular-nums" style={{animationDelay: '0.2s'}}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                <span className="text-white/80 font-bold text-lg md:text-xl self-center">:</span>
                <div className="px-2 py-1 bg-white/15 rounded-lg text-lg md:text-xl font-mono tabular-nums" style={{animationDelay: '0.4s'}}>{String(timeLeft.seconds).padStart(2, '0')}</div>
              </div>
            </div>
            <Link to="/shop?sale=true" className="text-red-600 font-bold hover:bg-red-50 px-5 py-2.5 rounded-full transition-colors flex items-center gap-1 text-sm whitespace-nowrap">
              {t('home.view_all')} <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.slice(0, 4).map((product) => (
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
        className="max-w-[1440px] mx-auto px-6 md:px-16 py-16 md:py-20"
      >
        <motion.div variants={fadeInUp} className="text-center mb-10 md:mb-12">
          <span className="font-label-caps text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2 block">{t('home.brands_title')}</span>
          <h2 className="font-h2 text-2xl md:text-3xl font-bold text-on-surface">Thương Hiệu Hàng Đầu</h2>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {(brands.length > 0 ? brands : MOCK_BRANDS).map((brand, idx) => {
            const gradients = [
              'from-rose-500 to-pink-600',
              'from-violet-500 to-purple-600',
              'from-amber-500 to-orange-600',
              'from-sky-400 to-cyan-600',
              'from-emerald-500 to-teal-600',
              'from-fuchsia-500 to-rose-600',
            ];
            const grad = gradients[idx % gradients.length];
            const imgSrc = ('logo_url' in brand && brand.logo_url) ? brand.logo_url : ('logo' in brand ? (brand as typeof MOCK_BRANDS[0]).logo : null);
            return (
            <motion.div key={brand.id} variants={fadeInUp} whileHover={{ y: -6 }} className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-stone-100 hover:border-emerald-200">
              <Link to={`/search?brand=${brand.id}`} className="flex items-center justify-center w-full h-full p-3 sm:p-4 md:p-5">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={brand.name}
                    className="max-w-full max-h-full object-cover rounded-xl"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                      const fallback = el.parentElement?.querySelector('.brand-fallback') as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`brand-fallback ${imgSrc ? 'hidden' : ''} text-white font-bold text-xs sm:text-sm md:text-base text-center leading-tight px-2 drop-shadow-md w-full h-full flex items-center justify-center rounded-xl bg-gradient-to-br ${grad}`}>{brand.name}</span>
              </Link>
            </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 5. Chương trình khuyến mãi (Promo Banners) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-[1440px] mx-auto px-6 md:px-16 py-8 md:py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
          <motion.div variants={fadeInUp}>
            <Link to="/shop" className="relative h-56 sm:h-64 md:h-72 rounded-3xl overflow-hidden group block shadow-md hover:shadow-xl transition-shadow">
              <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Promo 1"/>
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 md:p-10">
                <span className="text-white font-bold bg-emerald-700 px-4 py-1.5 rounded-full w-max text-xs mb-4 tracking-widest uppercase">{t('home.promo_gift_tag')}</span>
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-3 drop-shadow-md">{t('home.promo_gift_title')}</h3>
                <p className="text-white/80 text-sm">{t('home.promo_gift_desc')}</p>
              </div>
            </Link>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Link to="/shop" className="relative h-56 sm:h-64 md:h-72 rounded-3xl overflow-hidden group block shadow-md hover:shadow-xl transition-shadow">
              <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Promo 2"/>
              <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent flex flex-col justify-center items-end text-right p-8 md:p-10">
                <span className="text-white font-bold bg-red-500 px-4 py-1.5 rounded-full w-max text-xs mb-4 tracking-widest uppercase">{t('home.promo_sale_tag')}</span>
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-3 drop-shadow-md">{t('home.promo_sale_title')}</h3>
                <p className="text-white/80 text-sm">{t('home.promo_sale_desc')}</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* 6. Sản Phẩm (Tabs Example) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-[1440px] mx-auto px-6 md:px-16 py-16 md:py-20"
      >
        <motion.div variants={fadeInUp} className="flex justify-center items-center mb-10 md:mb-12">
          <div className="flex gap-6 md:gap-12 overflow-x-auto hide-scrollbar border-b border-stone-200 pb-1">
            {(['new', 'bestseller', 'favorite'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => selectProductTab(tab)}
                className={`text-lg md:text-2xl font-bold pb-3 whitespace-nowrap transition-colors ${
                  activeProductTab === tab
                    ? 'text-emerald-900 border-b-[3px] border-emerald-800'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab === 'new' ? t('home.tab_new') : tab === 'bestseller' ? t('home.tab_bestseller') : t('home.tab_favorite')}
              </button>
            ))}
          </div>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {(tabProducts.length > 0 ? tabProducts : products).slice(0, 8).map(product => (
            <motion.div key={`tab-${product.id}`} variants={fadeInUp}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 7. Tin Tức (Blog) */}
      <section className="bg-stone-50 py-16 md:py-20 border-t border-stone-100">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-[1440px] mx-auto px-6 md:px-16"
        >
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-12 gap-4">
            <div>
              <span className="font-label-caps tracking-[0.2em] text-primary/60 text-xs font-bold uppercase mb-2 block">{t('home.editorial')}</span>
              <h2 className="font-h2 text-3xl md:text-4xl font-bold text-on-surface">{t('home.blog_title')}</h2>
            </div>
            <Link to="/blog" className="text-emerald-800 font-bold hover:bg-emerald-50 px-5 py-2.5 rounded-full transition-colors flex items-center gap-1 text-sm">
              {t('home.blog_view_all')} <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {(blogs.length > 0 ? blogs : MOCK_BLOGS).map((blog) => (
              <motion.div key={blog.id} variants={fadeInUp}>
                <Link to={`/blog/${blog.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 block">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    {'image_url' in blog && blog.image_url
                      ? <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                      : 'image' in blog && blog.image
                      ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                      : <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-stone-400">article</span>
                        </div>
                    }
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="p-5 md:p-6">
                    <p className="text-stone-400 text-xs mb-2 font-bold uppercase tracking-widest">{('created_at' in blog && blog.created_at) ? new Date(blog.created_at).toLocaleDateString('vi-VN') : ('date' in blog ? blog.date : '')}</p>
                    <h3 className="font-h3 text-base md:text-lg font-bold text-on-surface mb-3 line-clamp-2 group-hover:text-emerald-800 transition-colors">{blog.title}</h3>
                    <span className="text-emerald-800 text-sm font-bold flex items-center group-hover:translate-x-2 transition-transform">{t('home.blog_read_more')} <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span></span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 8. Gợi ý sản phẩm (Recommended) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-[1440px] mx-auto px-6 md:px-16 py-16 md:py-20"
      >
        <motion.div variants={fadeInUp} className="text-center mb-10 md:mb-12">
          <span className="font-label-caps text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-2 block">{t('home.recommended_title')}</span>
          <h2 className="font-h2 text-2xl md:text-3xl font-bold text-on-surface">Dành Riêng Cho Bạn</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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

// Reusable Product Card Component (HomePage)
function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const activeDiscount = product.discount && isDiscountActive(product.discount) ? product.discount : null;
  const salePrice = activeDiscount ? Math.round(product.retail_price * (1 - activeDiscount.discount_percent / 100)) : null;
  const discountBadge = activeDiscount ? `-${Math.round(activeDiscount.discount_percent)}%` : null;

  return (
    <div className="group cursor-pointer relative">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-[4/5] bg-stone-100 rounded-2xl overflow-hidden mb-4 relative shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1.5">
          <img src={product.image_url || ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none" />

          {(product.badge || discountBadge) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {product.badge && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm ${product.badge.includes('SALE') ? 'bg-red-500' : 'bg-emerald-800'}`}>
                  {product.badge === 'BEST SELLER' ? t('product.badge_bestseller') :
                   product.badge === 'NEW IN' ? t('product.badge_newin') :
                   product.badge === 'SALE' ? t('product.badge_sale') : product.badge}
                </span>
              )}
              {discountBadge && (
                <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                  {discountBadge}
                </span>
              )}
            </div>
          )}

          {activeDiscount && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pt-12 pb-3">
              <div className="flex items-end justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-white font-extrabold text-lg sm:text-xl leading-tight drop-shadow-lg">{salePrice!.toLocaleString('vi-VN')}<sup>d</sup></span>
                  <span className="text-white/40 text-xs line-through decoration-red-400/60">{product.retail_price.toLocaleString('vi-VN')}d</span>
                </div>
                <div className="bg-red-500/90 backdrop-blur rounded-lg px-2.5 py-1.5 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                  <CountdownBadge endTime={activeDiscount.end_time} />
                </div>
              </div>
            </div>
          )}

          {!activeDiscount && (
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="material-symbols-outlined bg-white text-emerald-900 rounded-full p-3 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100 shadow-lg text-xl">shopping_bag</span>
            </div>
          )}
        </div>

        <div className="px-0.5">
          <h3 className="font-bold text-on-surface text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-emerald-800 transition-colors">{product.name}</h3>
          {!activeDiscount && (
            <p className="font-bold text-emerald-900 text-sm sm:text-base mt-2">{product.retail_price.toLocaleString('vi-VN')}d</p>
          )}
        </div>
      </Link>
    </div>
  );
}
