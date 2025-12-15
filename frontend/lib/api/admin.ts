import { apiClient } from './client';
import { AdminUserChangeStats } from './types';


class AdminService {
  /**
   * Get admin dashboard statistics
   */
  async getAdminStatsTotalUserCount(): Promise<number> {
    const response = await apiClient.get<{ totalUser: number }>('/admin/dashboard/stats/total-user');
    return response.totalUser;
  }
  async getAdminStatsTotalUserChangePercentage(): Promise<AdminUserChangeStats> {
    const response = await apiClient.get<AdminUserChangeStats>('/admin/dashboard/stats/monthly-user-change');
    return response;
  }

  async getAdminStatsTotalRequest(): Promise<number> {
    const response = await apiClient.get<{totalRequest : number}>('/admin/dashboard/stats/total-request');
    return response.totalRequest;
  }

  async getAdminStatsTotalRequestChangePercentage(): Promise<AdminUserChangeStats> {
    const response = await apiClient.get<AdminUserChangeStats>('/admin/dashboard/stats/monthly-request-change');
    return response;
  }

  async getAdminStatsTotalResolvedRequest(): Promise<number> {
    const response = await apiClient.get<{totalResolvedRequestsThisMonth : number}>('/admin/dashboard/stats/total-resolved-requests-this-month'); 
    return response.totalResolvedRequestsThisMonth;
  }
  
  async getAdminStatsTotalResolvedRequestChangePercentage(): Promise<AdminUserChangeStats> {
    const response = await apiClient.get<AdminUserChangeStats>('/admin/dashboard/stats/monthly-resolved-request-change');
    return response;
  }

  async getAdminStatsTotalPendingRequest(): Promise<number> {
    const response = await apiClient.get<{totalPendingRequest : number}>('/admin/dashboard/stats/pending-requests'); 
    return response.totalPendingRequest;
  }

  async getRequestsByUnit(): Promise<{ unitName: string; requestCount: number }[]> {
    const response = await apiClient.get<{ unitName: string; requestCount: number }[]>('/admin/dashboard/stats/requests-by-unit');
    return response;
  }
  
}

export const adminService = new AdminService();
