import axios from "axios";
import { getAPIBaseURL } from "@/lib/config";

const TOKEN_KEY = "campus_hub_token";

function resolveApiBaseUrl(): string {
  const configured = getAPIBaseURL();

  // Keep relative proxy mode in dev and avoid duplicating /api.
  if (!configured || configured === "/") {
    return "/api";
  }

  // Legacy template fallback points to 127.0.0.1:8000, but this project backend runs on 8080.
  if (
    configured.includes("127.0.0.1:8000") ||
    configured.includes("localhost:8000")
  ) {
    return "http://localhost:8080/api";
  }

  return configured.endsWith("/api")
    ? configured
    : `${configured.replace(/\/$/, "")}/api`;
}

const apiClient = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = resolveApiBaseUrl();
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
