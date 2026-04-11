/**
 * Dokan App – Secure Storage Utilities
 * MMKV-based fast, secure local storage with type-safe accessors.
 */
import { createMMKV } from 'react-native-mmkv';

// Separate storage instances for different concerns
export const authStorage = createMMKV({ id: 'dokan-auth' });
export const appStorage = createMMKV({ id: 'dokan-app' });
export const cacheStorage = createMMKV({ id: 'dokan-cache' });

// ─── Storage Keys ─────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  // Auth
  ACCESS_TOKEN: 'auth.access_token',
  USER_DATA: 'auth.user_data',
  CART_NONCE: 'auth.cart_nonce',
  CART_TOKEN: 'auth.cart_token',

  // App
  ONBOARDED: 'app.onboarded',
  LANGUAGE: 'app.language',
  THEME: 'app.theme',

  // Cart (local, for guest users)
  LOCAL_CART: 'cart.local',

  // Wishlist (local, for guest users)
  LOCAL_WISHLIST: 'wishlist.local',

  // Search
  RECENT_SEARCHES: 'search.recent',

  // Cache
  HOME_CACHE: 'cache.home',
  CATEGORIES_CACHE: 'cache.categories',
} as const;

// ─── Auth Storage Helpers ─────────────────────────────────────────────────
export const TokenStorage = {
  getToken: (): string | undefined => authStorage.getString(STORAGE_KEYS.ACCESS_TOKEN),
  setToken: (token: string): void => authStorage.set(STORAGE_KEYS.ACCESS_TOKEN, token),
  clearToken: () => { authStorage.remove(STORAGE_KEYS.ACCESS_TOKEN); },

  getCartNonce: (): string | undefined => authStorage.getString(STORAGE_KEYS.CART_NONCE),
  setCartNonce: (nonce: string): void => authStorage.set(STORAGE_KEYS.CART_NONCE, nonce),
  clearCartNonce: () => { authStorage.remove(STORAGE_KEYS.CART_NONCE); },

  getCartToken: (): string | undefined => authStorage.getString(STORAGE_KEYS.CART_TOKEN),
  setCartToken: (token: string): void => authStorage.set(STORAGE_KEYS.CART_TOKEN, token),
  clearCartToken: () => { authStorage.remove(STORAGE_KEYS.CART_TOKEN); },

  clearAll: (): void => authStorage.clearAll(),
};

// ─── Generic Cache Helpers ────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // seconds
}

export const CacheStorage = {
  set: <T>(key: string, data: T, ttlSeconds = 300): void => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds,
    };
    cacheStorage.set(key, JSON.stringify(entry));
  },

  get: <T>(key: string): T | null => {
    const raw = cacheStorage.getString(key);
    if (!raw) return null;

    try {
      const entry: CacheEntry<T> = JSON.parse(raw);
      const ageSeconds = (Date.now() - entry.timestamp) / 1000;
      if (ageSeconds > entry.ttl) {
        cacheStorage.remove(key);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  },

  invalidate: (key: string) => { cacheStorage.remove(key); },
  clearAll: (): void => cacheStorage.clearAll(),
};

// ─── App Settings Helpers ─────────────────────────────────────────────────
export const AppSettings = {
  getLanguage: (): string => appStorage.getString(STORAGE_KEYS.LANGUAGE) ?? 'ar',
  setLanguage: (lang: string): void => appStorage.set(STORAGE_KEYS.LANGUAGE, lang),

  isOnboarded: (): boolean => appStorage.getBoolean(STORAGE_KEYS.ONBOARDED) ?? false,
  setOnboarded: (): void => appStorage.set(STORAGE_KEYS.ONBOARDED, true),
};

// ─── Search History ───────────────────────────────────────────────────────
export const SearchHistory = {
  get: (): string[] => {
    const raw = appStorage.getString(STORAGE_KEYS.RECENT_SEARCHES);
    return raw ? JSON.parse(raw) : [];
  },
  add: (query: string): void => {
    const existing = SearchHistory.get();
    const updated = [query, ...existing.filter(q => q !== query)].slice(0, 10);
    appStorage.set(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  },
  clear: () => { appStorage.remove(STORAGE_KEYS.RECENT_SEARCHES); },
};
