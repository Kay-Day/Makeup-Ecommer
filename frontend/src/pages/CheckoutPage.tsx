import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authStorage, orderApi, type CheckoutSettings } from '../services/api';
import { cartStorage, type CartItem } from '../services/cart';

function currency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function splitFullName(fullName: string | undefined) {
  if (!fullName?.trim()) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

export function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = authStorage.getUser();
  const [items, setItems] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialName = splitFullName(currentUser?.full_name);
  const [form, setForm] = useState({
    firstName: initialName.firstName,
    lastName: initialName.lastName,
    phone: currentUser?.phone || '',
    address: '',
    city: 'TP. Hồ Chí Minh',
    postalCode: '',
    paymentMethod: 'cod' as const,
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setItems(cartStorage.getItems());
    const unsubscribe = cartStorage.subscribe(setItems);

    const loadCheckoutSettings = async () => {
      try {
        const response = await orderApi.getCheckoutSettings();
        setSettings(response.data);
      } catch (loadError) {
        console.error('Failed to load checkout settings', loadError);
      }
    };

    void loadCheckoutSettings();
    return unsubscribe;
  }, [currentUser, navigate]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => {
      const price = item.combo_discount_percent
        ? item.product.retail_price * (1 - item.combo_discount_percent / 100)
        : item.product.retail_price;
      return sum + price * item.quantity;
    }, 0),
    [items],
  );
  const shipping = settings?.default_shipping_fee ?? 30000;
  const total = subtotal + shipping;

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length) {
      setError('Giỏ hàng đang trống, chưa thể đặt hàng.');
      return;
    }

    const shippingFullName = [form.firstName, form.lastName].filter(Boolean).join(' ').trim();
    if (!shippingFullName || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setError('Vui lòng điền đầy đủ thông tin nhận hàng.');
      return;
    }

    // Stock validation before submitting
    const stockErrors: string[] = [];
    for (const item of items) {
      const currentStock = item.product.stock;
      if (currentStock != null && item.quantity > currentStock) {
        stockErrors.push(
          t('checkout.stock_error', { name: item.product.name, stock: currentStock, quantity: item.quantity })
        );
      }
    }
    if (stockErrors.length > 0) {
      setError(stockErrors.join('; '));
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await orderApi.create({
        items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity, combo_id: item.combo_id })),
        discount_code: discountCode.trim() || undefined,
        shipping_full_name: shippingFullName,
        shipping_phone: form.phone.trim(),
        shipping_address: form.address.trim(),
        shipping_city: form.city.trim(),
        shipping_postal_code: form.postalCode.trim() || undefined,
        payment_method: 'cod',
      });
      cartStorage.clear();
      setMessage(`Đặt hàng COD thành công. Mã đơn của bạn là #${response.data.id}.`);
      window.setTimeout(() => navigate(`/account?order=${response.data.id}`), 1000);
    } catch (submitError: any) {
      setError(submitError?.response?.data?.detail || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (!items.length) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[960px] items-center px-5 py-16 sm:px-8">
        <div className="w-full rounded-[2rem] border border-sky-100 bg-white px-8 py-16 text-center shadow-[0_24px_60px_rgba(24,58,92,0.08)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-700">
            <span className="material-symbols-outlined text-3xl">shopping_bag</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{t('checkout.empty_title')}</h1>
          <p className="mx-auto mt-3 max-w-xl text-stone-500">{t('checkout.empty_desc')}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/cart" className="rounded-full border border-sky-200 bg-white px-6 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
              {t('checkout.back_to_cart')}
            </Link>
            <Link to="/shop" className="rounded-full bg-sky-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-800">
              {t('checkout.back_to_shop')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1440px] px-5 pb-24 pt-10 sm:px-8 md:px-12 xl:px-16">
      <div className="mb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-600">{t('checkout.section_label')}</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{t('checkout.page_title')}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-500">{t('checkout.page_desc')}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-12 xl:gap-12">
        <div className="space-y-8 xl:col-span-7">
          <div className="rounded-[1.8rem] border border-sky-100 bg-[linear-gradient(135deg,#f6fbff_0%,#ffffff_55%,#eef7ff_100%)] p-6 shadow-[0_22px_60px_rgba(24,58,92,0.08)] sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">1</span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-900">{t('checkout.step_shipping')}</span>
              </div>
              <div className="h-px min-w-[2.5rem] flex-1 bg-sky-100" />
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">2</span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-900">{t('checkout.step_payment')}</span>
              </div>
              <div className="h-px min-w-[2.5rem] flex-1 bg-sky-100" />
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">3</span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-900">{t('checkout.step_review')}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">{t('checkout.summary_items')}</p>
                <div className="mt-2 text-2xl font-bold text-slate-900">{items.length}</div>
              </div>
              <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">{t('checkout.shipping')}</p>
                <div className="mt-2 text-2xl font-bold text-slate-900">{currency(shipping)}</div>
              </div>
              <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">{t('checkout.total')}</p>
                <div className="mt-2 text-2xl font-bold text-sky-800">{currency(total)}</div>
              </div>
            </div>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <section className="rounded-[1.8rem] border border-sky-100 bg-white p-6 shadow-[0_22px_60px_rgba(24,58,92,0.08)] sm:p-8">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-600">{t('checkout.step_label', { count: 1 })}</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">{t('checkout.shipping_title')}</h2>
                  <p className="mt-2 text-sm leading-7 text-stone-500">{t('checkout.shipping_desc')}</p>
                </div>
                <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 sm:flex">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field
                  label={t('checkout.first_name')}
                  value={form.firstName}
                  onChange={(value) => updateForm('firstName', value)}
                  placeholder={t('checkout.first_name_placeholder')}
                />
                <Field
                  label={t('checkout.last_name')}
                  value={form.lastName}
                  onChange={(value) => updateForm('lastName', value)}
                  placeholder={t('checkout.last_name_placeholder')}
                />
              </div>
              <div className="mt-6">
                <Field
                  label={t('checkout.address')}
                  value={form.address}
                  onChange={(value) => updateForm('address', value)}
                  placeholder={t('checkout.address_placeholder')}
                />
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <Field
                  label={t('checkout.city')}
                  value={form.city}
                  onChange={(value) => updateForm('city', value)}
                  placeholder={t('checkout.city_placeholder')}
                />
                <Field
                  label={t('checkout.postal')}
                  value={form.postalCode}
                  onChange={(value) => updateForm('postalCode', value)}
                  placeholder={t('checkout.postal_placeholder')}
                />
                <Field
                  label={t('checkout.phone')}
                  value={form.phone}
                  onChange={(value) => updateForm('phone', value)}
                  placeholder={t('checkout.phone_placeholder')}
                />
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-sky-100 bg-white p-6 shadow-[0_22px_60px_rgba(24,58,92,0.08)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-600">{t('checkout.step_label', { count: 2 })}</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">{t('checkout.payment_title')}</h2>
                  <p className="mt-2 text-sm leading-7 text-stone-500">{t('checkout.payment_desc')}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  COD
                </span>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t('checkout.cod_title')}</h3>
                    <p className="mt-2 text-sm leading-7 text-stone-600">{t('checkout.cod_desc')}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-sky-100 bg-white p-6 shadow-[0_22px_60px_rgba(24,58,92,0.08)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-600">{t('checkout.step_label', { count: 3 })}</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">{t('checkout.review_title')}</h2>
                  <p className="mt-2 text-sm leading-7 text-stone-500">{t('checkout.review_desc')}</p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-stone-100 bg-slate-50 p-5">
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                  {t('checkout.promo_label')}
                </label>
                <input
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder={t('checkout.promo_placeholder')}
                  type="text"
                  value={discountCode}
                  onChange={(event) => setDiscountCode(event.target.value)}
                />
                <p className="mt-3 text-sm text-stone-500">{t('checkout.promo_help')}</p>
              </div>

              {message ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {message}
                </div>
              ) : null}
              {error ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              ) : null}
            </section>
          </form>
        </div>

        <aside className="xl:col-span-5 xl:sticky xl:top-28">
          <div className="space-y-6 rounded-[1.8rem] border border-sky-100 bg-white p-6 shadow-[0_22px_60px_rgba(24,58,92,0.08)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-600">{t('checkout.summary_label')}</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900">{t('checkout.order_summary')}</h3>
              </div>
              <span className="rounded-full bg-sky-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                {t('checkout.items_count', { count: items.length })}
              </span>
            </div>

            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-4 rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-4">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl bg-white shadow-sm">
                    {item.product.image_url ? (
                      <img className="h-full w-full object-cover" alt={item.product.name} src={item.product.image_url} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-sky-50 text-sky-700">TMC</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{item.product.name}</h4>
                      <p className="mt-1 text-sm text-stone-500">
                        {[item.product.brand_name, item.product.category_name].filter(Boolean).join(' • ') || t('product.not_available')}
                        {item.combo_discount_percent && (
                          <span className="ml-2 inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-xs">card_giftcard</span>
                            Combo -{item.combo_discount_percent}%
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-stone-500">
                        {t('checkout.quantity_label', { count: item.quantity })}
                      </span>
                      <span className="text-base font-bold text-sky-800">
                        {currency(
                          (item.combo_discount_percent
                            ? item.product.retail_price * (1 - item.combo_discount_percent / 100)
                            : item.product.retail_price) * item.quantity
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">{t('checkout.subtotal')}</span>
                <span className="font-semibold text-slate-900">{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">{t('checkout.shipping')}</span>
                <span className="font-semibold text-slate-900">{currency(shipping)}</span>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                <span className="text-xl font-bold text-slate-900">{t('checkout.total')}</span>
                <span className="text-3xl font-bold text-sky-800">{currency(total)}</span>
              </div>
            </div>

            <button
              className="w-full rounded-[1.3rem] bg-sky-700 py-5 text-lg font-bold text-white transition hover:bg-sky-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-300"
              onClick={() => {
                const formElement = document.querySelector('form');
                if (formElement) formElement.requestSubmit();
              }}
              disabled={submitting}
              type="button"
            >
              {submitting ? t('checkout.processing') : t('checkout.complete_btn')}
            </button>

            <div className="rounded-[1.4rem] bg-slate-50 p-5">
              <div className="flex justify-center gap-6 opacity-45 grayscale">
                <span className="material-symbols-outlined text-4xl">credit_card</span>
                <span className="material-symbols-outlined text-4xl">local_shipping</span>
                <span className="material-symbols-outlined text-4xl">inventory_2</span>
              </div>
              <p className="mt-4 text-center text-[12px] leading-6 text-stone-500">
                {t('checkout.secure_note')}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">{label}</label>
      <input
        className="w-full rounded-2xl border border-stone-200 px-4 py-3.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
      />
    </div>
  );
}
