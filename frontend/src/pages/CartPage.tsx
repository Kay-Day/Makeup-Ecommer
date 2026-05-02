import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function CartPage() {
  const { t } = useTranslation();
  return (
    <div className="pb-section-padding px-8 md:px-16 max-w-[1440px] mx-auto min-h-screen">
      <div className="mb-12 mt-12">
        <h1 className="font-h1 text-4xl font-bold text-on-surface mb-2">{t('cart.title')}</h1>
        <p className="font-body-lg text-on-surface-variant text-lg">{t('cart.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Product List Section */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Cart Item 1 */}
          <div className="flex flex-col md:flex-row items-center gap-8 bg-surface-container-lowest p-6 rounded-xl border border-secondary-fixed/30 shadow-[0_30px_50px_rgba(79,95,63,0.03)] transition-all hover:shadow-[0_30px_60px_rgba(79,95,63,0.06)]">
            <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              <img alt="Advanced Hyaluronic Serum" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800"/>
            </div>
            <div className="flex-grow space-y-2 text-center md:text-left">
              <span className="font-label-caps text-xs font-bold uppercase tracking-wider text-primary-container bg-secondary-fixed px-3 py-1 rounded-full">Aesthetics</span>
              <h3 className="font-h3 text-xl font-bold text-on-surface">Advanced Hyaluronic Serum</h3>
              <p className="font-body-md text-on-surface-variant">30ml | Clinical Grade hydration for post-treatment recovery.</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="flex items-center border border-outline-variant rounded-full p-1 bg-surface-container-low">
                <button className="w-8 h-8 flex items-center justify-center hover:bg-secondary-fixed rounded-full transition-colors">
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="px-4 font-body-md font-bold">1</span>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-secondary-fixed rounded-full transition-colors">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-h3 text-xl font-bold text-primary">850.000đ</span>
                <button className="text-on-surface-variant hover:text-error transition-colors">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cart Item 2 */}
          <div className="flex flex-col md:flex-row items-center gap-8 bg-surface-container-lowest p-6 rounded-xl border border-secondary-fixed/30 shadow-[0_30px_50px_rgba(79,95,63,0.03)] transition-all hover:shadow-[0_30px_60px_rgba(79,95,63,0.06)]">
            <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              <img alt="Precision SPF 50+ Shield" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"/>
            </div>
            <div className="flex-grow space-y-2 text-center md:text-left">
              <span className="font-label-caps text-xs font-bold uppercase tracking-wider text-primary-container bg-secondary-fixed px-3 py-1 rounded-full">Dermatology</span>
              <h3 className="font-h3 text-xl font-bold text-on-surface">Precision SPF 50+ Shield</h3>
              <p className="font-body-md text-on-surface-variant">50ml | Broad-spectrum mineral protection with tint.</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="flex items-center border border-outline-variant rounded-full p-1 bg-surface-container-low">
                <button className="w-8 h-8 flex items-center justify-center hover:bg-secondary-fixed rounded-full transition-colors">
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="px-4 font-body-md font-bold">2</span>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-secondary-fixed rounded-full transition-colors">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-h3 text-xl font-bold text-primary">1.200.000đ</span>
                <button className="text-on-surface-variant hover:text-error transition-colors">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* TMC Quality Assurance */}
          <div className="mt-12 p-8 border border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            <h4 className="font-h3 text-xl font-bold text-on-surface">{t('cart.quality_title')}</h4>
            <p className="font-body-md text-on-surface-variant max-w-md mt-2">{t('cart.quality_desc')}</p>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 bg-secondary-fixed/20 p-8 rounded-2xl border border-secondary-fixed space-y-8">
            <h2 className="font-h2 text-2xl font-bold text-on-surface">{t('cart.order_summary')}</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between font-body-md text-on-surface-variant">
                <span>{t('cart.subtotal')}</span>
                <span className="text-on-surface font-semibold">2.050.000đ</span>
              </div>
              <div className="flex justify-between font-body-md text-on-surface-variant">
                <span>{t('cart.tax')}</span>
                <span className="text-on-surface font-semibold">164.000đ</span>
              </div>
              <div className="flex justify-between font-body-md text-on-surface-variant">
                <span>{t('cart.shipping')}</span>
                <span className="text-emerald-700 font-bold">{t('cart.free')}</span>
              </div>
              <div className="pt-4 border-t border-secondary-fixed/50 flex justify-between items-end">
                <span className="font-h3 text-xl font-bold text-on-surface">{t('cart.total')}</span>
                <span className="font-h2 text-3xl font-bold text-primary-container">2.214.000đ</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="space-y-3">
              <label className="font-label-caps text-xs font-bold uppercase tracking-wider text-on-surface-variant block">{t('cart.promo_label')}</label>
              <div className="flex gap-2">
                <input className="flex-grow bg-white border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none font-body-md" placeholder={t('cart.promo_placeholder')} type="text"/>
                <button className="bg-secondary-fixed text-primary px-4 py-2 rounded-lg font-label-caps text-xs font-bold uppercase tracking-wider hover:bg-secondary-fixed-dim transition-colors">{t('cart.promo_apply')}</button>
              </div>
            </div>

            {/* Checkout Button */}
            <Link to="/checkout" className="w-full bg-primary-container text-white py-5 rounded-xl font-h3 text-lg font-bold flex items-center justify-center gap-3 hover:bg-primary transition-all active:scale-[0.98] shadow-lg shadow-primary-container/10">
              {t('cart.checkout_btn')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>

            <div className="flex items-center gap-3 justify-center text-on-surface-variant mt-4">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span className="font-label-caps text-xs font-bold uppercase tracking-wider">{t('cart.secure_label')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
