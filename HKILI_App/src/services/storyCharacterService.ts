import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface StoryCharacter {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  age?: number;
  gender?: string;
  hairColor?: string;
  hairStyle?: string;
  skinColor?: string;
  eyeColor?: string;
  interests?: string[];
  customInterests?: string[];
  categoryId: string | { _id: string; name: string };
  createdAt?: string;
}

class StoryCharacterService {
  async getByCategoryId(categoryId: string): Promise<ApiResponse<StoryCharacter[]>> {
    return apiClient.get<StoryCharacter[]>('/story-characters', { categoryId });
  }

  async getAll(): Promise<ApiResponse<StoryCharacter[]>> {
    return apiClient.get<StoryCharacter[]>('/story-characters');
  }

  async getById(id: string): Promise<ApiResponse<StoryCharacter>> {
    return apiClient.get<StoryCharacter>(`/story-characters/${id}`);
  }
}

export const storyCharacterService = new StoryCharacterService();
