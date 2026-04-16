import apiClient from './api';
import type { Resource } from '@/lib/types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ResourceFilters {
  type?: string;
  status?: string;
  search?: string;
}

interface ResourceRequest {
  name: string;
  type: string;
  capacity?: number;
  location: string;
  description?: string;
  status: string;
  facilities?: string[];
  availabilityWindows?: string;
  allowedRoles?: string[];
}

export const resourceService = {
  async getAll(filters: ResourceFilters = {}): Promise<Resource[]> {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const { data } = await apiClient.get<ApiResponse<Resource[]>>(`/resources?${params}`);
    return data.data;
  },

  async getById(id: string): Promise<Resource> {
    const { data } = await apiClient.get<ApiResponse<Resource>>(`/resources/${id}`);
    return data.data;
  },

  async create(request: ResourceRequest): Promise<Resource> {
    const { data } = await apiClient.post<ApiResponse<Resource>>('/resources', request);
    return data.data;
  },

  async update(id: string, request: ResourceRequest): Promise<Resource> {
    const { data } = await apiClient.put<ApiResponse<Resource>>(`/resources/${id}`, request);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/resources/${id}`);
  },
};
