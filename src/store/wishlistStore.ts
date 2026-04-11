/**
 * Wishlist Store – Zustand
 * Local wishlist for guest users, server-synced for authenticated users.
 */
import { create } from 'zustand';
import { WishlistItem } from '../types';
import { appStorage, STORAGE_KEYS } from '../utils/storage';

interface WishlistState {
  items: WishlistItem[];

  // Queries
  isInWishlist: (productId: number) => boolean;

  // Actions
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: number) => void;
  setItems: (items: WishlistItem[]) => void; // Used when syncing from server
  clearWishlist: () => void;
  hydrateFromStorage: () => void;
}

const persistWishlist = (items: WishlistItem[]) => {
  appStorage.set(STORAGE_KEYS.LOCAL_WISHLIST, JSON.stringify(items));
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  isInWishlist: (productId: number) =>
    get().items.some((item) => item.product_id === productId),

  addItem: (newItem: WishlistItem) => {
    set((state) => {
      if (state.items.some((i) => i.product_id === newItem.product_id)) {
        return state; // Already in wishlist
      }
      const updated = [...state.items, newItem];
      persistWishlist(updated);
      return { items: updated };
    });
  },

  removeItem: (productId: number) => {
    set((state) => {
      const updated = state.items.filter((i) => i.product_id !== productId);
      persistWishlist(updated);
      return { items: updated };
    });
  },

  setItems: (items: WishlistItem[]) => {
    persistWishlist(items);
    set({ items });
  },

  clearWishlist: () => {
    appStorage.remove(STORAGE_KEYS.LOCAL_WISHLIST);
    set({ items: [] });
  },

  hydrateFromStorage: () => {
    const raw = appStorage.getString(STORAGE_KEYS.LOCAL_WISHLIST);
    if (raw) {
      try {
        const items: WishlistItem[] = JSON.parse(raw);
        set({ items });
      } catch {
        appStorage.remove(STORAGE_KEYS.LOCAL_WISHLIST);
      }
    }
  },
}));
