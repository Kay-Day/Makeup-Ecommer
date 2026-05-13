import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { comboApi, type Combo } from '../services/api';
import { cartStorage } from '../services/cart';

function currency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

export function ComboDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [combo, setCombo] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedAll, setAddedAll] = useState(false);

  useEffect(() => {
    if (!id) return;
    comboApi.getById(parseInt(id))
      .then((res) => setCombo(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddAllToCart = () => {
    if (!combo) return;
    cartStorage.addCombo(combo);
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-screen pt-28 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-16 animate-pulse">
          <div className="h-8 bg-stone-100 rounded w-48 mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-[4/3] bg-stone-100 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-8 bg-stone-100 rounded w-3/4" />
              <div className="h-4 bg-stone-50 rounded w-full" />
              <div className="h-4 bg-stone-50 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="bg-surface min-h-screen pt-28 pb-20 text-center">
        <span className="material-symbols-outlined text-5xl text-stone-300 mb-4 block">card_giftcard</span>
        <p className="text-stone-500 text-lg font-medium">{t('combos.not_found')}</p>
        <Link to="/combos" className="text-emerald-800 font-bold mt-4 inline-block hover:underline">{t('combos.view_all')}</Link>
      </div>
    );
  }

  const savings = (combo.original_price ?? 0) - (combo.discounted_price ?? 0);

  return (
    <div className="bg-surface min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100 pt-28 pb-6 px-6 md:px-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-sm text-stone-400 mb-1">
            <Link to="/" className="hover:text-emerald-800 transition-colors">{t('combos.breadcrumb_home')}</Link>
            <span className="mx-2">/</span>
            <Link to="/combos" className="hover:text-emerald-800 transition-colors">{t('combos.breadcrumb_combos')}</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-700 font-medium">{combo.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-16 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 shadow-md relative">
              <img src={combo.image_url || ''} alt={combo.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4">
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  -{combo.discount_percent}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-3">{combo.name}</h1>
            <p className="text-stone-500 leading-relaxed mb-8">{combo.description}</p>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 md:p-6 mb-8">
              <h3 className="font-bold text-on-surface mb-4">{t('combos.price_detail')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">{t('combos.original_price')}</span>
                  <span className="font-medium text-stone-700">{currency(combo.original_price ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{t('combos.combo_discount', { percent: combo.discount_percent })}</span>
                  <span className="font-medium text-red-600">-{currency(savings)}</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between">
                  <span className="font-bold text-on-surface">{t('combos.combo_price')}</span>
                  <span className="font-extrabold text-xl text-red-600">{currency(combo.discounted_price ?? 0)}</span>
                </div>
              </div>
            </div>

            <button
              className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                addedAll
                  ? 'bg-emerald-600 scale-95'
                  : 'bg-emerald-800 hover:bg-emerald-700 hover:shadow-xl active:scale-95'
              }`}
              onClick={handleAddAllToCart}
            >
              <span className="material-symbols-outlined">{addedAll ? 'check_circle' : 'shopping_cart'}</span>
              {addedAll ? t('combos.added_all') : t('combos.add_all')}
            </button>
          </motion.div>
        </div>

        {/* Products in Combo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 md:mt-16"
        >
          <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-6">
            {t('combos.products_in_combo')}
            <span className="text-stone-400 font-normal text-base ml-2">({combo.items.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {combo.items.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.product_id}`}
                className="flex items-center gap-4 bg-white rounded-xl border border-stone-100 p-4 hover:shadow-md hover:border-emerald-200 transition-all group"
              >
                <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                  {item.product?.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">TMC</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-on-surface truncate group-hover:text-emerald-800 transition-colors">
                    {item.product?.name ?? `Sản phẩm #${item.product_id}`}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {item.product?.brand?.name && `${item.product.brand.name} • `}
                    SL: {item.quantity}
                  </p>
                  <p className="text-sm font-bold text-emerald-800 mt-1">
                    {item.product?.retail_price ? currency(item.product.retail_price) : ''}
                  </p>
                </div>
                <span className="material-symbols-outlined text-stone-300 group-hover:text-emerald-600 transition-colors shrink-0">
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
