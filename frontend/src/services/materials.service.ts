import { api } from "@/lib/api";
import type { ApiResponse, Material } from "@/types";

export const materialsAPI = {
  getActive: () =>
    api.get<ApiResponse<Material[]>>("/api/materials"),

  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<ApiResponse<Material[]>>(`/api/materials/all${query}`);
  },

  getById: (id: string) =>
    api.get<ApiResponse<Material>>(`/api/materials/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Material>>("/api/materials", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Material>>(`/api/materials/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/materials/${id}`),
};
