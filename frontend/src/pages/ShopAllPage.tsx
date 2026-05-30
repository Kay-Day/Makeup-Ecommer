import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ui/ProductCard';
import { useTranslation } from 'react-i18next';
import { brandApi, categoryApi, productApi } from '../services/api';
import type { Brand, Category, Product } from '../services/api';

const PAGE_SIZE = 20;
const PRICE_MIN = 0;
const PRICE_MAX = 5000000;
const PRICE_STEP = 50000;
const PRICE_PRESETS = [
  { label: 'Tất cả', min: '', max: '' },
  { label: 'Dưới 300k', min: '0', max: '300000' },
  { label: '300k - 500k', min: '300000', max: '500000' },
  { label: '500k - 1tr', min: '500000', max: '1000000' },
  { label: '1tr - 2tr', min: '1000000', max: '2000000' },
  { label: 'Trên 2tr', min: '2000000', max: '' },
];

function formatPrice(value: string | number) {
  const numeric = Number(value || 0);
  if (numeric >= 1000000) {
    return `${(numeric / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`;
  }
  return `${Math.round(numeric / 1000).toLocaleString('vi-VN')}k`;
}

export function ShopAllPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | undefined>(
    searchParams.get('category') && /^\d+$/.test(searchParams.get('category') || '') ? Number(searchParams.get('category')) : undefined
  );
  const [activeBrand, setActiveBrand] = useState<number | undefined>(
    searchParams.get('brand') ? Number(searchParams.get('brand')) : undefined
  );
  const [activeSale, setActiveSale] = useState(searchParams.get('sale') === 'true');
  const [search, setSearch] = useState('');
  const [openSection, setOpenSection] = useState<string | null>('category');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [draftMinPrice, setDraftMinPrice] = useState(searchParams.get('min_price') || '');
  const [draftMaxPrice, setDraftMaxPrice] = useState(searchParams.get('max_price') || '');

  // Read category slug from URL params
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug) {
      categoryApi.getAll().then(res => {
        const found = res.data.find(c => c.slug === categorySlug || String(c.id) === categorySlug);
        if (found) setActiveCategory(found.id);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const sortParam = sortBy === 'featured' ? undefined : sortBy === 'newest' ? 'created_at' : sortBy === 'price_asc' ? 'price_asc' : sortBy === 'price_desc' ? 'price_desc' : undefined;
        const filterParams = {
          category_id: activeCategory,
          brand_id: activeBrand,
          search: search || undefined,
          min_price: minPrice ? Number(minPrice) : undefined,
          max_price: maxPrice ? Number(maxPrice) : undefined,
          sale: activeSale || undefined,
        };
        const [productsResponse, countResponse, categoriesResponse, brandsResponse] = await Promise.all([
          productApi.getAll({
            ...filterParams,
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
            sort: sortParam,
          }),
          productApi.getCount(filterParams),
          categoryApi.getAll(),
          brandApi.getAll(),
        ]);
        setProducts(productsResponse.data);
        setTotalProducts(countResponse.data.count);
        setCategories(categoriesResponse.data);
        setBrands(brandsResponse.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, [activeCategory, activeBrand, activeSale, search, page, sortBy, minPrice, maxPrice]);

  const groupedCategories = useMemo(() => {
    const parents = categories.filter((category) => !category.parent_id);
    const childrenByParent = categories.reduce<Record<number, Category[]>>((acc, category) => {
      if (category.parent_id) {
        acc[category.parent_id] = [...(acc[category.parent_id] || []), category];
      }
      return acc;
    }, {});
    const parentIds = new Set(parents.map((category) => category.id));
    const orphanChildren = categories.filter((category) => category.parent_id && !parentIds.has(category.parent_id));
    return { parents, childrenByParent, orphanChildren };
  }, [categories]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextMin = draftMinPrice ? String(Math.min(Number(draftMinPrice), PRICE_MAX)) : '';
      const nextMax = draftMaxPrice ? String(Math.min(Number(draftMaxPrice), PRICE_MAX)) : '';
      if (nextMin !== minPrice || nextMax !== maxPrice) {
        setMinPrice(nextMin);
        setMaxPrice(nextMax);
        setPage(1);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [draftMinPrice, draftMaxPrice, minPrice, maxPrice]);

  const activeFiltersCount = (activeCategory ? 1 : 0) + (activeBrand ? 1 : 0) + (activeSale ? 1 : 0) + (minPrice || maxPrice ? 1 : 0);
  const priceRangeMin = draftMinPrice ? Number(draftMinPrice) : PRICE_MIN;
  const priceRangeMax = draftMaxPrice ? Number(draftMaxPrice) : PRICE_MAX;
  const minPercent = (priceRangeMin / PRICE_MAX) * 100;
  const maxPercent = (priceRangeMax / PRICE_MAX) * 100;
  const selectedPreset = PRICE_PRESETS.find((preset) => preset.min === minPrice && preset.max === maxPrice)?.label;
  const applyPricePreset = (min: string, max: string) => {
    setDraftMinPrice(min);
    setDraftMaxPrice(max);
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
  };
  const clearPriceFilter = () => applyPricePreset('', '');
  const renderCategoryButton = (category: Category, child = false) => (
    <button
      key={category.id}
      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
        activeCategory === category.id
          ? 'bg-emerald-100 text-emerald-900'
          : child
            ? 'text-stone-500 hover:bg-stone-100 hover:text-emerald-800'
            : 'text-stone-700 hover:bg-stone-100'
      } ${child ? 'pl-7' : ''}`}
      onClick={() => { setActiveCategory(category.id); setPage(1); }}
    >
      <span className="flex items-center gap-2">
        {child ? <span className="h-px w-3 bg-stone-300" /> : null}
        {category.name}
      </span>
    </button>
  );
  const renderCategoryTree = () => (
    <>
      {groupedCategories.parents.map((category) => (
        <div key={category.id} className="space-y-1">
          {renderCategoryButton(category)}
          {groupedCategories.childrenByParent[category.id]?.map((child) => renderCategoryButton(child, true))}
        </div>
      ))}
      {groupedCategories.orphanChildren.length > 0 ? (
        <div className="border-t border-stone-100 pt-2">
          {groupedCategories.orphanChildren.map((category) => renderCategoryButton(category))}
        </div>
      ) : null}
    </>
  );
  const renderPriceFilter = () => (
    <div className="border border-stone-200 rounded-xl overflow-hidden shrink-0 bg-white shadow-sm">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition"
        onClick={() => setOpenSection(openSection === 'price' ? null : 'price')}
      >
        <span className="font-semibold text-sm text-emerald-900">Khoảng giá</span>
        <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${openSection === 'price' ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${openSection === 'price' ? 'max-h-[28rem]' : 'max-h-0'}`}>
        <div className="space-y-4 px-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">Từ</span>
              <span className="mt-1 block text-sm font-bold text-emerald-900">{formatPrice(priceRangeMin)}</span>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-right">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">Đến</span>
              <span className="mt-1 block text-sm font-bold text-emerald-900">{draftMaxPrice ? formatPrice(priceRangeMax) : `${formatPrice(PRICE_MAX)}+`}</span>
            </div>
          </div>

          <div className="relative h-10 pt-4">
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-stone-100" />
            <div
              className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-emerald-700"
              style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
            />
            <input
              className="pointer-events-none absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2 appearance-none bg-transparent accent-emerald-800 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-emerald-800 [&::-webkit-slider-thumb]:shadow-md"
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceRangeMin}
              aria-label="Giá thấp nhất"
              onChange={(event) => {
                const next = Math.min(Number(event.target.value), priceRangeMax - PRICE_STEP);
                setDraftMinPrice(String(Math.max(PRICE_MIN, next)));
              }}
            />
            <input
              className="pointer-events-none absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2 appearance-none bg-transparent accent-emerald-800 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-emerald-800 [&::-webkit-slider-thumb]:shadow-md"
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceRangeMax}
              aria-label="Giá cao nhất"
              onChange={(event) => {
                const next = Math.max(Number(event.target.value), priceRangeMin + PRICE_STEP);
                setDraftMaxPrice(next >= PRICE_MAX ? '' : String(next));
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
              type="number"
              min="0"
              placeholder="Từ"
              value={draftMinPrice}
              onChange={(event) => setDraftMinPrice(event.target.value)}
            />
            <input
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
              type="number"
              min="0"
              placeholder="Đến"
              value={draftMaxPrice}
              onChange={(event) => setDraftMaxPrice(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PRICE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${
                  selectedPreset === preset.label
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-200 hover:bg-emerald-50'
                }`}
                type="button"
                onClick={() => applyPricePreset(preset.min, preset.max)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button className="w-full rounded-lg bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-200" type="button" onClick={clearPriceFilter}>
            Xóa khoảng giá
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[280px] sm:h-[350px] md:h-[400px] flex items-center overflow-hidden bg-stone-800">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-50"
            alt="Hero background"
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-[1]" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-16 w-full">
          <div className="max-w-2xl">
            <span className="font-label-caps text-emerald-300 uppercase tracking-[0.2em] block mb-3 text-xs font-bold">{t('shop.hero_label')}</span>
            <h1 className="font-h1 text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{t('shop.hero_title')}</h1>
            <p className="text-white/70 text-sm sm:text-lg max-w-lg">{t('shop.hero_desc')}</p>
          </div>
        </div>
      </section>

      {/* Product Listing Area */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-10 md:py-16">
        {/* Mobile filter bar */}
        <div className="flex md:hidden items-center gap-3 mb-6">
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-stone-200 rounded-xl py-3 px-4 font-medium text-sm shadow-sm"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined text-xl">tune</span>
            Bộ lọc{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
          </button>
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-stone-400">
              <span className="material-symbols-outlined text-lg">search</span>
            </span>
            <input
              className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-sm"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-stone-100 px-5 py-4 flex items-center justify-between">
                <span className="font-bold text-lg">Bộ lọc</span>
                <button
                  className="material-symbols-outlined text-stone-500"
                  onClick={() => setSidebarOpen(false)}
                >
                  close
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Category */}
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50 transition"
                    onClick={() => setOpenSection(openSection === 'category' ? null : 'category')}
                  >
                    <span className="font-semibold text-sm text-emerald-900">Danh mục</span>
                    <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${openSection === 'category' ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${openSection === 'category' ? 'max-h-[60vh] overflow-y-auto' : 'max-h-0'}`}>
                    <div className="px-3 pb-3 space-y-1">
                      <button
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeCategory === undefined ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                        onClick={() => { setActiveCategory(undefined); setActiveSale(false); setPage(1); }}
                      >
                        Tất cả sản phẩm
                      </button>
                      {renderCategoryTree()}
                      <button
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeSale ? 'bg-red-100 text-red-800' : 'text-stone-600 hover:bg-stone-100'}`}
                        onClick={() => { setActiveSale(!activeSale); setPage(1); }}
                      >
                        Flash sale
                      </button>
                    </div>
                  </div>
                </div>

                {/* Brand */}
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50 transition"
                    onClick={() => setOpenSection(openSection === 'brand' ? null : 'brand')}
                  >
                    <span className="font-semibold text-sm text-emerald-900">Thương hiệu ({brands.length})</span>
                    <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${openSection === 'brand' ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${openSection === 'brand' ? 'max-h-[60vh] overflow-y-auto' : 'max-h-0'}`}>
                    <div className="px-3 pb-3 space-y-1">
                      <button
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeBrand === undefined ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                        onClick={() => { setActiveBrand(undefined); setPage(1); }}
                      >
                        Tất cả thương hiệu
                      </button>
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeBrand === brand.id ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                          onClick={() => { setActiveBrand(brand.id); setPage(1); }}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {renderPriceFilter()}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-10">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 flex flex-col gap-4 max-h-[calc(100vh-6rem)]">
              <div className="shrink-0 relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-stone-400">
                  <span className="material-symbols-outlined text-lg">search</span>
                </span>
                <input
                  className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-sm shadow-sm"
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                />
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden shrink-0 bg-white shadow-sm">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition"
                  onClick={() => setOpenSection(openSection === 'category' ? null : 'category')}
                >
                  <span className="font-semibold text-sm text-emerald-900">Danh mục</span>
                  <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${openSection === 'category' ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${openSection === 'category' ? 'max-h-[50vh] overflow-y-auto' : 'max-h-0'}`}>
                  <div className="px-3 pb-3 space-y-1">
                    <button
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeCategory === undefined ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                  onClick={() => { setActiveCategory(undefined); setActiveSale(false); setPage(1); }}
                    >
                      Tất cả sản phẩm
                    </button>
                    {renderCategoryTree()}
                    <button
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeSale ? 'bg-red-100 text-red-800' : 'text-stone-600 hover:bg-stone-100'}`}
                      onClick={() => { setActiveSale(!activeSale); setPage(1); }}
                    >
                      Flash sale
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden shrink-0 bg-white shadow-sm">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition"
                  onClick={() => setOpenSection(openSection === 'brand' ? null : 'brand')}
                >
                  <span className="font-semibold text-sm text-emerald-900">Thương hiệu ({brands.length})</span>
                  <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${openSection === 'brand' ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${openSection === 'brand' ? 'max-h-[50vh] overflow-y-auto' : 'max-h-0'}`}>
                  <div className="px-3 pb-3 space-y-1">
                    <button
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeBrand === undefined ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                  onClick={() => { setActiveBrand(undefined); setPage(1); }}
                    >
                      Tất cả thương hiệu
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeBrand === brand.id ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                        onClick={() => { setActiveBrand(brand.id); setPage(1); }}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {renderPriceFilter()}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-end mb-8 md:mb-10">
              <p className="text-sm text-stone-500">
                {loading ? 'Đang tải...' : `Hiển thị ${products.length}/${totalProducts} sản phẩm`}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-base text-stone-400">swap_vert</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="font-medium text-stone-700 border-none outline-none bg-transparent cursor-pointer text-sm"
                >
                  <option value="featured">{t('shop.sort_featured')}</option>
                  <option value="newest">{t('search.sort_newest')}</option>
                  <option value="price_asc">{t('search.sort_price_asc')}</option>
                  <option value="price_desc">{t('search.sort_price_desc')}</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-stone-100 rounded-2xl mb-4" />
                    <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-stone-50 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 md:gap-6 md:gap-y-10">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id.toString()}
                    name={product.name}
                    subtitle={product.category?.name || 'TMC'}
                    brandName={product.brand?.name || undefined}
                    price={product.retail_price}
                    imageUrl={product.image_url || ''}
                    badge={product.badge || undefined}
                    showQuickAdd={true}
                    discount={product.discount}
                    stock={product.stock}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-5xl text-stone-300 mb-4 block">search_off</span>
                <p className="text-stone-500 text-lg font-medium">Không tìm thấy sản phẩm</p>
                <p className="text-stone-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`w-10 h-10 flex items-center justify-center border border-stone-200 rounded-full transition-colors ${page === 1 ? 'text-stone-300 cursor-not-allowed' : 'hover:bg-stone-100 text-stone-400'}`}
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(5, Math.max(1, Math.ceil(totalProducts / PAGE_SIZE))) }, (_, i) => {
                  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
                  const startPage = Math.min(Math.max(1, page - 2), Math.max(1, totalPages - 4));
                  const pageNum = startPage + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${pageNum === page ? 'bg-emerald-900 text-white' : 'border border-stone-200 hover:bg-stone-100 text-stone-600'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(totalProducts / PAGE_SIZE)}
                  className={`w-10 h-10 flex items-center justify-center border border-stone-200 rounded-full transition-colors ${page >= Math.ceil(totalProducts / PAGE_SIZE) ? 'text-stone-300 cursor-not-allowed' : 'hover:bg-stone-100 text-stone-400'}`}
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
