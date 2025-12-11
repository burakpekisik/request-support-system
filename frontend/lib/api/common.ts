import { apiClient } from './client';
import type { RequestSummary, Category, Unit, CreateRequest } from './types';

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
}

export const commonService = new CommonService();
