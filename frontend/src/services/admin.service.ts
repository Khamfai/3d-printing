import { api } from "@/lib/api";
import type { ApiResponse, DashboardStats } from "@/types";

export const adminAPI = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardStats>>("/api/admin/dashboard"),

  getUsers: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<ApiResponse<Array<Record<string, unknown>>>>(`/api/admin/users${query}`);
  },

  updateUserRole: (userId: string, role: string) =>
    api.patch<ApiResponse<Record<string, unknown>>>(`/api/admin/users/${userId}/role`, { role }),
};
