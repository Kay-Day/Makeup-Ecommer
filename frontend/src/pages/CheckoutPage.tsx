import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authStorage, orderApi, paymentApi, type CheckoutSettings, type Order, type OrderQuote, type SePayPaymentStatus, type UserOut } from '../services/api';
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

const SEPAY_PAYMENT_WINDOW_MS = 5 * 60 * 1000;

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

export function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentUser] = useState<UserOut | null>(() => authStorage.getUser());
  const [items, setItems] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [checkoutQuote, setCheckoutQuote] = useState<OrderQuote | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<Order | null>(null);
  const [sepayStatus, setSepayStatus] = useState<SePayPaymentStatus | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const initialName = splitFullName(currentUser?.full_name);
  const [form, setForm] = useState({
    firstName: initialName.firstName,
    lastName: initialName.lastName,
    phone: currentUser?.phone || '',
    address: '',
    city: 'TP. Hồ Chí Minh',
    postalCode: '',
    paymentMethod: 'cod' as 'cod' | 'sepay',
  });

  useEffect(() => {
    document.title = 'Thanh toán an toàn | TMC Beauty';
    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: 'Hoàn tất đơn hàng mỹ phẩm TMC với giá sỉ tự động, giao hàng rõ ràng và thanh toán COD hoặc SePay QR.',
    });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'noindex,nofollow' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: 'Thanh toán an toàn | TMC Beauty' });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: 'Trang thanh toán bảo mật cho đơn hàng mỹ phẩm TMC.',
    });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: `${window.location.origin}/checkout` });
  }, []);

  useEffect(() => {
    const codeFromUrl = searchParams.get('code')?.trim().toUpperCase();
    if (!codeFromUrl) return;
    setDiscountCode(codeFromUrl);
    setAppliedDiscountCode(codeFromUrl);
  }, [searchParams]);

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
  }, [currentUser?.id, navigate]);

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
  const quoteLineByProductId = useMemo(() => {
    return new Map((checkoutQuote?.items || []).map((line) => [`${line.product_id}:${line.variant_code || ''}`, line]));
  }, [checkoutQuote]);
  const summaryShipping = pendingPayment ? pendingPayment.shipping_fee ?? 0 : checkoutQuote?.shipping_fee ?? shipping;
  const summaryTotal = pendingPayment ? pendingPayment.total_amount : checkoutQuote?.total_amount ?? total;
  const summarySubtotal = pendingPayment
    ? Math.max(0, summaryTotal - summaryShipping)
    : checkoutQuote?.subtotal_after_discount ?? subtotal;
  const summaryBeforeDiscount = pendingPayment
    ? pendingPayment.subtotal_before_discount ?? summarySubtotal
    : checkoutQuote?.subtotal_before_discount ?? subtotal;
  const pricingDiscount = pendingPayment
    ? pendingPayment.pricing_discount_amount ?? 0
    : checkoutQuote?.pricing_discount_amount ?? 0;
  const discountCodeAmount = pendingPayment
    ? pendingPayment.discount_code_amount ?? 0
    : checkoutQuote?.discount_code_amount ?? 0;
  const totalDiscount = pendingPayment
    ? pendingPayment.total_discount_amount ?? 0
    : checkoutQuote?.total_discount_amount ?? 0;
  const pricingLabel = pendingPayment?.pricing_label || checkoutQuote?.pricing_label || 'Giá bán lẻ';
  const summaryItemCount = pendingPayment
    ? pendingPayment.items.reduce((count, item) => count + item.quantity, 0)
    : items.reduce((count, item) => count + item.quantity, 0);
  const paymentDeadlineMs = pendingPayment?.created_at
    ? new Date(pendingPayment.created_at).getTime() + SEPAY_PAYMENT_WINDOW_MS
    : null;
  const paymentExpired = pendingPayment?.payment_status === 'expired'
    || sepayStatus?.payment_status === 'expired'
    || Boolean(paymentDeadlineMs && nowMs >= paymentDeadlineMs);
  const remainingPaymentSeconds = paymentDeadlineMs ? Math.max(0, Math.ceil((paymentDeadlineMs - nowMs) / 1000)) : null;
  const paymentSucceeded = Boolean(pendingPayment && (pendingPayment.payment_status === 'paid' || sepayStatus?.payment_status === 'paid'));

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!currentUser || pendingPayment || !items.length) {
      setCheckoutQuote(null);
      return;
    }

    let cancelled = false;
    const loadQuote = async () => {
      try {
        const response = await orderApi.quote({
          items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity, combo_id: item.combo_id, variant_code: item.variant_code || undefined })),
          discount_code: appliedDiscountCode || undefined,
        });
        if (!cancelled) {
          setCheckoutQuote(response.data);
          if (appliedDiscountCode) setError(null);
        }
      } catch (quoteError) {
        console.error('Failed to load checkout quote', quoteError);
        if (!cancelled) {
          setCheckoutQuote(null);
          if (appliedDiscountCode) {
            setError('Mã giảm giá không hợp lệ hoặc đơn hàng chưa đạt điều kiện áp dụng.');
          }
        }
      }
    };

    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [appliedDiscountCode, currentUser, items, pendingPayment]);

  useEffect(() => {
    if (!pendingPayment || pendingPayment.payment_method !== 'sepay') return;

    let stopped = false;
    const loadStatus = async () => {
      if (paymentDeadlineMs && Date.now() >= paymentDeadlineMs) {
        setError('Mã QR SePay đã hết hạn sau 5 phút. Vui lòng tạo đơn mới nếu muốn thanh toán online.');
        return;
      }
      try {
        const response = await paymentApi.getSePayStatus(pendingPayment.id);
        if (stopped) return;
        setSepayStatus(response.data);
        if (response.data.payment_status === 'paid') {
          setMessage(`Thanh toán SePay thành công. Mã đơn của bạn là #${pendingPayment.id}.`);
        }
        if (response.data.payment_status === 'expired') {
          setError('Mã QR SePay đã hết hạn sau 5 phút. Vui lòng tạo đơn mới nếu muốn thanh toán online.');
        }
      } catch (statusError) {
        console.error('Failed to load SePay payment status', statusError);
      }
    };

    void loadStatus();
    const timer = window.setInterval(loadStatus, 3000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [navigate, paymentDeadlineMs, pendingPayment]);

  useEffect(() => {
    if (!pendingPayment || pendingPayment.payment_method !== 'sepay') return;
    if (pendingPayment.payment_status === 'paid') return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [pendingPayment]);

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
        items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity, combo_id: item.combo_id, variant_code: item.variant_code || undefined })),
        discount_code: appliedDiscountCode || discountCode.trim() || undefined,
        shipping_full_name: shippingFullName,
        shipping_phone: form.phone.trim(),
        shipping_address: form.address.trim(),
        shipping_city: form.city.trim(),
        shipping_postal_code: form.postalCode.trim() || undefined,
        payment_method: form.paymentMethod,
      });
      cartStorage.clear();
      if (response.data.payment_method === 'sepay') {
        setPendingPayment(response.data);
        setSepayStatus(null);
        setNowMs(Date.now());
        setMessage('Đơn hàng đã được tạo. Vui lòng quét QR SePay để thanh toán.');
      } else {
        setMessage(`Đặt hàng COD thành công. Mã đơn của bạn là #${response.data.id}.`);
        window.setTimeout(() => navigate(`/account?order=${response.data.id}`), 1000);
      }
    } catch (submitError: any) {
      setError(submitError?.response?.data?.detail || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const applyDiscountCode = () => {
    const nextCode = discountCode.trim().toUpperCase();
    setDiscountCode(nextCode);
    setAppliedDiscountCode(nextCode);
  };

  if (!currentUser) {
    return null;
  }

  if (paymentSucceeded && pendingPayment) {
    return (
      <PaymentSuccessView
        order={pendingPayment}
        onViewNotifications={() => navigate(`/account?tab=notifications&order=${pendingPayment.id}`)}
        onViewOrder={() => navigate(`/account?order=${pendingPayment.id}`)}
      />
    );
  }

  if (!items.length && !pendingPayment) {
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
    <main className="min-h-screen bg-[#f7faf8]">
      <div className="mx-auto max-w-[1320px] px-4 pb-24 pt-8 sm:px-6 lg:px-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500" aria-label="Breadcrumb">
          <Link to="/" className="font-medium transition hover:text-emerald-800">Trang chủ</Link>
          <span>/</span>
          <Link to="/cart" className="font-medium transition hover:text-emerald-800">Giỏ hàng</Link>
          <span>/</span>
          <span className="font-semibold text-stone-900">Thanh toán</span>
        </nav>

        <header className="mb-8 grid gap-6 border-b border-emerald-100 pb-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">{t('checkout.section_label')}</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-stone-950 sm:text-4xl">
              Thanh toán gọn gàng, rõ từng khoản
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
              Giá sỉ, combo và mã giảm giá được kiểm tra lại từ hệ thống trước khi tạo đơn. Bạn chỉ cần xác nhận thông tin nhận hàng và chọn hình thức thanh toán.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-emerald-100 bg-white p-2 shadow-sm">
            <CheckoutStep active label={t('checkout.step_shipping')} number="1" />
            <CheckoutStep active label={t('checkout.step_payment')} number="2" />
            <CheckoutStep active label={t('checkout.step_review')} number="3" />
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{t('checkout.step_label', { count: 1 })}</p>
                  <h2 className="mt-2 text-2xl font-bold text-stone-950">{t('checkout.shipping_title')}</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{t('checkout.shipping_desc')}</p>
                </div>
                <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 sm:flex">
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

            <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{t('checkout.step_label', { count: 2 })}</p>
                  <h2 className="mt-2 text-2xl font-bold text-stone-950">{t('checkout.payment_title')}</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{t('checkout.payment_desc')}</p>
                </div>
                <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                  {form.paymentMethod === 'sepay' ? 'SePay' : 'COD'}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <PaymentOption
                  active={form.paymentMethod === 'cod'}
                  title={t('checkout.cod_title')}
                  description={t('checkout.cod_desc')}
                  icon="payments"
                  onClick={() => updateForm('paymentMethod', 'cod')}
                />
                <PaymentOption
                  active={form.paymentMethod === 'sepay'}
                  title="Thanh toán SePay QR"
                  description="Quét mã QR ngân hàng. Hệ thống tự xác nhận khi SePay báo tiền vào."
                  icon="qr_code_scanner"
                  onClick={() => updateForm('paymentMethod', 'sepay')}
                />
              </div>
            </section>

            <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{t('checkout.step_label', { count: 3 })}</p>
                  <h2 className="mt-2 text-2xl font-bold text-stone-950">{t('checkout.review_title')}</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{t('checkout.review_desc')}</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
                <label className="mb-3 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                  {t('checkout.promo_label')}
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    placeholder={t('checkout.promo_placeholder')}
                    type="text"
                    value={discountCode}
                    onChange={(event) => setDiscountCode(event.target.value)}
                  />
                  <button
                    className="rounded-lg bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"
                    onClick={applyDiscountCode}
                    type="button"
                  >
                    {t('checkout.apply')}
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-500">
                  {appliedDiscountCode ? `Đang kiểm tra mã ${appliedDiscountCode} trong tổng đơn.` : t('checkout.promo_help')}
                </p>
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
              {pendingPayment?.payment_method === 'sepay' ? (
                <SePayPaymentPanel
                  order={pendingPayment}
                  status={sepayStatus}
                  expired={paymentExpired}
                  remainingSeconds={remainingPaymentSeconds}
                  onViewOrder={() => navigate(`/account?order=${pendingPayment.id}`)}
                />
              ) : null}
            </section>
          </form>
        </div>

        <aside className="xl:sticky xl:top-24">
          <div className="space-y-6 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{t('checkout.summary_label')}</p>
                <h2 className="mt-2 text-2xl font-bold text-stone-950">{t('checkout.order_summary')}</h2>
                <p className="mt-1 text-sm text-stone-500">{t('checkout.items_count', { count: summaryItemCount })}</p>
              </div>
              <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
                {pricingLabel}
              </span>
            </div>

            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {pendingPayment ? pendingPayment.items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-lg border border-stone-100 bg-stone-50/70 p-3">
                  <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-white shadow-sm">
                    {item.product?.image_url ? (
                      <img className="h-full w-full object-cover" alt={item.product.name} src={item.product.image_url} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-sky-50 text-sky-700">TMC</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{item.product?.name || `Sản phẩm #${item.product_id}`}</h4>
                      <p className="mt-1 text-sm text-stone-500">
                        {[item.product?.brand?.name, item.product?.category?.name, item.combo_name].filter(Boolean).join(' • ') || t('product.not_available')}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-stone-500">
                        {t('checkout.quantity_label', { count: item.quantity })}
                      </span>
                      <span className="text-base font-bold text-emerald-800">
                        {currency(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              )) : items.map((item) => (
                <div key={item.product_id} className="flex gap-3 rounded-lg border border-stone-100 bg-stone-50/70 p-3">
                  <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-white shadow-sm">
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
                        {[item.product.brand_name, item.product.category_name, item.variant_code ? `Mã ${item.variant_code}` : null].filter(Boolean).join(' • ') || t('product.not_available')}
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
                      <span className="text-base font-bold text-emerald-800">
                        {currency(
                          quoteLineByProductId.get(`${item.product_id}:${item.variant_code || ''}`)?.line_total ??
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

            <div className="space-y-3 rounded-xl bg-stone-50 p-4">
              <SummaryRow label="Giá hàng trước ưu đãi" value={currency(summaryBeforeDiscount)} />
              {pricingDiscount > 0 ? <SummaryRow label="Ưu đãi giá sỉ/combo" value={`-${currency(pricingDiscount)}`} highlight /> : null}
              {discountCodeAmount > 0 ? <SummaryRow label="Mã giảm giá" value={`-${currency(discountCodeAmount)}`} highlight /> : null}
              {totalDiscount > 0 ? <SummaryRow label="Tổng tiết kiệm" value={`-${currency(totalDiscount)}`} highlight /> : null}
              <SummaryRow label={t('checkout.subtotal')} value={currency(summarySubtotal)} />
              <SummaryRow label={t('checkout.shipping')} value={currency(summaryShipping)} />
              <div className="mt-4 flex items-end justify-between border-t border-stone-200 pt-4">
                <span className="text-lg font-bold text-stone-950">{t('checkout.total')}</span>
                <span className="text-3xl font-bold text-emerald-800">{currency(summaryTotal)}</span>
              </div>
            </div>

            <button
              className="w-full rounded-lg bg-emerald-800 py-4 text-base font-bold text-white transition hover:bg-emerald-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-300"
              onClick={() => {
                const formElement = document.querySelector('form');
                if (formElement) formElement.requestSubmit();
              }}
              disabled={submitting || Boolean(pendingPayment)}
              type="button"
            >
              {pendingPayment ? 'Đơn hàng đã được tạo' : submitting ? t('checkout.processing') : t('checkout.complete_btn')}
            </button>

            <div className="rounded-xl border border-stone-100 bg-white p-4">
              <div className="flex justify-center gap-5 text-stone-400">
                <span className="material-symbols-outlined text-3xl">credit_card</span>
                <span className="material-symbols-outlined text-3xl">local_shipping</span>
                <span className="material-symbols-outlined text-3xl">inventory_2</span>
              </div>
              <p className="mt-3 text-center text-xs leading-6 text-stone-500">
                {t('checkout.secure_note')}
              </p>
            </div>
          </div>
        </aside>
      </div>
      </div>
    </main>
  );
}

function CheckoutStep({ active, label, number }: { active: boolean; label: string; number: string }) {
  return (
    <div className={`rounded-lg px-3 py-3 text-center ${active ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-500'}`}>
      <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/16 text-xs font-bold ring-1 ring-white/25">
        {number}
      </span>
      <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.12em]">{label}</span>
    </div>
  );
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={`text-right font-semibold ${highlight ? 'text-emerald-700' : 'text-stone-950'}`}>{value}</span>
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
      <label className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">{label}</label>
      <input
        className="w-full rounded-lg border border-stone-200 px-4 py-3.5 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
      />
    </div>
  );
}

function PaymentOption({
  active,
  title,
  description,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-[1.4rem] border p-5 text-left transition ${
        active
          ? 'border-emerald-300 bg-emerald-50 shadow-[0_14px_28px_rgba(6,95,70,0.10)]'
          : 'border-stone-200 bg-stone-50/70 hover:border-emerald-200 hover:bg-white'
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ${active ? 'text-emerald-800' : 'text-stone-500'}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-stone-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
        </div>
      </div>
    </button>
  );
}

function PaymentSuccessView({
  order,
  onViewNotifications,
  onViewOrder,
}: {
  order: Order;
  onViewNotifications: () => void;
  onViewOrder: () => void;
}) {
  return (
    <div className="mx-auto min-h-[calc(100vh-90px)] max-w-[1180px] px-4 py-10 sm:px-6 lg:px-10">
      <section className="overflow-hidden rounded-[1.8rem] border border-emerald-100 bg-white shadow-[0_28px_80px_rgba(22,101,52,0.12)]">
        <div className="bg-[linear-gradient(135deg,#065f46_0%,#047857_55%,#0f766e_100%)] px-6 py-12 text-white sm:px-10 lg:px-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/16 ring-1 ring-white/25">
                <span className="material-symbols-outlined text-5xl">check_circle</span>
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.28em] text-emerald-100">Giao dịch thành công</p>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Thanh toán đã được xác nhận
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50">
                Hệ thống đã nhận thanh toán SePay cho đơn #{order.id}. Thông báo đã được lưu vào tài khoản của bạn.
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-white/12 p-5 ring-1 ring-white/18 lg:w-80">
              <p className="text-sm font-semibold text-emerald-100">Tổng đã thanh toán</p>
              <p className="mt-3 break-words text-4xl font-black">{currency(order.total_amount)}</p>
              <p className="mt-4 text-sm text-emerald-50">Mã chuyển khoản</p>
              <p className="mt-1 break-all text-xl font-bold">{order.payment_code}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr,0.8fr]">
          <div className="space-y-4 px-6 py-8 sm:px-10">
            <h2 className="text-2xl font-bold text-slate-900">Tóm tắt đơn hàng</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <SuccessMetric label="Trạng thái" value="Đã thanh toán" />
              <SuccessMetric label="Hình thức" value="SePay QR" />
              <SuccessMetric label="Mã đơn" value={`#${order.id}`} />
            </div>
            <div className="rounded-[1.4rem] bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <span className="font-semibold text-slate-900">Sản phẩm</span>
                <span className="text-sm font-bold text-emerald-700">{order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span>
              </div>
              <div className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{item.product?.name || `Sản phẩm #${item.product_id}`}</p>
                      <p className="mt-1 text-sm text-stone-500">Số lượng {item.quantity}</p>
                    </div>
                    <p className="shrink-0 font-bold text-slate-900">{currency(item.unit_price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="border-t border-slate-100 bg-emerald-50/60 px-6 py-8 sm:px-10 lg:border-l lg:border-t-0">
            <h2 className="text-2xl font-bold text-slate-900">Thông báo hệ thống</h2>
            <p className="mt-3 leading-7 text-stone-600">
              Bạn có thể mở mục thông báo để xem xác nhận thanh toán và theo dõi các cập nhật tiếp theo từ admin.
            </p>
            <div className="mt-7 grid gap-3">
              <button
                className="rounded-2xl bg-emerald-800 px-5 py-4 font-bold text-white transition hover:bg-emerald-700"
                onClick={onViewNotifications}
                type="button"
              >
                Xem thông báo
              </button>
              <button
                className="rounded-2xl border border-emerald-200 bg-white px-5 py-4 font-bold text-emerald-800 transition hover:bg-emerald-50"
                onClick={onViewOrder}
                type="button"
              >
                Xem đơn hàng
              </button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function SuccessMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-2 break-words text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SePayPaymentPanel({
  order,
  status,
  expired,
  remainingSeconds,
  onViewOrder,
}: {
  order: Order;
  status: SePayPaymentStatus | null;
  expired: boolean;
  remainingSeconds: number | null;
  onViewOrder: () => void;
}) {
  const qrUrl = status?.qr_url || order.sepay_qr_url;
  const paymentCode = status?.payment_code || order.payment_code;
  const isPaid = status?.payment_status === 'paid' || order.payment_status === 'paid';
  const remainingLabel = remainingSeconds === null
    ? null
    : `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}`;

  return (
    <div className="mt-6 rounded-[1.5rem] border border-sky-100 bg-sky-50/70 p-5">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-[1.2rem] bg-white p-4 shadow-sm md:w-64">
          {expired ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 px-6 text-center">
              <span className="material-symbols-outlined text-4xl text-rose-500">timer_off</span>
              <p className="mt-3 text-sm font-bold text-slate-900">Mã QR đã hết hạn</p>
              <p className="mt-2 text-xs leading-5 text-stone-500">Đơn này không còn nhận thanh toán online.</p>
            </div>
          ) : null}
          {qrUrl ? (
            <img className="h-full w-full object-contain" src={qrUrl} alt="SePay QR" />
          ) : (
            <div className="text-center text-sm leading-6 text-stone-500">
              Phương thức thanh toán này hiện chưa sẵn sàng. Vui lòng chọn hình thức khác hoặc thử lại sau.
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className={`inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
            isPaid ? 'bg-emerald-100 text-emerald-700' : expired ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isPaid ? 'Đã thanh toán' : expired ? 'Hết hạn' : 'Chờ thanh toán'}
          </div>
          <h3 className="mt-4 text-2xl font-bold text-slate-900">Thanh toán đơn #{order.id}</h3>
          {!isPaid && !expired && remainingLabel ? (
            <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              Vui lòng thanh toán trong {remainingLabel}. Quá 5 phút hệ thống sẽ khóa QR online.
            </p>
          ) : null}
          {expired ? (
            <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Thời gian thanh toán online đã hết. Không chuyển tiền vào mã QR này nữa.
            </p>
          ) : null}
          <div className="mt-5 space-y-3 text-sm">
            <InfoRow label="Số tiền" value={currency(status?.total_amount || order.total_amount)} />
            <InfoRow label="Nội dung CK" value={paymentCode || 'Chưa có mã'} strong />
            <InfoRow label="Ngân hàng" value={status?.bank_name || 'Chưa cấu hình'} />
            <InfoRow label="Số tài khoản" value={status?.bank_account || 'Chưa cấu hình'} />
            <InfoRow label="Chủ tài khoản" value={status?.account_name || 'Chưa cấu hình'} />
          </div>
          <button
            className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
            onClick={onViewOrder}
            type="button"
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
      <span className="shrink-0 text-stone-500">{label}</span>
      <span className={`min-w-0 break-all text-right ${strong ? 'text-lg font-extrabold tracking-wide text-sky-800' : 'font-semibold text-slate-900'}`}>
        {value}
      </span>
    </div>
  );
}
