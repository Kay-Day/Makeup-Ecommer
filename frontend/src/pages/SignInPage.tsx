import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
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
    } catch (submitError: unknown) {
      const message =
        axios.isAxiosError<{ detail?: string }>(submitError) && submitError.response?.data?.detail
          ? submitError.response.data.detail
          : 'Không thể xử lý yêu cầu của bạn.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f2ea]">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <section className="relative min-h-[280px] w-full overflow-hidden sm:min-h-[340px] lg:min-h-screen lg:w-[48%]">
          <motion.img
            src="https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1800"
            alt="Beauty visual"
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ scale: [1, 1.05, 1], x: [0, -10, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,20,16,0.78),rgba(44,61,43,0.35),rgba(171,144,102,0.12))]" />

          <div className="relative z-10 flex min-h-[280px] flex-col justify-between p-5 text-white sm:min-h-[340px] sm:p-8 lg:min-h-screen lg:p-10 xl:p-14">
            <div className="inline-flex w-max max-w-full items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/80 sm:tracking-[0.28em]">{t('authPage.portal')}</span>
            </div>

            <div className="max-w-[560px]">
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.02]">
                {t('authPage.hero_title')}
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/78 sm:mt-5 sm:text-lg sm:leading-8">
                {t('authPage.hero_desc')}
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/60 sm:text-sm sm:tracking-[0.24em]">
                {t('authPage.hero_sub')}
              </p>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-1 items-center justify-center bg-[#fbfaf7] px-4 py-6 sm:px-6 sm:py-8 lg:w-[52%] lg:px-10">
          <div className="w-full max-w-[540px]">
            <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-emerald-900">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                {t('authPage.back_home')}
              </Link>

              <div className="flex flex-wrap items-center gap-3">
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
                    className={`rounded-full px-3 py-2 text-sm font-semibold transition sm:px-4 ${mode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
                    onClick={() => setMode('login')}
                  >
                    {t('authPage.login_tab')}
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-2 text-sm font-semibold transition sm:px-4 ${mode === 'register' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
                    onClick={() => setMode('register')}
                  >
                    {t('authPage.register_tab')}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_24px_70px_rgba(80,78,57,0.08)] sm:p-8">
              <div className="mb-6 sm:mb-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 sm:tracking-[0.24em]">
                    {mode === 'login' ? t('authPage.mode_login_label') : t('authPage.mode_register_label')}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-stone-400 hover:text-stone-700 sm:tracking-[0.18em]"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? t('authPage.hide') : t('authPage.show')}
                    </button>
                  }
                />

                <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <label className="inline-flex items-center gap-3 text-stone-500">
                    <input className="h-4 w-4 shrink-0 rounded border-stone-300 accent-emerald-800" type="checkbox" defaultChecked />
                    <span>{t('authPage.remember_me')}</span>
                  </label>
                  <span className="font-semibold text-emerald-800">
                    {mode === 'login' ? t('authPage.secure') : t('authPage.fast_setup')}
                  </span>
                </div>

                <button
                  className="w-full rounded-2xl bg-emerald-950 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-70 sm:py-4 sm:text-lg"
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
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500 sm:tracking-[0.2em]">{label}</span>
      <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3 focus-within:border-emerald-600 focus-within:bg-white sm:px-4">
        <span className="material-symbols-outlined shrink-0 text-stone-400">{icon}</span>
        <input
          className="min-w-0 flex-1 bg-transparent text-stone-900 outline-none placeholder:text-stone-400"
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
