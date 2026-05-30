import { Link } from 'react-router-dom';
import { useState, useEffect, type HTMLAttributes, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { assetUrl, productApi, bannerApi, categoryApi, brandApi, blogApi, type Banner, type ProductDiscount } from '../services/api';
import type { Product, Category, Brand, BlogArticle } from '../services/api';

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

const FALLBACK_BANNERS = [
  { id: 0, image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=65&w=1200&fm=webp', subtitle: 'home.hero_subtitle', title: 'home.hero_title', desc: 'home.hero_desc', link_url: null },
  { id: 1, image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=65&w=1200&fm=webp', subtitle: 'NÉT ĐẸP RẠNG RỠ', title: 'SKINCARE ESSENTIALS', desc: 'Khám phá bí quyết chăm sóc da chuẩn chuyên gia.', link_url: null },
  { id: 2, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=65&w=1200&fm=webp', subtitle: 'DẤU ẤN CÁ NHÂN', title: 'SIGNATURE SCENTS', desc: 'Bộ sưu tập nước hoa độc quyền, đánh thức mọi giác quan của bạn.', link_url: null },
];

const fadeInUp = {};
const staggerContainer = {};

type LightMotionProps<T extends HTMLElement> = HTMLAttributes<T> & {
  variants?: unknown;
  initial?: unknown;
  animate?: unknown;
  whileInView?: unknown;
  whileHover?: unknown;
  viewport?: unknown;
  transition?: unknown;
};

const motion = {
  div: ({ variants, initial, animate, whileInView, whileHover, viewport, transition, ...props }: LightMotionProps<HTMLDivElement>) => <div {...props} />,
  section: ({ variants, initial, animate, whileInView, whileHover, viewport, transition, ...props }: LightMotionProps<HTMLElement>) => <section {...props} />,
};

function responsiveImageSet(value: string | null | undefined, widths: number[], quality: number, optimizeUploads = false) {
  if (!value) return undefined;
  return widths.map((width) => `${assetUrl(value, { width, quality, optimizeUploads })} ${width}w`).join(', ');
}

function fallbackToOriginalUpload(event: SyntheticEvent<HTMLImageElement>) {
  if (event.currentTarget.dataset.fallbackApplied === 'true') return false;
  const fallback = event.currentTarget.dataset.fallbackSrc;
  if (fallback && event.currentTarget.src !== fallback) {
    event.currentTarget.dataset.fallbackApplied = 'true';
    event.currentTarget.srcset = '';
    event.currentTarget.src = fallback;
    return true;
  }
  return false;
}

export function HomePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [tabProducts, setTabProducts] = useState<Product[]>([]);
  const [flashProducts, setFlashProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [activeProductTab, setActiveProductTab] = useState<'new' | 'bestseller' | 'favorite'>('new');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [flashEndTime, setFlashEndTime] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const selectProductTab = (tab: 'new' | 'bestseller' | 'favorite') => {
    setActiveProductTab(tab);
  };

  useEffect(() => {
    productApi.getAll({ limit: 12 }).then(res => setProducts(res.data)).catch(console.error);
    productApi.getAll({ limit: 5, sale: true }).then(res => setFlashProducts(res.data)).catch(console.error);
    bannerApi.getAll().then(res => setBanners(res.data)).catch(() => setBanners([]));
    categoryApi.getAll().then(res => setCategories(res.data)).catch(console.error);
    brandApi.getAll().then(res => setBrands(res.data)).catch(console.error);
    blogApi.getArticles().then(res => setBlogs(res.data.slice(0, 3))).catch(console.error);
  }, []);

  useEffect(() => {
    const viewedIds = JSON.parse(localStorage.getItem('tmc_recent_product_ids') || '[]') as number[];
    const searchTerms = JSON.parse(localStorage.getItem('tmc_recent_search_terms') || '[]') as string[];
    const lastSearch = searchTerms[0];
    const loadRecommended = async () => {
      try {
        if (viewedIds.length > 0) {
          const responses = await Promise.all(viewedIds.slice(0, 4).map((productId) => productApi.getById(productId).catch(() => null)));
          const viewed = responses.map((response) => response?.data).filter(Boolean) as Product[];
          const categories = Array.from(new Set(viewed.map((item) => item.category_id).filter(Boolean))) as number[];
          if (categories.length > 0) {
            const categoryProducts = await Promise.all(categories.map((categoryId) => productApi.getAll({ category_id: categoryId, limit: 8 })));
            const merged = categoryProducts
              .flatMap((response) => response.data)
              .filter((item, index, list) => !viewedIds.includes(item.id) && list.findIndex((candidate) => candidate.id === item.id) === index)
              .slice(0, 4);
            setRecommendedProducts(merged.length ? merged : viewed);
            return;
          }
          setRecommendedProducts(viewed);
          return;
        }
        if (lastSearch) {
          const response = await productApi.getAll({ search: lastSearch, limit: 4 });
          setRecommendedProducts(response.data);
        }
      } catch {
        setRecommendedProducts([]);
      }
    };
    void loadRecommended();
  }, []);

  useEffect(() => {
    const request =
      activeProductTab === 'new'
        ? { limit: 5, badge: 'NEW IN', sort: 'created_at' }
        : activeProductTab === 'bestseller'
          ? { limit: 5, badge: 'BEST SELLER', sort: 'sold' }
          : { limit: 5, sort: 'rating' };
    productApi.getAll(request).then(res => setTabProducts(res.data)).catch(console.error);
  }, [activeProductTab]);

  // Find the earliest-ending active discount for flash deals countdown
  useEffect(() => {
    const activeDiscounts = (flashProducts.length ? flashProducts : products)
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
  }, [flashProducts, products]);

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

  const featuredBrands = brands.length > 0 ? brands : MOCK_BRANDS;
  const heroBanners = banners.length > 0 ? banners : FALLBACK_BANNERS;
  const activeBanner = heroBanners[activeBannerIndex % heroBanners.length];
  const activeBannerImage = 'image_url' in activeBanner ? (activeBanner as Banner).image_url : (activeBanner as typeof FALLBACK_BANNERS[0]).image;

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveBannerIndex((index) => (index + 1) % heroBanners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroBanners.length]);

  const renderBrandCard = (brand: Brand | typeof MOCK_BRANDS[number], idx: number, duplicate = false) => {
    const gradients = [
      'from-rose-500 to-pink-600',
      'from-violet-500 to-purple-600',
      'from-amber-500 to-orange-600',
      'from-sky-400 to-cyan-600',
      'from-emerald-500 to-teal-600',
      'from-fuchsia-500 to-rose-600',
    ];
    const grad = gradients[idx % gradients.length];
    const imgSrc = ('logo_url' in brand && brand.logo_url) ? brand.logo_url : ('logo' in brand ? brand.logo : null);

    return (
      <div
        key={`${duplicate ? 'copy' : 'brand'}-${brand.id}-${idx}`}
        aria-hidden={duplicate}
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 shrink-0 rounded-2xl bg-white shadow-md hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 overflow-hidden border border-stone-100 hover:border-emerald-200"
      >
        <Link to={`/search?brand=${brand.id}`} tabIndex={duplicate ? -1 : undefined} className="flex items-center justify-center w-full h-full p-3 sm:p-4 md:p-5">
          {imgSrc ? (
            <img
              src={assetUrl(imgSrc, { width: 96, quality: 52, optimizeUploads: true })}
              srcSet={responsiveImageSet(imgSrc, [64, 96], 52, true)}
              sizes="(min-width: 768px) 96px, 64px"
              data-fallback-src={assetUrl(imgSrc)}
              alt={brand.name}
              className="max-w-full max-h-full object-cover rounded-xl"
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                if (fallbackToOriginalUpload(e)) return;
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                const fallback = el.parentElement?.querySelector('.brand-fallback') as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
          ) : null}
          <span className={`brand-fallback ${imgSrc ? 'hidden' : ''} text-white font-bold text-xs sm:text-sm md:text-base text-center leading-tight px-2 drop-shadow-md w-full h-full flex items-center justify-center rounded-xl bg-gradient-to-br ${grad}`}>
            {brand.name}
          </span>
        </Link>
      </div>
    );
  };

  return (
    <div className="bg-surface pb-20">
      {/* 1. Hero Banner (Swiper Slider) */}
      <section className="relative w-full h-[60vh] sm:h-[75vh] md:h-[85vh] overflow-hidden">
        <img
          src={assetUrl(activeBannerImage, { width: 760, quality: 64, optimizeUploads: true })}
          srcSet={responsiveImageSet(activeBannerImage, [640, 760, 900], 64, true)}
          sizes="100vw"
          data-fallback-src={assetUrl(activeBannerImage)}
          onError={fallbackToOriginalUpload}
          alt={'title' in activeBanner ? activeBanner.title : ''}
          className="h-full w-full object-cover"
          width={760}
          height={1200}
          loading="eager"
          fetchPriority="high"
          decoding="sync"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10 flex flex-col justify-center items-center text-center px-4">
          <div className="max-w-3xl">
            <span className="text-white/90 font-label-caps tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 block uppercase">
              {'subtitle' in activeBanner ? (activeBanner.subtitle?.includes('.') ? t(activeBanner.subtitle) : activeBanner.subtitle) : ''}
            </span>
            <h1 className="text-white font-h1 text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              {activeBanner.title.includes('.') ? t(activeBanner.title) : activeBanner.title}
            </h1>
            <p className="text-white/80 text-sm sm:text-lg md:text-xl max-w-xl mb-6 sm:mb-8 drop-shadow-md mx-auto leading-relaxed">
              {'description' in activeBanner ? (activeBanner as Banner).description : (activeBanner as typeof FALLBACK_BANNERS[0]).desc}
            </p>
            <Link
              to={'link_url' in activeBanner && (activeBanner as Banner).link_url ? (activeBanner as Banner).link_url! : '/shop'}
              className="inline-flex items-center gap-2 bg-white text-emerald-900 px-8 py-3.5 sm:px-10 sm:py-4 rounded-full font-bold hover:bg-stone-100 transition-all shadow-[0_8px_40px_rgba(0,0,0,0.25)] active:scale-95 text-sm sm:text-base"
            >
              {t('home.shop_now')}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        </div>
        {heroBanners.length > 1 ? (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/15 p-1 backdrop-blur-sm sm:bottom-5">
            {heroBanners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Chọn banner ${index + 1}`}
                onClick={() => setActiveBannerIndex(index)}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span className={`block h-2.5 rounded-full transition-all ${index === activeBannerIndex % heroBanners.length ? 'w-7 bg-white' : 'w-2.5 bg-white/60'}`} />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {/* 2. Danh Mục (Categories) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="max-w-[1180px] mx-auto px-5 sm:px-6 md:px-10 py-10 md:py-14"
      >
        <motion.div variants={fadeInUp} className="text-center mb-7 md:mb-9">
          <span className="font-label-caps text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">{t('home.categories_title')}</span>
          <h2 className="font-h2 text-2xl md:text-3xl font-bold text-on-surface">Khám Phá Danh Mục</h2>
        </motion.div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-5">
          {(categories.length > 0 ? categories.filter((category) => !category.parent_id).slice(0, 4) : MOCK_CATEGORIES).map((cat, idx) => (
            <motion.div key={cat.id} variants={fadeInUp}>
              <Link to={'slug' in cat ? `/shop?category=${cat.slug}` : cat.link} className="group flex flex-col items-center">
                <div className="h-24 w-24 overflow-hidden rounded-xl border border-white bg-white shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:border-emerald-200 group-hover:shadow-md sm:h-28 sm:w-28 md:h-36 md:w-36" style={{animationDelay: `${idx * 0.5}s`}}>
                  {'image_url' in cat && cat.image_url
                    ? <img src={assetUrl(cat.image_url, { width: 180, quality: 54, optimizeUploads: true })} srcSet={responsiveImageSet(cat.image_url, [120, 180, 240], 54, true)} sizes="(min-width: 768px) 144px, (min-width: 640px) 112px, 96px" data-fallback-src={assetUrl(cat.image_url)} onError={fallbackToOriginalUpload} alt={cat.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" width={180} height={180} loading="lazy" decoding="async" />
                    : 'image' in cat && cat.image
                    ? <img src={assetUrl(cat.image, { width: 180, quality: 54 })} srcSet={responsiveImageSet(cat.image, [120, 180, 240], 54)} sizes="(min-width: 768px) 144px, (min-width: 640px) 112px, 96px" alt={cat.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" width={180} height={180} loading="lazy" decoding="async" />
                    : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200 transition-transform duration-700 group-hover:scale-105">
                        <span className="material-symbols-outlined text-2xl text-emerald-500">category</span>
                      </div>
                  }
                </div>
                <h3 className="mt-3 flex items-center gap-1.5 text-center text-sm font-bold text-on-surface transition-colors group-hover:text-emerald-800 md:text-base">
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
              <div className="flex gap-1.5 text-white font-bold bg-red-700 p-2.5 md:p-3 rounded-xl shadow-lg">
                <div className="px-2 py-1 bg-white text-red-800 rounded-lg text-lg md:text-xl font-mono tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</div>
                <span className="text-white font-bold text-lg md:text-xl self-center">:</span>
                <div className="px-2 py-1 bg-white text-red-800 rounded-lg text-lg md:text-xl font-mono tabular-nums" style={{animationDelay: '0.2s'}}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                <span className="text-white font-bold text-lg md:text-xl self-center">:</span>
                <div className="px-2 py-1 bg-white text-red-800 rounded-lg text-lg md:text-xl font-mono tabular-nums" style={{animationDelay: '0.4s'}}>{String(timeLeft.seconds).padStart(2, '0')}</div>
              </div>
            </div>
            <Link to="/shop?sale=true" className="text-red-600 font-bold hover:bg-red-50 px-5 py-2.5 rounded-full transition-colors flex items-center gap-1 text-sm whitespace-nowrap">
              {t('home.view_all')} <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 md:gap-6">
          {(flashProducts.length > 0 ? flashProducts : products.filter((product) => product.badge === 'SALE')).slice(0, 5).map((product) => (
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
          <span className="font-label-caps text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">{t('home.brands_title')}</span>
          <h2 className="font-h2 text-2xl md:text-3xl font-bold text-on-surface">Thương Hiệu Hàng Đầu</h2>
        </motion.div>
        <div className="-mx-6 overflow-hidden px-6 pb-3 md:-mx-16 md:px-16 [mask-image:linear-gradient(90deg,transparent,black_7%,black_93%,transparent)]">
          <div className="brand-marquee flex w-max gap-4 md:gap-8">
            <div className="flex shrink-0 gap-4 md:gap-8">
              {featuredBrands.map((brand, idx) => renderBrandCard(brand, idx))}
            </div>
            <div className="flex shrink-0 gap-4 md:gap-8">
              {featuredBrands.map((brand, idx) => renderBrandCard(brand, idx, true))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* 5. Sản Phẩm (Tabs Example) */}
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
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                {tab === 'new' ? t('home.tab_new') : tab === 'bestseller' ? t('home.tab_bestseller') : t('home.tab_favorite')}
              </button>
            ))}
          </div>
        </motion.div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 md:gap-6">
          {(tabProducts.length > 0 ? tabProducts : products).slice(0, 5).map(product => (
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
              <span className="font-label-caps tracking-[0.2em] text-primary text-xs font-bold uppercase mb-2 block">{t('home.editorial')}</span>
              <h2 className="font-h2 text-3xl md:text-4xl font-bold text-on-surface">{t('home.blog_title')}</h2>
            </div>
            <Link to="/blog" className="text-emerald-800 font-bold hover:bg-emerald-50 px-5 py-2.5 rounded-full transition-colors flex items-center gap-1 text-sm">
              {t('home.blog_view_all')} <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {(blogs.length > 0 ? blogs : MOCK_BLOGS).map((blog) => (
              <motion.div key={blog.id} variants={fadeInUp}>
                <Link
                  to={`/blog/${'public_slug' in blog && blog.public_slug ? blog.public_slug : 'slug' in blog && blog.slug ? blog.slug : blog.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 block"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    {'image_url' in blog && blog.image_url
                      ? <img src={assetUrl(blog.image_url, { width: 420, quality: 58, optimizeUploads: true })} srcSet={responsiveImageSet(blog.image_url, [320, 420], 58, true)} sizes="(min-width: 768px) 33vw, 100vw" data-fallback-src={assetUrl(blog.image_url)} onError={fallbackToOriginalUpload} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" width={420} height={315} loading="lazy" decoding="async"/>
                      : 'image' in blog && blog.image
                      ? <img src={assetUrl(blog.image, { width: 420, quality: 58 })} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" width={420} height={315} loading="lazy" decoding="async"/>
                      : <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-stone-400">article</span>
                        </div>
                    }
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="p-5 md:p-6">
                    <p className="text-stone-600 text-xs mb-2 font-bold uppercase tracking-widest">{('created_at' in blog && blog.created_at) ? new Date(blog.created_at).toLocaleDateString('vi-VN') : ('date' in blog ? blog.date : '')}</p>
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
          <span className="font-label-caps text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">{t('home.recommended_title')}</span>
          <h2 className="font-h2 text-2xl md:text-3xl font-bold text-on-surface">Dành Riêng Cho Bạn</h2>
        </motion.div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {(recommendedProducts.length > 0 ? recommendedProducts : products.slice(0, 4).reverse()).map(product => (
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
    <div className="group relative mx-auto w-full max-w-[260px] cursor-pointer">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative mb-3 aspect-[4/4.7] overflow-hidden rounded-xl border border-stone-100 bg-[#f8f4ee] shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-md">
          {product.image_url ? (
            <img src={assetUrl(product.image_url, { width: 320, quality: 58, optimizeUploads: true })} srcSet={responsiveImageSet(product.image_url, [240, 320, 380], 58, true)} sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 46vw" data-fallback-src={assetUrl(product.image_url)} onError={fallbackToOriginalUpload} alt={product.name} className="h-full w-full object-contain p-3 transition-transform duration-700 group-hover:scale-[1.04] sm:p-4" width={320} height={376} loading="lazy" decoding="async" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-emerald-50 text-emerald-800">
              <span className="material-symbols-outlined text-4xl">image</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5" />

          {(product.badge || discountBadge) && (
            <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5 sm:left-3 sm:top-3">
              {product.badge && (
                <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm sm:text-[10px] ${product.badge.includes('SALE') ? 'bg-red-700' : 'bg-emerald-800'}`}>
                  {product.badge === 'BEST SELLER' ? t('product.badge_bestseller') :
                   product.badge === 'NEW IN' ? t('product.badge_newin') :
                   product.badge === 'SALE' ? t('product.badge_sale') : product.badge}
                </span>
              )}
              {discountBadge && (
                <span className="rounded-full bg-red-700 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm sm:text-[10px]">
                  {discountBadge}
                </span>
              )}
            </div>
          )}

          {activeDiscount && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-3 pt-12">
              <div className="flex items-end justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-base font-extrabold leading-tight text-red-100 drop-shadow-lg sm:text-lg">{salePrice!.toLocaleString('vi-VN')}<sup>d</sup></span>
                  <span className="text-white/40 text-xs line-through decoration-red-400/60">{product.retail_price.toLocaleString('vi-VN')}d</span>
                </div>
                <div className="bg-red-700/95 backdrop-blur rounded-lg px-2.5 py-1.5 shadow-[0_0_20px_rgba(185,28,28,0.35)]">
                  <CountdownBadge endTime={activeDiscount.end_time} />
                </div>
              </div>
            </div>
          )}

          {!activeDiscount && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="material-symbols-outlined translate-y-6 rounded-full bg-white p-2.5 text-lg text-emerald-900 opacity-0 shadow-lg transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">shopping_bag</span>
            </div>
          )}
        </div>

        <div className="px-0.5">
          <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-5 text-on-surface transition-colors group-hover:text-emerald-800 sm:text-base">{product.name}</h3>
          {!activeDiscount && (
            <p className="mt-2 text-sm font-bold text-red-600 sm:text-base">{product.retail_price.toLocaleString('vi-VN')}d</p>
          )}
        </div>
      </Link>
    </div>
  );
}
