import { apiClient } from './client';
import type { OfficerDashboardStats, RequestSummary } from './types';

class OfficerService {
  /**
   * Get officer dashboard statistics
   */
  async getDashboardStats(): Promise<OfficerDashboardStats> {
    const response = await apiClient.get<OfficerDashboardStats>('/officer/dashboard/stats');
    return response;
  }

  /**
   * Get recent inbox requests
   */
  async getRecentInboxRequests(limit: number = 5): Promise<RequestSummary[]> {
    const response = await apiClient.get<RequestSummary[]>(`/officer/inbox/recent?limit=${limit}`);
    return response;
  }

  /**
   * Get in-progress requests
   */
  async getInProgressRequests(limit: number = 10): Promise<RequestSummary[]> {
    const response = await apiClient.get<RequestSummary[]>(`/officer/requests/in-progress?limit=${limit}`);
    return response;
  }
}

export const officerService = new OfficerService();
