import type { ApiResponse } from "../types";

export function success<T>(data: T, message = "Success"): ApiResponse<T> {
  return { success: true, data, message };
}

export function successPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = "Success"
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    message,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function error(message: string, errorDetail?: string): ApiResponse {
  return { success: false, message, error: errorDetail };
}
