import { AuthTokens } from '@/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'auth_tokens';

export const tokenStorage = {
  async get(): Promise<AuthTokens | null> {
    try {
      if (Platform.OS === 'web') {
        const json = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
        return json ? JSON.parse(json) : null;
      } else {
        const json = await SecureStore.getItemAsync(KEY);
        return json ? JSON.parse(json) : null;
      }
    } catch {
      return null;
    }
  },

  async set(tokens: AuthTokens): Promise<void> {
    try {
      const json = JSON.stringify(tokens);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(KEY, json);
        }
      } else {
        await SecureStore.setItemAsync(KEY, json);
      }
    } catch (error) {
      console.error('Failed to store auth tokens:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(KEY);
        }
      } else {
        await SecureStore.deleteItemAsync(KEY);
      }
    } catch (error) {
      console.error('Failed to clear auth tokens:', error);
    }
  },
};
