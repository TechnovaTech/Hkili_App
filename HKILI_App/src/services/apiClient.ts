import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, AuthTokens } from '@/types';
import { router } from 'expo-router';
import { tokenStorage } from './tokenStorage';

// Endpoints used while signed out; a 401 here must not trigger the session-expired redirect.
const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/apple',
  '/auth/send-otp',
  '/auth/reset-password',
  '/auth/refresh',
  '/auth/logout',
];

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private redirectingToLogin = false;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 120000,
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
          const tokens = await tokenStorage.get();
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
          
          // A 401 from a sign-in endpoint means bad credentials, not an expired session.
          if (PUBLIC_AUTH_PATHS.some((path) => originalRequest.url?.startsWith(path))) {
            return Promise.reject(error);
          }

          try {
            const tokens = await tokenStorage.get();
            if (tokens?.refreshToken) {
              const newTokens = await this.refreshTokens(tokens.refreshToken);
              await tokenStorage.set(newTokens);
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Fall through to sign-out below
          }

          // No valid session — there is no guest mode, so send the user to sign in.
          await tokenStorage.clear();
          this.redirectToLogin();
        }
        
        return Promise.reject(error);
      }
    );
  }

  private redirectToLogin() {
    // Several requests can fail together (e.g. a screen loading in parallel);
    // only navigate once.
    if (this.redirectingToLogin) return;
    this.redirectingToLogin = true;
    router.replace('/auth/login');
    setTimeout(() => {
      this.redirectingToLogin = false;
    }, 1000);
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

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data);
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
