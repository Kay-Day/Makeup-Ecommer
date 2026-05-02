import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { productApi } from '../services/api';
import type { Product } from '../services/api';
import { ProductCard } from '../components/ui/ProductCard';

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (id) {
          const res = await productApi.getById(parseInt(id));
          setProduct(res.data);
          
          // Fetch related products (same category)
          if (res.data.category_id) {
            const relatedRes = await productApi.getAll({ category_id: res.data.category_id });
            setRelatedProducts(relatedRes.data.filter(p => p.id !== res.data.id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center">{t('shop.loading')}</div>;
  }

  if (!product) {
    return <div className="py-20 text-center">Product not found</div>;
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="pb-section-padding px-8 md:px-16 max-w-[1440px] mx-auto mt-12">
      {/* Breadcrumb */}
      <nav className="flex gap-2 text-label-caps font-label-caps text-on-surface-variant mb-stack-lg text-xs font-bold uppercase">
        <Link to="/shop" className="hover:text-primary transition-colors">{t('header.shop')}</Link>
        <span>/</span>
        <span className="text-primary font-bold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Main Image with Zoom Effect */}
            <div className="flex-1 order-1 md:order-2">
              <div className="relative aspect-[4/5] bg-white rounded-xl overflow-hidden shadow-[0_30px_50px_rgba(79,95,63,0.05)] border border-secondary-fixed/50 group">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} src={product.image_url || ''}/>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Details */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="mb-stack-lg">
            <div className="flex items-center gap-2 mb-stack-sm">
              <span className="text-label-caps text-on-surface-variant text-xs font-bold uppercase">{product.category?.name} - {product.brand?.name}</span>
            </div>
            
            <h1 className="font-h1 text-4xl font-bold text-primary mb-4 leading-tight">{product.name}</h1>
            <p className="font-body-lg text-on-surface-variant mb-6 text-lg">
              {product.description}
            </p>
            <div className="font-h2 text-3xl font-bold text-primary mb-8">{product.retail_price.toLocaleString('vi-VN')}đ</div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-stack-lg mb-8">
            <div className="flex items-center border border-outline-variant rounded-lg bg-white">
              <button onClick={() => handleQuantityChange(-1)} className="p-4 hover:bg-stone-50 text-primary transition-colors"><span className="material-symbols-outlined">remove</span></button>
              <span className="px-6 font-bold">{quantity}</span>
              <button onClick={() => handleQuantityChange(1)} className="p-4 hover:bg-stone-50 text-primary transition-colors"><span className="material-symbols-outlined">add</span></button>
            </div>
            <button className="flex-1 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">shopping_cart</span>
              {t('product.quick_add')}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-section-padding mt-24">
          <div className="flex justify-between items-end mb-stack-lg mb-8">
            <div>
              <h2 className="font-h2 text-3xl font-bold text-primary">{t('home.recommended_title')}</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="block">
                <ProductCard 
                  id={p.id.toString()}
                  name={p.name}
                  subtitle={p.category?.name || ''}
                  price={p.retail_price}
                  imageUrl={p.image_url || ''}
                  badge={p.badge || undefined}
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
