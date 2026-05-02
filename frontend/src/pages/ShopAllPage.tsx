import { useState, useEffect } from 'react';
import { ProductCard } from '../components/ui/ProductCard';
import { useTranslation } from 'react-i18next';
import { productApi } from '../services/api';
import type { Product } from '../services/api';

export function ShopAllPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getAll();
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-80 mix-blend-multiply" 
            alt="Hero background" 
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"
          />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-8 md:px-16 w-full">
          <div className="max-w-2xl">
            <span className="font-label-caps text-primary uppercase tracking-widest block mb-4 text-xs font-bold">{t('shop.hero_label')}</span>
            <h1 className="font-h1 text-4xl md:text-5xl font-bold text-primary mb-6">{t('shop.hero_title')}</h1>
            <p className="font-body-lg text-on-surface-variant max-w-lg text-lg">{t('shop.hero_desc')}</p>
          </div>
        </div>
      </section>

      {/* Product Listing Area */}
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 py-20 flex flex-col md:flex-row gap-16">
        
        {/* Sidebar Filter */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-12">
            <div>
              <h3 className="font-h3 text-lg font-bold mb-6 text-primary">{t('shop.filter_skin_type')}</h3>
              <div className="space-y-4">
                {[t('shop.skin_oily'), t('shop.skin_dry'), t('shop.skin_mature'), t('shop.skin_all')].map((type, idx) => (
                  <label key={idx} className="flex items-center group cursor-pointer">
                    <input defaultChecked={type === t('shop.skin_mature')} className="w-4 h-4 border-outline rounded text-primary focus:ring-primary-container" type="checkbox"/>
                    <span className="ml-3 font-body-md text-on-surface-variant group-hover:text-primary transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-h3 text-lg font-bold mb-6 text-primary">{t('shop.filter_concern')}</h3>
              <div className="space-y-4">
                {[t('shop.concern_anti_aging'), t('shop.concern_pigmentation'), t('shop.concern_acne'), t('shop.concern_hydration')].map((concern, idx) => (
                  <label key={idx} className="flex items-center group cursor-pointer">
                    <input defaultChecked={concern === t('shop.concern_anti_aging')} className="w-4 h-4 border-outline rounded text-primary focus:ring-primary-container" type="checkbox"/>
                    <span className="ml-3 font-body-md text-on-surface-variant group-hover:text-primary transition-colors">{concern}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-h3 text-lg font-bold mb-6 text-primary">{t('shop.filter_price')}</h3>
              <div className="px-2">
                <input className="w-full h-1 bg-secondary-fixed rounded-lg appearance-none cursor-pointer accent-primary" type="range"/>
                <div className="flex justify-between mt-4 text-sm font-label-caps font-bold text-on-surface-variant">
                  <span>{t('shop.price_min')}</span>
                  <span>{t('shop.price_max')}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-end mb-12">
            <p className="font-body-md text-on-surface-variant">{t('shop.showing_products')}</p>
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-1 cursor-pointer">
              <span className="font-label-caps text-on-surface font-bold text-xs uppercase tracking-wider">{t('shop.sort_featured')}</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 gap-y-16">
            {loading ? (
              <p>{t('shop.loading')}</p>
            ) : (
              products.map(product => (
                <ProductCard 
                  key={product.id} 
                  id={product.id.toString()}
                  name={product.name}
                  subtitle={product.category?.name || 'TMC Medical'}
                  price={product.retail_price}
                  imageUrl={product.image_url || ''}
                  badge={product.badge || undefined}
                  showQuickAdd={true}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="mt-20 flex justify-center items-center space-x-4">
            <button className="w-10 h-10 flex items-center justify-center border border-stone-200 rounded-full hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full font-label-caps text-xs font-bold">1</button>
            <button className="w-10 h-10 flex items-center justify-center border border-stone-200 rounded-full hover:bg-stone-100 font-label-caps text-xs font-bold">2</button>
            <button className="w-10 h-10 flex items-center justify-center border border-stone-200 rounded-full hover:bg-stone-100 font-label-caps text-xs font-bold">3</button>
            <button className="w-10 h-10 flex items-center justify-center border border-stone-200 rounded-full hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
