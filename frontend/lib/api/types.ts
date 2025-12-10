// Auth Types
export interface RegisterRequest {
  tcNumber: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface LoginRequest {
  tcNumber: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  tcNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  message: string;
}

// User Types
export interface User {
  id: number;
  tcNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl?: string;
  createdAt: string;
  isActive: boolean;
}