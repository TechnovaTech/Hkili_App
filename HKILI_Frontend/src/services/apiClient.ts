import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ApiResponse, AuthTokens } from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const tokens = await this.getStoredTokens();
          if (tokens?.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          }
        } catch (error) {
          console.warn('Failed to get auth token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const tokens = await this.getStoredTokens();
            if (tokens?.refreshToken) {
              const newTokens = await this.refreshTokens(tokens.refreshToken);
              await this.storeTokens(newTokens);
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            await this.clearTokens();
            // Redirect to login would be handled by the app
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  private async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const tokensJson = await SecureStore.getItemAsync('auth_tokens');
      return tokensJson ? JSON.parse(tokensJson) : null;
    } catch (error) {
      return null;
    }
  }

  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync('auth_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('auth_tokens');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  private async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await axios.post(`${this.baseURL}/auth/refresh`, {
      refreshToken,
    });
    return response.data.data;
  }

  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, { params });
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse<any> {
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || 'Server error',
        message: error.response.data?.message,
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'Network error',
        message: 'Please check your internet connection',
      };
    } else {
      return {
        success: false,
        error: 'Request error',
        message: error.message,
      };
    }
  }
}

export const apiClient = new ApiClient();