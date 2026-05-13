import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cartStorage } from '../../services/cart';
import { authStorage } from '../../services/api';

export function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setCartCount(cartStorage.getCount());
    return cartStorage.subscribe((items) => {
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    });
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  const navLinks = [
    { to: '/', label: t('header.home'), exact: true },
    { to: '/shop', label: t('header.shop') },
    { to: '/combos', label: t('header.combos') },
    { to: '/philosophy', label: t('header.about') },
    { to: '/blog', label: t('header.blog') },
    { to: '/contact', label: t('header.contact') },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 shadow-[0_4px_30px_rgba(79,95,63,0.03)] h-20">
      <nav className="flex justify-between items-center h-full px-6 md:px-16 max-w-[1440px] mx-auto">
        <Link to="/" className="text-xl font-bold tracking-tighter text-emerald-900 font-h1 shrink-0">
          TMC
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-medium tracking-tight transition-colors duration-300 pb-1 ${
                isActive(link.to, link.exact)
                  ? 'text-emerald-900 border-b-2 border-emerald-800'
                  : 'text-stone-500 hover:text-emerald-800 border-b-2 border-transparent'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-5">
          <button onClick={toggleLanguage} className="text-emerald-900 font-bold hover:opacity-70 transition-opacity bg-stone-100 px-3 py-1 rounded-full text-sm">
            {i18n.language === 'vi' ? 'EN' : 'VI'}
          </button>
          <Link to="/search" className="material-symbols-outlined text-emerald-900 hover:opacity-70 transition-opacity hidden sm:block">search</Link>
          <Link to="/cart" className="relative material-symbols-outlined text-emerald-900 hover:opacity-70 transition-opacity">
            shopping_bag
            {cartCount ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8b6837] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link to={authStorage.getUser() ? '/account' : '/login'} className="material-symbols-outlined text-emerald-900 hover:opacity-70 transition-opacity hidden sm:block">person</Link>

          <button
            className="md:hidden material-symbols-outlined text-emerald-900 text-2xl"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? 'close' : 'menu'}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white border-t border-stone-100 shadow-2xl animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col px-6 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition ${
                    isActive(link.to, link.exact)
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-emerald-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-stone-100" />
              <Link to="/search" className="px-4 py-3 rounded-xl text-base font-medium text-stone-600 hover:bg-stone-50 hover:text-emerald-800 transition flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">search</span>
                {t('header.search')}
              </Link>
              <Link to="/login" className="px-4 py-3 rounded-xl text-base font-medium text-stone-600 hover:bg-stone-50 hover:text-emerald-800 transition flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">person</span>
                {t('header.login')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
