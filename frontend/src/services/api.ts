import axios from 'axios';
import { toast } from './toast';
export { API_BASE_URL, UPLOADS_BASE_URL } from '../config/server';
import { API_BASE_URL as CONFIG_API_BASE_URL } from '../config/server';

// Localhost config moved to ../config/server.ts for easier switching.

const api = axios.create({
  baseURL: CONFIG_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tmc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error?.response?.data?.detail || error?.message || 'Có lỗi xảy ra';
    toast.error(typeof msg === 'string' ? msg : 'Có lỗi xảy ra');
    return Promise.reject(error);
  },
);

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
}

export interface Brand {
  id: number;
  name: string;
  logo_url: string | null;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
}

export interface ProductDiscount {
  id: number;
  product_id: number;
  discount_percent: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string | null;
}

export interface ProductReview {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string | null;
  user?: UserOut | null;
}

export interface ComboItem {
  id: number;
  combo_id: number;
  product_id: number;
  quantity: number;
  product?: Product | null;
}

export interface Combo {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  discount_percent: number;
  is_active: boolean;
  created_at: string | null;
  items: ComboItem[];
  original_price: number | null;
  discounted_price: number | null;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  category_id: number | null;
  brand_id: number | null;
  retail_price: number;
  wholesale_price: number | null;
  badge: string | null;
  stock: number;
  is_active: boolean;
  category?: Category | null;
  brand?: Brand | null;
  images: ProductImage[];
  avg_rating: number | null;
  review_count: number;
  discount?: ProductDiscount | null;
}

export interface PricingTier {
  id: number;
  name: string;
  min_total_spent: number;
  discount_percent: number;
  use_wholesale_price: boolean;
  is_active: boolean;
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserOut {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
}

export interface DiscountCode {
  id: number;
  code: string;
  discount_type: 'percent' | 'fixed_amount';
  discount_value: number;
  min_order_amount: number;
  max_usage: number | null;
  current_usage: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string | null;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  combo_id?: number | null;
  combo_name?: string | null;
  product?: Product | null;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  applied_price_type: string;
  discount_code_id: number | null;
  status: string;
  created_at: string | null;
  user?: UserOut | null;
  discount_code?: DiscountCode | null;
  items: OrderItem[];
  pricing_label?: string | null;
  pricing_rule_name?: string | null;
  pricing_discount_percent?: number | null;
  subtotal_before_discount?: number | null;
  item_subtotal?: number | null;
  pricing_discount_amount?: number | null;
  discount_code_amount?: number | null;
  total_discount_amount?: number | null;
  shipping_fee?: number | null;
  subtotal_after_discount?: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
  payment_code?: string | null;
  sepay_qr_url?: string | null;
  paid_at?: string | null;
  sepay_transaction_id?: string | null;
  shipping_full_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_postal_code?: string | null;
  tracking_number?: string | null;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string | null;
  product?: Product | null;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string | null;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string | null;
}

export interface WholesaleTier {
  id: number;
  name: string;
  min_order_total: number;
  max_order_total: number | null;
  discount_percent: number;
  is_active: boolean;
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DiscountSetting {
  id: number;
  wholesale_threshold: number;
  default_shipping_fee: number;
  updated_by: number | null;
  updated_at: string | null;
  pricing_tiers: PricingTier[];
  wholesale_tiers: WholesaleTier[];
}

export interface CheckoutSettings {
  default_shipping_fee: number;
  payment_methods: string[];
}

export interface SePayPaymentStatus {
  order_id: number;
  payment_method: string;
  payment_status: string;
  payment_code: string | null;
  total_amount: number;
  qr_url: string | null;
  bank_name: string | null;
  bank_account: string | null;
  account_name: string | null;
  paid_at: string | null;
}

export interface SePayWebhookLog {
  id: number;
  transaction_id: string;
  payment_code: string | null;
  transfer_amount: number;
  transfer_type: string | null;
  account_number: string | null;
  reference_code: string | null;
  status: string;
  message: string | null;
  raw_payload: string;
  created_at: string | null;
}

export interface CustomerPricingStatus {
  lifetime_spend: number;
  projected_spend: number;
  current_tier?: PricingTier | null;
  next_tier?: PricingTier | null;
  amount_to_next_tier: number;
  fallback_wholesale_threshold: number;
  fallback_amount_to_wholesale: number;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
  author_id: number;
  category_id: number;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
  author?: UserOut | null;
  category?: BlogCategory | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserOut;
}

export interface ChatbotApiKey {
  id: number;
  name: string;
  provider: string;
  masked_key: string;
  base_url: string;
  model: string;
  reasoning_effort: string;
  is_active: boolean;
  note: string | null;
  last_used_at: string | null;
  last_error: string | null;
  failure_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProductSuggestion {
  id: number;
  name: string;
  brand_name: string | null;
  category_name: string | null;
  retail_price: number;
  wholesale_price: number | null;
  image_url: string | null;
}

export interface ChatbotReply {
  reply: string;
  used_model: string;
  used_key_name: string;
  product_suggestions: ProductSuggestion[];
}

export interface DashboardResponse {
  summary: {
    total_products: number;
    total_orders: number;
    total_revenue: number;
    total_users: number;
    wholesale_threshold: number;
    default_shipping_fee: number;
  };
  revenue_by_month: { label: string; value: number }[];
  orders_by_status: { status: string; count: number }[];
  price_modes: { label: string; count: number; revenue: number }[];
  pricing_tiers: PricingTier[];
  wholesale_tiers: WholesaleTier[];
  recent_orders: Order[];
  top_products: { id: number; name: string; units_sold: number; revenue: number }[];
  generated_at: string;
  requested_by: string;
}

export const authStorage = {
  setSession(response: AuthResponse) {
    localStorage.setItem('tmc_token', response.access_token);
    localStorage.setItem('tmc_user', JSON.stringify(response.user));
  },
  clear() {
    localStorage.removeItem('tmc_token');
    localStorage.removeItem('tmc_user');
  },
  getUser(): UserOut | null {
    const raw = localStorage.getItem('tmc_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserOut;
    } catch {
      return null;
    }
  },
  getToken(): string | null {
    return localStorage.getItem('tmc_token');
  },
};

export const comboApi = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    api.get<Combo[]>('/combos', { params }),
  getById: (id: number) => api.get<Combo>(`/combos/${id}`),
};

export const productApi = {
  getAll: (params?: { category_id?: number; brand_id?: number; search?: string; min_price?: number; max_price?: number; badge?: string; limit?: number; offset?: number; sort?: string }) =>
    api.get<Product[]>('/products', { params }),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  getReviews: (productId: number) => api.get<ProductReview[]>(`/products/${productId}/reviews`),
  createReview: (productId: number, payload: { rating: number; comment?: string }) =>
    api.post<ProductReview>(`/products/${productId}/reviews`, payload),
  getImages: (productId: number) => api.get<ProductImage[]>(`/products/${productId}/images`),
};

export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories'),
};

export const brandApi = {
  getAll: () => api.get<Brand[]>('/brands'),
};

export const blogApi = {
  getCategories: () => api.get<BlogCategory[]>('/blog-categories'),
  getArticles: (params?: { category_id?: number; search?: string }) =>
    api.get<BlogArticle[]>('/blog-articles', { params }),
  getArticle: (id: number) => api.get<BlogArticle>(`/blog-articles/${id}`),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  updateProfile: (payload: { full_name?: string; phone?: string; current_password?: string; new_password?: string }) =>
    api.put<UserOut>('/auth/me', payload),
};

export const orderApi = {
  create: (payload: {
    items: { product_id: number; quantity: number; combo_id?: number }[];
    discount_code?: string;
    shipping_full_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_postal_code?: string;
    payment_method: 'cod' | 'sepay';
  }) =>
    api.post<Order>('/orders', payload),
  getAll: () => api.get<Order[]>('/orders'),
  getById: (id: number) => api.get<Order>(`/orders/${id}`),
  cancel: (id: number) => api.put<Order>(`/orders/${id}/cancel`),
  getPricingStatus: () => api.get<CustomerPricingStatus>('/orders/pricing-status'),
  getCheckoutSettings: () => api.get<CheckoutSettings>('/orders/checkout-settings'),
};

export const paymentApi = {
  getSePayStatus: (orderId: number) => api.get<SePayPaymentStatus>(`/payments/sepay/orders/${orderId}`),
};

export const notificationApi = {
  getAll: () => api.get<NotificationItem[]>('/notifications'),
  markRead: (id: number) => api.put<NotificationItem>(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const chatbotApi = {
  send: (messages: { role: 'user' | 'assistant'; content: string }[]) =>
    api.post<ChatbotReply>('/chatbot/messages', { messages }),
};

export const wishlistApi = {
  getAll: () => api.get<WishlistItem[]>('/wishlist'),
  add: (productId: number) => api.post<WishlistItem>('/wishlist', { product_id: productId }),
  remove: (productId: number) => api.delete(`/wishlist/${productId}`),
};

export const bannerApi = {
  getAll: () => api.get<Banner[]>('/banners'),
};

export const uploadApi = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ filename: string; url: string; uploaded_by: string }>('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const adminApi = {
  getDashboard: () => api.get<DashboardResponse>('/admin/dashboard'),
  getDiscountSettings: () => api.get<DiscountSetting>('/admin/discount-settings'),
  updateDiscountSettings: (payload: { wholesale_threshold: number; default_shipping_fee: number }) =>
    api.put<DiscountSetting>('/admin/discount-settings', payload),
  getChatbotKeys: () => api.get<ChatbotApiKey[]>('/chatbot/admin/keys'),
  createChatbotKey: (payload: {
    name: string;
    api_key: string;
    provider?: string;
    base_url?: string;
    model?: string;
    reasoning_effort?: string;
    is_active: boolean;
    note?: string | null;
  }) => api.post<ChatbotApiKey>('/chatbot/admin/keys', payload),
  updateChatbotKey: (id: number, payload: Partial<{
    name: string;
    api_key: string;
    provider: string;
    base_url: string;
    model: string;
    reasoning_effort: string;
    is_active: boolean;
    note: string | null;
  }>) => api.put<ChatbotApiKey>(`/chatbot/admin/keys/${id}`, payload),
  deleteChatbotKey: (id: number) => api.delete(`/chatbot/admin/keys/${id}`),
  getPricingTiers: () => api.get<PricingTier[]>('/admin/pricing-tiers'),
  createPricingTier: (payload: {
    name: string;
    min_total_spent: number;
    discount_percent: number;
    use_wholesale_price: boolean;
    is_active: boolean;
    note?: string | null;
  }) => api.post<PricingTier>('/admin/pricing-tiers', payload),
  updatePricingTier: (id: number, payload: Partial<{
    name: string;
    min_total_spent: number;
    discount_percent: number;
    use_wholesale_price: boolean;
    is_active: boolean;
    note: string | null;
  }>) => api.put<PricingTier>(`/admin/pricing-tiers/${id}`, payload),
  deletePricingTier: (id: number) => api.delete(`/admin/pricing-tiers/${id}`),
  getWholesaleTiers: () => api.get<WholesaleTier[]>('/admin/wholesale-tiers'),
  createWholesaleTier: (payload: {
    name: string;
    min_order_total: number;
    max_order_total: number | null;
    discount_percent: number;
    is_active: boolean;
    note?: string | null;
  }) => api.post<WholesaleTier>('/admin/wholesale-tiers', payload),
  updateWholesaleTier: (id: number, payload: Partial<{
    name: string;
    min_order_total: number;
    max_order_total: number | null;
    discount_percent: number;
    is_active: boolean;
    note: string | null;
  }>) => api.put<WholesaleTier>(`/admin/wholesale-tiers/${id}`, payload),
  deleteWholesaleTier: (id: number) => api.delete(`/admin/wholesale-tiers/${id}`),
  exportOrdersReport: () => api.get<Blob>('/admin/reports/orders.csv', { responseType: 'blob' }),

  getUsers: () => api.get<UserOut[]>('/admin/users'),
  createUser: (payload: { email: string; password: string; full_name: string; phone?: string | null; role: string; is_active: boolean }) =>
    api.post<UserOut>('/admin/users', payload),
  updateUser: (id: number, payload: Partial<{ email: string; password: string; full_name: string; phone: string | null; role: string; is_active: boolean }>) =>
    api.put<UserOut>(`/admin/users/${id}`, payload),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

  getBrands: () => api.get<Brand[]>('/admin/brands'),
  createBrand: (payload: { name: string; logo_url?: string | null }) => api.post<Brand>('/admin/brands', payload),
  updateBrand: (id: number, payload: Partial<{ name: string; logo_url: string | null }>) =>
    api.put<Brand>(`/admin/brands/${id}`, payload),
  deleteBrand: (id: number) => api.delete(`/admin/brands/${id}`),

  getCategories: () => api.get<Category[]>('/admin/categories'),
  createCategory: (payload: { name: string; slug: string; image_url?: string | null }) =>
    api.post<Category>('/admin/categories', payload),
  updateCategory: (id: number, payload: Partial<{ name: string; slug: string; image_url: string | null }>) =>
    api.put<Category>(`/admin/categories/${id}`, payload),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),

  getProducts: () => api.get<Product[]>('/admin/products'),
  createProduct: (payload: Omit<Product, 'id' | 'category' | 'brand'>) =>
    api.post<Product>('/admin/products', payload),
  updateProduct: (id: number, payload: Partial<Omit<Product, 'id' | 'category' | 'brand'>>) =>
    api.put<Product>(`/admin/products/${id}`, payload),
  deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),

  getOrders: () => api.get<Order[]>('/admin/orders'),
  getSePayWebhookLogs: () => api.get<SePayWebhookLog[]>('/admin/sepay-webhook-logs'),
  updateOrder: (id: number, payload: { status?: string; tracking_number?: string }) =>
    api.put<Order>(`/admin/orders/${id}`, payload),
  deleteOrder: (id: number) => api.delete(`/admin/orders/${id}`),

  getDiscountCodes: () => api.get<DiscountCode[]>('/admin/discount-codes'),
  createDiscountCode: (payload: {
    code: string;
    discount_type: 'percent' | 'fixed_amount';
    discount_value: number;
    min_order_amount: number;
    max_usage?: number | null;
    expires_at?: string | null;
    is_active: boolean;
  }) => api.post<DiscountCode>('/admin/discount-codes', payload),
  updateDiscountCode: (
    id: number,
    payload: Partial<{
      code: string;
      discount_type: 'percent' | 'fixed_amount';
      discount_value: number;
      min_order_amount: number;
      max_usage: number | null;
      current_usage: number;
      expires_at: string | null;
      is_active: boolean;
    }>,
  ) => api.put<DiscountCode>(`/admin/discount-codes/${id}`, payload),
  deleteDiscountCode: (id: number) => api.delete(`/admin/discount-codes/${id}`),

  getBlogCategories: () => api.get<BlogCategory[]>('/admin/blog-categories'),
  createBlogCategory: (payload: { name: string; slug: string; description?: string | null }) =>
    api.post<BlogCategory>('/admin/blog-categories', payload),
  updateBlogCategory: (id: number, payload: Partial<{ name: string; slug: string; description: string | null }>) =>
    api.put<BlogCategory>(`/admin/blog-categories/${id}`, payload),
  deleteBlogCategory: (id: number) => api.delete(`/admin/blog-categories/${id}`),

  getBlogArticles: () => api.get<BlogArticle[]>('/admin/blog-articles'),
  createBlogArticle: (payload: {
    title: string;
    slug: string;
    content: string;
    image_url?: string | null;
    category_id: number;
    is_published: boolean;
  }) => api.post<BlogArticle>('/admin/blog-articles', payload),
  updateBlogArticle: (id: number, payload: Partial<{
    title: string;
    slug: string;
    content: string;
    image_url: string | null;
    category_id: number;
    is_published: boolean;
  }>) => api.put<BlogArticle>(`/admin/blog-articles/${id}`, payload),
  deleteBlogArticle: (id: number) => api.delete(`/admin/blog-articles/${id}`),

  getBanners: () => api.get<Banner[]>('/admin/banners'),
  createBanner: (payload: {
    title: string;
    subtitle?: string | null;
    description?: string | null;
    image_url: string;
    link_url?: string | null;
    sort_order: number;
    is_active: boolean;
  }) => api.post<Banner>('/admin/banners', payload),
  updateBanner: (id: number, payload: Partial<{
    title: string;
    subtitle: string | null;
    description: string | null;
    image_url: string;
    link_url: string | null;
    sort_order: number;
    is_active: boolean;
  }>) => api.put<Banner>(`/admin/banners/${id}`, payload),
  deleteBanner: (id: number) => api.delete(`/admin/banners/${id}`),

  addProductImage: (productId: number, payload: { image_url: string; sort_order?: number }) =>
    api.post<ProductImage>(`/admin/products/${productId}/images`, payload),
  deleteProductImage: (productId: number, imageId: number) =>
    api.delete(`/admin/products/${productId}/images/${imageId}`),
  reorderProductImages: (productId: number, imageIds: number[]) =>
    api.put(`/admin/products/${productId}/images/reorder`, { image_ids: imageIds }),

  getProductDiscounts: () => api.get<ProductDiscount[]>('/admin/product-discounts'),
  createProductDiscount: (productId: number, payload: { discount_percent: number; start_time: string; end_time: string; is_active: boolean }) =>
    api.post<ProductDiscount>(`/admin/products/${productId}/discount`, payload),
  updateProductDiscount: (productId: number, payload: { discount_percent?: number; start_time?: string; end_time?: string; is_active?: boolean }) =>
    api.put<ProductDiscount>(`/admin/products/${productId}/discount`, payload),
  deleteProductDiscount: (productId: number) =>
    api.delete(`/admin/products/${productId}/discount`),

  // Combos
  getCombos: () => api.get<Combo[]>('/admin/combos'),
  createCombo: (payload: {
    name: string;
    description?: string | null;
    image_url?: string | null;
    discount_percent: number;
    is_active: boolean;
    items: { product_id: number; quantity: number }[];
  }) => api.post<Combo>('/admin/combos', payload),
  updateCombo: (id: number, payload: Partial<{
    name: string;
    description: string | null;
    image_url: string | null;
    discount_percent: number;
    is_active: boolean;
  }>) => api.put<Combo>(`/admin/combos/${id}`, payload),
  deleteCombo: (id: number) => api.delete(`/admin/combos/${id}`),
  addComboItem: (comboId: number, payload: { product_id: number; quantity: number }) =>
    api.post<ComboItem>(`/admin/combos/${comboId}/items`, payload),
  updateComboItem: (comboId: number, itemId: number, payload: { product_id?: number; quantity?: number }) =>
    api.put<ComboItem>(`/admin/combos/${comboId}/items/${itemId}`, payload),
  deleteComboItem: (comboId: number, itemId: number) =>
    api.delete(`/admin/combos/${comboId}/items/${itemId}`),
};

export default api;
