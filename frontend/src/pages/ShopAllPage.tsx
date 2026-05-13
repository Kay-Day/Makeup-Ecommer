import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ui/ProductCard';
import { useTranslation } from 'react-i18next';
import { brandApi, categoryApi, productApi } from '../services/api';
import type { Brand, Category, Product } from '../services/api';

const PAGE_SIZE = 9;

export function ShopAllPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | undefined>(
    searchParams.get('category') ? undefined : undefined
  );
  const [activeBrand, setActiveBrand] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [openSection, setOpenSection] = useState<string | null>('category');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Read category slug from URL params
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug) {
      categoryApi.getAll().then(res => {
        const found = res.data.find(c => c.slug === categorySlug);
        if (found) setActiveCategory(found.id);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const sortParam = sortBy === 'featured' ? undefined : sortBy === 'newest' ? 'created_at' : sortBy === 'price_asc' ? 'price_asc' : sortBy === 'price_desc' ? 'price_desc' : undefined;
        const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
          productApi.getAll({ category_id: activeCategory, brand_id: activeBrand, search: search || undefined, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, sort: sortParam }),
          categoryApi.getAll(),
          brandApi.getAll(),
        ]);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
        setBrands(brandsResponse.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, [activeCategory, activeBrand, search, page, sortBy]);

  const activeFiltersCount = (activeCategory ? 1 : 0) + (activeBrand ? 1 : 0);

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
              onChange={(event) => setSearch(event.target.value)}
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
                        onClick={() => setActiveCategory(undefined)}
                      >
                        Tất cả sản phẩm
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeCategory === category.id ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                          onClick={() => setActiveCategory(category.id)}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Brand */}
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50 transition"
                    onClick={() => setOpenSection(openSection === 'brand' ? null : 'brand')}
                  >
                    <span className="font-semibold text-sm text-emerald-900">Thương hiệu</span>
                    <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${openSection === 'brand' ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${openSection === 'brand' ? 'max-h-[60vh] overflow-y-auto' : 'max-h-0'}`}>
                    <div className="px-3 pb-3 space-y-1">
                      <button
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeBrand === undefined ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                        onClick={() => setActiveBrand(undefined)}
                      >
                        Tất cả thương hiệu
                      </button>
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeBrand === brand.id ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                          onClick={() => setActiveBrand(brand.id)}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
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
                  onChange={(event) => setSearch(event.target.value)}
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
                      onClick={() => setActiveCategory(undefined)}
                    >
                      Tất cả sản phẩm
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeCategory === category.id ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                        onClick={() => setActiveCategory(category.id)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden shrink-0 bg-white shadow-sm">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition"
                  onClick={() => setOpenSection(openSection === 'brand' ? null : 'brand')}
                >
                  <span className="font-semibold text-sm text-emerald-900">Thương hiệu</span>
                  <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${openSection === 'brand' ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${openSection === 'brand' ? 'max-h-[50vh] overflow-y-auto' : 'max-h-0'}`}>
                  <div className="px-3 pb-3 space-y-1">
                    <button
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeBrand === undefined ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                      onClick={() => setActiveBrand(undefined)}
                    >
                      Tất cả thương hiệu
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeBrand === brand.id ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                        onClick={() => setActiveBrand(brand.id)}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-end mb-8 md:mb-10">
              <p className="text-sm text-stone-500">
                {loading ? 'Đang tải...' : `${products.length} sản phẩm`}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-stone-100 rounded-2xl mb-4" />
                    <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-stone-50 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 gap-y-10">
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
                {Array.from({ length: Math.min(3, page + 1) }, (_, i) => {
                  const pageNum = Math.max(1, page - 1) + i;
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
                  disabled={products.length < PAGE_SIZE}
                  className={`w-10 h-10 flex items-center justify-center border border-stone-200 rounded-full transition-colors ${products.length < PAGE_SIZE ? 'text-stone-300 cursor-not-allowed' : 'hover:bg-stone-100 text-stone-400'}`}
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
