import { apiClient } from './client';
import type { RegisterRequest, LoginRequest, AuthResponse } from './types';

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
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('jwt_token');
  }

  /**
   * Get stored user data
   */
  getUser(): AuthResponse | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user_data');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Save authentication data to localStorage
   */
  private saveAuthData(response: AuthResponse): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('jwt_token', response.token);
    localStorage.setItem('user_data', JSON.stringify(response));
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