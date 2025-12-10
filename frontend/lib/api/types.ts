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
  phoneNumber: string;
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

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  tcNumber: string;
  phoneNumber: string;
  role: string;
}

export interface TokenCheckResponse {
  valid: boolean;
  message: string;
}

// Officer Dashboard Types
export interface OfficerDashboardStats {
  newRequests: number;
  inProgress: number;
  resolvedToday: number;
  transferred: number;
  newRequestsTrend: number;
  resolvedTodayTrend: number;
}

export interface OfficerAssignmentStats {
  totalAssigned: number;
  pendingAction: number;
  resolvedThisWeek: number;
}

export interface RequestSummary {
  id: number;
  title: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  category: string;
  priority: string;
  status: string;
  unitName: string;
  createdAt: string;
  updatedAt: string;
}

// Request Filter Types
export interface RequestFilters {
  status: string;
  priority?: string;
  category?: string;
  search: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description: string;
}