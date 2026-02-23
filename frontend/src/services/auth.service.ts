import { api } from "@/lib/api";
import type { ApiResponse, User } from "@/types";

export const authAPI = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>("/api/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string; refreshToken: string }>>("/api/auth/login", data),

  getProfile: () =>
    api.get<ApiResponse<User>>("/api/auth/me"),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ token: string }>>("/api/auth/refresh", { refreshToken }),
};
