import type { UserData } from './api/types';

// Storage Keys
export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  USER_DATA: 'user_data',
} as const;

/**
 * LocalStorage utility functions with SSR safety
 */
export const storage = {
  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  },

  /**
   * Save JWT token to localStorage
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
  },

  /**
   * Get user data from localStorage
   */
  getUserData(): UserData | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!data) return null;
    
    try {
      return JSON.parse(data) as UserData;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  },

  /**
   * Save user data to localStorage
   */
  setUserData(userData: UserData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },

  /**
   * Clear all auth data from localStorage
   */
  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },
};
