import apiClient from "./api";
import type { User } from "@/lib/types";

const TOKEN_KEY = "campus_hub_token";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  department?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  storeToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<{ data: User }>("/auth/me");
    return data.data;
  },

  loginWithGoogle() {
    window.location.href = "/oauth2/authorization/google";
  },

  async register(payload: RegisterPayload): Promise<string> {
    const { data } = await apiClient.post<{ message: string }>(
      "/auth/register",
      payload,
    );
    return data.message;
  },

  async verifyEmail(token: string): Promise<string> {
    const { data } = await apiClient.get<{ message: string }>(
      "/auth/verify-email",
      { params: { token } },
    );
    return data.message;
  },

  async loginWithEmail(payload: LoginPayload): Promise<{ token: string; user: User }> {
    const { data } = await apiClient.post<{ data: { token: string; user: User } }>(
      "/auth/login",
      payload,
    );
    localStorage.setItem(TOKEN_KEY, data.data.token);
    return data.data;
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
};
