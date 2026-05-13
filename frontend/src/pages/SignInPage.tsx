import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { authApi, authStorage } from '../services/api';

export function SignInPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response =
        mode === 'login'
          ? await authApi.login(form.email, form.password)
          : await authApi.register(form);

      authStorage.setSession(response.data);
      navigate(response.data.user.role === 'admin' ? '/admin' : '/');
    } catch (submitError: any) {
      setError(submitError?.response?.data?.detail || 'Không thể xử lý yêu cầu của bạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#f6f2ea]">
      <div className="flex h-full w-full">
        <section className="relative h-full w-1/2 overflow-hidden">
          <motion.img
            src="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1800"
            alt="Beauty visual"
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ scale: [1, 1.05, 1], x: [0, -10, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,20,16,0.78),rgba(44,61,43,0.35),rgba(171,144,102,0.12))]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white xl:p-14">
            <div className="inline-flex w-max items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">{t('authPage.portal')}</span>
            </div>

            <div className="max-w-[560px]">
              <h1 className="text-5xl font-bold leading-[1.02] text-white">
                {t('authPage.hero_title')}
              </h1>
              <p className="mt-5 text-lg leading-8 text-white/78">
                {t('authPage.hero_desc')}
              </p>
              <p className="mt-3 text-sm uppercase tracking-[0.24em] text-white/60">
                {t('authPage.hero_sub')}
              </p>
            </div>
          </div>
        </section>

        <section className="flex h-full w-1/2 items-center justify-center bg-[#fbfaf7] px-10">
          <div className="w-full max-w-[540px]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-emerald-900">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                {t('authPage.back_home')}
              </Link>

              <div className="flex items-center gap-3">
                <div className="rounded-full border border-stone-200 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] transition ${i18n.language === 'vi' ? 'bg-emerald-950 text-white' : 'text-stone-500'}`}
                    onClick={() => void i18n.changeLanguage('vi')}
                  >
                    VIE
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] transition ${i18n.language === 'en' ? 'bg-emerald-950 text-white' : 'text-stone-500'}`}
                    onClick={() => void i18n.changeLanguage('en')}
                  >
                    EN
                  </button>
                </div>

                <div className="rounded-full bg-stone-200/70 p-1">
                  <button
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
                    onClick={() => setMode('login')}
                  >
                    {t('authPage.login_tab')}
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
                    onClick={() => setMode('register')}
                  >
                    {t('authPage.register_tab')}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_24px_70px_rgba(80,78,57,0.08)]">
              <div className="mb-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
                    {mode === 'login' ? t('authPage.mode_login_label') : t('authPage.mode_register_label')}
                  </p>
                  <h2 className="mt-3 text-4xl font-bold text-stone-900">
                    {mode === 'login' ? t('authPage.welcome_back') : t('authPage.create_account')}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
                    {mode === 'login' ? t('authPage.login_desc') : t('authPage.register_desc')}
                  </p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={submit}>
                {error ? (
                  <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                {mode === 'register' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label={t('authPage.full_name')}
                      icon="badge"
                      value={form.full_name}
                      onChange={(value) => setForm((prev) => ({ ...prev, full_name: value }))}
                      placeholder={t('authPage.full_name_placeholder')}
                    />
                    <InputField
                      label={t('authPage.phone')}
                      icon="call"
                      value={form.phone}
                      onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                      placeholder={t('authPage.phone_placeholder')}
                    />
                  </div>
                ) : null}

                <InputField
                  label={t('authPage.email')}
                  icon="mail"
                  type="email"
                  value={form.email}
                  onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
                  placeholder={t('authPage.email_placeholder')}
                />

                <InputField
                  label={t('authPage.password')}
                  icon="lock"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
                  placeholder={t('authPage.password_placeholder')}
                  trailing={
                    <button
                      type="button"
                      className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400 hover:text-stone-700"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? t('authPage.hide') : t('authPage.show')}
                    </button>
                  }
                />

                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="inline-flex items-center gap-3 text-stone-500">
                    <input className="h-4 w-4 rounded border-stone-300 accent-emerald-800" type="checkbox" defaultChecked />
                    <span>{t('authPage.remember_me')}</span>
                  </label>
                  <span className="font-semibold text-emerald-800">
                    {mode === 'login' ? t('authPage.secure') : t('authPage.fast_setup')}
                  </span>
                </div>

                <button
                  className="w-full rounded-[1.4rem] bg-emerald-950 px-5 py-4 text-lg font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-70"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? t('authPage.processing') : mode === 'login' ? t('authPage.submit_login') : t('authPage.submit_register')}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon,
  trailing,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  icon: string;
  trailing?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-stone-500">{label}</span>
      <div className="flex items-center gap-3 rounded-[1.2rem] border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-emerald-600 focus-within:bg-white">
        <span className="material-symbols-outlined text-stone-400">{icon}</span>
        <input
          className="w-full bg-transparent text-stone-900 outline-none placeholder:text-stone-400"
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        {trailing}
      </div>
    </label>
  );
}
