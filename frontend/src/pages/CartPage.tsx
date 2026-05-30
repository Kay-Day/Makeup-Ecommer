import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cartStorage, type CartItem } from '../services/cart';
import { productApi, type WholesaleTier } from '../services/api';

function currency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function comboUnitPrice(item: CartItem): number {
  if (item.combo_discount_percent) {
    return item.product.retail_price * (1 - item.combo_discount_percent / 100);
  }
  return item.product.retail_price;
}

function cartUnitPrice(item: CartItem, wholesaleTier: WholesaleTier | null): number {
  const basePrice = wholesaleTier && item.product.wholesale_price
    ? item.product.wholesale_price
    : item.product.retail_price;
  const comboPrice = item.combo_discount_percent
    ? basePrice * (1 - item.combo_discount_percent / 100)
    : basePrice;
  const tierPrice = wholesaleTier?.discount_percent
    ? comboPrice * (1 - wholesaleTier.discount_percent / 100)
    : comboPrice;
  return Math.round(tierPrice);
}

export function CartPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wholesaleTiers, setWholesaleTiers] = useState<WholesaleTier[]>([]);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    setItems(cartStorage.getItems());
    return cartStorage.subscribe(setItems);
  }, []);

  useEffect(() => {
    productApi.getWholesaleTiers().then((response) => setWholesaleTiers(response.data)).catch(() => setWholesaleTiers([]));
  }, []);

  useEffect(() => {
    const staleItems = items.filter((item) => item.product.wholesale_price === undefined);
    if (!staleItems.length) return;

    let cancelled = false;
    const refreshProducts = async () => {
      const products = await Promise.all(
        staleItems.map((item) => productApi.getById(item.product_id).then((response) => response.data).catch(() => null)),
      );
      if (cancelled) return;
      products.forEach((product) => {
        if (product) cartStorage.updateProduct(product);
      });
    };

    void refreshProducts();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const { comboGroups, standaloneItems } = useMemo(() => {
    const comboMap = new Map<number, CartItem[]>();
    const standalone: CartItem[] = [];
    for (const item of items) {
      if (item.combo_id) {
        const group = comboMap.get(item.combo_id) || [];
        group.push(item);
        comboMap.set(item.combo_id, group);
      } else {
        standalone.push(item);
      }
    }
    return { comboGroups: Array.from(comboMap.entries()), standaloneItems: standalone };
  }, [items]);

  const retailSubtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + comboUnitPrice(item) * item.quantity, 0);
  }, [items]);
  const activeWholesaleTier = useMemo(() => {
    return wholesaleTiers.find((tier) => (
      tier.is_active &&
      retailSubtotal >= tier.min_order_total &&
      (tier.max_order_total == null || retailSubtotal <= tier.max_order_total)
    )) || null;
  }, [retailSubtotal, wholesaleTiers]);
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + cartUnitPrice(item, activeWholesaleTier) * item.quantity, 0);
  }, [activeWholesaleTier, items]);

  const updateQuantity = (productId: number, delta: number, variantCode?: string | null) => {
    const item = items.find((entry) => entry.product_id === productId && (entry.variant_code || null) === (variantCode || null));
    if (!item) return;
    const maxStock = item.product.stock ?? Number.MAX_SAFE_INTEGER;
    const nextQuantity = Math.max(1, Math.min(item.quantity + delta, maxStock));
    cartStorage.updateQuantity(productId, nextQuantity, variantCode);
  };

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="pb-section-padding px-8 md:px-16 max-w-[1440px] mx-auto min-h-screen">
      <div className="mb-12 mt-12">
        <h1 className="font-h1 text-4xl font-bold text-on-surface mb-2">{t('cart.title')}</h1>
        <p className="font-body-lg text-on-surface-variant text-lg">{t('cart.description')}</p>
      </div>

      {!items.length ? (
        <div className="rounded-[2rem] border border-dashed border-stone-200 bg-white px-8 py-16 text-center shadow-[0_20px_45px_rgba(161,141,108,0.06)]">
          <h2 className="text-2xl font-bold text-stone-900">{t('cart.empty_title')}</h2>
          <p className="mt-3 text-stone-500">{t('cart.empty_desc')}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/shop" className="rounded-full bg-[#8b6837] px-6 py-3 font-semibold text-white">{t('cart.shop_now')}</Link>
            <Link to="/" className="rounded-full border border-stone-200 bg-white px-6 py-3 font-semibold text-stone-700">{t('cart.back_home')}</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {/* Combo groups */}
            {comboGroups.map(([comboId, comboItems]) => {
              const comboDiscount = comboItems[0]?.combo_discount_percent ?? 0;
              const comboOriginal = comboItems.reduce((s, i) => s + i.product.retail_price * i.quantity, 0);
              const comboDiscounted = comboItems.reduce((s, i) => s + cartUnitPrice(i, activeWholesaleTier) * i.quantity, 0);
              return (
                <div key={`combo-${comboId}`} className="bg-amber-50/50 border border-amber-200 rounded-2xl overflow-hidden">
                  <div className="bg-amber-100/70 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-700">card_giftcard</span>
                      <span className="font-bold text-amber-900 text-sm">{t('cart.combo_discount', { percent: comboDiscount })}</span>
                    </div>
                    <button
                      onClick={() => cartStorage.removeCombo(comboId)}
                      className="text-xs text-amber-700 hover:text-red-600 font-medium transition-colors"
                    >
                      {t('cart.combo_remove')}
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {comboItems.map((item) => (
                      <CartItemRow
                        key={item.product_id}
                        item={item}
                        wholesaleTier={activeWholesaleTier}
                        updateQuantity={updateQuantity}
                        showComboPrice={true}
                      />
                    ))}
                  </div>
                  <div className="bg-amber-50 px-6 py-3 border-t border-amber-200 flex justify-between items-center text-sm">
                    <span className="text-stone-500">{t('cart.combo_price')}</span>
                    <div className="text-right">
                      <span className="text-stone-400 line-through mr-2">{currency(comboOriginal)}</span>
                      <span className="font-bold text-red-600">{currency(comboDiscounted)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Standalone items */}
            {standaloneItems.map((item) => (
              <CartItemRow
                key={item.product_id}
                item={item}
                wholesaleTier={activeWholesaleTier}
                updateQuantity={updateQuantity}
                showComboPrice={false}
              />
            ))}

            <div className="mt-12 p-8 border border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <h4 className="font-h3 text-xl font-bold text-on-surface">{t('cart.quality_title')}</h4>
              <p className="font-body-md text-on-surface-variant max-w-md mt-2">{t('cart.quality_desc')}</p>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 bg-secondary-fixed/20 p-8 rounded-2xl border border-secondary-fixed space-y-8">
              <h2 className="font-h2 text-2xl font-bold text-on-surface">{t('cart.order_summary')}</h2>

              <div className="space-y-4">
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>{t('cart.subtotal')}</span>
                  <span className="text-on-surface font-semibold">{currency(subtotal)}</span>
                </div>
                {activeWholesaleTier ? (
                  <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                    Đã áp dụng {activeWholesaleTier.name} - giảm {activeWholesaleTier.discount_percent}% theo tổng đơn {currency(retailSubtotal)}
                  </div>
                ) : null}
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>{t('cart.tax')}</span>
                  <span className="text-on-surface font-semibold">{currency(tax)}</span>
                </div>
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>{t('cart.shipping')}</span>
                  <span className="text-emerald-700 font-bold">{t('cart.free')}</span>
                </div>
                <div className="pt-4 border-t border-secondary-fixed/50 flex justify-between items-end">
                  <span className="font-h3 text-xl font-bold text-on-surface">{t('cart.total')}</span>
                  <span className="font-h2 text-3xl font-bold text-primary-container">{currency(total)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-label-caps text-xs font-bold uppercase tracking-wider text-on-surface-variant block">{t('cart.promo_label')}</label>
                <div className="flex gap-2">
                  <input
                    className="flex-grow bg-white border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none font-body-md"
                    placeholder={t('cart.promo_placeholder')}
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button
                    onClick={() => setPromoCode(promoCode.trim().toUpperCase())}
                    className="bg-secondary-fixed text-primary px-4 py-2 rounded-lg font-label-caps text-xs font-bold uppercase tracking-wider hover:bg-secondary-fixed-dim transition-colors"
                  >
                    {t('cart.promo_apply')}
                  </button>
                </div>
              </div>

              <Link to={`/checkout${promoCode ? `?code=${encodeURIComponent(promoCode)}` : ''}`} className="w-full bg-primary-container text-white py-5 rounded-xl font-h3 text-lg font-bold flex items-center justify-center gap-3 hover:bg-primary transition-all active:scale-[0.98] shadow-lg shadow-primary-container/10">
                {t('cart.checkout_btn')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>

              <button onClick={() => cartStorage.clear()} className="w-full rounded-xl border border-stone-200 bg-white py-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
                {t('cart.clear_all')}
              </button>

              <div className="flex items-center gap-3 justify-center text-on-surface-variant mt-4">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span className="font-label-caps text-xs font-bold uppercase tracking-wider">{t('cart.secure_label')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartItemRow({
  item,
  wholesaleTier,
  updateQuantity,
  showComboPrice,
}: {
  item: CartItem;
  wholesaleTier: WholesaleTier | null;
  updateQuantity: (productId: number, delta: number, variantCode?: string | null) => void;
  showComboPrice: boolean;
}) {
  const { t } = useTranslation();
  const unitPrice = cartUnitPrice(item, wholesaleTier);
  const hasComboDiscount = showComboPrice && item.combo_discount_percent;
  const hasWholesalePrice = Boolean(wholesaleTier && item.product.wholesale_price);
  const lineTotal = unitPrice * item.quantity;
  const stock = item.product.stock;
  const isOutOfStock = stock === 0;
  const isLowStock = stock != null && stock > 0 && stock <= 5;
  const atStockLimit = stock != null && item.quantity >= stock;

  return (
    <div className={`flex flex-col md:flex-row items-center gap-8 bg-surface-container-lowest p-6 rounded-xl border border-secondary-fixed/30 shadow-[0_30px_50px_rgba(79,95,63,0.03)] transition-all hover:shadow-[0_30px_60px_rgba(79,95,63,0.06)] ${isOutOfStock ? 'opacity-60' : ''}`}>
      <Link to={`/product/${item.product_id}`} className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 relative">
        {item.product.image_url ? (
          <img alt={item.product.name} className="w-full h-full object-cover" src={item.product.image_url} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-400">TMC</div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{t('product.out_of_stock')}</span>
          </div>
        )}
      </Link>
      <div className="flex-grow space-y-2 text-center md:text-left">
        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
          <span className="font-label-caps text-xs font-bold uppercase tracking-wider text-primary-container bg-secondary-fixed px-3 py-1 rounded-full">
            {item.product.category_name || t('cart.category_placeholder')}
          </span>
          {isOutOfStock && (
            <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{t('product.out_of_stock')}</span>
          )}
          {isLowStock && (
            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{t('product.stock_left', { count: stock })}</span>
          )}
        </div>
        <h3 className="font-h3 text-xl font-bold text-on-surface">{item.product.name}</h3>
        <p className="font-body-md text-on-surface-variant">
          {item.product.brand_name || 'TMC'}{item.variant_code ? ` • Mã ${item.variant_code}` : ''}
          {hasComboDiscount ? (
            <>
              {' • '}
              <span className="text-stone-400 line-through">{currency(item.product.retail_price)}</span>
              {' '}
              <span className="text-red-600 font-semibold">{currency(unitPrice)}</span>
            </>
          ) : hasWholesalePrice ? (
            <>
              {' • '}
              <span className="text-stone-400 line-through">{currency(item.product.retail_price)}</span>
              {' '}
              <span className="text-emerald-700 font-semibold">{currency(unitPrice)}</span>
            </>
          ) : (
            ` • ${t('cart.retail_price', { price: currency(item.product.retail_price) })}`
          )}
        </p>
      </div>
      <div className="flex flex-col items-center md:items-end gap-4">
        <div className="flex items-center border border-outline-variant rounded-full p-1 bg-surface-container-low">
          <button onClick={() => updateQuantity(item.product_id, -1, item.variant_code)} className="w-8 h-8 flex items-center justify-center hover:bg-secondary-fixed rounded-full transition-colors">
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
          <span className="px-4 font-body-md font-bold">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.product_id, 1, item.variant_code)}
            disabled={atStockLimit || isOutOfStock}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              atStockLimit || isOutOfStock ? 'text-stone-300 cursor-not-allowed' : 'hover:bg-secondary-fixed'
            }`}
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-h3 text-xl font-bold text-primary">{currency(lineTotal)}</span>
          <button onClick={() => cartStorage.removeItem(item.product_id, item.variant_code)} className="text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
