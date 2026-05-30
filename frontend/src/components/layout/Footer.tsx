import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/Logo.png';

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

  const socialLinks = [
    { href: 'https://www.facebook.com/tmcmedicalvietnam', label: 'Facebook', icon: '/social-icons/facebook.svg' },
    { href: 'https://www.tiktok.com/@tmcmedical', label: 'TikTok', icon: '/social-icons/tiktok.svg' },
    { href: 'https://zalo.me/0766669266', label: 'Zalo', icon: '/social-icons/zalo.svg' },
  ];

  return (
    <footer className="bg-stone-900 text-stone-200 w-full pt-16 md:pt-20 pb-10 px-6 md:px-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-[1440px] mx-auto">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="mb-4 inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-stone-700 bg-white">
            <img src={logo} alt="TMC" className="h-full w-full object-contain p-1" loading="lazy" decoding="async" />
          </Link>
          <p className="text-sm leading-relaxed text-stone-300 max-w-xs">{t('footer.description')}</p>
          <p className="mt-4 text-sm leading-6 text-stone-300">
            TMC Medical Vietnam<br />
            TP. Ho Chi Minh, Viet Nam
          </p>
        </div>
        <div>
          <h2 className="font-bold text-white mb-5 uppercase text-[10px] tracking-[0.2em]">{t('footer.quick_links')}</h2>
          <ul className="space-y-3 text-sm">
            <li><Link className="text-stone-300 hover:text-white transition-colors" to="/shop?category=skincare">{t('footer.link_treatments')}</Link></li>
            <li><Link className="text-stone-300 hover:text-white transition-colors" to="/shop">{t('footer.link_shop')}</Link></li>
            <li><Link className="text-stone-300 hover:text-white transition-colors" to="/contact">{t('footer.link_doctors')}</Link></li>
            <li><Link className="text-stone-300 hover:text-white transition-colors" to="/philosophy">{t('footer.link_philosophy')}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-white mb-5 uppercase text-[10px] tracking-[0.2em]">{t('footer.support')}</h2>
          <ul className="space-y-3 text-sm">
            <li><Link className="text-stone-300 hover:text-white transition-colors" to="/faq?tab=safety">{t('footer.privacy')}</Link></li>
            <li><Link className="text-stone-300 hover:text-white transition-colors" to="/faq?tab=orders">{t('footer.terms')}</Link></li>
            <li><Link className="text-stone-300 hover:text-white transition-colors" to="/faq">{t('footer.disclaimer')}</Link></li>
            <li><Link className="text-stone-300 hover:text-white transition-colors" to="/contact">{t('footer.contact')}</Link></li>
            <li><Link className="text-stone-300 hover:text-white transition-colors" to="/contact?topic=careers">{t('footer.careers')}</Link></li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <h2 className="font-bold text-white mb-5 uppercase text-[10px] tracking-[0.2em]">{t('footer.stay_inspired')}</h2>
          <p className="text-sm text-stone-300 mb-4">{t('footer.newsletter_desc')}</p>
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
        <p className="text-xs text-stone-300">{t('footer.copyright')}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {socialLinks.map((item) => (
            <a
              key={item.label}
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-700 text-stone-300 transition-colors hover:border-white hover:bg-white hover:text-stone-900"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
            >
              <img src={item.icon} alt="" className="h-4 w-4 invert opacity-75 transition group-hover:invert-0 group-hover:opacity-100" width={16} height={16} loading="lazy" decoding="async" />
            </a>
          ))}
          <a className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-700 text-stone-300 transition-colors hover:border-white hover:text-white" href="https://tmcmedical.vn" target="_blank" rel="noopener noreferrer" aria-label="Website"><span className="material-symbols-outlined text-lg">public</span></a>
          <a className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-700 text-stone-300 transition-colors hover:border-white hover:text-white" href="mailto:tmccarevietnam@gmail.com" aria-label="Email"><span className="material-symbols-outlined text-lg">mail</span></a>
          <a className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-700 text-stone-300 transition-colors hover:border-white hover:text-white" href="tel:0766669266" aria-label="Phone"><span className="material-symbols-outlined text-lg">call</span></a>
        </div>
      </div>
    </footer>
  );
}
