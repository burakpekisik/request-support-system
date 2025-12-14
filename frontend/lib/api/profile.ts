import { apiClient } from './client';

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
  message: string;
}

export const profileService = {
  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    await apiClient.put('/profile', data);
  },

  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<AvatarUploadResponse>('/profile/avatar', formData);
  },
};
