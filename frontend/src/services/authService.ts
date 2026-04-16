import apiClient from "./api";
import type { User } from "@/lib/types";

const TOKEN_KEY = "campus_hub_token";

export const authService = {
  // Store JWT token from OAuth2 callback
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

  // Get current user from backend
  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<{ data: User }>("/auth/me");
    return data.data;
  },

  // Initiate Google OAuth2 login
  loginWithGoogle() {
    window.location.href = "/oauth2/authorization/google";
  },

  // Logout
  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
};
