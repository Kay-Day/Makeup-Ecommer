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
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1.5">
        {/* Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
          <img
            src={combo.image_url || ''}
            alt={combo.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Discount badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              -{combo.discount_percent}%
            </span>
          </div>

          {/* Product thumbnails */}
          <div className="absolute bottom-4 left-4 flex -space-x-3">
            {combo.items.slice(0, 4).map((item, idx) => (
              <div
                key={item.id}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-white overflow-hidden shadow-md"
                style={{ zIndex: 4 - idx }}
              >
                {item.product?.image_url ? (
                  <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-stone-200 flex items-center justify-center text-[8px] text-stone-400">TMC</div>
                )}
              </div>
            ))}
            {combo.items.length > 4 && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-emerald-800 flex items-center justify-center text-[10px] font-bold text-white shadow-md" style={{ zIndex: 0 }}>
                +{combo.items.length - 4}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-5 md:p-6">
          <h3 className="font-bold text-on-surface text-base md:text-lg mb-2 line-clamp-2 group-hover:text-emerald-800 transition-colors">
            {combo.name}
          </h3>
          <p className="text-stone-400 text-xs md:text-sm line-clamp-2 mb-4">{combo.description}</p>

          {/* Pricing */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-stone-400 line-through">{currency(combo.original_price ?? 0)}</p>
              <p className="text-lg md:text-xl font-extrabold text-red-600">{currency(combo.discounted_price ?? 0)}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-sm">savings</span>
                {t('combos.savings', { amount: currency(savings) })}
              </span>
            </div>
          </div>

          {/* Items count */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            {t('combos.items_count', { count: combo.items.length })}
          </div>
        </div>
      </div>
    </Link>
  );
}
