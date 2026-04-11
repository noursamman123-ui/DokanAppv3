import apiClient from './client';
import { Endpoints } from './endpoints';
import { Product, ProductFilters } from '../types';

export const ProductsService = {
  getProducts: async (filters: ProductFilters = {}): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(Endpoints.storeProducts.list, {
      params: {
        per_page: filters.per_page ?? 50,
        page: filters.page ?? 1,
        category: filters.category,
        min_price: filters.min_price,
        max_price: filters.max_price,
        orderby: filters.orderby ?? 'date',
        order: filters.order ?? 'desc',
        on_sale: filters.on_sale,
        featured: filters.featured,
        search: filters.search,
      },
    });
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(Endpoints.storeProducts.detail(id));
    return response.data;
  },

  getRelated: async (id: number): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(Endpoints.storeProducts.related(id));
    return response.data;
  },

  getVariations: async (parentId: number): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(Endpoints.storeProducts.list, {
      params: { type: 'variation', parent: parentId, per_page: 100 },
    });
    return response.data;
  },

  searchProducts: async (query: string, page = 1): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(Endpoints.storeProducts.list, {
      params: { search: query, per_page: 20, page },
    });
    return response.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(Endpoints.storeProducts.list, {
      params: { featured: true, per_page: 10 },
    });
    return response.data;
  },

  getSaleProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(Endpoints.storeProducts.list, {
      params: { on_sale: true, per_page: 10 },
    });
    return response.data;
  },
};
