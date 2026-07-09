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

  /**
   * Purchase a coin plan. NOTE: the backend checkout is currently a STUB — it
   * credits coins without a real charge. Returns the updated coin balance.
   */
  purchase: async (planId: string): Promise<ApiResponse<{ coinsAdded: number; orderId: string }> & { coins?: number }> => {
    return apiClient.post('/orders', { planId }) as any;
  },
};
