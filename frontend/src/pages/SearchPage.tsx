import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Son Thỏi MAC Matte Lipstick', price: '450.000đ', originalPrice: '550.000đ', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=400', tag: '-18%', rating: 4.8, reviews: 120 },
  { id: 2, name: 'Kem Nền Dior Forever Skin Glow', price: '1.200.000đ', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400', tag: 'New', rating: 4.9, reviews: 85 },
  { id: 3, name: 'Phấn Nước YSL Le Cushion', price: '1.500.000đ', image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400', tag: 'Hot', rating: 4.7, reviews: 312 },
  { id: 4, name: 'Tinh Chất Phục Hồi Estee Lauder', price: '2.100.000đ', originalPrice: '2.500.000đ', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400', tag: '-16%', rating: 5.0, reviews: 450 },
  { id: 5, name: 'Nước Hoa Chanel Coco Mademoiselle', price: '3.500.000đ', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400', rating: 4.9, reviews: 520 },
  { id: 6, name: 'Má Hồng NARS Orgasm', price: '850.000đ', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=400', rating: 4.8, reviews: 210 },
];

export function SearchPage() {
  const { t } = useTranslation();
  const [priceRange, setPriceRange] = useState<string>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-surface min-h-screen pb-20">
      {/* Breadcrumb & Header */}
      <div className="bg-white border-b border-outline-variant/30 pt-8 pb-8 px-8 md:px-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-sm text-outline mb-4">
            <Link to="/" className="hover:text-primary">{t('search.breadcrumb_home')}</Link>
            <span className="mx-2">/</span>
            <span className="text-on-surface">{t('search.breadcrumb_search')}</span>
          </div>
          <h1 className="font-h1 text-3xl md:text-4xl font-bold text-on-surface">{t('search.title')} (6)</h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 py-10">
        
        {/* Mobile Filter Toggle */}
        <button 
          className="md:hidden w-full mb-6 bg-white border border-outline-variant py-3 px-4 rounded-lg flex items-center justify-between font-bold"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <span>{t('search.filter_toggle')}</span>
          <span className="material-symbols-outlined">filter_list</span>
        </button>

        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Sidebar / Filters */}
          <aside className={`w-full md:w-64 shrink-0 space-y-8 ${isSidebarOpen ? 'block' : 'hidden md:block'}`}>
            
            {/* Price Filter */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/30">
              <h3 className="font-bold text-lg mb-4 text-on-surface">{t('search.price_range_title')}</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" className="form-radio text-primary focus:ring-primary h-5 w-5 border-outline-variant" checked={priceRange === 'all'} onChange={() => setPriceRange('all')} />
                  <span className="text-on-surface-variant group-hover:text-primary transition-colors">{t('search.price_all')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" className="form-radio text-primary focus:ring-primary h-5 w-5 border-outline-variant" checked={priceRange === 'under_500'} onChange={() => setPriceRange('under_500')} />
                  <span className="text-on-surface-variant group-hover:text-primary transition-colors">{t('search.price_under_500')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" className="form-radio text-primary focus:ring-primary h-5 w-5 border-outline-variant" checked={priceRange === '500_1000'} onChange={() => setPriceRange('500_1000')} />
                  <span className="text-on-surface-variant group-hover:text-primary transition-colors">{t('search.price_500_1000')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" className="form-radio text-primary focus:ring-primary h-5 w-5 border-outline-variant" checked={priceRange === '1000_2000'} onChange={() => setPriceRange('1000_2000')} />
                  <span className="text-on-surface-variant group-hover:text-primary transition-colors">{t('search.price_1000_2000')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" className="form-radio text-primary focus:ring-primary h-5 w-5 border-outline-variant" checked={priceRange === 'above_2000'} onChange={() => setPriceRange('above_2000')} />
                  <span className="text-on-surface-variant group-hover:text-primary transition-colors">{t('search.price_above_2000')}</span>
                </label>
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/30">
              <h3 className="font-bold text-lg mb-4 text-on-surface">{t('search.category_title')}</h3>
              <div className="space-y-3">
                {['Son Môi', 'Kem Nền', 'Chăm Sóc Da', 'Nước Hoa', 'Phụ Kiện'].map((cat, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="form-checkbox text-primary focus:ring-primary h-5 w-5 rounded border-outline-variant" />
                    <span className="text-on-surface-variant group-hover:text-primary transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant/30">
              <h3 className="font-bold text-lg mb-4 text-on-surface">{t('search.brand_title')}</h3>
              <div className="space-y-3">
                {['MAC', 'Dior', 'Chanel', 'YSL', 'Estee Lauder', 'NARS'].map((brand, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="form-checkbox text-primary focus:ring-primary h-5 w-5 rounded border-outline-variant" />
                    <span className="text-on-surface-variant group-hover:text-primary transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* Main Content (Product Grid) */}
          <main className="flex-1">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-outline-variant/30 mb-8 gap-4">
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-3 flex items-center text-outline">
                  <span className="material-symbols-outlined">search</span>
                </span>
                <input 
                  type="text" 
                  placeholder={t('search.search_placeholder')}
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm text-outline whitespace-nowrap">{t('search.sort_label')}</span>
                <select className="bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-lg text-sm font-semibold text-on-surface w-full sm:w-auto py-2">
                  <option>{t('search.sort_newest')}</option>
                  <option>{t('search.sort_bestseller')}</option>
                  <option>{t('search.sort_price_asc')}</option>
                  <option>{t('search.sort_price_desc')}</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PRODUCTS.map(product => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-outline-variant/30 group hover:shadow-lg transition-all relative">
                  {/* Tag */}
                  {product.tag && (
                    <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold text-white ${product.tag.includes('%') ? 'bg-error' : 'bg-primary'}`}>
                      {product.tag}
                    </div>
                  )}
                  
                  {/* Image */}
                  <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-white text-primary rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-all opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white shadow-lg">
                        <span className="material-symbols-outlined">shopping_bag</span>
                      </button>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-5">
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="font-h3 text-base font-semibold text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <span className="material-symbols-outlined text-[16px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-sm font-bold text-on-surface">{product.rating}</span>
                      <span className="text-xs text-outline">({product.reviews})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary text-lg">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-outline text-sm line-through">{product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12 gap-2">
              <button className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant text-outline hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white font-bold">1</button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-bold">2</button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-bold">3</button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
