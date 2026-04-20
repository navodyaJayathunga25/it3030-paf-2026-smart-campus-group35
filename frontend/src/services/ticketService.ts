import apiClient from './api';
import type { Ticket, Comment, TicketPriority, TicketStatus } from '@/lib/types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface TicketRequest {
  resourceId?: string;
  location: string;
  category: string;
  description: string;
  priority: TicketPriority;
  contactEmail: string;
  contactPhone?: string;
  attachmentUrls?: string[];
}

export const ticketService = {
  async getAll(): Promise<Ticket[]> {
    const { data } = await apiClient.get<ApiResponse<Ticket[]>>('/tickets');
    return data.data;
  },

  async getById(id: string): Promise<Ticket> {
    const { data } = await apiClient.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return data.data;
  },

  async create(request: TicketRequest): Promise<Ticket> {
    const { data } = await apiClient.post<ApiResponse<Ticket>>('/tickets', request);
    return data.data;
  },

  async updateStatus(id: string, status: TicketStatus, notes?: string): Promise<Ticket> {
    const { data } = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}/status`, { status, notes });
    return data.data;
  },

  async assignTechnician(id: string, technicianId: string): Promise<Ticket> {
    const { data } = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}/assign`, { reason: technicianId });
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tickets/${id}`);
  },

  // Comments
  async getComments(ticketId: string): Promise<Comment[]> {
    const { data } = await apiClient.get<ApiResponse<Comment[]>>(`/tickets/${ticketId}/comments`);
    return data.data;
  },

  async addComment(ticketId: string, content: string): Promise<Comment> {
    const { data } = await apiClient.post<ApiResponse<Comment>>(`/tickets/${ticketId}/comments`, { content });
    return data.data;
  },

  async updateComment(ticketId: string, commentId: string, content: string): Promise<Comment> {
    const { data } = await apiClient.put<ApiResponse<Comment>>(
      `/tickets/${ticketId}/comments/${commentId}`,
      { content }
    );
    return data.data;
  },

  async deleteComment(ticketId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/tickets/${ticketId}/comments/${commentId}`);
  },
};
