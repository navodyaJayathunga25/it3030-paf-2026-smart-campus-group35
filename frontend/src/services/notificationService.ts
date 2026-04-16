import apiClient from './api';
import type { Notification } from '@/lib/types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const { data } = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
    return data.data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return data.data.count;
  },

  async markAsRead(id: string): Promise<Notification> {
    const { data } = await apiClient.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return data.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },
};
