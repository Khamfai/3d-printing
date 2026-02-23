import { api } from "@/lib/api";
import type { ApiResponse, Model3D } from "@/types";

export const modelsAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<ApiResponse<Model3D[]>>(`/api/models${query}`);
  },

  getFeatured: () =>
    api.get<ApiResponse<Model3D[]>>("/api/models/featured"),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<Model3D>>(`/api/models/${slug}`),

  getMyModels: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<ApiResponse<Model3D[]>>(`/api/models/user/my-models${query}`);
  },

  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Model3D>>("/api/models", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Model3D>>(`/api/models/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/models/${id}`),
};
