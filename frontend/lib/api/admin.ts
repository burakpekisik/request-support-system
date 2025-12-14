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

  
}

export const adminService = new AdminService();
