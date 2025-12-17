import { apiClient } from './client';
import { AdminUserChangeStats, UnitOfficer } from './types';


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

  async getAdminStatsPendingRequestChangePercentage(): Promise<AdminUserChangeStats> {
    const response = await apiClient.get<AdminUserChangeStats>('/admin/dashboard/stats/monthly-pending-request-change');
    return response;
  }

  async getAdminRequests(status: string = 'all', unit: string = 'all', page: number = 1, size: number = 10): Promise<any> {
    const response = await apiClient.get<any>(`/admin/requests?status=${status}&unit=${unit}&page=${page}&size=${size}`);
    return response;
  }

  async getAdminUsers(search: string = '', role: string = 'all', page: number = 1, size: number = 10): Promise<any> {
    const response = await apiClient.get<any>(`/admin/users?search=${search}&role=${role}&page=${page}&size=${size}`);
    return response;
  }

  async updateUserRole(userId: number, roleId: number): Promise<any> {
    const response = await apiClient.post<any>(`/admin/users/${userId}/role`, { roleId });
    return response;
  }

  async updateUserUnits(userId: number, unitIds: number[]): Promise<any> {
    const response = await apiClient.post<any>(`/admin/users/${userId}/units`, { unitIds });
    return response;
  }

  async getAllUnits(): Promise<any> {
    const response = await apiClient.get<any>(`/admin/units`);
    return response;
  }

  /**
   * Get officers by unit ID
   */
  async getOfficersByUnit(unitId: number): Promise<UnitOfficer[]> {
    const response = await apiClient.get<UnitOfficer[]>(`/admin/units/${unitId}/officers`);
    return response;
  }
  
  /**
   * Delete a user by ID (admin only)
   */
  async deleteUser(userId: number): Promise<any> {
    console.log("[AdminService] deleteUser called - userId:", userId);
    try {
      const response = await apiClient.delete<any>(`/admin/users/${userId}`);
      console.log("[AdminService] deleteUser response:", response);
      return response;
    } catch (error) {
      console.error("[AdminService] deleteUser error:", error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
