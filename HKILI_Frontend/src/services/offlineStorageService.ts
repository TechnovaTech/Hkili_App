import AsyncStorage from '@react-native-async-storage/async-storage';
import { Story } from '@/types';

class OfflineStorageService {
  private readonly STORIES_KEY = 'offline_stories';
  private readonly AUDIO_CACHE_KEY = 'audio_cache';
  private readonly STORAGE_LIMIT = 100 * 1024 * 1024; // 100MB default

  async downloadStory(story: Story): Promise<void> {
    try {
      const offlineStories = await this.getOfflineStories();
      const updatedStory = { ...story, isDownloaded: true };
      
      const existingIndex = offlineStories.findIndex(s => s.id === story.id);
      if (existingIndex >= 0) {
        offlineStories[existingIndex] = updatedStory;
      } else {
        offlineStories.push(updatedStory);
      }
      
      await AsyncStorage.setItem(this.STORIES_KEY, JSON.stringify(offlineStories));
    } catch (error) {
      console.error('Failed to download story:', error);
      throw error;
    }
  }

  async removeOfflineStory(storyId: string): Promise<void> {
    try {
      const offlineStories = await this.getOfflineStories();
      const filteredStories = offlineStories.filter(s => s.id !== storyId);
      await AsyncStorage.setItem(this.STORIES_KEY, JSON.stringify(filteredStories));
    } catch (error) {
      console.error('Failed to remove offline story:', error);
      throw error;
    }
  }

  async getOfflineStories(): Promise<Story[]> {
    try {
      const storiesJson = await AsyncStorage.getItem(this.STORIES_KEY);
      return storiesJson ? JSON.parse(storiesJson) : [];
    } catch (error) {
      console.error('Failed to get offline stories:', error);
      return [];
    }
  }

  async getOfflineStory(storyId: string): Promise<Story | null> {
    try {
      const offlineStories = await this.getOfflineStories();
      return offlineStories.find(s => s.id === storyId) || null;
    } catch (error) {
      console.error('Failed to get offline story:', error);
      return null;
    }
  }

  async isStoryDownloaded(storyId: string): Promise<boolean> {
    try {
      const offlineStories = await this.getOfflineStories();
      return offlineStories.some(s => s.id === storyId);
    } catch (error) {
      return false;
    }
  }

  async getStorageUsage(): Promise<{ used: number; limit: number }> {
    try {
      const offlineStories = await this.getOfflineStories();
      const storiesSize = JSON.stringify(offlineStories).length;
      
      // Estimate audio cache size (simplified)
      const audioCacheJson = await AsyncStorage.getItem(this.AUDIO_CACHE_KEY);
      const audioCacheSize = audioCacheJson ? audioCacheJson.length : 0;
      
      return {
        used: storiesSize + audioCacheSize,
        limit: this.STORAGE_LIMIT,
      };
    } catch (error) {
      return { used: 0, limit: this.STORAGE_LIMIT };
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORIES_KEY);
      await AsyncStorage.removeItem(this.AUDIO_CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  async cacheRecentStory(story: Story): Promise<void> {
    try {
      const recentStories = await this.getRecentStories();
      const filteredStories = recentStories.filter(s => s.id !== story.id);
      const updatedStories = [story, ...filteredStories].slice(0, 10); // Keep last 10
      
      await AsyncStorage.setItem('recent_stories', JSON.stringify(updatedStories));
    } catch (error) {
      console.error('Failed to cache recent story:', error);
    }
  }

  async getRecentStories(): Promise<Story[]> {
    try {
      const recentJson = await AsyncStorage.getItem('recent_stories');
      return recentJson ? JSON.parse(recentJson) : [];
    } catch (error) {
      return [];
    }
  }
}

export const offlineStorageService = new OfflineStorageService();