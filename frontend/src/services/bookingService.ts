import apiClient from './api';
import type { Booking } from '@/lib/types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface BookingRequest {
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
}

export const bookingService = {
  async getAll(): Promise<Booking[]> {
    const { data } = await apiClient.get<ApiResponse<Booking[]>>('/bookings');
    return data.data;
  },

  async getById(id: string): Promise<Booking> {
    const { data } = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return data.data;
  },

  async create(request: BookingRequest): Promise<Booking> {
    const { data } = await apiClient.post<ApiResponse<Booking>>('/bookings', request);
    return data.data;
  },

  async approve(id: string): Promise<Booking> {
    const { data } = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/approve`);
    return data.data;
  },

  async reject(id: string, reason: string): Promise<Booking> {
    const { data } = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/reject`, { reason });
    return data.data;
  },

  async cancel(id: string): Promise<Booking> {
    const { data } = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
    return data.data;
  },
};
