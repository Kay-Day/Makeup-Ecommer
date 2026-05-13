import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300 w-full pt-16 md:pt-20 pb-10 px-6 md:px-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-[1440px] mx-auto">
        <div className="col-span-2 md:col-span-1">
          <div className="font-bold text-white text-xl mb-4">TMC</div>
          <p className="text-sm leading-relaxed text-stone-400 max-w-xs">{t('footer.description')}</p>
        </div>
        <div>
          <h5 className="font-bold text-white mb-5 uppercase text-[10px] tracking-[0.2em]">{t('footer.quick_links')}</h5>
          <ul className="space-y-3 text-sm">
            <li><Link className="text-stone-400 hover:text-white transition-colors" to="/shop">{t('footer.link_treatments')}</Link></li>
            <li><Link className="text-stone-400 hover:text-white transition-colors" to="/shop">{t('footer.link_shop')}</Link></li>
            <li><Link className="text-stone-400 hover:text-white transition-colors" to="/philosophy">{t('footer.link_doctors')}</Link></li>
            <li><Link className="text-stone-400 hover:text-white transition-colors" to="/philosophy">{t('footer.link_philosophy')}</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-white mb-5 uppercase text-[10px] tracking-[0.2em]">{t('footer.support')}</h5>
          <ul className="space-y-3 text-sm">
            <li><Link className="text-stone-400 hover:text-white transition-colors" to="/faq?tab=safety">{t('footer.privacy')}</Link></li>
            <li><Link className="text-stone-400 hover:text-white transition-colors" to="/faq?tab=orders">{t('footer.terms')}</Link></li>
            <li><Link className="text-stone-400 hover:text-white transition-colors" to="/faq">{t('footer.disclaimer')}</Link></li>
            <li><Link className="text-stone-400 hover:text-white transition-colors" to="/contact">{t('footer.contact')}</Link></li>
            <li><Link className="text-stone-400 hover:text-white transition-colors" to="/contact">{t('footer.careers')}</Link></li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <h5 className="font-bold text-white mb-5 uppercase text-[10px] tracking-[0.2em]">{t('footer.stay_inspired')}</h5>
          <p className="text-sm text-stone-400 mb-4">{t('footer.newsletter_desc')}</p>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
            <input
              className="bg-stone-800 border border-stone-700 px-4 py-2.5 rounded-lg text-sm flex-1 outline-none focus:border-emerald-600 text-white placeholder:text-stone-500"
              placeholder={t('footer.email_placeholder')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors">
              {subscribed ? '✓' : t('footer.join')}
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto mt-14 md:mt-20 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-stone-500">{t('footer.copyright')}</p>
        <div className="flex gap-6">
          <a className="text-stone-500 hover:text-white transition-colors" href="https://tmcmedical.vn" target="_blank" rel="noopener noreferrer"><span className="material-symbols-outlined text-lg">public</span></a>
          <a className="text-stone-500 hover:text-white transition-colors" href="mailto:tmccarevietnam@gmail.com"><span className="material-symbols-outlined text-lg">mail</span></a>
          <a className="text-stone-500 hover:text-white transition-colors" href="tel:0766669266"><span className="material-symbols-outlined text-lg">call</span></a>
        </div>
      </div>
    </footer>
  );
}
