import { apiClient } from './apiClient';
import { ApiResponse } from '@/types';

export interface Settings {
  signupBonusCoins: number;
  storyCost: number;
  languages: {
    EN: boolean;
    FR: boolean;
    AR: boolean;
  };
  maxStoryLength: number;
  storyModes: {
    adventure: boolean;
    educational: boolean;
    bedtime: boolean;
    interactive: boolean;
  };
}

export const settingsService = {
  async getSettings(): Promise<ApiResponse<Settings>> {
    return apiClient.get<Settings>('/settings');
  },
};
