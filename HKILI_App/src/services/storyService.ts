import { apiClient } from './apiClient';
import { Story, StoryGenerationRequest, ApiResponse } from '@/types';

class StoryService {
  async generateStory(request: StoryGenerationRequest): Promise<ApiResponse<Story>> {
    return apiClient.post<Story>('/stories/generate', request);
  }

  async getStories(page = 1, limit = 20): Promise<ApiResponse<{ stories: Story[]; total: number }>> {
    return apiClient.get('/stories', { page, limit });
  }

  async getStory(id: string): Promise<ApiResponse<Story>> {
    return apiClient.get<Story>(`/stories/${id}`);
  }

  async toggleFavorite(storyId: string): Promise<ApiResponse<{ isFavorite: boolean }>> {
    return apiClient.post(`/stories/${storyId}/favorite`);
  }

  async deleteStory(storyId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/stories/${storyId}`);
  }

  async searchStories(query: string, filters?: {
    genre?: string;
    favorites?: boolean;
  }): Promise<ApiResponse<Story[]>> {
    return apiClient.get('/stories/search', { query, ...filters });
  }

  async getStoryAudio(storyId: string): Promise<ApiResponse<{ audioUrl: string }>> {
    return apiClient.get(`/stories/${storyId}/audio`);
  }

  async getStoryImages(storyId: string): Promise<ApiResponse<{ images: string[] }>> {
    return apiClient.get(`/stories/${storyId}/images`);
  }

  // Placeholder for voice selection - backend handles the actual voice processing
  async getAvailableVoices(): Promise<ApiResponse<{ id: string; name: string; language: string }[]>> {
    return apiClient.get('/voices');
  }
}

export const storyService = new StoryService();