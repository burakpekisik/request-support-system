import { apiClient } from './client';
import type { RequestSummary, Category, Unit, CreateRequest, RequestDetail, TimelineEntry, AddResponseRequest, AddResponseResult } from './types';

class CommonService {
  /**
   * Get user's own submitted requests with filtering, sorting and search
   * Works for both students and officers
   */
  async getMyRequests(params: {
    status?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    size?: number;
  } = {}): Promise<RequestSummary[]> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('status', params.status || 'all');
    queryParams.append('category', params.category || 'all');
    queryParams.append('search', params.search || '');
    queryParams.append('sortBy', params.sortBy || 'createdAt');
    queryParams.append('sortOrder', params.sortOrder || 'desc');
    queryParams.append('page', String(params.page || 0));
    queryParams.append('size', String(params.size || 20));

    const response = await apiClient.get<RequestSummary[]>(`/my-requests?${queryParams.toString()}`);
    return response;
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories');
    return response;
  }

  /**
   * Get all units
   */
  async getUnits(): Promise<Unit[]> {
    const response = await apiClient.get<Unit[]>('/units');
    return response;
  }

  /**
   * Create new request
   */
  async createRequest(data: CreateRequest, files?: File[]): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('unitId', String(data.unitId));
    formData.append('categoryId', String(data.categoryId));

    // Dosyaları ekle
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await apiClient.postFormData<{ message: string }>('/requests', formData);
    return response;
  }

  /**
   * Get request details by ID
   */
  async getRequestDetail(requestId: number | string): Promise<RequestDetail> {
    const response = await apiClient.get<RequestDetail>(`/requests/${requestId}`);
    return response;
  }

  /**
   * Get timeline/conversation history for a request
   */
  async getTimeline(requestId: number | string): Promise<TimelineEntry[]> {
    const response = await apiClient.get<TimelineEntry[]>(`/requests/${requestId}/timeline`);
    return response;
  }

  /**
   * Add response/comment to a request with optional file attachments
   */
  async addResponse(requestId: number | string, data: AddResponseRequest, files?: File[]): Promise<AddResponseResult> {
    const formData = new FormData();
    formData.append('newStatusId', String(data.newStatusId));
    
    if (data.comment) {
      formData.append('comment', data.comment);
    }

    // Add files if any
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await apiClient.postFormData<AddResponseResult>(`/requests/${requestId}/responses`, formData);
    return response;
  }

  /**
   * Take ownership of a request (assign to current officer)
   */
  async takeOwnership(requestId: number | string): Promise<{ message: string; newStatusId: number }> {
    const response = await apiClient.post<{ message: string; newStatusId: number }>(
      `/requests/${requestId}/take-ownership`,
      {}
    );
    return response;
  }

  /**
   * Mark a request as resolved
   */
  async markAsResolved(requestId: number | string): Promise<{ message: string; newStatusId: number }> {
    const response = await apiClient.post<{ message: string; newStatusId: number }>(
      `/requests/${requestId}/mark-as-resolved`,
      {}
    );
    return response;
  }

  /**
   * Transfer a request to another officer in the same unit
   */
  async transferToOfficer(requestId: number | string, targetOfficerId: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/requests/${requestId}/transfer`,
      { targetOfficerId }
    );
    return response;
  }

  /**
   * Cancel a request
   */
  async cancelRequest(requestId: number | string): Promise<{ message: string; newStatusId: number }> {
    const response = await apiClient.post<{ message: string; newStatusId: number }>(
        `/requests/${requestId}/cancel`,
        {}
    );
    return response;
  }

  /**
   * Update request priority
   */
  async updatePriority(requestId: number | string, priorityId: number): Promise<{ message: string; newPriorityId: number }> {
    const response = await apiClient.put<{ message: string; newPriorityId: number }>(
      `/requests/${requestId}/priority`,
      { priorityId }
    );
    return response;
  }
}

export const commonService = new CommonService();
