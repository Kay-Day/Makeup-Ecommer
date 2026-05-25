import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { brandApi, categoryApi, productApi, type Brand, type Category, type Product } from '../services/api';
import { ProductCard } from '../components/ui/ProductCard';

export function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    searchParams.get('category') && /^\d+$/.test(searchParams.get('category') || '') ? Number(searchParams.get('category')) : undefined,
  );
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>(
    searchParams.get('brand') ? Number(searchParams.get('brand')) : undefined,
  );
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('category');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [productResponse, categoryResponse, brandResponse] = await Promise.all([
          productApi.getAll({
            category_id: selectedCategory,
            brand_id: selectedBrand,
            search: search || undefined,
            min_price: minPrice ? Number(minPrice) : undefined,
            max_price: maxPrice ? Number(maxPrice) : undefined,
            limit: 100,
          }),
          categoryApi.getAll(),
          brandApi.getAll(),
        ]);

        setProducts(productResponse.data);
        setCategories(categoryResponse.data);
        setBrands(brandResponse.data);
      } catch (error) {
        console.error('Failed to load search data', error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [selectedCategory, selectedBrand, search, minPrice, maxPrice]);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (!categoryParam || /^\d+$/.test(categoryParam)) return;
    categoryApi.getAll().then((res) => {
      const found = res.data.find((category) => category.slug === categoryParam);
      if (found) setSelectedCategory(found.id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (search) nextParams.set('q', search);
    if (selectedCategory) nextParams.set('category', String(selectedCategory));
    if (selectedBrand) nextParams.set('brand', String(selectedBrand));
    if (minPrice) nextParams.set('min_price', minPrice);
    if (maxPrice) nextParams.set('max_price', maxPrice);
    setSearchParams(nextParams, { replace: true });
    if (search.trim()) {
      const currentTerms = JSON.parse(localStorage.getItem('tmc_recent_search_terms') || '[]') as string[];
      const nextTerms = [search.trim(), ...currentTerms.filter((item) => item !== search.trim())].slice(0, 8);
      localStorage.setItem('tmc_recent_search_terms', JSON.stringify(nextTerms));
    }
  }, [search, selectedCategory, selectedBrand, minPrice, maxPrice, setSearchParams]);

  const pageTitle = useMemo(() => {
    if (selectedBrand) {
      const brand = brands.find((item) => item.id === selectedBrand);
      return brand ? `${t('search.brand_title')}: ${brand.name}` : t('search.title');
    }
    if (selectedCategory) {
      const category = categories.find((item) => item.id === selectedCategory);
      return category ? `${t('search.category_title')}: ${category.name}` : t('search.title');
    }
    return t('search.title');
  }, [brands, categories, selectedBrand, selectedCategory, t]);

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedBrand ? 1 : 0) + (minPrice || maxPrice ? 1 : 0);
  const categoryLabel = (category: Category) => `${category.parent_id ? '— ' : ''}${category.name}`;
  const renderPriceFilter = () => (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50 transition"
        onClick={() => setOpenSection(openSection === 'price' ? null : 'price')}
      >
        <span className="font-semibold text-sm text-emerald-900">Khoảng giá</span>
        <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${openSection === 'price' ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${openSection === 'price' ? 'max-h-48' : 'max-h-0'}`}>
        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          <input className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-600" type="number" min="0" placeholder="Từ" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} />
          <input className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-600" type="number" min="0" placeholder="Đến" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} />
          <button className="col-span-2 rounded-lg bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-200" type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>Xóa khoảng giá</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-surface min-h-screen pb-20">
      <div className="bg-white border-b border-stone-100 pt-8 pb-8 px-6 md:px-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-sm text-stone-400 mb-4">
            <Link to="/" className="hover:text-emerald-800 transition-colors">{t('search.breadcrumb_home')}</Link>
            <span className="mx-2">/</span>
            <span className="text-on-surface font-medium">{t('search.breadcrumb_search')}</span>
          </div>
          <h1 className="font-h1 text-2xl md:text-4xl font-bold text-on-surface">{pageTitle} <span className="text-stone-400 font-normal text-lg">({products.length})</span></h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-8 md:py-10">
        {/* Mobile filter + search bar */}
        <div className="flex md:hidden items-center gap-3 mb-6">
          <button
            className="flex items-center justify-center gap-2 bg-white border border-stone-200 rounded-xl py-3 px-4 font-medium text-sm shadow-sm"
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
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('search.search_placeholder')}
              className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-sm shadow-sm"
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
                <button className="material-symbols-outlined text-stone-500" onClick={() => setSidebarOpen(false)}>close</button>
              </div>
              <div className="p-5 space-y-4">
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50 transition"
                    onClick={() => setOpenSection(openSection === 'category' ? null : 'category')}
                  >
                    <span className="font-semibold text-sm text-emerald-900">{t('search.category_title')}</span>
                    <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${openSection === 'category' ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${openSection === 'category' ? 'max-h-[60vh] overflow-y-auto' : 'max-h-0'}`}>
                    <div className="px-4 pb-4 space-y-1">
                      <button
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${!selectedCategory ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                        onClick={() => setSelectedCategory(undefined)}
                      >
                        Tất cả danh mục
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${selectedCategory === category.id ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {categoryLabel(category)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50 transition"
                    onClick={() => setOpenSection(openSection === 'brand' ? null : 'brand')}
                  >
                    <span className="font-semibold text-sm text-emerald-900">Thương hiệu</span>
                    <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${openSection === 'brand' ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${openSection === 'brand' ? 'max-h-[60vh] overflow-y-auto' : 'max-h-0'}`}>
                    <div className="px-4 pb-4 space-y-1">
                      <button
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${!selectedBrand ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                        onClick={() => setSelectedBrand(undefined)}
                      >
                        Tất cả thương hiệu
                      </button>
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${selectedBrand === brand.id ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                          onClick={() => setSelectedBrand(brand.id)}
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
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-72 shrink-0 space-y-4">
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition"
                onClick={() => setOpenSection(openSection === 'category' ? null : 'category')}
              >
                <span className="font-semibold text-sm text-emerald-900">{t('search.category_title')}</span>
                <span className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-300 ${openSection === 'category' ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${openSection === 'category' ? 'max-h-[50vh] overflow-y-auto' : 'max-h-0'}`}>
                <div className="px-4 pb-4 space-y-1">
                  <button
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${!selectedCategory ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                    onClick={() => setSelectedCategory(undefined)}
                  >
                    Tất cả danh mục
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${selectedCategory === category.id ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {categoryLabel(category)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
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
                <div className="px-4 pb-4 space-y-1">
                  <button
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${!selectedBrand ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                    onClick={() => setSelectedBrand(undefined)}
                  >
                    Tất cả thương hiệu
                  </button>
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${selectedBrand === brand.id ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}
                      onClick={() => setSelectedBrand(brand.id)}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {renderPriceFilter()}
          </aside>

          <main className="flex-1 min-w-0">
            {/* Desktop search bar */}
            <div className="hidden md:flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-stone-200 shadow-sm mb-8 gap-4">
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-3 flex items-center text-stone-400">
                  <span className="material-symbols-outlined">search</span>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('search.search_placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none rounded-lg text-sm transition-all"
                />
              </div>
              <div className="text-sm text-stone-500">
                {selectedBrand ? 'Đang lọc theo hãng' : selectedCategory ? 'Đang lọc theo danh mục' : 'Hiển thị toàn bộ sản phẩm'}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-stone-100 rounded-2xl mb-4" />
                    <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-stone-50 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-10">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={String(product.id)}
                    name={product.name}
                    subtitle={product.category?.name || 'TMC'}
                    brandName={product.brand?.name || undefined}
                    price={product.retail_price}
                    imageUrl={product.image_url || ''}
                    badge={product.badge || undefined}
                    discount={product.discount}
                    stock={product.stock}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-5xl text-stone-300 mb-4 block">search_off</span>
                <p className="text-stone-500 text-lg font-medium">Không tìm thấy sản phẩm phù hợp</p>
                <p className="text-stone-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
