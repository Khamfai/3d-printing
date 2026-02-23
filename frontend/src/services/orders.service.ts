import { api } from "@/lib/api";
import type { ApiResponse, Order } from "@/types";

export const ordersAPI = {
  create: (data: { items: Array<Record<string, unknown>>; shippingAddress?: Record<string, string>; notes?: string }) =>
    api.post<ApiResponse<Order>>("/api/orders", data),

  getMyOrders: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<ApiResponse<Order[]>>(`/api/orders/my-orders${query}`);
  },

  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/api/orders/${id}`),

  // Admin
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<ApiResponse<Order[]>>(`/api/orders${query}`);
  },

  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, { status }),
};
