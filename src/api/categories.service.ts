import apiClient from './client';
import { Endpoints } from './endpoints';
import { Category } from '../types';

export const CategoriesService = {
  getCategories: async (parentId?: number): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>(Endpoints.storeCategories.list, {
      params: { parent: parentId ?? 0, per_page: 100, hide_empty: true },
    });
    return response.data;
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(Endpoints.storeCategories.detail(id));
    return response.data;
  },

  getSubcategories: async (parentId: number): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>(Endpoints.storeCategories.list, {
      params: { parent: parentId, per_page: 100, hide_empty: true },
    });
    return response.data;
  },
};
