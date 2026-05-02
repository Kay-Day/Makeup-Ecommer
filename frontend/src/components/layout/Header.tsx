import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  const navLinks = [
    { to: '/', label: t('header.home'), exact: true },
    { to: '/shop', label: t('header.shop') },
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
      <nav className="flex justify-between items-center h-full px-8 md:px-16 max-w-[1440px] mx-auto">
        <Link to="/" className="text-xl font-bold tracking-tighter text-emerald-900 font-h1">
          TMC Medical
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
        <div className="flex items-center space-x-6">
          <button onClick={toggleLanguage} className="text-emerald-900 font-bold hover:opacity-70 transition-opacity bg-stone-100 px-3 py-1 rounded-full text-sm">
            {i18n.language === 'vi' ? 'EN' : 'VI'}
          </button>
          <Link to="/search" className="material-symbols-outlined text-emerald-900 hover:opacity-70 transition-opacity">search</Link>
          <Link to="/cart" className="material-symbols-outlined text-emerald-900 hover:opacity-70 transition-opacity">shopping_bag</Link>
          <Link to="/login" className="material-symbols-outlined text-emerald-900 hover:opacity-70 transition-opacity">person</Link>
        </div>
      </nav>
    </header>
  );
}
