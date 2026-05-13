import type { Combo, Product } from './api';

const CART_STORAGE_KEY = 'tmc_cart_items';
const CART_EVENT = 'tmc-cart-updated';

export type CartItem = {
  product_id: number;
  quantity: number;
  combo_id?: number;
  combo_discount_percent?: number;
  product: {
    id: number;
    name: string;
    image_url: string | null;
    retail_price: number;
    brand_name?: string | null;
    category_name?: string | null;
    stock?: number;
  };
};

function isStoredCartProduct(product: Product | CartItem['product']): product is CartItem['product'] {
  return 'brand_name' in product || 'category_name' in product;
}

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: items }));
}

function normalizeProduct(product: Product | CartItem['product']): CartItem['product'] {
  const storedProduct = isStoredCartProduct(product);
  return {
    id: product.id,
    name: product.name,
    image_url: product.image_url ?? null,
    retail_price: product.retail_price,
    brand_name: storedProduct ? product.brand_name ?? null : product.brand?.name ?? null,
    category_name: storedProduct ? product.category_name ?? null : product.category?.name ?? null,
    stock: 'stock' in product ? product.stock : undefined,
  };
}

export const cartStorage = {
  getItems(): CartItem[] {
    return readCart();
  },
  getCount(): number {
    return readCart().reduce((sum, item) => sum + item.quantity, 0);
  },
  getSubtotal(): number {
    return readCart().reduce((sum, item) => {
      const price = item.product.retail_price;
      if (item.combo_discount_percent) {
        return sum + (price * (1 - item.combo_discount_percent / 100)) * item.quantity;
      }
      return sum + price * item.quantity;
    }, 0);
  },
  addItem(product: Product | CartItem['product'], quantity = 1) {
    const items = readCart();
    const existing = items.find((item) => item.product_id === product.id);
    const maxStock = 'stock' in product && typeof product.stock === 'number' ? product.stock : undefined;
    if (existing) {
      existing.quantity += quantity;
      if (maxStock !== undefined) {
        existing.quantity = Math.min(existing.quantity, maxStock);
      }
    } else {
      items.push({
        product_id: product.id,
        quantity: maxStock !== undefined ? Math.min(quantity, maxStock) : quantity,
        product: normalizeProduct(product),
      });
    }
    writeCart(items);
  },
  addCombo(combo: Combo) {
    const items = readCart();
    for (const comboItem of combo.items) {
      if (!comboItem.product) continue;
      const existing = items.find((item) => item.product_id === comboItem.product_id);
      const maxStock = comboItem.product.stock;
      if (existing) {
        existing.quantity += comboItem.quantity;
        if (maxStock !== undefined) {
          existing.quantity = Math.min(existing.quantity, maxStock);
        }
        existing.combo_id = combo.id;
        existing.combo_discount_percent = combo.discount_percent;
      } else {
        items.push({
          product_id: comboItem.product_id,
          quantity: maxStock !== undefined ? Math.min(comboItem.quantity, maxStock) : comboItem.quantity,
          combo_id: combo.id,
          combo_discount_percent: combo.discount_percent,
          product: normalizeProduct(comboItem.product),
        });
      }
    }
    writeCart(items);
  },
  removeCombo(comboId: number) {
    writeCart(readCart().filter((item) => item.combo_id !== comboId));
  },
  updateQuantity(productId: number, quantity: number) {
    const items = readCart()
      .map((item) => item.product_id === productId ? { ...item, quantity } : item)
      .filter((item) => item.quantity > 0);
    writeCart(items);
  },
  removeItem(productId: number) {
    writeCart(readCart().filter((item) => item.product_id !== productId));
  },
  clear() {
    writeCart([]);
  },
  subscribe(listener: (items: CartItem[]) => void) {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<CartItem[]>;
      listener(customEvent.detail ?? readCart());
    };
    window.addEventListener(CART_EVENT, handler);
    return () => window.removeEventListener(CART_EVENT, handler);
  },
};
