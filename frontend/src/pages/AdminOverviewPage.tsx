import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  adminApi,
  authStorage,
  notificationApi,
  productApi,
  uploadApi,
  type Banner,
  type BlogArticle,
  type BlogCategory,
  type Brand,
  type Category,
  type ChatbotApiKey,
  type DashboardResponse,
  type DiscountCode,
  type DiscountSetting,
  type NotificationItem,
  type Order,
  type PricingTier,
  type WholesaleTier,
  type Product,
  type ProductDiscount,
  type ProductImage,
  type UserOut,
  type Combo,
} from '../services/api';
import { RichTextEditor } from '../components/ui/RichTextEditor';

type AdminTab =
  | 'dashboard'
  | 'users'
  | 'brands'
  | 'categories'
  | 'products'
  | 'orders'
  | 'discounts'
  | 'pricing'
  | 'chatbot'
  | 'blogCategories'
  | 'articles'
  | 'banners'
  | 'combos';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function currency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleString('vi-VN');
}

function ImageField({
  label,
  value,
  onChange,
  onUpload,
  uploading,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}) {
  const [preview, setPreview] = useState<string>(value);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    await onUpload(file);
    URL.revokeObjectURL(objectUrl);
    event.target.value = '';
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">{label}</label>
      <input
        className="w-full rounded-xl border border-stone-200 bg-white/90 px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://... hoặc upload file"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-amber-200 hover:bg-amber-50">
          <input className="hidden" type="file" accept="image/*" onChange={handleFileChange} />
          {uploading ? 'Đang upload...' : 'Upload ảnh'}
        </label>
        {preview ? (
          <img src={preview} alt="Preview" className="h-20 w-20 rounded-xl border border-stone-200 object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-xs text-stone-400">
            Preview
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminOverviewPage() {
  const { t } = useTranslation();
  const currentUser = authStorage.getUser();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingKey, setUploadingKey] = useState('');

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [discountSetting, setDiscountSetting] = useState<DiscountSetting | null>(null);
  const [users, setUsers] = useState<UserOut[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [chatbotKeys, setChatbotKeys] = useState<ChatbotApiKey[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [wholesaleTiers, setWholesaleTiers] = useState<WholesaleTier[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>([]);
  const [productImages, setProductImages] = useState<Record<number, ProductImage[]>>({});
  const [combos, setCombos] = useState<Combo[]>([]);
  const [comboForm, setComboForm] = useState({ id: 0, name: '', description: '', image_url: '', discount_percent: 0, is_active: true });
  const [comboItemsForm, setComboItemsForm] = useState<{ product_id: number; quantity: number }[]>([]);
  const [newComboItem, setNewComboItem] = useState({ product_id: 0, quantity: 1 });

  const [userForm, setUserForm] = useState({
    id: 0,
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'customer',
    is_active: true,
  });
  const [brandForm, setBrandForm] = useState({ id: 0, name: '', logo_url: '' });
  const [categoryForm, setCategoryForm] = useState({ id: 0, name: '', slug: '', image_url: '' });
  const [productForm, setProductForm] = useState({
    id: 0,
    name: '',
    description: '',
    image_url: '',
    category_id: 0,
    brand_id: 0,
    retail_price: 0,
    wholesale_price: 0,
    badge: '',
    stock: 0,
    is_active: true,
  });
  const [discountForm, setDiscountForm] = useState({
    id: 0,
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed_amount',
    discount_value: 0,
    min_order_amount: 0,
    max_usage: 0,
    expires_at: '',
    is_active: true,
  });
  const [pricingTierForm, setPricingTierForm] = useState({
    id: 0,
    name: '',
    min_total_spent: 0,
    discount_percent: 0,
    use_wholesale_price: false,
    is_active: true,
    note: '',
  });
  const [wholesaleTierForm, setWholesaleTierForm] = useState({
    id: 0,
    name: '',
    min_order_total: 0,
    max_order_total: '' as string,
    discount_percent: 0,
    is_active: true,
    note: '',
  });
  const [chatbotKeyForm, setChatbotKeyForm] = useState({
    id: 0,
    name: '',
    api_key: '',
    provider: 'deepseek',
    base_url: 'https://api.deepseek.com',
    model: 'deepseek-v4-pro',
    reasoning_effort: 'max',
    is_active: true,
    note: '',
  });
  const [blogCategoryForm, setBlogCategoryForm] = useState({ id: 0, name: '', slug: '', description: '' });
  const [articleForm, setArticleForm] = useState({
    id: 0,
    title: '',
    slug: '',
    content: '',
    image_url: '',
    category_id: 0,
    is_published: true,
  });
  const [bannerForm, setBannerForm] = useState({
    id: 0,
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    link_url: '',
    sort_order: 0,
    is_active: true,
  });
  const [trackingInput, setTrackingInput] = useState<Record<number, string>>({});
  const [newImageUrl, setNewImageUrl] = useState<Record<number, string>>({});
  const [productDiscountForm, setProductDiscountForm] = useState({
    productId: 0,
    id: 0,
    discount_percent: 0,
    start_time: '',
    end_time: '',
    is_active: true,
  });

  const resetUserForm = () => setUserForm({ id: 0, email: '', password: '', full_name: '', phone: '', role: 'customer', is_active: true });
  const resetBrandForm = () => setBrandForm({ id: 0, name: '', logo_url: '' });
  const resetCategoryForm = () => setCategoryForm({ id: 0, name: '', slug: '', image_url: '' });
  const resetProductForm = () =>
    setProductForm({
      id: 0,
      name: '',
      description: '',
      image_url: '',
      category_id: categories[0]?.id ?? 0,
      brand_id: brands[0]?.id ?? 0,
      retail_price: 0,
      wholesale_price: 0,
      badge: '',
      stock: 0,
      is_active: true,
    });
  const resetDiscountForm = () =>
    setDiscountForm({
      id: 0,
      code: '',
      discount_type: 'percent',
      discount_value: 0,
      min_order_amount: 0,
      max_usage: 0,
      expires_at: '',
      is_active: true,
    });
  const resetPricingTierForm = () =>
    setPricingTierForm({
      id: 0,
      name: '',
      min_total_spent: 0,
      discount_percent: 0,
      use_wholesale_price: false,
      is_active: true,
      note: '',
    });
  const resetWholesaleTierForm = () =>
    setWholesaleTierForm({
      id: 0,
      name: '',
      min_order_total: 0,
      max_order_total: '',
      discount_percent: 0,
      is_active: true,
      note: '',
    });
  const resetChatbotKeyForm = () =>
    setChatbotKeyForm({
      id: 0,
      name: '',
      api_key: '',
      provider: 'deepseek',
      base_url: 'https://api.deepseek.com',
      model: 'deepseek-v4-pro',
      reasoning_effort: 'max',
      is_active: true,
      note: '',
    });
  const resetBlogCategoryForm = () => setBlogCategoryForm({ id: 0, name: '', slug: '', description: '' });
  const resetArticleForm = () =>
    setArticleForm({
      id: 0,
      title: '',
      slug: '',
      content: '',
      image_url: '',
      category_id: blogCategories[0]?.id ?? 0,
      is_published: true,
    });
  const resetBannerForm = () =>
    setBannerForm({
      id: 0,
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      link_url: '',
      sort_order: 0,
      is_active: true,
    });

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess('');
      return;
    }
    setSuccess(message);
    setError('');
  };

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const responses = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getDiscountSettings(),
        adminApi.getUsers(),
        adminApi.getBrands(),
        adminApi.getCategories(),
        adminApi.getProducts(),
        adminApi.getOrders(),
        notificationApi.getAll(),
        adminApi.getDiscountCodes(),
        adminApi.getChatbotKeys(),
        adminApi.getPricingTiers(),
        adminApi.getWholesaleTiers(),
        adminApi.getBlogCategories(),
        adminApi.getBlogArticles(),
        adminApi.getBanners(),
        adminApi.getProductDiscounts(),
        adminApi.getCombos(),
      ]);

      setDashboard(responses[0].data);
      setDiscountSetting(responses[1].data);
      setUsers(responses[2].data);
      setBrands(responses[3].data);
      setCategories(responses[4].data);
      setProducts(responses[5].data);
      setOrders(responses[6].data);
      setNotifications(responses[7].data);
      setDiscountCodes(responses[8].data);
      setChatbotKeys(responses[9].data);
      setPricingTiers(responses[10].data);
      setWholesaleTiers(responses[11].data);
      setBlogCategories(responses[12].data);
      setArticles(responses[13].data);
      setBanners(responses[14].data);
      setProductDiscounts(responses[15].data);
      setCombos(responses[16].data);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.detail || 'Không tải được dữ liệu admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      void loadAdminData();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!productForm.id && categories.length && !productForm.category_id) {
      setProductForm((prev) => ({ ...prev, category_id: categories[0].id }));
    }
  }, [categories, productForm.id, productForm.category_id]);

  useEffect(() => {
    if (!productForm.id && brands.length && !productForm.brand_id) {
      setProductForm((prev) => ({ ...prev, brand_id: brands[0].id }));
    }
  }, [brands, productForm.id, productForm.brand_id]);

  useEffect(() => {
    if (!articleForm.id && blogCategories.length && !articleForm.category_id) {
      setArticleForm((prev) => ({ ...prev, category_id: blogCategories[0].id }));
    }
  }, [blogCategories, articleForm.id, articleForm.category_id]);

  useEffect(() => {
    if (productForm.id && !productImages[productForm.id]) {
      productApi.getImages(productForm.id).then((res) => {
        setProductImages((prev) => ({ ...prev, [productForm.id]: res.data }));
      }).catch(() => {});
    }
  }, [productForm.id]);

  const unreadNotificationCount = notifications.filter((item) => !item.is_read).length;

  const markNotificationRead = async (notificationId: number) => {
    try {
      const response = await notificationApi.markRead(notificationId);
      setNotifications((prev) => prev.map((item) => (item.id === notificationId ? response.data : item)));
    } catch (readError: any) {
      showMessage(readError?.response?.data?.detail || 'Không thể cập nhật thông báo.', true);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch (readError: any) {
      showMessage(readError?.response?.data?.detail || 'Không thể cập nhật thông báo.', true);
    }
  };

  const uploadImageToField = async (key: string, file: File, onDone: (url: string) => void) => {
    setUploadingKey(key);
    try {
      const response = await uploadApi.image(file);
      onDone(response.data.url);
      showMessage('Upload ảnh thành công.');
    } catch (uploadError: any) {
      showMessage(uploadError?.response?.data?.detail || 'Upload ảnh thất bại.', true);
    } finally {
      setUploadingKey('');
    }
  };

  const withSaving = async (callback: () => Promise<void>) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await callback();
    } catch (saveError: any) {
      showMessage(saveError?.response?.data?.detail || 'Thao tác thất bại.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleUserSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      if (userForm.id) {
        await adminApi.updateUser(userForm.id, {
          email: userForm.email,
          password: userForm.password || undefined,
          full_name: userForm.full_name,
          phone: userForm.phone || null,
          role: userForm.role,
          is_active: userForm.is_active,
        });
        showMessage('Đã cập nhật user.');
      } else {
        await adminApi.createUser(userForm);
        showMessage('Đã thêm user mới.');
      }
      resetUserForm();
      await loadAdminData();
    });
  };

  const handleBrandSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      if (brandForm.id) {
        await adminApi.updateBrand(brandForm.id, { name: brandForm.name, logo_url: brandForm.logo_url || null });
        showMessage('Đã cập nhật thương hiệu.');
      } else {
        await adminApi.createBrand({ name: brandForm.name, logo_url: brandForm.logo_url || null });
        showMessage('Đã thêm thương hiệu.');
      }
      resetBrandForm();
      await loadAdminData();
    });
  };

  const handleCategorySubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      const payload = {
        name: categoryForm.name,
        slug: categoryForm.slug || slugify(categoryForm.name),
        image_url: categoryForm.image_url || null,
      };
      if (categoryForm.id) {
        await adminApi.updateCategory(categoryForm.id, payload);
        showMessage('Đã cập nhật danh mục sản phẩm.');
      } else {
        await adminApi.createCategory(payload);
        showMessage('Đã thêm danh mục sản phẩm.');
      }
      resetCategoryForm();
      await loadAdminData();
    });
  };

  const handleProductSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      const payload = {
        name: productForm.name,
        description: productForm.description || null,
        image_url: productForm.image_url || null,
        category_id: productForm.category_id || null,
        brand_id: productForm.brand_id || null,
        retail_price: Number(productForm.retail_price),
        wholesale_price: Number(productForm.wholesale_price) || null,
        badge: productForm.badge || null,
        stock: Number(productForm.stock),
        is_active: productForm.is_active,
      };
      if (productForm.id) {
        await adminApi.updateProduct(productForm.id, payload);
        showMessage('Đã cập nhật sản phẩm.');
      } else {
        await adminApi.createProduct(payload as Omit<Product, 'id' | 'category' | 'brand'>);
        showMessage('Đã thêm sản phẩm.');
      }
      resetProductForm();
      await loadAdminData();
    });
  };

  const handleDiscountSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      const payload = {
        code: discountForm.code.toUpperCase(),
        discount_type: discountForm.discount_type,
        discount_value: Number(discountForm.discount_value),
        min_order_amount: Number(discountForm.min_order_amount),
        max_usage: Number(discountForm.max_usage) || null,
        expires_at: discountForm.expires_at || null,
        is_active: discountForm.is_active,
      };
      if (discountForm.id) {
        await adminApi.updateDiscountCode(discountForm.id, payload);
        showMessage('Đã cập nhật mã giảm giá.');
      } else {
        await adminApi.createDiscountCode(payload);
        showMessage('Đã thêm mã giảm giá.');
      }
      resetDiscountForm();
      await loadAdminData();
    });
  };

  const handlePricingTierSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      const payload = {
        name: pricingTierForm.name,
        min_total_spent: Number(pricingTierForm.min_total_spent),
        discount_percent: Number(pricingTierForm.discount_percent),
        use_wholesale_price: pricingTierForm.use_wholesale_price,
        is_active: pricingTierForm.is_active,
        note: pricingTierForm.note || null,
      };
      if (pricingTierForm.id) {
        await adminApi.updatePricingTier(pricingTierForm.id, payload);
        showMessage('Đã cập nhật mốc giá.');
      } else {
        await adminApi.createPricingTier(payload);
        showMessage('Đã thêm mốc giá mới.');
      }
      resetPricingTierForm();
      await loadAdminData();
    });
  };

  const handleWholesaleTierSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      const maxOrderTotal = wholesaleTierForm.max_order_total
        ? Number(wholesaleTierForm.max_order_total)
        : null;
      const payload = {
        name: wholesaleTierForm.name,
        min_order_total: Number(wholesaleTierForm.min_order_total),
        max_order_total: maxOrderTotal,
        discount_percent: Number(wholesaleTierForm.discount_percent),
        is_active: wholesaleTierForm.is_active,
        note: wholesaleTierForm.note || null,
      };
      if (wholesaleTierForm.id) {
        await adminApi.updateWholesaleTier(wholesaleTierForm.id, payload);
        showMessage('Đã cập nhật mức giá sỉ.');
      } else {
        await adminApi.createWholesaleTier(payload);
        showMessage('Đã thêm mức giá sỉ mới.');
      }
      resetWholesaleTierForm();
      await loadAdminData();
    });
  };

  const handleChatbotKeySubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      const payload = {
        name: chatbotKeyForm.name,
        api_key: chatbotKeyForm.api_key,
        provider: chatbotKeyForm.provider,
        base_url: chatbotKeyForm.base_url,
        model: chatbotKeyForm.model,
        reasoning_effort: chatbotKeyForm.reasoning_effort,
        is_active: chatbotKeyForm.is_active,
        note: chatbotKeyForm.note || null,
      };
      if (chatbotKeyForm.id) {
        await adminApi.updateChatbotKey(chatbotKeyForm.id, payload);
        showMessage('Đã cập nhật chatbot key.');
      } else {
        await adminApi.createChatbotKey(payload);
        showMessage('Đã thêm chatbot key mới.');
      }
      resetChatbotKeyForm();
      await loadAdminData();
    });
  };

  const handleBlogCategorySubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      const payload = {
        name: blogCategoryForm.name,
        slug: blogCategoryForm.slug || slugify(blogCategoryForm.name),
        description: blogCategoryForm.description || null,
      };
      if (blogCategoryForm.id) {
        await adminApi.updateBlogCategory(blogCategoryForm.id, payload);
        showMessage('Đã cập nhật danh mục bài viết.');
      } else {
        await adminApi.createBlogCategory(payload);
        showMessage('Đã thêm danh mục bài viết.');
      }
      resetBlogCategoryForm();
      await loadAdminData();
    });
  };

  const handleArticleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      const payload = {
        title: articleForm.title,
        slug: articleForm.slug || slugify(articleForm.title),
        content: articleForm.content,
        image_url: articleForm.image_url || null,
        category_id: Number(articleForm.category_id),
        is_published: articleForm.is_published,
      };
      if (articleForm.id) {
        await adminApi.updateBlogArticle(articleForm.id, payload);
        showMessage('Đã cập nhật bài viết.');
      } else {
        await adminApi.createBlogArticle(payload);
        showMessage('Đã thêm bài viết.');
      }
      resetArticleForm();
      await loadAdminData();
    });
  };

  const handleBannerSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      const payload = {
        title: bannerForm.title,
        subtitle: bannerForm.subtitle || null,
        description: bannerForm.description || null,
        image_url: bannerForm.image_url,
        link_url: bannerForm.link_url || null,
        sort_order: bannerForm.sort_order,
        is_active: bannerForm.is_active,
      };
      if (bannerForm.id) {
        await adminApi.updateBanner(bannerForm.id, payload);
        showMessage('Đã cập nhật banner.');
      } else {
        await adminApi.createBanner(payload);
        showMessage('Đã thêm banner.');
      }
      resetBannerForm();
      await loadAdminData();
    });
  };

  const resetProductDiscountForm = () =>
    setProductDiscountForm({ productId: 0, id: 0, discount_percent: 0, start_time: '', end_time: '', is_active: true });

  const handleProductDiscountSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await withSaving(async () => {
      const productId = productDiscountForm.productId;
      const payload = {
        discount_percent: productDiscountForm.discount_percent,
        start_time: new Date(productDiscountForm.start_time).toISOString(),
        end_time: new Date(productDiscountForm.end_time).toISOString(),
        is_active: productDiscountForm.is_active,
      };
      if (productDiscountForm.id) {
        await adminApi.updateProductDiscount(productId, payload);
        showMessage('Da cap nhat giam gia san pham.');
      } else {
        await adminApi.createProductDiscount(productId, payload);
        showMessage('Da them giam gia san pham.');
      }
      resetProductDiscountForm();
      await loadAdminData();
    });
  };

  const handleThresholdSave = async () => {
    if (!discountSetting) return;
    await withSaving(async () => {
      await adminApi.updateDiscountSettings({
        wholesale_threshold: Number(discountSetting.wholesale_threshold),
        default_shipping_fee: Number(discountSetting.default_shipping_fee),
      });
      showMessage('Đã cập nhật ngưỡng giá sỉ và phí ship mặc định.');
      await loadAdminData();
    });
  };

  const handleExportOrdersReport = async () => {
    try {
      const response = await adminApi.exportOrdersReport();
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showMessage('Đã xuất báo cáo đơn hàng CSV.');
    } catch (exportError: any) {
      showMessage(exportError?.response?.data?.detail || 'Không thể xuất báo cáo đơn hàng.', true);
    }
  };

  const handleDelete = async (label: string, callback: () => Promise<unknown>) => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${label}?`)) return;
    await withSaving(async () => {
      await callback();
      showMessage(`Đã xoá ${label}.`);
      await loadAdminData();
    });
  };

  const renderDashboard = () => {
    if (!dashboard) return null;
    const maxRevenue = Math.max(...dashboard.revenue_by_month.map((item) => item.value), 1);

    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Doanh thu" value={currency(dashboard.summary.total_revenue)} />
          <StatCard label="Đơn hàng" value={dashboard.summary.total_orders.toString()} />
          <StatCard label="Sản phẩm" value={dashboard.summary.total_products.toString()} />
          <StatCard label="Khách hàng" value={dashboard.summary.total_users.toString()} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
          <section className="rounded-[1.8rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_45px_rgba(161,141,108,0.08)] backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">Biểu đồ doanh thu</h2>
                <p className="text-sm text-stone-500">Dữ liệu tổng hợp theo tháng từ database</p>
              </div>
            </div>
            <div className="flex h-72 items-end gap-3 rounded-[1.5rem] bg-[linear-gradient(180deg,#fffdf8_0%,#f6f1e7_100%)] px-4 py-5">
              {dashboard.revenue_by_month.length ? dashboard.revenue_by_month.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full rounded-t-2xl bg-[linear-gradient(180deg,#b78a48_0%,#8f6a35_100%)] transition-all"
                    style={{ height: `${Math.max((item.value / maxRevenue) * 100, 8)}%` }}
                    title={`${item.label}: ${currency(item.value)}`}
                  />
                  <span className="text-[11px] font-semibold text-stone-500">{item.label.slice(5)}</span>
                </div>
              )) : (
                <div className="flex h-full w-full items-center justify-center text-stone-400">Chưa có dữ liệu doanh thu</div>
              )}
            </div>
          </section>

          <section className="rounded-[1.8rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_45px_rgba(161,141,108,0.08)] backdrop-blur">
            <h2 className="text-xl font-bold text-stone-900">Giá sỉ mặc định</h2>
            <p className="mt-1 text-sm text-stone-500">Ngưỡng fallback cho hệ thống và phí ship COD mặc định. Nếu chưa có mốc giá riêng phù hợp, khách đạt tổng mua này sẽ dùng `wholesale_price` ở sản phẩm có cấu hình giá sỉ.</p>
            <div className="mt-6 space-y-4">
              <input
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                type="number"
                value={discountSetting?.wholesale_threshold ?? 0}
                onChange={(event) =>
                  setDiscountSetting((prev) => prev ? { ...prev, wholesale_threshold: Number(event.target.value) } : prev)
                }
              />
              <input
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                type="number"
                value={discountSetting?.default_shipping_fee ?? 30000}
                onChange={(event) =>
                  setDiscountSetting((prev) => prev ? { ...prev, default_shipping_fee: Number(event.target.value) } : prev)
                }
              />
              <button
                className="w-full rounded-2xl bg-[linear-gradient(135deg,#8b6837_0%,#b48b4a_100%)] px-4 py-3 font-semibold text-white transition hover:brightness-105"
                onClick={() => void handleThresholdSave()}
                disabled={saving}
              >
                Lưu cấu hình giá sỉ và ship
              </button>
              <div className="rounded-2xl bg-[linear-gradient(180deg,#fffdf8_0%,#f6f1e7_100%)] p-4 text-sm text-stone-600">
                Cập nhật gần nhất: {formatDate(discountSetting?.updated_at)}. Phí ship hiện tại: {currency(discountSetting?.default_shipping_fee ?? 30000)}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-stone-900">Trạng thái đơn hàng</h3>
              <div className="mt-4 space-y-3">
                {dashboard.orders_by_status.map((item) => (
                  <div key={item.status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="capitalize text-stone-600">{item.status}</span>
                      <span className="font-semibold text-stone-900">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,#b48745_0%,#8d6d3f_100%)]"
                        style={{ width: `${Math.max((item.count / Math.max(dashboard.summary.total_orders, 1)) * 100, 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[1.8rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_45px_rgba(161,141,108,0.08)] backdrop-blur">
            <h2 className="text-xl font-bold text-stone-900">Sản phẩm bán tốt</h2>
            <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-stone-100 bg-white/90">
              <table className="w-full text-left text-sm">
                <thead className="bg-[linear-gradient(180deg,#fffdf8_0%,#f8f3ea_100%)] text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">SL bán</th>
                    <th className="px-4 py-3">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.top_products.map((item) => (
                    <tr key={item.id} className="border-t border-stone-100">
                      <td className="px-4 py-3 font-medium text-stone-800">{item.name}</td>
                      <td className="px-4 py-3 text-stone-600">{item.units_sold}</td>
                      <td className="px-4 py-3 text-stone-600">{currency(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[1.8rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_45px_rgba(161,141,108,0.08)] backdrop-blur">
            <h2 className="text-xl font-bold text-stone-900">Đơn hàng gần đây</h2>
            <div className="mt-4 space-y-3">
              {dashboard.recent_orders.map((order) => (
                <div key={order.id} className="rounded-[1.4rem] border border-stone-100 bg-[linear-gradient(180deg,#fffefa_0%,#fbf8f1_100%)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-900">#{order.id} - {order.user?.full_name || order.user?.email}</p>
                      <p className="text-sm text-stone-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#8b6837]">{currency(order.total_amount)}</p>
                      <p className="text-xs uppercase tracking-wider text-stone-500">{order.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[1.8rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_45px_rgba(161,141,108,0.08)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900">Doanh thu theo chính sách giá</h2>
                <p className="mt-1 text-sm text-stone-500">Giúp admin nhìn rõ đơn bán lẻ, giá sỉ và các mốc ưu đãi đang hoạt động ra sao.</p>
              </div>
              <button className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-amber-200 hover:bg-amber-50" onClick={() => void handleExportOrdersReport()}>
                Xuất CSV
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {dashboard.price_modes.length ? dashboard.price_modes.map((mode) => {
                const width = Math.max((mode.revenue / Math.max(dashboard.summary.total_revenue || 1, 1)) * 100, 8);
                return (
                  <div key={mode.label} className="rounded-2xl bg-[linear-gradient(180deg,#fffdf8_0%,#f7f1e6_100%)] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-stone-900">{mode.label}</p>
                        <p className="mt-1 text-sm text-stone-500">{mode.count} đơn hàng</p>
                      </div>
                      <p className="font-semibold text-[#8b6837]">{currency(mode.revenue)}</p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white">
                      <div className="h-2 rounded-full bg-[linear-gradient(90deg,#b48745_0%,#8d6d3f_100%)]" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              }) : <div className="rounded-2xl bg-stone-50 px-4 py-6 text-center text-stone-400">Chưa có dữ liệu phân loại giá.</div>}
            </div>
          </section>

          <section className="rounded-[1.8rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_45px_rgba(161,141,108,0.08)] backdrop-blur">
            <h2 className="text-xl font-bold text-stone-900">Các mốc giá đang áp dụng</h2>
            <div className="mt-5 space-y-3">
              {dashboard.pricing_tiers.length ? dashboard.pricing_tiers.map((tier) => (
                <div key={tier.id} className="rounded-2xl border border-stone-100 bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-stone-900">{tier.name}</p>
                      <p className="mt-1 text-sm text-stone-500">Từ {currency(tier.min_total_spent)} - Giảm {tier.discount_percent}%</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#9a7741]">{tier.use_wholesale_price ? 'Có áp dụng giá sỉ nếu sản phẩm có giá sỉ' : 'Chỉ giảm theo phần trăm'}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tier.is_active ? 'bg-amber-50 text-[#8b6837]' : 'bg-stone-100 text-stone-500'}`}>
                      {tier.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              )) : <div className="rounded-2xl bg-stone-50 px-4 py-6 text-center text-stone-400">Chưa có mốc giá nào.</div>}
            </div>
          </section>

          {dashboard.wholesale_tiers && dashboard.wholesale_tiers.length > 0 && (
            <section className="rounded-[1.8rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_45px_rgba(161,141,108,0.08)] backdrop-blur">
              <h2 className="text-xl font-bold text-stone-900">Mức giá sỉ (theo tổng đơn)</h2>
              <div className="mt-5 space-y-3">
                {dashboard.wholesale_tiers.map((tier) => (
                  <div key={tier.id} className="rounded-2xl border border-stone-100 bg-white px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-stone-900">{tier.name}</p>
                        <p className="mt-1 text-sm text-stone-500">
                          Từ {currency(tier.min_order_total)}{tier.max_order_total ? ` đến ${currency(tier.max_order_total)}` : ' trở lên'} - Giảm {tier.discount_percent}%/sản phẩm
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tier.is_active ? 'bg-amber-50 text-[#8b6837]' : 'bg-stone-100 text-stone-500'}`}>
                        {tier.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <section className="rounded-[1.8rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_45px_rgba(161,141,108,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Thông báo admin</h2>
              <p className="mt-1 text-sm text-stone-500">Đơn hàng mới và thay đổi trạng thái sẽ hiện ngay tại đây.</p>
            </div>
            <button className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-amber-200 hover:bg-amber-50" onClick={() => void markAllNotificationsRead()}>
              Đánh dấu đã đọc
            </button>
          </div>
          <div className="mt-5 grid gap-3">
            {notifications.slice(0, 5).map((notification) => (
              <button
                key={notification.id}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  notification.is_read ? 'border-stone-100 bg-stone-50/80' : 'border-amber-200 bg-amber-50/80'
                }`}
                onClick={() => void markNotificationRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-stone-900">{notification.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{notification.message}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{formatDate(notification.created_at)}</p>
                  </div>
                  {!notification.is_read ? <span className="mt-1 h-3 w-3 rounded-full bg-amber-500" /> : null}
                </div>
              </button>
            ))}
            {!notifications.length ? <div className="rounded-2xl bg-stone-50 px-4 py-6 text-center text-stone-400">Chưa có thông báo nào.</div> : null}
          </div>
        </section>
      </div>
    );
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8f4ec_0%,#fcfbf7_100%)] px-6">
        <div className="max-w-xl rounded-[2rem] border border-white/80 bg-white/90 p-10 text-center shadow-[0_30px_70px_rgba(157,140,109,0.1)] backdrop-blur">
          <h1 className="text-3xl font-bold text-stone-900">Khu vực quản trị</h1>
          <p className="mt-3 text-stone-600">Bạn cần đăng nhập bằng tài khoản admin để sử dụng CRUD users, đơn hàng, sản phẩm, danh mục, bài viết và thống kê.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link className="rounded-2xl bg-[linear-gradient(135deg,#8b6837_0%,#b48b4a_100%)] px-5 py-3 font-semibold text-white" to="/login">
              Đăng nhập admin
            </Link>
            <Link className="rounded-2xl border border-stone-200 px-5 py-3 font-semibold text-stone-700" to="/">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f3ead5,transparent_24%),radial-gradient(circle_at_top_right,#efe5d2,transparent_22%),linear-gradient(180deg,#faf7f1_0%,#fdfcf9_100%)] text-stone-900">
      <div className="mx-auto flex max-w-[1660px] gap-6 px-4 py-6 lg:px-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,#fffef9_0%,#f3ecde_100%)] p-6 text-stone-900 shadow-[0_28px_70px_rgba(166,145,103,0.14)] lg:block">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#a68146]">TMC Admin</p>
            <h1 className="mt-3 text-3xl font-bold">{t('admin.subtitle')}</h1>
            <p className="mt-2 text-sm text-stone-600">{t('admin.subtitle_desc')}</p>
          </div>
          <nav className="space-y-2">
            {[
              ['dashboard', t('admin.tab_dashboard')],
              ['users', t('admin.tab_users')],
              ['brands', t('admin.tab_brands')],
              ['categories', t('admin.tab_categories')],
              ['products', t('admin.tab_products')],
              ['orders', t('admin.tab_orders')],
              ['discounts', t('admin.tab_discounts')],
              ['pricing', t('admin.tab_pricing')],
              ['chatbot', t('admin.tab_chatbot')],
              ['blogCategories', t('admin.tab_blog_categories')],
              ['articles', t('admin.tab_articles')],
              ['banners', t('admin.tab_banners')],
              ['combos', t('admin.tab_combos')],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  activeTab === key ? 'bg-[linear-gradient(135deg,#b38847_0%,#d8bc84_100%)] text-white shadow-[0_12px_25px_rgba(179,136,71,0.24)]' : 'text-stone-700 hover:bg-white/70'
                }`}
                onClick={() => setActiveTab(key as AdminTab)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-6 rounded-2xl border border-white/70 bg-white/75 p-4 text-sm text-stone-800">
            <p className="text-xs uppercase tracking-[0.25em] text-[#a68146]">{t('admin.notifications_label')}</p>
            <p className="mt-2 text-3xl font-bold">{unreadNotificationCount}</p>
          </div>
          <div className="mt-auto rounded-2xl border border-white/70 bg-white/75 p-4 text-sm text-stone-800">
            <p className="font-semibold">{currentUser.full_name}</p>
            <p className="mt-1 text-stone-500">{currentUser.email}</p>
          </div>
        </aside>

        <main className="flex-1">
          <div className="rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_25px_90px_rgba(165,146,109,0.1)] backdrop-blur md:p-8">
            <div className="relative mb-8 overflow-hidden rounded-[1.75rem] border border-white/80 bg-[linear-gradient(135deg,#fffaf1_0%,#f3e7cf_52%,#ead7b6_100%)] p-6 text-stone-900 shadow-[0_24px_55px_rgba(177,150,101,0.15)] md:p-8">
              <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/45 blur-2xl" />
              <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-[#d4b07a]/25 blur-2xl" />
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#a68146]">Luxury Admin Console</p>
                  <h2 className="mt-3 text-4xl font-bold">Dashboard quản trị sang hơn, mượt hơn</h2>
                  <p className="mt-3 max-w-2xl text-stone-600">
                    Quản lý đầy đủ CRUD, theo dõi đơn hàng realtime, nhận thông báo ngay khi có đơn mới và cập nhật trạng thái cho khách hàng.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-white/80 bg-white/65 px-4 py-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Unread</p>
                    <p className="mt-2 text-2xl font-bold">{unreadNotificationCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/65 px-4 py-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Orders</p>
                    <p className="mt-2 text-2xl font-bold">{orders.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-4 border-b border-stone-100 pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-stone-900">{t('admin.title')}</h2>
                <p className="mt-1 text-stone-500">{t('admin.desc')}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-2xl border border-stone-200 bg-white px-4 py-2 font-semibold text-stone-700 transition hover:border-amber-200 hover:bg-amber-50" onClick={() => void loadAdminData()}>
                  {t('admin.reload')}
                </button>
                <button className="rounded-2xl bg-[linear-gradient(135deg,#8b6837_0%,#b48b4a_100%)] px-4 py-2 font-semibold text-white transition hover:brightness-105" onClick={() => void markAllNotificationsRead()}>
                  {t('admin.read_all')}
                </button>
                <Link className="rounded-2xl border border-stone-200 bg-white px-4 py-2 font-semibold text-stone-700 lg:hidden" to="#" onClick={() => setActiveTab('dashboard')}>
                  {t('admin.overview')}
                </Link>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2 lg:hidden">
              {[
                ['dashboard', t('admin.mobile_overview')],
                ['users', t('admin.mobile_users')],
                ['brands', t('admin.mobile_brands')],
                ['categories', t('admin.mobile_categories')],
                ['products', t('admin.mobile_products')],
                ['orders', t('admin.mobile_orders')],
                ['discounts', t('admin.mobile_discounts')],
                ['pricing', t('admin.mobile_pricing')],
                ['chatbot', t('admin.mobile_chatbot')],
                ['blogCategories', t('admin.mobile_blog_categories')],
                ['articles', t('admin.mobile_articles')],
                ['banners', t('admin.mobile_banners')],
                ['combos', t('admin.mobile_combos')],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                    activeTab === key ? 'bg-[linear-gradient(135deg,#8b6837_0%,#b48b4a_100%)] text-white' : 'bg-white text-stone-700'
                  }`}
                  onClick={() => setActiveTab(key as AdminTab)}
                >
                  {label}
                </button>
              ))}
            </div>

            {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {success ? <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-[#8b6837]">{success}</div> : null}
            {loading ? <div className="py-16 text-center text-stone-500">{t('admin.loading')}</div> : null}

            {!loading && activeTab === 'dashboard' ? renderDashboard() : null}

            {!loading && activeTab === 'users' ? (
              <AdminSection title="Quản lý users">
                <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void handleUserSubmit(event)}>
                  <FormInput label="Họ tên" value={userForm.full_name} onChange={(value) => setUserForm((prev) => ({ ...prev, full_name: value }))} />
                  <FormInput label="Email" value={userForm.email} onChange={(value) => setUserForm((prev) => ({ ...prev, email: value }))} />
                  <FormInput label="Số điện thoại" value={userForm.phone} onChange={(value) => setUserForm((prev) => ({ ...prev, phone: value }))} />
                  <FormInput label={userForm.id ? 'Mật khẩu mới nếu muốn đổi' : 'Mật khẩu'} type="password" value={userForm.password} onChange={(value) => setUserForm((prev) => ({ ...prev, password: value }))} />
                  <FormSelect label="Vai trò" value={userForm.role} onChange={(value) => setUserForm((prev) => ({ ...prev, role: value }))} options={[['customer', 'Customer'], ['admin', 'Admin']]} />
                  <FormSelect label="Trạng thái" value={String(userForm.is_active)} onChange={(value) => setUserForm((prev) => ({ ...prev, is_active: value === 'true' }))} options={[['true', 'Đang hoạt động'], ['false', 'Đã khoá']]} />
                  <ActionRow saving={saving} onReset={resetUserForm} submitLabel={userForm.id ? 'Cập nhật user' : 'Thêm user'} />
                </form>

                <Table>
                  <thead>
                    <tr>
                      <Th>Họ tên</Th>
                      <Th>Email</Th>
                      <Th>Vai trò</Th>
                      <Th>Trạng thái</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-stone-100">
                        <Td>{user.full_name}</Td>
                        <Td>{user.email}</Td>
                        <Td>{user.role}</Td>
                        <Td>{user.is_active ? 'Hoạt động' : 'Khoá'}</Td>
                        <Td>
                          <RowActions
                            onEdit={() => setUserForm({ id: user.id, email: user.email, password: '', full_name: user.full_name, phone: user.phone || '', role: user.role, is_active: user.is_active })}
                            onDelete={() => void handleDelete(`user ${user.email}`, () => adminApi.deleteUser(user.id))}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </AdminSection>
            ) : null}

            {!loading && activeTab === 'brands' ? (
              <AdminSection title="Quản lý thương hiệu">
                <form className="space-y-4" onSubmit={(event) => void handleBrandSubmit(event)}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="Tên thương hiệu" value={brandForm.name} onChange={(value) => setBrandForm((prev) => ({ ...prev, name: value }))} />
                    <ImageField
                      label="Logo"
                      value={brandForm.logo_url}
                      onChange={(value) => setBrandForm((prev) => ({ ...prev, logo_url: value }))}
                      uploading={uploadingKey === 'brand'}
                      onUpload={(file) => uploadImageToField('brand', file, (url) => setBrandForm((prev) => ({ ...prev, logo_url: url })))}
                    />
                  </div>
                  <ActionRow saving={saving} onReset={resetBrandForm} submitLabel={brandForm.id ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu'} />
                </form>

                <Table>
                  <thead>
                    <tr>
                      <Th>Logo</Th>
                      <Th>Tên</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((brand) => (
                      <tr key={brand.id} className="border-t border-stone-100">
                        <Td>{brand.logo_url ? <img src={brand.logo_url} alt={brand.name} className="h-12 w-12 rounded-xl object-cover" /> : 'Không có'}</Td>
                        <Td>{brand.name}</Td>
                        <Td>
                          <RowActions
                            onEdit={() => setBrandForm({ id: brand.id, name: brand.name, logo_url: brand.logo_url || '' })}
                            onDelete={() => void handleDelete(`thương hiệu ${brand.name}`, () => adminApi.deleteBrand(brand.id))}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </AdminSection>
            ) : null}

            {!loading && activeTab === 'categories' ? (
              <AdminSection title="Quản lý danh mục sản phẩm">
                <form className="space-y-4" onSubmit={(event) => void handleCategorySubmit(event)}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput
                      label="Tên danh mục"
                      value={categoryForm.name}
                      onChange={(value) => setCategoryForm((prev) => ({ ...prev, name: value, slug: prev.id ? prev.slug : slugify(value) }))}
                    />
                    <FormInput label="Slug" value={categoryForm.slug} onChange={(value) => setCategoryForm((prev) => ({ ...prev, slug: value }))} />
                  </div>
                  <ImageField
                    label="Ảnh danh mục"
                    value={categoryForm.image_url}
                    onChange={(value) => setCategoryForm((prev) => ({ ...prev, image_url: value }))}
                    uploading={uploadingKey === 'category'}
                    onUpload={(file) => uploadImageToField('category', file, (url) => setCategoryForm((prev) => ({ ...prev, image_url: url })))}
                  />
                  <ActionRow saving={saving} onReset={resetCategoryForm} submitLabel={categoryForm.id ? 'Cập nhật danh mục' : 'Thêm danh mục'} />
                </form>

                <Table>
                  <thead>
                    <tr>
                      <Th>Ảnh</Th>
                      <Th>Tên</Th>
                      <Th>Slug</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id} className="border-t border-stone-100">
                        <Td>{category.image_url ? <img src={category.image_url} alt={category.name} className="h-12 w-12 rounded-xl object-cover" /> : 'Không có'}</Td>
                        <Td>{category.name}</Td>
                        <Td>{category.slug}</Td>
                        <Td>
                          <RowActions
                            onEdit={() => setCategoryForm({ id: category.id, name: category.name, slug: category.slug, image_url: category.image_url || '' })}
                            onDelete={() => void handleDelete(`danh mục ${category.name}`, () => adminApi.deleteCategory(category.id))}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </AdminSection>
            ) : null}

            {!loading && activeTab === 'products' ? (
              <AdminSection title="Quản lý sản phẩm">
                <form className="space-y-4" onSubmit={(event) => void handleProductSubmit(event)}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="Tên sản phẩm" value={productForm.name} onChange={(value) => setProductForm((prev) => ({ ...prev, name: value }))} />
                    <FormInput label="Badge" value={productForm.badge} onChange={(value) => setProductForm((prev) => ({ ...prev, badge: value }))} />
                    <FormSelect
                      label="Danh mục"
                      value={String(productForm.category_id)}
                      onChange={(value) => setProductForm((prev) => ({ ...prev, category_id: Number(value) }))}
                      options={categories.map((category) => [String(category.id), category.name])}
                    />
                    <FormSelect
                      label="Hãng / Thương hiệu"
                      value={String(productForm.brand_id)}
                      onChange={(value) => setProductForm((prev) => ({ ...prev, brand_id: Number(value) }))}
                      options={brands.map((brand) => [String(brand.id), brand.name])}
                    />
                    <FormInput label="Giá lẻ" type="number" value={String(productForm.retail_price)} onChange={(value) => setProductForm((prev) => ({ ...prev, retail_price: Number(value) }))} />
                    <FormInput label="Giá sỉ" type="number" value={String(productForm.wholesale_price)} onChange={(value) => setProductForm((prev) => ({ ...prev, wholesale_price: Number(value) }))} />
                    <FormInput label="Tồn kho" type="number" value={String(productForm.stock)} onChange={(value) => setProductForm((prev) => ({ ...prev, stock: Number(value) }))} />
                    <FormSelect
                      label="Trạng thái"
                      value={String(productForm.is_active)}
                      onChange={(value) => setProductForm((prev) => ({ ...prev, is_active: value === 'true' }))}
                      options={[['true', 'Hiển thị'], ['false', 'Ẩn']]}
                    />
                  </div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Mô tả</label>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                    value={productForm.description}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                  />
                  <ImageField
                    label="Ảnh sản phẩm"
                    value={productForm.image_url}
                    onChange={(value) => setProductForm((prev) => ({ ...prev, image_url: value }))}
                    uploading={uploadingKey === 'product'}
                    onUpload={(file) => uploadImageToField('product', file, (url) => setProductForm((prev) => ({ ...prev, image_url: url })))}
                  />
                  <ActionRow saving={saving} onReset={resetProductForm} submitLabel={productForm.id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'} />
                </form>

                {productForm.id ? (
                  <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-5">
                    <h4 className="text-lg font-bold text-stone-900 mb-3">Ảnh gallery</h4>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {(productImages[productForm.id] || []).map((img) => (
                        <div key={img.id} className="relative h-24 w-24 overflow-hidden rounded-xl border border-stone-200">
                          <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                          <button
                            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                            onClick={() => void withSaving(async () => {
                              await adminApi.deleteProductImage(productForm.id, img.id);
                              setProductImages((prev) => ({ ...prev, [productForm.id]: (prev[productForm.id] || []).filter((i) => i.id !== img.id) }));
                              showMessage('Đã xoá ảnh.');
                            })}
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <input
                        className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2 outline-none focus:border-amber-400"
                        placeholder="URL ảnh..."
                        value={newImageUrl[productForm.id] || ''}
                        onChange={(e) => setNewImageUrl((prev) => ({ ...prev, [productForm.id]: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800 transition hover:bg-amber-200"
                        onClick={() => void withSaving(async () => {
                          const url = newImageUrl[productForm.id]?.trim();
                          if (!url) return;
                          const res = await adminApi.addProductImage(productForm.id, { image_url: url, sort_order: (productImages[productForm.id] || []).length });
                          setProductImages((prev) => ({ ...prev, [productForm.id]: [...(prev[productForm.id] || []), res.data] }));
                          setNewImageUrl((prev) => ({ ...prev, [productForm.id]: '' }));
                          showMessage('Đã thêm ảnh.');
                        })}
                      >
                        + Thêm ảnh
                      </button>
                    </div>
                  </div>
                ) : null}

                <Table>
                  <thead>
                    <tr>
                      <Th>Ảnh</Th>
                      <Th>Sản phẩm</Th>
                      <Th>Hãng</Th>
                      <Th>Giá lẻ</Th>
                      <Th>Giá sỉ</Th>
                      <Th>Tồn kho</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t border-stone-100">
                        <Td>{product.image_url ? <img src={product.image_url} alt={product.name} className="h-12 w-12 rounded-xl object-cover" /> : 'Không có'}</Td>
                        <Td>
                          <div className="font-semibold text-stone-800">{product.name}</div>
                          <div className="text-xs text-stone-500">{product.category?.name}</div>
                        </Td>
                        <Td>{product.brand?.name || 'Chưa chọn hãng'}</Td>
                        <Td>{currency(product.retail_price)}</Td>
                        <Td>{product.wholesale_price ? currency(product.wholesale_price) : 'Chưa set'}</Td>
                        <Td>{product.stock}</Td>
                        <Td>
                          <RowActions
                            onEdit={() =>
                              setProductForm({
                                id: product.id,
                                name: product.name,
                                description: product.description || '',
                                image_url: product.image_url || '',
                                category_id: product.category_id || 0,
                                brand_id: product.brand_id || 0,
                                retail_price: product.retail_price,
                                wholesale_price: product.wholesale_price || 0,
                                badge: product.badge || '',
                                stock: product.stock,
                                is_active: product.is_active,
                              })
                            }
                            onDelete={() => void handleDelete(`sản phẩm ${product.name}`, () => adminApi.deleteProduct(product.id))}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </AdminSection>
            ) : null}

            {!loading && activeTab === 'orders' ? (
              <AdminSection title="Quản lý đơn hàng">
                <div className="grid gap-4 md:grid-cols-4">
                  <MetricTile label="Tổng đơn" value={String(orders.length)} tone="emerald" />
                  <MetricTile label="Chờ xử lý" value={String(orders.filter((order) => order.status === 'pending').length)} tone="amber" />
                  <MetricTile label="Đang giao" value={String(orders.filter((order) => order.status === 'shipped').length)} tone="blue" />
                  <MetricTile label="Đã giao" value={String(orders.filter((order) => order.status === 'delivered').length)} tone="stone" />
                </div>
                <Table>
                  <thead>
                    <tr>
                      <Th>Mã đơn</Th>
                      <Th>Khách hàng</Th>
                      <Th>Tổng tiền</Th>
                      <Th>Loại giá</Th>
                      <Th>Tiết kiệm</Th>
                      <Th>Trạng thái</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-stone-100">
                        <Td>
                          <div className="font-semibold text-stone-800">#{order.id}</div>
                          <div className="text-xs text-stone-500">{formatDate(order.created_at)}</div>
                        </Td>
                        <Td>
                          <div>{order.user?.full_name || order.user?.email}</div>
                          <div className="text-xs text-stone-500">
                            {order.shipping_full_name || 'Chưa có người nhận'} - {order.shipping_phone || 'Chưa có SĐT'}
                          </div>
                        </Td>
                        <Td>
                          <div className="font-semibold text-stone-800">{currency(order.total_amount)}</div>
                          <div className="text-xs text-stone-500">Ship: {currency(order.shipping_fee || 0)}</div>
                        </Td>
                        <Td>
                          <div className="font-semibold text-stone-800">{order.pricing_label || order.applied_price_type}</div>
                          <div className="text-xs text-stone-500">
                            {order.payment_method === 'cod' ? 'COD' : order.payment_method || 'Không rõ'} • {order.discount_code?.code ? `Mã: ${order.discount_code.code}` : 'Không dùng mã'}
                          </div>
                        </Td>
                        <Td>{currency(order.total_discount_amount || 0)}</Td>
                        <Td>
                          <select
                            className="rounded-xl border border-stone-200 bg-white px-3 py-2"
                            value={order.status}
                            onChange={(event) => {
                              void withSaving(async () => {
                                await adminApi.updateOrder(order.id, { status: event.target.value });
                                showMessage(`Đã cập nhật trạng thái đơn #${order.id}.`);
                                await loadAdminData();
                              });
                            }}
                          >
                            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <div className="mt-2 flex gap-2">
                            <input
                              className="w-32 rounded-xl border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-amber-400"
                              placeholder="Vận đơn"
                              value={trackingInput[order.id] ?? order.tracking_number ?? ''}
                              onChange={(e) => setTrackingInput((prev) => ({ ...prev, [order.id]: e.target.value }))}
                              onBlur={() => {
                                const value = trackingInput[order.id];
                                if (value !== undefined && value !== (order.tracking_number ?? '')) {
                                  void withSaving(async () => {
                                    await adminApi.updateOrder(order.id, { tracking_number: value || undefined });
                                    await loadAdminData();
                                  });
                                }
                              }}
                            />
                          </div>
                        </Td>
                        <Td>
                          <button
                            className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                            onClick={() => void handleDelete(`đơn hàng #${order.id}`, () => adminApi.deleteOrder(order.id))}
                          >
                            Xoá
                          </button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="grid gap-4 lg:grid-cols-2">
                  {orders.slice(0, 4).map((order) => (
                    <div key={`panel-${order.id}`} className="rounded-[1.75rem] border border-stone-100 bg-[linear-gradient(180deg,#fffefa_0%,#f8f4ea_100%)] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a7741]">Order #{order.id}</p>
                          <h3 className="mt-2 text-2xl font-bold text-stone-900">{currency(order.total_amount)}</h3>
                          <p className="mt-2 text-sm text-stone-500">{order.user?.full_name || order.user?.email}</p>
                          <p className="mt-2 text-sm font-semibold text-[#8b6837]">{order.pricing_label || order.applied_price_type}</p>
                          <p className="mt-2 text-sm text-stone-500">
                            {order.shipping_full_name || 'Chưa có người nhận'} - {order.shipping_phone || 'Chưa có SĐT'}
                          </p>
                          <p className="mt-1 text-sm text-stone-500">
                            {[order.shipping_address, order.shipping_city, order.shipping_postal_code].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700">{order.status}</span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                            <div>
                              <p className="font-semibold text-stone-900">
                                {item.product?.name || `Sản phẩm #${item.product_id}`}
                                {(item.combo_id || item.combo_name) && (
                                  <span className="ml-2 inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                    <span className="material-symbols-outlined text-xs">card_giftcard</span>
                                    {item.combo_name || `Combo #${item.combo_id}`}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-stone-500">{item.product?.brand?.name || 'Không có hãng'} - SL {item.quantity} - Đơn giá {currency(item.unit_price)}</p>
                            </div>
                            <p className="font-semibold text-stone-800">{currency(item.unit_price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-5">
                        <MiniDashboardStat label="Retail" value={currency(order.subtotal_before_discount || 0)} />
                        <MiniDashboardStat label="Tier" value={currency(order.pricing_discount_amount || 0)} />
                        <MiniDashboardStat label="Coupon" value={currency(order.discount_code_amount || 0)} />
                        <MiniDashboardStat label="Ship" value={currency(order.shipping_fee || 0)} />
                        <MiniDashboardStat label="Final" value={currency(order.total_amount)} highlight />
                      </div>
                    </div>
                  ))}
                </div>
              </AdminSection>
            ) : null}

            {!loading && activeTab === 'discounts' ? (
              <AdminSection title="Mã giảm giá">
                <section className="space-y-4 rounded-[1.75rem] border border-stone-100 bg-white p-5 shadow-[0_15px_35px_rgba(165,146,109,0.08)]">
                  <div>
                    <h4 className="text-xl font-bold text-stone-900">Mã giảm giá</h4>
                    <p className="mt-1 text-sm text-stone-500">Áp dụng sau khi hệ thống đã tính giá theo tier hoặc giá sỉ.</p>
                  </div>
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void handleDiscountSubmit(event)}>
                    <FormInput label="Mã" value={discountForm.code} onChange={(value) => setDiscountForm((prev) => ({ ...prev, code: value.toUpperCase() }))} />
                    <FormSelect
                      label="Loại giảm"
                      value={discountForm.discount_type}
                      onChange={(value) => setDiscountForm((prev) => ({ ...prev, discount_type: value as 'percent' | 'fixed_amount' }))}
                      options={[['percent', 'Phần trăm'], ['fixed_amount', 'Số tiền cố định']]}
                    />
                    <FormInput label="Giá trị giảm" type="number" value={String(discountForm.discount_value)} onChange={(value) => setDiscountForm((prev) => ({ ...prev, discount_value: Number(value) }))} />
                    <FormInput label="Đơn tối thiểu" type="number" value={String(discountForm.min_order_amount)} onChange={(value) => setDiscountForm((prev) => ({ ...prev, min_order_amount: Number(value) }))} />
                    <FormInput label="Giới hạn lượt dùng" type="number" value={String(discountForm.max_usage)} onChange={(value) => setDiscountForm((prev) => ({ ...prev, max_usage: Number(value) }))} />
                    <FormInput label="Hết hạn" type="datetime-local" value={discountForm.expires_at} onChange={(value) => setDiscountForm((prev) => ({ ...prev, expires_at: value }))} />
                    <FormSelect label="Trạng thái" value={String(discountForm.is_active)} onChange={(value) => setDiscountForm((prev) => ({ ...prev, is_active: value === 'true' }))} options={[['true', 'Kích hoạt'], ['false', 'Tắt']]} />
                    <ActionRow saving={saving} onReset={resetDiscountForm} submitLabel={discountForm.id ? 'Cập nhật mã giảm' : 'Thêm mã giảm'} />
                  </form>

                  <Table>
                    <thead>
                      <tr>
                        <Th>Mã</Th>
                        <Th>Loại</Th>
                        <Th>Giá trị</Th>
                        <Th>Giới hạn</Th>
                        <Th>Hết hạn</Th>
                        <Th></Th>
                      </tr>
                    </thead>
                    <tbody>
                      {discountCodes.map((code) => (
                        <tr key={code.id} className="border-t border-stone-100">
                          <Td>{code.code}</Td>
                          <Td>{code.discount_type}</Td>
                          <Td>{code.discount_type === 'percent' ? `${code.discount_value}%` : currency(code.discount_value)}</Td>
                          <Td>{code.max_usage ? `${code.current_usage}/${code.max_usage}` : `Đã dùng ${code.current_usage}`}</Td>
                          <Td>{formatDate(code.expires_at)}</Td>
                          <Td>
                            <RowActions
                              onEdit={() =>
                                setDiscountForm({
                                  id: code.id,
                                  code: code.code,
                                  discount_type: code.discount_type,
                                  discount_value: code.discount_value,
                                  min_order_amount: code.min_order_amount,
                                  max_usage: code.max_usage || 0,
                                  expires_at: code.expires_at ? code.expires_at.slice(0, 16) : '',
                                  is_active: code.is_active,
                                })
                              }
                              onDelete={() => void handleDelete(`mã giảm ${code.code}`, () => adminApi.deleteDiscountCode(code.id))}
                            />
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </section>

                <section className="space-y-4 rounded-[1.75rem] border border-stone-100 bg-white p-5 shadow-[0_15px_35px_rgba(165,146,109,0.08)]">
                  <div>
                    <h4 className="text-xl font-bold text-stone-900">Giam gia san pham (hen gio)</h4>
                    <p className="mt-1 text-sm text-stone-500">Giam gia tung san pham theo thoi gian. San pham se hien thi gia giam, dong ho dem nguoc va tag % giam.</p>
                  </div>
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void handleProductDiscountSubmit(event)}>
                    <FormSelect
                      label="San pham"
                      value={productDiscountForm.productId ? String(productDiscountForm.productId) : ''}
                      onChange={(value) => {
                        const pid = Number(value);
                        const existing = productDiscounts.find((d) => d.product_id === pid);
                        if (existing) {
                          setProductDiscountForm({
                            productId: existing.product_id,
                            id: existing.id,
                            discount_percent: existing.discount_percent,
                            start_time: existing.start_time ? existing.start_time.slice(0, 16) : '',
                            end_time: existing.end_time ? existing.end_time.slice(0, 16) : '',
                            is_active: existing.is_active,
                          });
                        } else {
                          setProductDiscountForm((prev) => ({ ...prev, productId: pid, id: 0 }));
                        }
                      }}
                      options={[
                        ['', '-- Chon san pham --'],
                        ...products.map((p) => [
                          String(p.id),
                          `#${p.id} ${p.name}${productDiscounts.some((d) => d.product_id === p.id) ? ' (da co giam gia)' : ''}`,
                        ]),
                      ]}
                    />
                    <FormInput
                      label="Giam (%)"
                      type="number"
                      value={String(productDiscountForm.discount_percent)}
                      onChange={(value) => setProductDiscountForm((prev) => ({ ...prev, discount_percent: Number(value) }))}
                    />
                    <FormInput
                      label="Bat dau"
                      type="datetime-local"
                      value={productDiscountForm.start_time}
                      onChange={(value) => setProductDiscountForm((prev) => ({ ...prev, start_time: value }))}
                    />
                    <FormInput
                      label="Ket thuc"
                      type="datetime-local"
                      value={productDiscountForm.end_time}
                      onChange={(value) => setProductDiscountForm((prev) => ({ ...prev, end_time: value }))}
                    />
                    <FormSelect
                      label="Trang thai"
                      value={String(productDiscountForm.is_active)}
                      onChange={(value) => setProductDiscountForm((prev) => ({ ...prev, is_active: value === 'true' }))}
                      options={[['true', 'Kich hoat'], ['false', 'Tat']]}
                    />
                    <ActionRow
                      saving={saving}
                      onReset={resetProductDiscountForm}
                      submitLabel={productDiscountForm.id ? 'Cap nhat giam gia' : 'Them giam gia'}
                    />
                  </form>

                  {productDiscounts.length > 0 ? (
                    <Table>
                      <thead>
                        <tr>
                          <Th>San pham</Th>
                          <Th>Giam</Th>
                          <Th>Bat dau</Th>
                          <Th>Ket thuc</Th>
                          <Th>Trang thai</Th>
                          <Th></Th>
                        </tr>
                      </thead>
                      <tbody>
                        {productDiscounts.map((pd) => {
                          const prod = products.find((p) => p.id === pd.product_id);
                          return (
                            <tr key={pd.id} className="border-t border-stone-100">
                              <Td>{prod ? `#${prod.id} ${prod.name}` : `Product #${pd.product_id}`}</Td>
                              <Td className="font-bold text-red-600">{pd.discount_percent}%</Td>
                              <Td>{formatDate(pd.start_time)}</Td>
                              <Td>{formatDate(pd.end_time)}</Td>
                              <Td>{pd.is_active ? 'Kich hoat' : 'Tat'}</Td>
                              <Td>
                                <RowActions
                                  onEdit={() => {
                                    setProductDiscountForm({
                                      productId: pd.product_id,
                                      id: pd.id,
                                      discount_percent: pd.discount_percent,
                                      start_time: pd.start_time ? pd.start_time.slice(0, 16) : '',
                                      end_time: pd.end_time ? pd.end_time.slice(0, 16) : '',
                                      is_active: pd.is_active,
                                    });
                                  }}
                                  onDelete={() => void handleDelete(`giam gia san pham #${pd.product_id}`, () => adminApi.deleteProductDiscount(pd.product_id))}
                                />
                              </Td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-sm text-stone-500">Chua co san pham nao duoc giam gia.</p>
                  )}
                </section>
              </AdminSection>
            ) : null}

            {!loading && activeTab === 'pricing' ? (
              <AdminSection title="Mốc giá khách hàng và giá sỉ">
                <div className="grid gap-6 xl:grid-cols-2">
                  <section className="space-y-4 rounded-[1.75rem] border border-stone-100 bg-[linear-gradient(180deg,#fffefa_0%,#f8f3e9_100%)] p-5">
                    <div>
                      <h4 className="text-xl font-bold text-stone-900">Ngưỡng giá sỉ mặc định</h4>
                      <p className="mt-1 text-sm text-stone-500">Fallback cho trường hợp chưa cấu hình mốc giá riêng. Khi khách đạt ngưỡng này, sản phẩm có `wholesale_price` sẽ dùng giá sỉ.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormInput
                        label="Tổng mua để bật giá sỉ mặc định"
                        type="number"
                        value={String(discountSetting?.wholesale_threshold ?? 0)}
                        onChange={(value) =>
                          setDiscountSetting((prev) => (prev ? { ...prev, wholesale_threshold: Number(value) } : prev))
                        }
                      />
                      <FormInput
                        label="Phí ship mặc định"
                        type="number"
                        value={String(discountSetting?.default_shipping_fee ?? 30000)}
                        onChange={(value) =>
                          setDiscountSetting((prev) => (prev ? { ...prev, default_shipping_fee: Number(value) } : prev))
                        }
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        className="rounded-2xl bg-[linear-gradient(135deg,#8b6837_0%,#b48b4a_100%)] px-4 py-3 font-semibold text-white transition hover:brightness-105"
                        onClick={() => void handleThresholdSave()}
                        disabled={saving}
                        type="button"
                      >
                        Lưu cấu hình
                      </button>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-500">
                      Cập nhật gần nhất: {formatDate(discountSetting?.updated_at)}
                    </div>
                  </section>

                  <section className="space-y-4 rounded-[1.75rem] border border-stone-100 bg-white p-5 shadow-[0_15px_35px_rgba(165,146,109,0.08)]">
                    <div>
                      <h4 className="text-xl font-bold text-stone-900">Thêm mốc giá khách hàng</h4>
                      <p className="mt-1 text-sm text-stone-500">Khách mua tích luỹ càng cao thì được giảm sâu hơn. Có thể bật giá sỉ và thêm % giảm cho từng mốc.</p>
                    </div>
                    <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void handlePricingTierSubmit(event)}>
                      <FormInput label="Tên mốc" value={pricingTierForm.name} onChange={(value) => setPricingTierForm((prev) => ({ ...prev, name: value }))} />
                      <FormInput label="Tổng mua từ" type="number" value={String(pricingTierForm.min_total_spent)} onChange={(value) => setPricingTierForm((prev) => ({ ...prev, min_total_spent: Number(value) }))} />
                      <FormInput label="Giảm thêm (%)" type="number" value={String(pricingTierForm.discount_percent)} onChange={(value) => setPricingTierForm((prev) => ({ ...prev, discount_percent: Number(value) }))} />
                      <FormSelect
                        label="Áp dụng giá sỉ"
                        value={String(pricingTierForm.use_wholesale_price)}
                        onChange={(value) => setPricingTierForm((prev) => ({ ...prev, use_wholesale_price: value === 'true' }))}
                        options={[['true', 'Có'], ['false', 'Không']]}
                      />
                      <FormSelect
                        label="Trạng thái"
                        value={String(pricingTierForm.is_active)}
                        onChange={(value) => setPricingTierForm((prev) => ({ ...prev, is_active: value === 'true' }))}
                        options={[['true', 'Đang áp dụng'], ['false', 'Tạm tắt']]}
                      />
                      <FormInput label="Ghi chú" value={pricingTierForm.note} onChange={(value) => setPricingTierForm((prev) => ({ ...prev, note: value }))} />
                      <ActionRow saving={saving} onReset={resetPricingTierForm} submitLabel={pricingTierForm.id ? 'Cập nhật mốc giá' : 'Thêm mốc giá'} />
                    </form>
                  </section>
                </div>

                <Table>
                  <thead>
                    <tr>
                      <Th>Mốc giá</Th>
                      <Th>Tổng mua từ</Th>
                      <Th>Giảm thêm</Th>
                      <Th>Giá sỉ</Th>
                      <Th>Trạng thái</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingTiers.map((tier) => (
                      <tr key={tier.id} className="border-t border-stone-100">
                        <Td>
                          <div className="font-semibold text-stone-800">{tier.name}</div>
                          <div className="text-xs text-stone-500">{tier.note || 'Không có ghi chú'}</div>
                        </Td>
                        <Td>{currency(tier.min_total_spent)}</Td>
                        <Td>{tier.discount_percent}%</Td>
                        <Td>{tier.use_wholesale_price ? 'Có' : 'Không'}</Td>
                        <Td>{tier.is_active ? 'Đang áp dụng' : 'Tạm tắt'}</Td>
                        <Td>
                          <RowActions
                            onEdit={() =>
                              setPricingTierForm({
                                id: tier.id,
                                name: tier.name,
                                min_total_spent: tier.min_total_spent,
                                discount_percent: tier.discount_percent,
                                use_wholesale_price: tier.use_wholesale_price,
                                is_active: tier.is_active,
                                note: tier.note || '',
                              })
                            }
                            onDelete={() => void handleDelete(`mốc giá ${tier.name}`, () => adminApi.deletePricingTier(tier.id))}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* ── Wholesale Tiers (Giá sỉ theo tổng đơn) ── */}
                <section className="space-y-4 rounded-[1.75rem] border border-stone-100 bg-white p-5 shadow-[0_15px_35px_rgba(165,146,109,0.08)]">
                  <div>
                    <h4 className="text-xl font-bold text-stone-900">Mức giá sỉ (theo tổng đơn hàng)</h4>
                    <p className="mt-1 text-sm text-stone-500">Giảm giá theo tổng giá trị đơn hàng. Khoảng giá trị từ min đến max, nếu max để trống là không giới hạn trên.</p>
                  </div>
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void handleWholesaleTierSubmit(event)}>
                    <FormInput label="Tên mức" value={wholesaleTierForm.name} onChange={(value) => setWholesaleTierForm((prev) => ({ ...prev, name: value }))} />
                    <FormInput label="Tổng đơn từ (VNĐ)" type="number" value={String(wholesaleTierForm.min_order_total)} onChange={(value) => setWholesaleTierForm((prev) => ({ ...prev, min_order_total: Number(value) }))} />
                    <FormInput label="Tổng đơn đến (VNĐ, bỏ trống nếu không giới hạn)" type="number" value={wholesaleTierForm.max_order_total} onChange={(value) => setWholesaleTierForm((prev) => ({ ...prev, max_order_total: value }))} />
                    <FormInput label="Giảm giá (%)" type="number" value={String(wholesaleTierForm.discount_percent)} onChange={(value) => setWholesaleTierForm((prev) => ({ ...prev, discount_percent: Number(value) }))} />
                    <FormSelect
                      label="Trạng thái"
                      value={String(wholesaleTierForm.is_active)}
                      onChange={(value) => setWholesaleTierForm((prev) => ({ ...prev, is_active: value === 'true' }))}
                      options={[['true', 'Đang áp dụng'], ['false', 'Tạm tắt']]}
                    />
                    <FormInput label="Ghi chú" value={wholesaleTierForm.note} onChange={(value) => setWholesaleTierForm((prev) => ({ ...prev, note: value }))} />
                    <ActionRow saving={saving} onReset={resetWholesaleTierForm} submitLabel={wholesaleTierForm.id ? 'Cập nhật mức giá sỉ' : 'Thêm mức giá sỉ'} />
                  </form>
                </section>

                <Table>
                  <thead>
                    <tr>
                      <Th>Mức giá sỉ</Th>
                      <Th>Tổng đơn từ</Th>
                      <Th>Tổng đơn đến</Th>
                      <Th>Giảm giá</Th>
                      <Th>Trạng thái</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {wholesaleTiers.map((tier) => (
                      <tr key={tier.id} className="border-t border-stone-100">
                        <Td>
                          <div className="font-semibold text-stone-800">{tier.name}</div>
                          <div className="text-xs text-stone-500">{tier.note || 'Không có ghi chú'}</div>
                        </Td>
                        <Td>{currency(tier.min_order_total)}</Td>
                        <Td>{tier.max_order_total ? currency(tier.max_order_total) : 'Không giới hạn'}</Td>
                        <Td className="font-semibold text-amber-600">{tier.discount_percent}%</Td>
                        <Td>{tier.is_active ? 'Đang áp dụng' : 'Tạm tắt'}</Td>
                        <Td>
                          <RowActions
                            onEdit={() =>
                              setWholesaleTierForm({
                                id: tier.id,
                                name: tier.name,
                                min_order_total: tier.min_order_total,
                                max_order_total: tier.max_order_total !== null ? String(tier.max_order_total) : '',
                                discount_percent: tier.discount_percent,
                                is_active: tier.is_active,
                                note: tier.note || '',
                              })
                            }
                            onDelete={() => void handleDelete(`mức giá sỉ ${tier.name}`, () => adminApi.deleteWholesaleTier(tier.id))}
                          />
                        </Td>
                      </tr>
                    ))}
                    {wholesaleTiers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-stone-400">Chưa có mức giá sỉ nào. Hãy thêm mức đầu tiên.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </AdminSection>
            ) : null}

            {!loading && activeTab === 'chatbot' ? (
              <AdminSection title="Quản lý chatbot DeepSeek">
                <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
                  <section className="space-y-4 rounded-[1.75rem] border border-stone-100 bg-[linear-gradient(180deg,#fffefa_0%,#f8f3e9_100%)] p-5">
                    <div>
                      <h4 className="text-xl font-bold text-stone-900">API key xoay vòng</h4>
                      <p className="mt-1 text-sm text-stone-500">Có thể nhập nhiều key DeepSeek. Hệ thống sẽ tự luân phiên key đang active và tự chuyển key khác nếu key hiện tại lỗi.</p>
                    </div>
                    <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void handleChatbotKeySubmit(event)}>
                      <FormInput label="Tên key" value={chatbotKeyForm.name} onChange={(value) => setChatbotKeyForm((prev) => ({ ...prev, name: value }))} />
                      <FormInput label="Provider" value={chatbotKeyForm.provider} onChange={(value) => setChatbotKeyForm((prev) => ({ ...prev, provider: value }))} />
                      <div className="md:col-span-2">
                        <FormInput label={chatbotKeyForm.id ? 'API key mới nếu muốn thay' : 'API key'} type="password" value={chatbotKeyForm.api_key} onChange={(value) => setChatbotKeyForm((prev) => ({ ...prev, api_key: value }))} />
                      </div>
                      <FormInput label="Base URL" value={chatbotKeyForm.base_url} onChange={(value) => setChatbotKeyForm((prev) => ({ ...prev, base_url: value }))} />
                      <FormInput label="Model" value={chatbotKeyForm.model} onChange={(value) => setChatbotKeyForm((prev) => ({ ...prev, model: value }))} />
                      <FormSelect
                        label="Thinking effort"
                        value={chatbotKeyForm.reasoning_effort}
                        onChange={(value) => setChatbotKeyForm((prev) => ({ ...prev, reasoning_effort: value }))}
                        options={[['max', 'Max'], ['high', 'High']]}
                      />
                      <FormSelect
                        label="Trạng thái"
                        value={String(chatbotKeyForm.is_active)}
                        onChange={(value) => setChatbotKeyForm((prev) => ({ ...prev, is_active: value === 'true' }))}
                        options={[['true', 'Đang dùng'], ['false', 'Tạm tắt']]}
                      />
                      <div className="md:col-span-2">
                        <FormInput label="Ghi chú" value={chatbotKeyForm.note} onChange={(value) => setChatbotKeyForm((prev) => ({ ...prev, note: value }))} />
                      </div>
                      <ActionRow saving={saving} onReset={resetChatbotKeyForm} submitLabel={chatbotKeyForm.id ? 'Cập nhật key' : 'Thêm key'} />
                    </form>
                  </section>

                  <section className="space-y-4 rounded-[1.75rem] border border-stone-100 bg-white p-5 shadow-[0_15px_35px_rgba(165,146,109,0.08)]">
                    <div>
                      <h4 className="text-xl font-bold text-stone-900">Cấu hình khuyến nghị</h4>
                      <p className="mt-1 text-sm text-stone-500">Dùng `deepseek-v4-pro` với thinking mode bật sẵn và effort `max` để chatbot tư vấn cao cấp hơn cho khách hàng.</p>
                    </div>
                    <div className="grid gap-3">
                      <MiniDashboardStat label="Model mặc định" value="deepseek-v4-pro" highlight />
                      <MiniDashboardStat label="Thinking" value="Enabled" />
                      <MiniDashboardStat label="Effort" value="max" />
                    </div>
                  </section>
                </div>

                <Table>
                  <thead>
                    <tr>
                      <Th>Tên key</Th>
                      <Th>Key</Th>
                      <Th>Model</Th>
                      <Th>Trạng thái</Th>
                      <Th>Hoạt động gần nhất</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatbotKeys.map((key) => (
                      <tr key={key.id} className="border-t border-stone-100">
                        <Td>
                          <div className="font-semibold text-stone-800">{key.name}</div>
                          <div className="text-xs text-stone-500">{key.note || 'Không có ghi chú'}</div>
                        </Td>
                        <Td>{key.masked_key}</Td>
                        <Td>
                          <div className="font-semibold text-stone-800">{key.model}</div>
                          <div className="text-xs text-stone-500">{key.reasoning_effort}</div>
                        </Td>
                        <Td>
                          <div>{key.is_active ? 'Đang dùng' : 'Tạm tắt'}</div>
                          <div className="text-xs text-stone-500">{key.failure_count ? `Lỗi: ${key.failure_count}` : 'Ổn định'}</div>
                        </Td>
                        <Td>
                          <div>{formatDate(key.last_used_at)}</div>
                          <div className="text-xs text-red-500">{key.last_error || ''}</div>
                        </Td>
                        <Td>
                          <RowActions
                            onEdit={() =>
                              setChatbotKeyForm({
                                id: key.id,
                                name: key.name,
                                api_key: '',
                                provider: key.provider,
                                base_url: key.base_url,
                                model: key.model,
                                reasoning_effort: key.reasoning_effort,
                                is_active: key.is_active,
                                note: key.note || '',
                              })
                            }
                            onDelete={() => void handleDelete(`chatbot key ${key.name}`, () => adminApi.deleteChatbotKey(key.id))}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </AdminSection>
            ) : null}

            {!loading && activeTab === 'blogCategories' ? (
              <AdminSection title="Quản lý danh mục bài viết">
                <form className="space-y-4" onSubmit={(event) => void handleBlogCategorySubmit(event)}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput
                      label="Tên danh mục bài viết"
                      value={blogCategoryForm.name}
                      onChange={(value) => setBlogCategoryForm((prev) => ({ ...prev, name: value, slug: prev.id ? prev.slug : slugify(value) }))}
                    />
                    <FormInput label="Slug" value={blogCategoryForm.slug} onChange={(value) => setBlogCategoryForm((prev) => ({ ...prev, slug: value }))} />
                  </div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Mô tả</label>
                  <textarea
                    className="min-h-24 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                    value={blogCategoryForm.description}
                    onChange={(event) => setBlogCategoryForm((prev) => ({ ...prev, description: event.target.value }))}
                  />
                  <ActionRow saving={saving} onReset={resetBlogCategoryForm} submitLabel={blogCategoryForm.id ? 'Cập nhật danh mục bài viết' : 'Thêm danh mục bài viết'} />
                </form>

                <Table>
                  <thead>
                    <tr>
                      <Th>Tên</Th>
                      <Th>Slug</Th>
                      <Th>Mô tả</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogCategories.map((category) => (
                      <tr key={category.id} className="border-t border-stone-100">
                        <Td>{category.name}</Td>
                        <Td>{category.slug}</Td>
                        <Td>{category.description || 'Không có'}</Td>
                        <Td>
                          <RowActions
                            onEdit={() => setBlogCategoryForm({ id: category.id, name: category.name, slug: category.slug, description: category.description || '' })}
                            onDelete={() => void handleDelete(`danh mục bài viết ${category.name}`, () => adminApi.deleteBlogCategory(category.id))}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </AdminSection>
            ) : null}

            {!loading && activeTab === 'articles' ? (
              <AdminSection title="Quản lý bài viết">
                <form className="space-y-4" onSubmit={(event) => void handleArticleSubmit(event)}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput
                      label="Tiêu đề"
                      value={articleForm.title}
                      onChange={(value) => setArticleForm((prev) => ({ ...prev, title: value, slug: prev.id ? prev.slug : slugify(value) }))}
                    />
                    <FormInput label="Slug" value={articleForm.slug} onChange={(value) => setArticleForm((prev) => ({ ...prev, slug: value }))} />
                    <FormSelect
                      label="Danh mục bài viết"
                      value={String(articleForm.category_id)}
                      onChange={(value) => setArticleForm((prev) => ({ ...prev, category_id: Number(value) }))}
                      options={blogCategories.map((category) => [String(category.id), category.name])}
                    />
                    <FormSelect
                      label="Trạng thái"
                      value={String(articleForm.is_published)}
                      onChange={(value) => setArticleForm((prev) => ({ ...prev, is_published: value === 'true' }))}
                      options={[['true', 'Xuất bản'], ['false', 'Nháp']]}
                    />
                  </div>
                  <ImageField
                    label="Ảnh bài viết"
                    value={articleForm.image_url}
                    onChange={(value) => setArticleForm((prev) => ({ ...prev, image_url: value }))}
                    uploading={uploadingKey === 'article'}
                    onUpload={(file) => uploadImageToField('article', file, (url) => setArticleForm((prev) => ({ ...prev, image_url: url })))}
                  />
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Nội dung</label>
                  <RichTextEditor
                    value={articleForm.content}
                    onChange={(html) => setArticleForm((prev) => ({ ...prev, content: html }))}
                    onImageUpload={(file) =>
                      new Promise<string>((resolve, reject) => {
                        uploadApi.image(file).then((res) => resolve(res.data.url)).catch(reject);
                      })
                    }
                  />
                  <ActionRow saving={saving} onReset={resetArticleForm} submitLabel={articleForm.id ? 'Cập nhật bài viết' : 'Thêm bài viết'} />
                </form>

                <Table>
                  <thead>
                    <tr>
                      <Th>Bài viết</Th>
                      <Th>Danh mục</Th>
                      <Th>Tác giả</Th>
                      <Th>Trạng thái</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={article.id} className="border-t border-stone-100">
                        <Td>
                          <div className="font-semibold text-stone-800">{article.title}</div>
                          <div className="text-xs text-stone-500">{article.slug}</div>
                        </Td>
                        <Td>{article.category?.name}</Td>
                        <Td>{article.author?.full_name || article.author?.email}</Td>
                        <Td>{article.is_published ? 'Xuất bản' : 'Nháp'}</Td>
                        <Td>
                          <RowActions
                            onEdit={() =>
                              setArticleForm({
                                id: article.id,
                                title: article.title,
                                slug: article.slug,
                                content: article.content,
                                image_url: article.image_url || '',
                                category_id: article.category_id,
                                is_published: article.is_published,
                              })
                            }
                            onDelete={() => void handleDelete(`bài viết ${article.title}`, () => adminApi.deleteBlogArticle(article.id))}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </AdminSection>
            ) : null}

            {!loading && activeTab === 'banners' ? (
              <AdminSection title="Quản lý Banners">
                <form className="space-y-4" onSubmit={(event) => void handleBannerSubmit(event)}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="Tiêu đề" value={bannerForm.title} onChange={(value) => setBannerForm((prev) => ({ ...prev, title: value }))} />
                    <FormInput label="Subtitle" value={bannerForm.subtitle} onChange={(value) => setBannerForm((prev) => ({ ...prev, subtitle: value }))} />
                    <FormInput label="Mô tả" value={bannerForm.description} onChange={(value) => setBannerForm((prev) => ({ ...prev, description: value }))} />
                    <FormInput label="Link URL" value={bannerForm.link_url} onChange={(value) => setBannerForm((prev) => ({ ...prev, link_url: value }))} />
                    <FormInput
                      label="Thứ tự"
                      value={String(bannerForm.sort_order)}
                      onChange={(value) => setBannerForm((prev) => ({ ...prev, sort_order: Number(value) || 0 }))}
                    />
                    <FormSelect
                      label="Trạng thái"
                      value={String(bannerForm.is_active)}
                      onChange={(value) => setBannerForm((prev) => ({ ...prev, is_active: value === 'true' }))}
                      options={[['true', 'Hiển thị'], ['false', 'Ẩn']]}
                    />
                  </div>
                  <ImageField
                    label="Ảnh banner"
                    value={bannerForm.image_url}
                    onChange={(value) => setBannerForm((prev) => ({ ...prev, image_url: value }))}
                    uploading={uploadingKey === 'banner'}
                    onUpload={(file) => uploadImageToField('banner', file, (url) => setBannerForm((prev) => ({ ...prev, image_url: url })))}
                  />
                  <ActionRow saving={saving} onReset={resetBannerForm} submitLabel={bannerForm.id ? 'Cập nhật banner' : 'Thêm banner'} />
                </form>

                <Table>
                  <thead>
                    <tr>
                      <Th>Banner</Th>
                      <Th>Thứ tự</Th>
                      <Th>Trạng thái</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner) => (
                      <tr key={banner.id} className="border-t border-stone-100">
                        <Td>
                          <div className="font-semibold text-stone-800">{banner.title}</div>
                          <div className="text-xs text-stone-500">{banner.subtitle}</div>
                        </Td>
                        <Td>{banner.sort_order}</Td>
                        <Td>{banner.is_active ? 'Hiển thị' : 'Ẩn'}</Td>
                        <Td>
                          <RowActions
                            onEdit={() =>
                              setBannerForm({
                                id: banner.id,
                                title: banner.title,
                                subtitle: banner.subtitle || '',
                                description: banner.description || '',
                                image_url: banner.image_url,
                                link_url: banner.link_url || '',
                                sort_order: banner.sort_order,
                                is_active: banner.is_active,
                              })
                            }
                            onDelete={() => void handleDelete(`banner ${banner.title}`, () => adminApi.deleteBanner(banner.id))}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </AdminSection>
            ) : null}

            {/* Combos */}
            {!loading && activeTab === 'combos' ? (
              <AdminSection title="Quản lý Combos">
                <form
                  className="mb-8 space-y-4"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    await withSaving(async () => {
                      if (comboForm.id) {
                        await adminApi.updateCombo(comboForm.id, {
                          name: comboForm.name,
                          description: comboForm.description || null,
                          image_url: comboForm.image_url || null,
                          discount_percent: comboForm.discount_percent,
                          is_active: comboForm.is_active,
                        });
                        showMessage('Đã cập nhật combo.');
                      } else {
                        await adminApi.createCombo({
                          name: comboForm.name,
                          description: comboForm.description || null,
                          image_url: comboForm.image_url || null,
                          discount_percent: comboForm.discount_percent,
                          is_active: comboForm.is_active,
                          items: comboItemsForm,
                        });
                        showMessage('Đã thêm combo mới.');
                      }
                      setComboForm({ id: 0, name: '', description: '', image_url: '', discount_percent: 0, is_active: true });
                      setComboItemsForm([]);
                      await loadAdminData();
                    });
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Tên combo" value={comboForm.name} onChange={(v) => setComboForm({ ...comboForm, name: v })} />
                    <FormInput label="Giảm giá (%)" value={String(comboForm.discount_percent)} onChange={(v) => setComboForm({ ...comboForm, discount_percent: parseInt(v) || 0 })} type="number" />
                  </div>
                  <FormInput label="Mô tả" value={comboForm.description} onChange={(v) => setComboForm({ ...comboForm, description: v })} />
                  <ImageField label="Ảnh combo" value={comboForm.image_url} onChange={(v) => setComboForm({ ...comboForm, image_url: v })} onUpload={async () => {}} uploading={false} />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
                      <input type="checkbox" checked={comboForm.is_active} onChange={(e) => setComboForm({ ...comboForm, is_active: e.target.checked })} className="rounded" />
                      Kích hoạt
                    </label>
                  </div>

                  {!comboForm.id && (
                    <div className="border border-stone-200 rounded-xl p-4 space-y-3">
                      <h4 className="font-semibold text-sm text-stone-700">Sản phẩm trong combo</h4>
                      {comboItemsForm.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="flex-1 text-stone-600">SP #{item.product_id} × {item.quantity}</span>
                          <button type="button" className="text-red-500 text-xs hover:underline" onClick={() => setComboItemsForm(comboItemsForm.filter((_, i) => i !== idx))}>Xoá</button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <select
                          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm"
                          value={newComboItem.product_id}
                          onChange={(e) => setNewComboItem({ ...newComboItem, product_id: parseInt(e.target.value) || 0 })}
                        >
                          <option value={0}>Chọn sản phẩm...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>#{p.id} {p.name}</option>
                          ))}
                        </select>
                        <input type="number" min={1} value={newComboItem.quantity} onChange={(e) => setNewComboItem({ ...newComboItem, quantity: parseInt(e.target.value) || 1 })} className="w-20 rounded-lg border border-stone-200 px-3 py-2 text-sm" />
                        <button type="button" className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-semibold" onClick={() => { if (newComboItem.product_id > 0) { setComboItemsForm([...comboItemsForm, { ...newComboItem }]); setNewComboItem({ product_id: 0, quantity: 1 }); } }}>Thêm</button>
                      </div>
                    </div>
                  )}

                  <ActionRow
                    saving={saving}
                    onReset={() => { setComboForm({ id: 0, name: '', description: '', image_url: '', discount_percent: 0, is_active: true }); setComboItemsForm([]); }}
                    submitLabel={comboForm.id ? 'Cập nhật combo' : 'Tạo combo mới'}
                  />
                </form>

                {/* Existing combo items management */}
                {comboForm.id > 0 && (
                  <div className="mb-8 border border-stone-200 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-sm text-stone-700">Sản phẩm trong combo #{comboForm.id}</h4>
                    <div className="flex gap-2">
                      <select className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm" value={newComboItem.product_id} onChange={(e) => setNewComboItem({ ...newComboItem, product_id: parseInt(e.target.value) || 0 })}>
                        <option value={0}>Chọn sản phẩm...</option>
                        {products.map((p) => (<option key={p.id} value={p.id}>#{p.id} {p.name}</option>))}
                      </select>
                      <input type="number" min={1} value={newComboItem.quantity} onChange={(e) => setNewComboItem({ ...newComboItem, quantity: parseInt(e.target.value) || 1 })} className="w-20 rounded-lg border border-stone-200 px-3 py-2 text-sm" />
                      <button type="button" className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-semibold" onClick={async () => {
                        if (newComboItem.product_id > 0) {
                          await withSaving(async () => {
                            await adminApi.addComboItem(comboForm.id, newComboItem);
                            showMessage('Đã thêm sản phẩm vào combo.');
                            setNewComboItem({ product_id: 0, quantity: 1 });
                            await loadAdminData();
                          });
                        }
                      }}>Thêm</button>
                    </div>
                    {combos.find((c) => c.id === comboForm.id)?.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm bg-stone-50 rounded-lg p-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-200 overflow-hidden shrink-0">
                          {item.product?.image_url ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-stone-400">TMC</div>}
                        </div>
                        <span className="flex-1 font-medium">{item.product?.name ?? `SP #${item.product_id}`} × {item.quantity}</span>
                        <button className="text-red-500 text-xs hover:underline" onClick={async () => {
                          await withSaving(async () => {
                            await adminApi.deleteComboItem(comboForm.id, item.id);
                            showMessage('Đã xoá sản phẩm khỏi combo.');
                            await loadAdminData();
                          });
                        }}>Xoá</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Combos table */}
                <Table>
                  <thead>
                    <tr>
                      <Th>Tên combo</Th>
                      <Th>Số SP</Th>
                      <Th>Giảm giá</Th>
                      <Th>Giá gốc</Th>
                      <Th>Giá combo</Th>
                      <Th>Trạng thái</Th>
                      <Th>Thao tác</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {combos.map((combo) => (
                      <tr key={combo.id} className="border-t border-stone-100">
                        <Td className="font-semibold">{combo.name}</Td>
                        <Td>{combo.items.length} SP</Td>
                        <Td className="font-bold text-red-600">-{combo.discount_percent}%</Td>
                        <Td>{combo.original_price?.toLocaleString('vi-VN') ?? '-'}d</Td>
                        <Td className="font-bold text-emerald-700">{combo.discounted_price?.toLocaleString('vi-VN') ?? '-'}d</Td>
                        <Td>{combo.is_active ? 'Kích hoạt' : 'Tắt'}</Td>
                        <Td>
                          <RowActions
                            onEdit={() => {
                              setComboForm({ id: combo.id, name: combo.name, description: combo.description || '', image_url: combo.image_url || '', discount_percent: combo.discount_percent, is_active: combo.is_active });
                              setNewComboItem({ product_id: 0, quantity: 1 });
                            }}
                            onDelete={() => void handleDelete(`combo ${combo.name}`, () => adminApi.deleteCombo(combo.id))}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </AdminSection>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-stone-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.7rem] border border-white/80 bg-[linear-gradient(135deg,#fffdfa_0%,#f4ebd7_100%)] p-5 text-stone-900 shadow-[0_18px_35px_rgba(171,148,100,0.08)]">
      <p className="text-sm font-semibold text-[#9a7741]">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function MetricTile({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'amber' | 'blue' | 'stone' }) {
  const toneClasses = {
    emerald: 'from-[#f4ebd7] to-[#ead9b7] text-stone-900',
    amber: 'from-[#fff7e6] to-[#f4e3bf] text-[#7f602e]',
    blue: 'from-[#edf4f2] to-[#dbe8e4] text-[#47645b]',
    stone: 'from-stone-100 to-white text-stone-900',
  };

  return (
    <div className={`rounded-[1.6rem] border border-white/80 bg-gradient-to-br p-5 shadow-[0_18px_35px_rgba(171,148,100,0.08)] ${toneClasses[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.22em] opacity-70">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function MiniDashboardStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${highlight ? 'bg-[#8b6837] text-white' : 'border border-stone-100 bg-white'}`}>
      <p className={`text-xs font-bold uppercase tracking-[0.18em] ${highlight ? 'text-white/70' : 'text-stone-500'}`}>{label}</p>
      <p className="mt-2 text-lg font-bold">{value}</p>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">{label}</label>
      <input
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">{label}</label>
      <select
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, labelValue]) => (
          <option key={optionValue} value={optionValue}>
            {labelValue}
          </option>
        ))}
      </select>
    </div>
  );
}

function ActionRow({
  saving,
  onReset,
  submitLabel,
}: {
  saving: boolean;
  onReset: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button className="rounded-2xl bg-[linear-gradient(135deg,#8b6837_0%,#b48b4a_100%)] px-5 py-3 font-semibold text-white transition hover:brightness-105" disabled={saving} type="submit">
        {submitLabel}
      </button>
      <button className="rounded-2xl border border-stone-200 bg-white px-5 py-3 font-semibold text-stone-700 transition hover:border-amber-200 hover:bg-amber-50" type="button" onClick={onReset}>
        Làm mới form
      </button>
    </div>
  );
}

function Table({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-3xl border border-stone-100 bg-white/90 shadow-[0_15px_30px_rgba(177,150,101,0.05)]"><table className="w-full text-left text-sm">{children}</table></div>;
}

function Th({ children }: { children?: ReactNode }) {
  return <th className="bg-[linear-gradient(180deg,#fffdf8_0%,#f7f1e6_100%)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-stone-500">{children}</th>;
}

function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top text-stone-700 ${className}`}>{children}</td>;
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-2">
      <button className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-amber-200 hover:bg-amber-50" type="button" onClick={onEdit}>
        Sửa
      </button>
      <button className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600" type="button" onClick={onDelete}>
        Xoá
      </button>
    </div>
  );
}
