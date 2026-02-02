import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt?: string;
}

class CategoryService {
  async getAll(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>('/categories');
  }
}

export const categoryService = new CategoryService();
