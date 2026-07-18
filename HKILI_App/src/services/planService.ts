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
   * Start a coin purchase. If Stripe is configured on the backend, returns
   * { mode:'stripe', checkoutUrl, orderId } — open the URL, then call
   * verifyOrder(). Otherwise returns { mode:'stub', coins } (credited already).
   */
  purchase: async (
    planId: string
  ): Promise<ApiResponse<any> & { mode?: 'stripe' | 'stub'; checkoutUrl?: string; orderId?: string; coins?: number }> => {
    return apiClient.post('/orders', { planId }) as any;
  },

  /** Confirm a Stripe order after checkout; credits coins if paid. */
  verifyOrder: async (
    orderId: string
  ): Promise<ApiResponse<any> & { status?: string; coins?: number }> => {
    return apiClient.post('/orders/verify', { orderId }) as any;
  },
};
