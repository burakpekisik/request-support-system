import { apiClient } from './client';
import type { RegisterRequest, LoginRequest, AuthResponse, UserData } from './types';
import { storage } from '../storage';

class AuthService {
  private readonly baseUrl = '/auth';

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        `${this.baseUrl}/register`,
        data
      );
      
      this.saveAuthData(response);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        `${this.baseUrl}/login`,
        data
      );
      
      this.saveAuthData(response);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    storage.clearAuth();
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return storage.getToken();
  }

  /**
   * Get stored user data
   */
  getUser(): UserData | null {
    return storage.getUserData();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return storage.isAuthenticated();
  }

  /**
   * Save authentication data to localStorage
   */
  private saveAuthData(response: AuthResponse): void {
    storage.setToken(response.token);
    storage.setUserData({
      id: response.userId,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      tcNumber: response.tcNumber,
      phoneNumber: response.phoneNumber,
      role: response.role,
      avatarUrl: response.avatarUrl,
      unitName: response.unitName,
    });
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unknown error occurred');
  }

  /**
 * Quick token validity check
 */
  async checkToken(): Promise<{ valid: boolean; message: string }> {
    try {
      const response = await apiClient.get<{ valid: boolean; message: string }>('/auth/check');
      return response;
    } catch (error) {
      return { valid: false, message: 'Token is invalid' };
    }
  }
}

// Singleton instance
export const authService = new AuthService();