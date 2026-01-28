import { apiClient } from './apiClient';
import { User, AuthTokens, ApiResponse } from '@/types';
import * as SecureStore from 'expo-secure-store';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      await this.storeTokens(response.data.tokens);
    }
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    
    if (response.success && response.data) {
      await this.storeTokens(response.data.tokens);
    }
    
    return response;
  }

  async loginWithGoogle(idToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/google', { idToken });
    
    if (response.success && response.data) {
      await this.storeTokens(response.data.tokens);
    }
    
    return response;
  }

  async loginWithApple(identityToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/apple', { identityToken });
    
    if (response.success && response.data) {
      await this.storeTokens(response.data.tokens);
    }
    
    return response;
  }

  async resetPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/reset-password', { email });
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      await this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/me');
  }

  async createGuestSession(): Promise<User> {
    return {
      id: 'guest',
      email: '',
      isGuest: true,
      coins: 3, // Free coins for guest users
      subscription: { type: 'free' },
    };
  }

  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync('auth_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store auth tokens:', error);
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('auth_tokens');
    } catch (error) {
      console.error('Failed to clear auth tokens:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const tokensJson = await SecureStore.getItemAsync('auth_tokens');
      if (!tokensJson) return false;
      
      const tokens: AuthTokens = JSON.parse(tokensJson);
      return tokens.expiresAt > Date.now();
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();