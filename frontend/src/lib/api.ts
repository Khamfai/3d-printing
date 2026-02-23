const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth-token");
    if (stored) headers["Authorization"] = `Bearer ${stored}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOpts,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `API Error: ${res.status}`);
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    fetchAPI<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    fetchAPI<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    fetchAPI<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    fetchAPI<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    fetchAPI<T>(endpoint, { ...options, method: "DELETE" }),
};
