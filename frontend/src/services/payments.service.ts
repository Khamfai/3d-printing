import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

export const paymentsAPI = {
  createIntent: (orderId: string) =>
    api.post<ApiResponse<{ clientSecret: string; paymentIntentId: string }>>(
      "/api/payments/create-intent",
      { orderId }
    ),
};
