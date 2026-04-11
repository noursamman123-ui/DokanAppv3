import apiClient from './client';
import { Endpoints } from './endpoints';
import { WishlistItem } from '../types';

export const WishlistService = {
  getWishlist: async (): Promise<WishlistItem[]> => {
    const response = await apiClient.get<WishlistItem[]>(Endpoints.wishlist.get);
    return response.data;
  },

  addToWishlist: async (productId: number): Promise<WishlistItem> => {
    const response = await apiClient.post<WishlistItem>(Endpoints.wishlist.add, { product_id: productId });
    return response.data;
  },

  removeFromWishlist: async (productId: number): Promise<void> => {
    await apiClient.delete(Endpoints.wishlist.remove(productId));
  },
};
