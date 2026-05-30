import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cartStorage } from '../../services/cart';
import { authStorage, type UserOut } from '../../services/api';

export function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserOut | null>(() => authStorage.getUser());
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    setCartCount(cartStorage.getCount());
    return cartStorage.subscribe((items) => {
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    });
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setCurrentUser(authStorage.getUser());
  }, [location.pathname]);

  useEffect(() => {
    const syncUser = () => setCurrentUser(authStorage.getUser());
    window.addEventListener('tmc-auth-change', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('tmc-auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

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

  const handleLogout = () => {
    authStorage.clear();
    setCurrentUser(null);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 shadow-[0_4px_30px_rgba(79,95,63,0.03)] h-20">
      <nav className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1440px] mx-auto">
        <Link to="/" className="shrink-0 text-xl font-bold tracking-tighter text-emerald-900 font-h1">
          TMC
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1.5 lg:flex xl:gap-2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold tracking-tight transition-colors duration-300 xl:px-4 ${
                isActive(link.to, link.exact)
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-emerald-50 hover:text-emerald-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button onClick={toggleLanguage} className="rounded-full bg-stone-100 px-3.5 py-2 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50 hover:text-emerald-950" aria-label={i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}>
            {i18n.language === 'vi' ? 'EN' : 'VI'}
          </button>
          <Link to="/search" className="hidden h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-emerald-900 transition hover:bg-emerald-50 hover:text-emerald-950 sm:inline-flex" aria-label={t('header.search')}>
            <span className="material-symbols-outlined text-[21px]">search</span>
          </Link>
          <Link to="/cart" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-emerald-900 transition hover:bg-emerald-50 hover:text-emerald-950" aria-label={t('header.cart')}>
            <span className="material-symbols-outlined text-[21px]">shopping_bag</span>
            {cartCount ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8b6837] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          {isAdmin ? (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 xl:inline-flex"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              {t('header.admin')}
            </Link>
          ) : null}
          <Link to={currentUser ? '/account' : '/login'} className="hidden h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-emerald-900 transition hover:bg-emerald-50 hover:text-emerald-950 sm:inline-flex" aria-label={currentUser ? t('header.account') : t('header.login')}>
            <span className="material-symbols-outlined text-[21px]">person</span>
          </Link>
          {currentUser ? (
            <button
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-stone-200 px-3.5 py-2 text-xs font-bold text-emerald-900 transition hover:border-emerald-200 hover:bg-emerald-50 2xl:inline-flex"
              onClick={handleLogout}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              {t('header.logout')}
            </button>
          ) : null}

          <button
            className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-2xl text-emerald-900 lg:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? 'close' : 'menu'}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
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
              {isAdmin ? (
                <Link
                  to="/admin"
                  className={`px-4 py-3 rounded-xl text-base font-medium transition flex items-center gap-3 ${
                    isActive('/admin')
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-emerald-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                  {t('header.admin')}
                </Link>
              ) : null}
              <hr className="my-2 border-stone-100" />
              <Link to="/search" className="px-4 py-3 rounded-xl text-base font-medium text-stone-600 hover:bg-stone-50 hover:text-emerald-800 transition flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">search</span>
                {t('header.search')}
              </Link>
              <Link to={currentUser ? '/account' : '/login'} className="px-4 py-3 rounded-xl text-base font-medium text-stone-600 hover:bg-stone-50 hover:text-emerald-800 transition flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">person</span>
                {currentUser ? t('header.account') : t('header.login')}
              </Link>
              {currentUser ? (
                <button
                  className="px-4 py-3 rounded-xl text-base font-medium text-rose-700 hover:bg-rose-50 transition flex items-center gap-3"
                  onClick={handleLogout}
                  type="button"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  {t('header.logout')}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
