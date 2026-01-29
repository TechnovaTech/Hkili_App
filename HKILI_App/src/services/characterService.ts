import { apiClient } from './apiClient';
import { Character, CharacterFormData } from '@/types/character';
import { ApiResponse } from '@/types';

export const characterService = {
  async create(data: CharacterFormData): Promise<ApiResponse<Character>> {
    // Convert CharacterFormData to backend format
    const payload = {
      ...data,
      age: data.age ? parseInt(data.age, 10) : undefined,
    };
    
    return apiClient.post<Character>('/characters', payload);
  },

  async getAll(): Promise<ApiResponse<Character[]>> {
    return apiClient.get<Character[]>('/characters');
  },
  
  async getById(id: string): Promise<ApiResponse<Character>> {
    return apiClient.get<Character>(`/characters/${id}`);
  }
};
