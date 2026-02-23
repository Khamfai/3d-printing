import { api } from "@/lib/api";
import type { ApiResponse, PriceEstimate, PricingRule } from "@/types";

export const pricingAPI = {
  estimate: (data: {
    modelId?: string;
    volumeCm3?: number;
    materialId: string;
    quality?: string;
    infillPercent?: number;
    quantity?: number;
  }) => api.post<ApiResponse<PriceEstimate>>("/api/pricing/estimate", data),

  getRules: () =>
    api.get<ApiResponse<PricingRule[]>>("/api/pricing/rules"),

  createRule: (data: Record<string, unknown>) =>
    api.post<ApiResponse<PricingRule>>("/api/pricing/rules", data),

  updateRule: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<PricingRule>>(`/api/pricing/rules/${id}`, data),

  deleteRule: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/pricing/rules/${id}`),
};
