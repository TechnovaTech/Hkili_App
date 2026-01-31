import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface Plan {
  _id: string;
  name: string;
  coins: number;
  originalPrice: number;
  discountPrice: number;
  createdAt: string;
}

export const planService = {
  getAll: async (): Promise<ApiResponse<Plan[]>> => {
    return apiClient.get<Plan[]>('/plans');
  },
};
