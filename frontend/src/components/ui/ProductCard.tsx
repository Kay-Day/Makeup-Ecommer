import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export interface ProductCardProps {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  imageUrl: string;
  badge?: string;
  showQuickAdd?: boolean;
}

export function ProductCard({ id, name, subtitle, price, imageUrl, badge, showQuickAdd = false }: ProductCardProps) {
  const { t } = useTranslation();
  return (
    <Link to={`/product/${id}`} className="group cursor-pointer block">
      <div className="aspect-[4/5] bg-stone-50 rounded-2xl overflow-hidden mb-6 relative border border-stone-100 shadow-[0_4px_30px_rgba(79,95,63,0.03)] transition-transform duration-500 hover:-translate-y-2">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        {badge && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">
            {badge === 'BEST SELLER' ? t('product.badge_bestseller') : 
             badge === 'NEW IN' ? t('product.badge_newin') : 
             badge === 'SALE' ? t('product.badge_sale') : badge}
          </div>
        )}
        {showQuickAdd && (
          <button className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-primary text-white px-8 py-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 font-label-caps shadow-lg">
            {t('product.quick_add')}
          </button>
        )}
      </div>
      <h4 className="font-h3 font-bold text-primary text-xl mb-1">{name}</h4>
      <p className="text-stone-500 text-sm mb-3">{subtitle}</p>
      <p className="font-body-md font-bold text-primary">{price.toLocaleString('vi-VN')}đ</p>
    </Link>
  );
}

