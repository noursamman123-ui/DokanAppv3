/**
 * Cart Store – Zustand
 * Local cart management with MMKV persistence.
 * Guest users get a local cart; logged-in users sync with WooCommerce Server.
 */
import { create } from 'zustand';
import { LocalCartItem } from '../types';
import { appStorage, STORAGE_KEYS } from '../utils/storage';

interface CartState {
  items: LocalCartItem[];
  couponCode: string | null;
  isLoading: boolean;

  // Computed
  totalItems: () => number;
  totalPrice: () => number;

  // Actions
  addItem: (item: LocalCartItem) => void;
  removeItem: (productId: number, variationId?: number) => void;
  updateQuantity: (productId: number, variationId: number | undefined, quantity: number) => void;
  applyCoupon: (code: string) => void;
  clearCoupon: () => void;
  clearCart: () => void;
  hydrateFromStorage: () => void;
}

const persistCart = (items: LocalCartItem[]) => {
  appStorage.set(STORAGE_KEYS.LOCAL_CART, JSON.stringify(items));
};

const getCartKey = (productId: number, variationId?: number) =>
  `${productId}_${variationId ?? 0}`;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: null,
  isLoading: false,

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, item) => {
      const price = parseFloat(item.price ?? '0');
      return sum + price * item.quantity;
    }, 0),

  addItem: (newItem: LocalCartItem) => {
    set((state) => {
      const key = getCartKey(newItem.product_id, newItem.variation_id);
      const existing = state.items.find(
        (i) => getCartKey(i.product_id, i.variation_id) === key
      );

      let updatedItems: LocalCartItem[];
      if (existing) {
        updatedItems = state.items.map((i) =>
          getCartKey(i.product_id, i.variation_id) === key
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      } else {
        updatedItems = [...state.items, newItem];
      }

      persistCart(updatedItems);
      return { items: updatedItems };
    });
  },

  removeItem: (productId: number, variationId?: number) => {
    set((state) => {
      const key = getCartKey(productId, variationId);
      const updatedItems = state.items.filter(
        (i) => getCartKey(i.product_id, i.variation_id) !== key
      );
      persistCart(updatedItems);
      return { items: updatedItems };
    });
  },

  updateQuantity: (productId: number, variationId: number | undefined, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId, variationId);
      return;
    }
    set((state) => {
      const key = getCartKey(productId, variationId);
      const updatedItems = state.items.map((i) =>
        getCartKey(i.product_id, i.variation_id) === key ? { ...i, quantity } : i
      );
      persistCart(updatedItems);
      return { items: updatedItems };
    });
  },

  applyCoupon: (code: string) => set({ couponCode: code }),
  clearCoupon: () => set({ couponCode: null }),

  clearCart: () => {
    appStorage.remove(STORAGE_KEYS.LOCAL_CART);
    set({ items: [], couponCode: null });
  },

  hydrateFromStorage: () => {
    const raw = appStorage.getString(STORAGE_KEYS.LOCAL_CART);
    if (raw) {
      try {
        const items: LocalCartItem[] = JSON.parse(raw);
        set({ items });
      } catch {
        appStorage.remove(STORAGE_KEYS.LOCAL_CART);
      }
    }
  },
}));
