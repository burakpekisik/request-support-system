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
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  tcNumber: string;
  phoneNumber: string;
  role: string;
  avatarUrl?: string;
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

// Unit Types
export interface Unit {
  id: number;
  name: string;
  description: string;
}

// Create Request Types
export interface CreateRequest {
  title: string;
  description: string;
  unitId: number;
  categoryId: number;
  priorityId?: number; // Optional - will be set by officer
}

// Profile Form Types
export interface ProfileFormData {
  name: string;
  surname: string;
  email: string;
  tc_number: string;
  phone: string;
}

// Request Detail Types
export interface RequestDetail {
  id: number;
  title: string;
  description: string;
  status: string;
  statusId: number;
  statusColor: string;
  unitName: string;
  unitId: number;
  priority: string;
  priorityColor: string;
  priorityId: number;
  category: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
  requesterAvatarUrl?: string;
  assignedOfficerId?: number;
  assignedOfficerName?: string;
}

// Timeline Entry Types
export interface TimelineEntry {
  id: number;
  requestId: number;
  actorId: number;
  actorName: string;
  actorAvatarUrl?: string;
  actorRole: string; // STUDENT, OFFICER, ADMIN
  previousStatusId?: number;
  previousStatus?: string;
  newStatusId: number;
  newStatus: string;
  comment?: string;
  attachments?: TimelineAttachment[];
  createdAt: string;
}

// Timeline Attachment Type (simplified)
export interface TimelineAttachment {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSizeMb: number;
}

// Add Response Request Types
export interface AddResponseRequest {
  newStatusId: number;
  comment?: string;
}

// Attachment Types
export interface Attachment {
  id: number;
  requestId: number;
  uploaderId: number;
  timelineId?: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSizeMb: number;
  createdAt: string;
}

// Add Response Result Types
export interface AddResponseResult {
  message: string;
  timelineId: number;
  attachmentCount: number;
}

export interface AdminUserChangeStats {
  label: string;
  percentage: number;
  isPositive: boolean; 
}