import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { comboApi, type Combo } from '../services/api';
import { cartStorage } from '../services/cart';

function currency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const COMBOS_PER_PAGE = 9;

export function CombosPage() {
  const { t } = useTranslation();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedComboIds, setAddedComboIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    comboApi.getAll({ limit: 50 })
      .then((res) => setCombos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(combos.length / COMBOS_PER_PAGE));
  const visibleCombos = combos.slice((currentPage - 1) * COMBOS_PER_PAGE, currentPage * COMBOS_PER_PAGE);

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

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
        {!loading && combos.length > 0 && (
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">{t('combos.hero_label')}</p>
              <h2 className="mt-2 text-2xl font-bold text-on-surface sm:text-3xl">{t('combos.hero_title')}</h2>
            </div>
            <p className="text-sm text-stone-500">
              {t('combos.page_status', { page: currentPage, total: totalPages, count: combos.length })}
            </p>
          </div>
        )}

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
            {visibleCombos.map((combo) => (
              <motion.div key={combo.id} variants={fadeInUp}>
                <ComboCard
                  combo={combo}
                  added={addedComboIds.includes(combo.id)}
                  onAdd={() => {
                    cartStorage.addCombo(combo);
                    setAddedComboIds((ids) => ids.includes(combo.id) ? ids : [...ids, combo.id]);
                    window.setTimeout(() => {
                      setAddedComboIds((ids) => ids.filter((id) => id !== combo.id));
                    }, 1800);
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && combos.length > COMBOS_PER_PAGE && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              className="inline-flex h-11 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-600 transition hover:border-emerald-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              {t('combos.prev_page')}
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition ${
                    currentPage === page
                      ? 'bg-emerald-900 text-white shadow-sm'
                      : 'border border-stone-200 bg-white text-stone-600 hover:border-emerald-200 hover:bg-emerald-50'
                  }`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              className="inline-flex h-11 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-600 transition hover:border-emerald-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              {t('combos.next_page')}
            </button>
          </div>
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

function ComboCard({ combo, added, onAdd }: { combo: Combo; added: boolean; onAdd: () => void }) {
  const { t } = useTranslation();
  const savings = (combo.original_price ?? 0) - (combo.discounted_price ?? 0);
  const shownItems = combo.items.slice(0, 4);
  const remainingCount = Math.max(0, combo.items.length - shownItems.length);

  return (
    <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-100 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <Link to={`/combo/${combo.id}`} className="block h-full">
          <img src={combo.image_url || ''} alt={combo.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        </Link>
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">-{combo.discount_percent}%</span>
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-emerald-900 shadow-sm backdrop-blur">
            {t('combos.items_count', { count: combo.items.length })}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <Link to={`/combo/${combo.id}`} className="block">
            <h3 className="line-clamp-2 text-xl font-extrabold leading-tight text-white drop-shadow-lg">{combo.name}</h3>
          </Link>
        </div>
      </div>

      <div className="flex h-full flex-col p-4 md:p-5">
        <p className="mb-4 line-clamp-2 text-sm leading-6 text-stone-500">{combo.description}</p>

        <div className="mb-5 grid grid-cols-2 gap-2">
          {shownItems.map((item) => (
            <Link
              key={item.id}
              to={`/product/${item.product_id}`}
              className="group/product rounded-xl border border-stone-100 bg-stone-50 p-2 transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              <div className="flex gap-2">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-stone-100">
                  {item.product?.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-stone-400">TMC</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-bold leading-4 text-stone-800 transition group-hover/product:text-emerald-800">
                    {item.product?.name ?? t('combos.product_fallback', { id: item.product_id })}
                  </p>
                  <p className="mt-1 text-[11px] text-stone-400">{item.product?.brand?.name}</p>
                  <p className="mt-1 text-xs font-bold text-emerald-900">{item.product?.retail_price ? currency(item.product.retail_price) : ''}</p>
                  <p className="mt-0.5 text-[11px] text-stone-500">{t('combos.qty', { count: item.quantity })}</p>
                </div>
              </div>
            </Link>
          ))}

          {remainingCount > 0 && (
            <Link
              to={`/combo/${combo.id}`}
              className="flex min-h-[72px] items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white text-sm font-bold text-stone-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
            >
              +{remainingCount} sản phẩm
            </Link>
          )}
        </div>

        <div className="mt-auto border-t border-stone-100 pt-4">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs leading-tight text-stone-400 line-through">{currency(combo.original_price ?? 0)}</p>
              <p className="text-xl font-extrabold leading-tight text-red-600">{currency(combo.discounted_price ?? 0)}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700">
              <span className="material-symbols-outlined text-[15px]">savings</span>
              {t('combos.savings', { amount: currency(savings) })}
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold text-white shadow-sm transition active:scale-95 ${
                added ? 'bg-emerald-600' : 'bg-emerald-900 hover:bg-emerald-800'
              }`}
              onClick={onAdd}
            >
              <span className="material-symbols-outlined text-[18px]">{added ? 'check_circle' : 'shopping_cart'}</span>
              {added ? t('combos.added_all') : t('combos.add_all')}
            </button>
            <Link
              to={`/combo/${combo.id}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
              aria-label={t('combos.view_detail')}
            >
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
