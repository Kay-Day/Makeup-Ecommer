import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function SignInPage() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-surface">
      {/* Left Side: Visual Brand Experience */}
      <section className="relative w-full md:w-1/2 lg:w-[55%] h-64 md:h-screen overflow-hidden">
        <div className="absolute inset-0 bg-primary-container/10"></div>
        <img 
          className="w-full h-full object-cover" 
          alt="Premium Dermatology Treatment Room" 
          src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent flex flex-col justify-end p-12 md:p-24">
          <div className="max-w-md">
            <span className="font-label-caps text-xs font-bold uppercase tracking-widest text-white mb-4 block">{t('signin.premium_label')}</span>
            <h2 className="font-h1 text-4xl md:text-5xl font-bold text-white mb-6">{t('signin.hero_title')}</h2>
            <p className="font-body-lg text-lg text-white/90">{t('signin.hero_desc')}</p>
          </div>
        </div>
      </section>

      {/* Right Side: Login Interaction */}
      <section className="w-full md:w-1/2 lg:w-[45%] h-screen overflow-y-auto flex items-center justify-center px-6 py-12 md:px-12 lg:px-24">
        <div className="w-full max-w-[420px]">
          {/* Brand Anchor */}
          <div className="mb-12">
            <Link to="/" className="text-xl font-bold tracking-tighter text-emerald-900 block hover:opacity-80 transition-opacity">
              TMC Medical
            </Link>
          </div>

          <div className="space-y-8">
            <header>
              <h2 className="font-h2 text-3xl font-bold text-primary mb-2">{t('signin.welcome')}</h2>
              <p className="font-body-md text-on-surface-variant">{t('signin.welcome_desc')}</p>
            </header>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div className="relative group">
                  <label className="font-label-caps text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block transition-colors group-focus-within:text-primary" htmlFor="email">{t('signin.email_label')}</label>
                  <input 
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container outline-none text-body-md placeholder:text-stone-400 transition-all" 
                    id="email" 
                    placeholder="name@example.com" 
                    type="email"
                  />
                </div>
                
                <div className="relative group">
                  <div className="flex justify-between items-end mb-2">
                    <label className="font-label-caps text-xs font-bold uppercase tracking-wider text-on-surface-variant transition-colors group-focus-within:text-primary" htmlFor="password">{t('signin.password_label')}</label>
                    <Link className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider" to="/forgot-password">{t('signin.forgot')}</Link>
                  </div>
                  <input 
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container outline-none text-body-md placeholder:text-stone-400 transition-all" 
                    id="password" 
                    placeholder="••••••••" 
                    type="password"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button className="w-full bg-primary-container text-white py-4 rounded-lg font-h3 text-lg font-bold shadow-[0_4px_30px_rgba(79,95,63,0.1)] hover:bg-primary transition-all active:scale-[0.98]">
                  {t('signin.signin_btn')}
                </button>
                <button className="w-full bg-transparent border border-primary-container text-primary-container py-4 rounded-lg font-h3 text-lg font-bold hover:bg-primary-container/5 transition-all active:scale-[0.98]">
                  {t('signin.create_btn')}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 py-4">
              <div className="h-px w-full bg-outline-variant/30"></div>
              <span className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-stone-400 whitespace-nowrap">{t('signin.or_continue')}</span>
              <div className="h-px w-full bg-outline-variant/30"></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="font-body-md text-sm font-semibold">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"></path>
                </svg>
                <span className="font-body-md text-sm font-semibold">Facebook</span>
              </button>
            </div>

            {/* Footer Component Guidance Integration (Simplified for Login) */}
            <footer className="mt-20 pt-8 border-t border-stone-200">
              <p className="font-body-md text-[11px] text-stone-400 mb-4">© 2024 TMC Medical Vietnam. All Rights Reserved.</p>
              <div className="flex flex-wrap gap-4">
                <Link className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-primary transition-colors" to="/faq">{t('signin.privacy')}</Link>
                <Link className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-primary transition-colors" to="/faq">{t('signin.terms')}</Link>
                <Link className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-primary transition-colors" to="/contact">{t('signin.contact_us')}</Link>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
}
