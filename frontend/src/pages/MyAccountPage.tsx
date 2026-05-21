import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authStorage, authApi, notificationApi, orderApi, wishlistApi, type CustomerPricingStatus, type NotificationItem, type Order, type UserOut, type WishlistItem } from '../services/api';

function currency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleString('vi-VN');
}

export function MyAccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState<UserOut | null>(() => authStorage.getUser());
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [pricingStatus, setPricingStatus] = useState<CustomerPricingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'orders' | 'wishlist' | 'notifications' | 'profile'>('orders');

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: currentUser?.full_name || '',
    phone: currentUser?.phone || '',
    current_password: '',
    new_password: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectSection = (section: 'orders' | 'wishlist' | 'notifications' | 'profile') => {
    setActiveSection(section);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (searchParams.get('order')) {
      setActiveSection('orders');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [ordersResponse, notificationsResponse, pricingResponse, wishlistResponse] = await Promise.all([
          orderApi.getAll(),
          notificationApi.getAll(),
          orderApi.getPricingStatus(),
          wishlistApi.getAll(),
        ]);
        setOrders(ordersResponse.data);
        setNotifications(notificationsResponse.data);
        setPricingStatus(pricingResponse.data);
        setWishlist(wishlistResponse.data);
      } catch (error) {
        console.error('Failed to load account data', error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [currentUser?.id, navigate]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications]);
  const highlightedOrderId = searchParams.get('order') ? Number(searchParams.get('order')) : null;

  const handleLogout = () => {
    authStorage.clear();
    navigate('/login');
  };

  const handleReadNotification = async (notification: NotificationItem) => {
    try {
      if (!notification.is_read) {
        const response = await notificationApi.markRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notification.id ? response.data : item)),
        );
      }
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm(t('account.cancel_order_confirm'))) return;
    try {
      const response = await orderApi.cancel(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? response.data : o)));
    } catch (error: any) {
      alert(error?.response?.data?.detail || t('account.cancel_order_error'));
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const payload: Record<string, string> = {
        full_name: profileForm.full_name,
        phone: profileForm.phone,
      };
      if (profileForm.new_password) {
        payload.current_password = profileForm.current_password;
        payload.new_password = profileForm.new_password;
      }
      const response = await authApi.updateProfile(payload);
      authStorage.setSession({
        access_token: authStorage.getToken() || '',
        token_type: 'bearer',
        user: response.data,
      });
      setCurrentUser(response.data);
      setProfileForm({
        full_name: response.data.full_name,
        phone: response.data.phone || '',
        current_password: '',
        new_password: '',
      });
      setProfileMsg({ type: 'success', text: t('account.save_success') });
      setEditingProfile(false);
    } catch (error: any) {
      setProfileMsg({ type: 'error', text: error?.response?.data?.detail || t('account.save_error') });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleRemoveWishlist = async (productId: number) => {
    try {
      await wishlistApi.remove(productId);
      setWishlist((prev) => prev.filter((item) => item.product_id !== productId));
    } catch {
      // ignore
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[linear-gradient(180deg,#f8f7f2_0%,#ffffff_100%)]">
      <div className="mx-auto flex max-w-[1500px] gap-6 px-6 py-10">
        <aside className="sticky top-24 hidden h-[calc(100vh-120px)] w-80 shrink-0 rounded-[2rem] bg-[#163126] p-6 text-white lg:flex lg:flex-col">
          <div className="flex items-center gap-4 rounded-[1.5rem] bg-white/10 p-4 backdrop-blur">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-300/20 text-xl font-bold text-emerald-100">
              {currentUser.full_name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold">{currentUser.full_name}</h3>
              <p className="truncate text-sm text-white/65">{currentUser.email}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <SummaryMini label={t('account.mobile_orders')} value={String(orders.length)} />
            <SummaryMini label={t('account.mobile_notifications')} value={String(unreadCount)} />
          </div>

          <nav className="mt-8 space-y-2">
            <SidebarAction label={t('account.tab_orders')} active={activeSection === 'orders'} onClick={() => selectSection('orders')} />
            <SidebarAction label={`${t('account.tab_wishlist')} ${wishlist.length ? `(${wishlist.length})` : ''}`} active={activeSection === 'wishlist'} onClick={() => selectSection('wishlist')} />
            <SidebarAction label={`${t('account.tab_notifications')} ${unreadCount ? `(${unreadCount})` : ''}`} active={activeSection === 'notifications'} onClick={() => selectSection('notifications')} />
            <SidebarAction label={t('account.tab_profile')} active={activeSection === 'profile'} onClick={() => selectSection('profile')} />
          </nav>

          <div className="mt-auto rounded-[1.5rem] bg-white/10 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.28em] text-white/55">{t('account.support_status')}</p>
            <p className="mt-3 text-xl font-bold">{t('account.support_active')}</p>
            <p className="mt-2 text-sm text-white/70">{t('account.support_desc')}</p>
            <button
              className="mt-5 w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={handleLogout}
            >
              {t('account.logout')}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <section className="rounded-[2.25rem] bg-white p-6 shadow-[0_25px_80px_rgba(60,68,48,0.08)] md:p-8">
            <div className="flex flex-col gap-5 border-b border-stone-100 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">{t('account.title')}</p>
                <h1 className="mt-3 text-4xl font-bold text-stone-900">{t('account.subtitle')}</h1>
                <p className="mt-3 max-w-2xl text-stone-500">
                  {t('account.desc')}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:hidden">
                <button className={`rounded-2xl px-4 py-2 text-sm font-semibold ${activeSection === 'orders' ? 'bg-emerald-900 text-white' : 'bg-stone-100 text-stone-700'}`} onClick={() => selectSection('orders')}>{t('account.mobile_orders')}</button>
                <button className={`rounded-2xl px-4 py-2 text-sm font-semibold ${activeSection === 'wishlist' ? 'bg-emerald-900 text-white' : 'bg-stone-100 text-stone-700'}`} onClick={() => selectSection('wishlist')}>{t('account.mobile_wishlist')}</button>
                <button className={`rounded-2xl px-4 py-2 text-sm font-semibold ${activeSection === 'notifications' ? 'bg-emerald-900 text-white' : 'bg-stone-100 text-stone-700'}`} onClick={() => selectSection('notifications')}>{t('account.mobile_notifications')}</button>
                <button className={`rounded-2xl px-4 py-2 text-sm font-semibold ${activeSection === 'profile' ? 'bg-emerald-900 text-white' : 'bg-stone-100 text-stone-700'}`} onClick={() => selectSection('profile')}>{t('account.mobile_profile')}</button>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-stone-500">{t('account.loading')}</div>
            ) : (
              <div className="mt-8 space-y-8">
                {activeSection === 'orders' ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-4">
                      <MetricCard label={t('account.total_orders')} value={String(orders.length)} />
                      <MetricCard label={t('account.processing')} value={String(orders.filter((order) => ['pending', 'confirmed'].includes(order.status)).length)} />
                      <MetricCard label={t('account.delivered')} value={String(orders.filter((order) => order.status === 'delivered').length)} />
                      <MetricCard label={t('account.total_spent')} value={currency(orders.reduce((sum, order) => sum + order.total_amount, 0))} />
                    </div>

                    {pricingStatus ? (
                      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                        <div className="rounded-[1.75rem] border border-stone-100 bg-white p-5 shadow-[0_15px_35px_rgba(165,146,109,0.08)]">
                          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a7741]">{t('account.pricing_title')}</p>
                          <h2 className="mt-3 text-2xl font-bold text-stone-900">
                            {pricingStatus.current_tier?.name || t('account.pricing_none')}
                          </h2>
                          <p className="mt-2 text-stone-500">
                            {t('account.pricing_current_spend', { amount: currency(pricingStatus.lifetime_spend) })}
                          </p>
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl bg-stone-50 px-4 py-3">
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('account.tier_discount')}</p>
                              <p className="mt-2 text-xl font-bold text-stone-900">{pricingStatus.current_tier?.discount_percent || 0}%</p>
                            </div>
                            <div className="rounded-2xl bg-stone-50 px-4 py-3">
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('account.wholesale_access')}</p>
                              <p className="mt-2 text-xl font-bold text-stone-900">{pricingStatus.current_tier?.use_wholesale_price ? t('account.wholesale_yes') : t('account.wholesale_no')}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-stone-100 bg-[linear-gradient(180deg,#fffefa_0%,#f8f3e9_100%)] p-5">
                          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a7741]">{t('account.next_tier')}</p>
                          <h3 className="mt-3 text-2xl font-bold text-stone-900">
                            {pricingStatus.next_tier?.name || t('account.next_tier_max')}
                          </h3>
                          <p className="mt-2 text-stone-500">
                            {pricingStatus.next_tier
                              ? `Cần thêm ${currency(pricingStatus.amount_to_next_tier)} để đạt ${pricingStatus.next_tier.name}.`
                              : 'Bạn đã mở toàn bộ mốc giá hiện có.'}
                          </p>
                          <p className="mt-4 text-sm text-stone-500">
                            Ngưỡng giá sỉ mặc định: {currency(pricingStatus.fallback_wholesale_threshold)}.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className={`rounded-[1.75rem] border p-5 transition ${
                            highlightedOrderId === order.id
                              ? 'border-emerald-400 bg-emerald-50/70 shadow-[0_10px_40px_rgba(16,185,129,0.12)]'
                              : 'border-stone-100 bg-stone-50/70'
                          }`}
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Order #{order.id}</p>
                              <h3 className="mt-2 text-2xl font-bold text-stone-900">{currency(order.total_amount)}</h3>
                              <p className="mt-2 text-sm text-stone-500">{formatDate(order.created_at)}</p>
                              <p className="mt-2 text-sm font-semibold text-[#8b6837]">{order.pricing_label || order.applied_price_type}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700">Tạm tính: {currency(order.item_subtotal || 0)}</span>
                              <span className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white">{order.status}</span>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3">
                            <div className="rounded-2xl border border-stone-100 bg-white px-4 py-3">
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Nhận hàng</p>
                              <p className="mt-2 font-semibold text-stone-900">{order.shipping_full_name || currentUser.full_name}</p>
                              <p className="mt-1 text-sm text-stone-500">
                                {[order.shipping_phone, order.shipping_address, order.shipping_city, order.shipping_postal_code].filter(Boolean).join(' • ')}
                              </p>
                              <p className="mt-2 text-sm font-semibold text-emerald-700">
                                {order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : order.payment_method || 'Chưa cập nhật'}
                              </p>
                              {order.tracking_number ? (
                                <p className="mt-2 text-sm font-semibold text-sky-700">
                                  Mã vận đơn: {order.tracking_number}
                                </p>
                              ) : null}
                              {order.status === 'pending' ? (
                                <button
                                  className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                                  onClick={() => handleCancelOrder(order.id)}
                                >
                                  Huỷ đơn
                                </button>
                              ) : null}
                            </div>
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                                <div>
                                  <p className="font-semibold text-stone-900">{item.product?.name || `Sản phẩm #${item.product_id}`}</p>
                                  <p className="text-sm text-stone-500">
                                    {item.product?.brand?.name || 'Không có hãng'} - SL: {item.quantity} - Đơn giá: {currency(item.unit_price)}
                                  </p>
                                </div>
                                <p className="font-semibold text-stone-900">{currency(item.unit_price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-5">
                            <MiniBreakdown label="Giá retail" value={currency(order.subtotal_before_discount || 0)} />
                            <MiniBreakdown label="Ưu đãi tier" value={currency(order.pricing_discount_amount || 0)} />
                            <MiniBreakdown label="Mã giảm giá" value={currency(order.discount_code_amount || 0)} />
                            <MiniBreakdown label="Phí ship" value={currency(order.shipping_fee || 0)} />
                            <MiniBreakdown label="Thanh toán" value={currency(order.total_amount)} highlight />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                {activeSection === 'notifications' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-stone-900">Thông báo đơn hàng</h2>
                        <p className="mt-2 text-stone-500">Mỗi khi admin cập nhật trạng thái đơn, bạn sẽ thấy thông báo tại đây.</p>
                      </div>
                      <button className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700" onClick={() => void handleReadAll()}>
                        Đánh dấu đã đọc tất cả
                      </button>
                    </div>

                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          className={`w-full rounded-[1.75rem] border p-5 text-left transition ${
                            notification.is_read ? 'border-stone-100 bg-stone-50/70' : 'border-emerald-200 bg-emerald-50/70'
                          }`}
                          onClick={() => void handleReadNotification(notification)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-lg font-bold text-stone-900">{notification.title}</p>
                              <p className="mt-2 text-stone-600">{notification.message}</p>
                              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                                {formatDate(notification.created_at)}
                              </p>
                            </div>
                            {!notification.is_read ? (
                              <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
                            ) : null}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                {activeSection === 'wishlist' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-stone-900">Danh sách yêu thích</h2>
                        <p className="mt-2 text-stone-500">Sản phẩm bạn đã lưu để theo dõi.</p>
                      </div>
                    </div>
                    {!wishlist.length ? (
                      <div className="rounded-[1.75rem] border border-stone-100 bg-stone-50/70 p-10 text-center">
                        <p className="text-stone-500">Chưa có sản phẩm yêu thích nào.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {wishlist.map((item) => (
                          <div key={item.id} className="flex gap-4 rounded-[1.5rem] border border-stone-100 bg-white p-4">
                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-stone-100">
                              {item.product?.image_url ? (
                                <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-stone-400">TMC</div>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-stone-900">{item.product?.name || `#${item.product_id}`}</h4>
                                <p className="mt-1 text-sm text-stone-500">{item.product?.brand?.name || ''}</p>
                                <p className="mt-1 font-bold text-emerald-700">{currency(item.product?.retail_price || 0)}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  className="rounded-xl bg-emerald-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
                                  onClick={() => navigate(`/product/${item.product_id}`)}
                                >
                                  Xem
                                </button>
                                <button
                                  className="rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                                  onClick={() => handleRemoveWishlist(item.product_id)}
                                >
                                  Xoá
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}

                {activeSection === 'profile' ? (
                  <div className="grid gap-5 lg:grid-cols-[1fr,340px]">
                    <div className="rounded-[1.75rem] border border-stone-100 bg-stone-50/70 p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-stone-900">Thông tin tài khoản</h2>
                        <button
                          className="rounded-xl bg-emerald-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                          onClick={() => {
                            setEditingProfile(!editingProfile);
                            setProfileForm({
                              full_name: currentUser.full_name || '',
                              phone: currentUser.phone || '',
                              current_password: '',
                              new_password: '',
                            });
                            setProfileMsg(null);
                          }}
                        >
                          {editingProfile ? 'Huỷ' : 'Sửa'}
                        </button>
                      </div>
                      {!editingProfile ? (
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                          <ProfileField label="Họ tên" value={currentUser.full_name} />
                          <ProfileField label="Email" value={currentUser.email} />
                          <ProfileField label="Số điện thoại" value={currentUser.phone || 'Chưa cập nhật'} />
                          <ProfileField label="Vai trò" value={currentUser.role} />
                        </div>
                      ) : (
                        <div className="mt-6 space-y-4">
                          <div>
                            <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Họ tên</label>
                            <input
                              className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
                              value={profileForm.full_name}
                              onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Email</label>
                            <input className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-stone-500" disabled value={currentUser.email} />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Số điện thoại</label>
                            <input
                              className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                            />
                          </div>
                          <div className="border-t border-stone-200 pt-4">
                            <p className="text-sm font-semibold text-stone-700">Đổi mật khẩu (để trống nếu không đổi)</p>
                            <div className="mt-3 grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Mật khẩu hiện tại</label>
                                <input
                                  type="password"
                                  className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
                                  value={profileForm.current_password}
                                  onChange={(e) => setProfileForm((p) => ({ ...p, current_password: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Mật khẩu mới</label>
                                <input
                                  type="password"
                                  className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
                                  value={profileForm.new_password}
                                  onChange={(e) => setProfileForm((p) => ({ ...p, new_password: e.target.value }))}
                                />
                              </div>
                            </div>
                          </div>
                          {profileMsg ? (
                            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                              {profileMsg.text}
                            </div>
                          ) : null}
                          <button
                            className="w-full rounded-xl bg-emerald-900 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                            disabled={profileSaving}
                            onClick={handleSaveProfile}
                          >
                            {profileSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[1.75rem] bg-[#163126] p-6 text-white">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/50">Account Overview</p>
                      <h3 className="mt-4 text-3xl font-bold">Customer Console</h3>
                      <p className="mt-3 text-white/72">
                        Từ đây khách hàng có thể theo dõi tất cả đơn hàng đã đặt và cập nhật mới nhất từ admin mà không cần rời khỏi tài khoản.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function SidebarAction({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
        active ? 'bg-white text-[#163126]' : 'text-white/75 hover:bg-white/10'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function SummaryMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] bg-white/10 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.24em] text-white/50">{label}</p>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#163126,#27523d)] p-5 text-white">
      <p className="text-xs uppercase tracking-[0.24em] text-white/55">{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

function MiniBreakdown({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${highlight ? 'bg-[#8b6837] text-white' : 'border border-stone-100 bg-white'}`}>
      <p className={`text-xs font-bold uppercase tracking-[0.18em] ${highlight ? 'text-white/70' : 'text-stone-500'}`}>{label}</p>
      <p className="mt-2 text-lg font-bold">{value}</p>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-stone-900">{value}</p>
    </div>
  );
}
