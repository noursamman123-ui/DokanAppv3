import apiClient from './client';
import { Endpoints } from './endpoints';
import { HomeData, Banner } from '../types';

export const HomeService = {
  getHomeData: async (): Promise<HomeData> => {
    const response = await apiClient.get<any>(Endpoints.home.data);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data as HomeData;
    }
    return response.data as HomeData;
  },

  getBanners: async (): Promise<Banner[]> => {
    const response = await apiClient.get<any>(Endpoints.home.banners);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data as Banner[];
    }
    return response.data as Banner[];
  },
};
