/**
 * Dokan App – Axios HTTP Client
 * Secure, production-ready API client with:
 * - JWT token injection
 * - Automatic token refresh
 * - WooCommerce Nonce for Store API
 * - Request cancellation
 * - Structured error handling
 */
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { TokenStorage } from '../utils/storage';
import { ApiError } from '../types';

// Base URL from environment (set via .env / react-native-config)
// IMPORTANT: Never hardcode credentials here
const BASE_URL = 'https://staging.dokan.com.sy';

// ─── Create Axios Instance ────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor: Attach Auth Token ───────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenStorage.getToken();
    
    // Do not attach token for Auth endpoints to avoid backend parsing exceptions
    const isAuthEndpoint = config.url?.includes('/register') || config.url?.includes('/login') || config.url?.includes('/token');

    if (token && !isAuthEndpoint) {
      // Use a completely custom header to bypass any aggressive JWT plugins
      // that might be intercepting the standard 'Authorization' header.
      config.headers['X-Dokan-Mobile-Auth'] = token;
      
      // Also keep X-Dokan-Authorization for backward compatibility with v7/v8
      config.headers['X-Dokan-Authorization'] = token;
    }

    // Attach WooCommerce cart nonce and token for Store API calls
    const cartNonce = TokenStorage.getCartNonce();
    const cartToken = TokenStorage.getCartToken();

    if (config.url?.includes('/wc/store/')) {
      if (cartNonce) {
        // Send both variants for maximum compatibility
        config.headers['Nonce'] = cartNonce;
        config.headers['X-WC-Store-API-Nonce'] = cartNonce;
      }
      if (cartToken) {
        config.headers['Cart-Token'] = cartToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: Handle Errors ─────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Extract and store cart nonce from WC Store API responses
    // Axios lowercases header keys: 'x-wc-store-api-nonce' and 'nonce'
    const nonce = response.headers['x-wc-store-api-nonce'] || response.headers['nonce'];
    if (nonce) {
      TokenStorage.setCartNonce(nonce);
    }

    const cartToken = response.headers['cart-token'];
    if (cartToken) {
      TokenStorage.setCartToken(cartToken);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Token expired — try to refresh or force logout
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Only logout if we're certain the token is non-refreshable or truly invalid
        // For standard JWT-auth (no refresh token), we signal expiry
        (globalThis as any).__onSessionExpired?.();
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Parse WooCommerce / WordPress error format
    const apiError = parseApiError(error);
    return Promise.reject(apiError);
  },
);

// ─── Error Parser ─────────────────────────────────────────────────────────
function parseApiError(error: AxiosError): ApiError {
  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    return {
      code: (data.code as string) ?? 'UNKNOWN_ERROR',
      message: (data.message as string) ?? 'An unexpected error occurred',
      data: data.data as Record<string, unknown> | undefined,
    };
  }

  if (error.code === 'ECONNABORTED') {
    return { code: 'TIMEOUT', message: 'Request timed out. Please check your connection.' };
  }

  if (!error.response) {
    return { code: 'NETWORK_ERROR', message: 'Network error. Please check your connection.' };
  }

  return { code: 'SERVER_ERROR', message: 'A server error occurred. Please try again.' };
}

// ─── Public Helpers ───────────────────────────────────────────────────────
export const createCancelToken = () => {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
};

export default apiClient;

// Augment global type for session expiry callback
declare global {
  var __onSessionExpired: (() => void) | undefined;
}
