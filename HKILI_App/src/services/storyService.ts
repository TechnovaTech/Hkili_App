import { apiClient } from './apiClient';
import { Story, StoryGenerationRequest, ApiResponse } from '@/types';

class StoryService {
  async generateStory(request: StoryGenerationRequest): Promise<ApiResponse<Story>> {
    return apiClient.post<Story>('/stories/generate', request);
  }

  async getStories(page = 1, limit = 20): Promise<ApiResponse<{ stories: Story[]; total: number }>> {
    return apiClient.get('/stories', { page, limit });
  }

  async getStoriesByCriteria(categoryId: string, storyCharacterId: string): Promise<ApiResponse<Story[]>> {
    try {
      // The backend endpoint returns Story[] directly (raw array)
      const response = await apiClient.get<any>('/stories', { categoryId, storyCharacterId });
      
      // Check if response is an array (direct backend response)
      if (Array.isArray(response)) {
        const mappedStories = response.map((story: any) => ({
          ...story,
          id: story._id || story.id, // Map _id to id
          // Ensure content is parsed if it's a string
          content: typeof story.content === 'string' 
            ? this.parseContent(story.content) 
            : (story.content || [])
        }));
        return { success: true, data: mappedStories };
      }
      
      // Check if response is wrapped in ApiResponse (standard format)
      if (response && (response as any).success && (response as any).data) {
        return response as any;
      }

      // Fallback if structure is unknown but strictly not empty
      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      console.error('Error fetching stories by criteria:', error);
      return { success: false, error: 'Failed to fetch stories' };
    }
  }

  private parseContent(content: string): any[] {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
      return [{ id: '1', text: content }];
    } catch (e) {
      // If not JSON, treat as plain text single segment
      return [{ id: '1', text: content }];
    }
  }

  async getStory(id: string): Promise<ApiResponse<Story>> {
    try {
      const response = await apiClient.get<any>(`/stories/${id}`);
      
      // Check if response is the story object directly (has _id or id)
      if (response && (response._id || response.id)) {
        const story = {
          ...response,
          id: response._id || response.id,
          content: typeof response.content === 'string' 
            ? this.parseContent(response.content) 
            : (response.content || [])
        };
        return { success: true, data: story };
      }
      
      // Check if it's already ApiResponse
      if (response && (response as any).success) {
         return response as any;
      }

      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      console.error('Error fetching story:', error);
      return { success: false, error: 'Failed to fetch story' };
    }
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