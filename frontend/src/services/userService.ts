import apiClient from './api';
import type { User, UserRole } from '@/lib/types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/users');
    return data.data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  },

  async updateRole(id: string, role: UserRole): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>(`/users/${id}/role`, { role });
    return data.data;
  },

  async updateStatus(id: string, active: boolean): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>(`/users/${id}/status`, { active });
    return data.data;
  },

  async getPending(): Promise<User[]> {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/users/pending');
    return data.data;
  },

  async approve(id: string, role: UserRole): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>(`/users/${id}/approve`, { role });
    return data.data;
  },

  async reject(id: string): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>(`/users/${id}/reject`);
    return data.data;
  },

  async updateMyPicture(picture: string): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>('/users/me/picture', { picture });
    return data.data;
  },
};

export const adminService = {
  async getStats(): Promise<Record<string, number>> {
    const { data } = await apiClient.get<ApiResponse<Record<string, number>>>('/admin/stats');
    return data.data;
  },
};
