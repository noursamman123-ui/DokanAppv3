/**
 * Auth Store – Zustand
 * Manages authentication state with MMKV persistence.
 */
import { create } from 'zustand';
import { User, AuthTokens } from '../types';
import { TokenStorage, appStorage } from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,

  setAuth: (user: User, tokens: AuthTokens) => {
    // Persist token securely
    TokenStorage.setToken(tokens.token);
    // Store user data (non-sensitive)
    appStorage.set('auth.user_data', JSON.stringify(user));

    // Clear any guest cart sessions so we fetch the fresh logged-in cart
    TokenStorage.clearCartNonce();
    TokenStorage.clearCartToken();

    set({
      user,
      token: tokens.token,
      isAuthenticated: true,
      isHydrated: true,
    });
  },

  updateUser: (userData: Partial<User>) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...userData } : null;
      if (updatedUser) {
        appStorage.set('auth.user_data', JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    }),

  logout: () => {
    TokenStorage.clearToken();
    TokenStorage.clearCartNonce();
    TokenStorage.clearCartToken();
    appStorage.remove('auth.user_data');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  hydrateFromStorage: () => {
    const token = TokenStorage.getToken();
    const rawUser = appStorage.getString('auth.user_data');
    
    if (token) {
      if (rawUser) {
        try {
          const user: User = JSON.parse(rawUser);
          set({ user, token, isAuthenticated: true, isHydrated: true });
          return;
        } catch (e) {
          console.error('Failed to parse stored user data', e);
          // If JSON is corrupt but token exists, we stay authenticated 
          // but will need to re-fetch user data.
          set({ token, isAuthenticated: true, isHydrated: true });
          return;
        }
      } else {
        // Token exists but no user data — still authenticated
        set({ token, isAuthenticated: true, isHydrated: true });
        return;
      }
    }
    
    set({ isHydrated: true });
  },
}));
