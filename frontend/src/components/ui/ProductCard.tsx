import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { ProductDiscount } from '../../services/api';

export interface ProductCardProps {
  id: string;
  name: string;
  subtitle: string;
  brandName?: string;
  price: number;
  imageUrl: string;
  badge?: string;
  showQuickAdd?: boolean;
  wishlisted?: boolean;
  onToggleWishlist?: (productId: number) => void;
  discount?: ProductDiscount | null;
  stock?: number;
  onQuickAdd?: (id: number) => void;
}

function isDiscountActive(discount: ProductDiscount): boolean {
  const now = new Date().getTime();
  const start = new Date(discount.start_time).getTime();
  const end = new Date(discount.end_time).getTime();
  return discount.is_active && now >= start && now <= end;
}

function CountdownTimer({ endTime }: { endTime: string }) {
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
    <div className="flex items-center gap-1 text-[10px] font-bold text-white">
      <span className="material-symbols-outlined text-xs">schedule</span>
      {days > 0 ? `${days}d ` : ''}
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}

export function ProductCard({ id, name, subtitle, brandName, price, imageUrl, badge, showQuickAdd = false, wishlisted, onToggleWishlist, discount, stock, onQuickAdd }: ProductCardProps) {
  const { t } = useTranslation();

  const activeDiscount = discount && isDiscountActive(discount) ? discount : null;
  const salePrice = activeDiscount ? Math.round(price * (1 - activeDiscount.discount_percent / 100)) : null;
  const discountBadge = activeDiscount ? `-${Math.round(activeDiscount.discount_percent)}%` : null;

  return (
    <div className="group cursor-pointer relative">
      <Link to={`/product/${id}`} className="block">
        <div className="aspect-[4/5] bg-stone-100 rounded-2xl overflow-hidden mb-4 relative shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1.5">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none" />

          {stock === 0 && (
            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-20">
              <span className="bg-red-500/90 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg">{t('product.out_of_stock')}</span>
            </div>
          )}

          {(badge || discountBadge || (stock != null && stock > 0 && stock <= 5)) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {badge && (
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-800 shadow-sm">
                  {badge === 'BEST SELLER' ? t('product.badge_bestseller') :
                   badge === 'NEW IN' ? t('product.badge_newin') :
                   badge === 'SALE' ? t('product.badge_sale') : badge}
                </span>
              )}
              {discountBadge && (
                <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                  {discountBadge}
                </span>
              )}
              {stock != null && stock > 0 && stock <= 5 && (
                <span className="bg-amber-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm">
                  {t('product.stock_left', { count: stock })}
                </span>
              )}
            </div>
          )}

          {activeDiscount && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pt-12 pb-3">
              <div className="flex items-end justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-white font-extrabold text-lg sm:text-xl leading-tight drop-shadow-lg">{salePrice!.toLocaleString('vi-VN')}<sup>d</sup></span>
                  <span className="text-white/40 text-xs line-through decoration-red-400/60">{price.toLocaleString('vi-VN')}d</span>
                </div>
                <div className="bg-red-500/90 backdrop-blur rounded-lg px-2.5 py-1.5 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                  <CountdownTimer endTime={activeDiscount.end_time} />
                </div>
              </div>
            </div>
          )}

          {showQuickAdd && !activeDiscount && (
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <button
                onClick={(e) => { e.preventDefault(); onQuickAdd?.(parseInt(id)); }}
                className="bg-white text-emerald-900 px-6 py-2.5 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 font-bold text-sm shadow-lg hover:bg-emerald-50 cursor-pointer"
              >
                {t('product.quick_add')}
              </button>
            </div>
          )}
        </div>

        <div className="px-0.5">
          <h4 className="font-bold text-on-surface text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-emerald-800 transition-colors">{name}</h4>
          <p className="text-stone-400 text-xs mb-1">{subtitle}</p>
          {brandName && <p className="text-stone-400 text-[11px] mb-2 uppercase tracking-[0.15em]">{brandName}</p>}
          {!activeDiscount && (
            <p className="font-bold text-emerald-900 text-sm sm:text-base">{price.toLocaleString('vi-VN')}d</p>
          )}
        </div>
      </Link>

      {onToggleWishlist && (
        <button
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition hover:scale-110 hover:bg-white"
          onClick={(e) => { e.preventDefault(); onToggleWishlist(parseInt(id)); }}
        >
          <span className={`material-symbols-outlined text-lg ${wishlisted ? 'text-red-500' : 'text-stone-400'}`}>
            {wishlisted ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      )}
    </div>
  );
}
