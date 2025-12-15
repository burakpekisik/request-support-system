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
    console.log("Resolved Requests This Month:", response.totalResolvedRequestsThisMonth);
    return response.totalResolvedRequestsThisMonth;
  }  
  
}

export const adminService = new AdminService();
