import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tmc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
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
  category?: Category;
  brand?: Brand;
}

export interface UserOut {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserOut;
}

// API Functions
export const productApi = {
  getAll: (params?: { category_id?: number; brand_id?: number; search?: string; min_price?: number; max_price?: number; badge?: string }) =>
    api.get<Product[]>('/products', { params }),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
};

export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories'),
};

export const brandApi = {
  getAll: () => api.get<Brand[]>('/brands'),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
};

export const orderApi = {
  create: (items: { product_id: number; quantity: number }[]) =>
    api.post('/orders', { items }),
  getAll: () => api.get('/orders'),
};

export default api;
