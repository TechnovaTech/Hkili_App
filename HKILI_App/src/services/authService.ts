import { apiClient } from './apiClient';
import { User, AuthTokens, ApiResponse } from '@/types';
import { tokenStorage } from './tokenStorage';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  otp?: string; // email verification code (required when the server has email configured)
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      await tokenStorage.set(response.data.tokens);
    }
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    
    if (response.success && response.data) {
      await tokenStorage.set(response.data.tokens);
    }
    
    return response;
  }

  async loginWithGoogle(idToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/google', { idToken });
    
    if (response.success && response.data) {
      await tokenStorage.set(response.data.tokens);
    }
    
    return response;
  }

  async loginWithApple(identityToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/apple', { identityToken });
    
    if (response.success && response.data) {
      await tokenStorage.set(response.data.tokens);
    }
    
    return response;
  }

  /**
   * Request a 6-digit email code. purpose 'register' = verify a new email,
   * 'reset' = forgot password. When the server has no mail service configured
   * it returns { otpRequired: false } and registration proceeds without a code.
   */
  async sendOtp(
    email: string,
    purpose: 'register' | 'reset'
  ): Promise<ApiResponse<void> & { otpRequired?: boolean }> {
    return apiClient.post('/auth/send-otp', { email, purpose }) as any;
  }

  /** Complete forgot-password: verify the emailed code and set a new password. */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/reset-password', { email, otp, newPassword });
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      await tokenStorage.clear();
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/me');
  }

  async updateProfile(data: {
    name?: string;
    country?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<ApiResponse<User>> {
    return apiClient.patch<User>('/auth/me', data);
  }

  async deleteAccount(): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>('/auth/me');
    if (response.success) {
      await tokenStorage.clear();
    }
    return response;
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

  async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await tokenStorage.get();
      if (!tokens?.accessToken) return false;
      // Consider authenticated if access token is valid OR refresh token exists
      // (apiClient interceptor will auto-refresh on 401)
      if (tokens.expiresAt > Date.now()) return true;
      return !!tokens.refreshToken;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
