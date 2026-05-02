import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function CheckoutPage() {
  const { t } = useTranslation();
  return (
    <div className="pt-12 pb-24 px-8 md:px-16 max-w-[1440px] mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Column: Checkout Form Journey */}
        <div className="lg:col-span-7 space-y-12">
          {/* Progress Stepper */}
          <div className="flex items-center space-x-4 mb-12">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span className="font-label-caps text-on-surface text-xs font-bold tracking-widest">{t('checkout.step_shipping')}</span>
            </div>
            <div className="h-px w-12 bg-outline-variant"></div>
            <div className="flex items-center gap-2">
              <span className="bg-surface-container-high text-on-surface-variant w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span className="font-label-caps text-outline text-xs font-bold tracking-widest">{t('checkout.step_payment')}</span>
            </div>
            <div className="h-px w-12 bg-outline-variant"></div>
            <div className="flex items-center gap-2">
              <span className="bg-surface-container-high text-on-surface-variant w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span className="font-label-caps text-outline text-xs font-bold tracking-widest">{t('checkout.step_review')}</span>
            </div>
          </div>

          {/* Shipping Form Section */}
          <section className="bg-white p-8 rounded-xl border border-secondary-fixed shadow-[0_4px_30px_rgba(79,95,63,0.05)]">
            <h2 className="font-h2 text-3xl font-bold mb-8 text-primary">{t('checkout.shipping_title')}</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-label-caps text-[10px] font-bold text-outline uppercase tracking-wider">{t('checkout.first_name')}</label>
                  <input className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md transition-all" placeholder="Thanh" type="text"/>
                </div>
                <div className="space-y-2">
                  <label className="font-label-caps text-[10px] font-bold text-outline uppercase tracking-wider">{t('checkout.last_name')}</label>
                  <input className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md transition-all" placeholder="Nguyen" type="text"/>
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label-caps text-[10px] font-bold text-outline uppercase tracking-wider">{t('checkout.address')}</label>
                <input className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md transition-all" placeholder="123 Le Loi Street, District 1" type="text"/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="font-label-caps text-[10px] font-bold text-outline uppercase tracking-wider">CITY</label>
                  <input className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md transition-all" placeholder="Ho Chi Minh" type="text"/>
                </div>
                <div className="space-y-2">
                  <label className="font-label-caps text-[10px] font-bold text-outline uppercase tracking-wider">POSTAL CODE</label>
                  <input className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md transition-all" placeholder="700000" type="text"/>
                </div>
                <div className="space-y-2">
                  <label className="font-label-caps text-[10px] font-bold text-outline uppercase tracking-wider">PHONE</label>
                  <input className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md transition-all" placeholder="+84 901 234 567" type="tel"/>
                </div>
              </div>
            </form>
          </section>

          {/* Collapsed Payment Section */}
          <section className="bg-surface-container-low p-8 rounded-xl border border-stone-200 opacity-60">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-outline">payments</span>
                <h2 className="font-h3 text-xl font-bold text-outline">{t('checkout.payment_title')}</h2>
              </div>
              <span className="text-xs font-bold text-outline tracking-wider">STEP 2</span>
            </div>
          </section>

          {/* Collapsed Review Section */}
          <section className="bg-surface-container-low p-8 rounded-xl border border-stone-200 opacity-60">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-outline">verified</span>
                <h2 className="font-h3 text-xl font-bold text-outline">{t('checkout.review_title')}</h2>
              </div>
              <span className="text-xs font-bold text-outline tracking-wider">STEP 3</span>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <aside className="lg:col-span-5 sticky top-32">
          <div className="bg-white p-8 rounded-xl border border-secondary-fixed shadow-[0_4px_30px_rgba(79,95,63,0.05)] space-y-8">
            <h3 className="font-h3 text-2xl font-bold text-primary">{t('checkout.order_summary')}</h3>
            
            {/* Order Items */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" alt="Advanced Rejuvenation Serum" src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800"/>
                </div>
                <div className="flex-grow">
                  <h4 className="font-body-lg font-bold text-on-surface">Advanced Rejuvenation Serum</h4>
                  <p className="text-sm text-stone-500">50ml • Botanical Extract</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm font-medium">Qty: 1</span>
                    <span className="font-bold text-primary">1.250.000đ</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" alt="SPF 50+ Mineral Shield" src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"/>
                </div>
                <div className="flex-grow">
                  <h4 className="font-body-lg font-bold text-on-surface">SPF 50+ Mineral Shield</h4>
                  <p className="text-sm text-stone-500">100ml • Clinical Care</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm font-medium">Qty: 2</span>
                    <span className="font-bold text-primary">1.900.000đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-stone-100"></div>

            {/* Totals */}
            <div className="space-y-3">
              <div className="flex justify-between text-body-md">
                <span className="text-stone-500">Subtotal</span>
                <span className="text-on-surface">3.150.000đ</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-stone-500">Shipping</span>
                <span className="text-emerald-700 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-stone-500">VAT (8%)</span>
                <span className="text-on-surface">252.000đ</span>
              </div>
              <div className="pt-4 flex justify-between items-end border-t border-stone-100 mt-4">
                <span className="font-h3 text-xl font-bold text-primary">Total</span>
                <span className="font-h2 text-3xl font-bold text-primary">3.402.000đ</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input className="flex-grow px-4 py-2 rounded-lg border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm" placeholder="Promo Code" type="text"/>
                <button className="px-6 py-2 border border-primary text-primary font-bold rounded-lg text-sm hover:bg-primary-container hover:text-white transition-all">Apply</button>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full bg-primary-container text-white font-bold py-5 rounded-xl text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/10">
              {t('checkout.complete_btn')}
            </button>

            {/* Trust Signals */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="flex gap-6 opacity-40 grayscale">
                <span className="material-symbols-outlined text-4xl">credit_card</span>
                <span className="material-symbols-outlined text-4xl">account_balance</span>
                <span className="material-symbols-outlined text-4xl">contactless</span>
              </div>
              <p className="text-[11px] text-stone-400 text-center font-medium leading-relaxed">
                Your payment information is processed securely. We do not store credit card details nor have access to your credit card information.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
