import { apiClient } from './client';
import type { OfficerDashboardStats, OfficerAssignmentStats, RequestSummary, UnitOfficer } from './types';

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

  /**
   * Get inbox requests with filtering, sorting and search
   */
  async getInboxRequests(params: {
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    size?: number;
  } = {}): Promise<RequestSummary[]> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('status', params.status || 'all');
    queryParams.append('priority', params.priority || 'all');
    queryParams.append('search', params.search || '');
    queryParams.append('sortBy', params.sortBy || 'createdAt');
    queryParams.append('sortOrder', params.sortOrder || 'desc');
    queryParams.append('page', String(params.page || 0));
    queryParams.append('size', String(params.size || 20));

    const response = await apiClient.get<RequestSummary[]>(`/officer/inbox?${queryParams.toString()}`);
    return response;
  }

  /**
   * Get assignment statistics
   */
  async getAssignmentStats(): Promise<OfficerAssignmentStats> {
    const response = await apiClient.get<OfficerAssignmentStats>('/officer/assignments/stats');
    return response;
  }

  /**
   * Get assigned requests with filtering, sorting and search
   */
  async getAssignedRequests(params: {
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    size?: number;
  } = {}): Promise<RequestSummary[]> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('status', params.status || 'all');
    queryParams.append('priority', params.priority || 'all');
    queryParams.append('search', params.search || '');
    queryParams.append('sortBy', params.sortBy || 'createdAt');
    queryParams.append('sortOrder', params.sortOrder || 'desc');
    queryParams.append('page', String(params.page || 0));
    queryParams.append('size', String(params.size || 20));

    const response = await apiClient.get<RequestSummary[]>(`/officer/assignments?${queryParams.toString()}`);
    return response;
  }

  /**
   * Get officers in the same unit(s)
   */
  async getUnitOfficers(): Promise<UnitOfficer[]> {
    const response = await apiClient.get<UnitOfficer[]>('/officer/unit-officers');
    return response;
  }
}

export const officerService = new OfficerService();
