import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-stone-50 border-t border-stone-200 w-full py-20 px-8 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-[1440px] mx-auto">
        <div>
          <div className="font-bold text-emerald-900 text-xl mb-6">TMC Medical</div>
          <p className="font-body-md text-xs leading-relaxed text-stone-500 max-w-xs">{t('footer.description')}</p>
        </div>
        <div>
          <h5 className="font-bold text-primary mb-6 uppercase text-[10px] tracking-widest">{t('footer.quick_links')}</h5>
          <ul className="space-y-4 font-body-md text-xs">
            <li><Link className="text-stone-500 hover:underline transition-all" to="/shop">{t('footer.link_treatments')}</Link></li>
            <li><Link className="text-stone-500 hover:underline transition-all" to="/shop">{t('footer.link_shop')}</Link></li>
            <li><Link className="text-stone-500 hover:underline transition-all" to="/philosophy">{t('footer.link_doctors')}</Link></li>
            <li><Link className="text-stone-500 hover:underline transition-all" to="/philosophy">{t('footer.link_philosophy')}</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-primary mb-6 uppercase text-[10px] tracking-widest">{t('footer.support')}</h5>
          <ul className="space-y-4 font-body-md text-xs">
            <li><Link className="text-stone-500 hover:underline transition-all" to="/faq">{t('footer.privacy')}</Link></li>
            <li><Link className="text-stone-500 hover:underline transition-all" to="/faq">{t('footer.terms')}</Link></li>
            <li><Link className="text-stone-500 hover:underline transition-all" to="/faq">{t('footer.disclaimer')}</Link></li>
            <li><Link className="text-stone-500 hover:underline transition-all" to="/contact">{t('footer.contact')}</Link></li>
            <li><Link className="text-stone-500 hover:underline transition-all" to="/contact">{t('footer.careers')}</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-primary mb-6 uppercase text-[10px] tracking-widest">{t('footer.stay_inspired')}</h5>
          <p className="font-body-md text-xs text-stone-500 mb-6">{t('footer.newsletter_desc')}</p>
          <div className="flex gap-2">
            <input className="bg-white border border-stone-200 px-4 py-2 rounded-lg text-xs flex-1 outline-none focus:border-primary-container" placeholder={t('footer.email_placeholder')} type="email" />
            <button className="bg-primary-container text-white px-6 py-2 rounded-lg text-xs font-bold">{t('footer.join')}</button>
          </div>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto mt-20 pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body-md text-xs text-stone-400">{t('footer.copyright')}</p>
        <div className="flex gap-6">
          <a className="text-stone-400 hover:text-primary transition-colors" href="https://tmcmedical.vn" target="_blank" rel="noopener noreferrer"><span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>public</span></a>
          <a className="text-stone-400 hover:text-primary transition-colors" href="mailto:tmccarevietnam@gmail.com"><span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span></a>
          <a className="text-stone-400 hover:text-primary transition-colors" href="tel:0766669266"><span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>call</span></a>
        </div>
      </div>
    </footer>
  );
}
