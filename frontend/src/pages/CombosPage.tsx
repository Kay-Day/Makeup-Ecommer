import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { comboApi, type Combo } from '../services/api';

function currency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.1 } },
};

export function CombosPage() {
  const { t } = useTranslation();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    comboApi.getAll({ limit: 50 })
      .then((res) => setCombos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface pb-20">
      {/* Hero */}
      <section className="relative h-[320px] sm:h-[400px] flex items-center overflow-hidden bg-stone-900">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-40"
            alt="Combos hero"
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-[1]" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-16 w-full">
          <div className="max-w-2xl">
            <span className="text-amber-300 font-label-caps uppercase tracking-[0.2em] block mb-3 text-xs font-bold">{t('combos.hero_label')}</span>
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{t('combos.hero_title')}</h1>
            <p className="text-white/70 text-sm sm:text-lg max-w-lg">{t('combos.hero_desc')}</p>
          </div>
        </div>
      </section>

      {/* Combo Grid */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 md:py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl overflow-hidden">
                <div className="aspect-[16/10] bg-stone-100" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-stone-100 rounded w-3/4" />
                  <div className="h-4 bg-stone-50 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {combos.map((combo) => (
              <motion.div key={combo.id} variants={fadeInUp}>
                <ComboCard combo={combo} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && combos.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-stone-300 mb-4 block">card_giftcard</span>
            <p className="text-stone-500 text-lg font-medium">{t('combos.empty_title')}</p>
            <p className="text-stone-400 text-sm mt-1">{t('combos.empty_desc')}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ComboCard({ combo }: { combo: Combo }) {
  const { t } = useTranslation();
  const savings = (combo.original_price ?? 0) - (combo.discounted_price ?? 0);

  return (
    <Link to={`/combo/${combo.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1.5 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 shrink-0">
          <img
            src={combo.image_url || ''}
            alt={combo.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Discount badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              -{combo.discount_percent}%
            </span>
          </div>

          {/* Combo name overlay on image */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="font-bold text-white text-lg drop-shadow-lg line-clamp-1">
              {combo.name}
            </h3>
          </div>
        </div>

        {/* Products List - this is the "sổ sản phẩm" part */}
        <div className="p-4 md:p-5 flex-1 flex flex-col">
          <p className="text-stone-400 text-xs line-clamp-2 mb-4">{combo.description}</p>

          {/* Each product in the combo shown clearly */}
          <div className="space-y-2 mb-4 flex-1">
            {combo.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-stone-50 rounded-xl p-2 group/item hover:bg-emerald-50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-stone-100">
                  {item.product?.image_url ? (
                    <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">TMC</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-700 truncate group-hover/item:text-emerald-800 transition-colors">
                    {item.product?.name ?? t('combos.product_fallback', { id: item.product_id })}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-400">{t('combos.qty', { count: item.quantity })}</span>
                    {item.product?.retail_price && (
                      <span className="text-xs font-semibold text-stone-500">{currency(item.product.retail_price)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing section */}
          <div className="border-t border-stone-100 pt-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-stone-400 line-through leading-tight">{currency(combo.original_price ?? 0)}</p>
                <p className="text-lg font-extrabold text-red-600 leading-tight">{currency(combo.discounted_price ?? 0)}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">savings</span>
                {t('combos.savings', { amount: currency(savings) })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
