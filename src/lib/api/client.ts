import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, AUTH_ROUTES } from "./config";
import { TokenManager } from "./token";

/**
 * Axios client with automatic token injection and silent refresh.
 *
 * Improvements over the original Request class:
 * 1. Uses Axios interceptors — cleaner than manual retry wrappers.
 * 2. Queues concurrent requests during a token refresh (prevents duplicate refreshes).
 * 3. Full TypeScript generics for type-safe responses.
 * 4. Centralised error handling with typed error responses.
 * 5. Auto-logout on refresh failure.
 */

// ------------------------------------------------------------------
// Axios instance
// ------------------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

// ------------------------------------------------------------------
// Token-refresh queue
// ------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
};

// ------------------------------------------------------------------
// Request interceptor — attach access token
// ------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------------------------------------------
// Response interceptor — handle 401 / 403 with silent refresh
// ------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on auth errors, and only once per request
    const isAuthError =
      error.response?.status === 401 || error.response?.status === 403;

    if (!isAuthError || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        originalRequest._retry = true;
        return apiClient(originalRequest);
      });
    }

    // Start refresh flow
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      const { data } = await axios.post(
        `${API_BASE_URL}${AUTH_ROUTES.REFRESH_TOKEN}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newAccessToken: string = data.accessToken;
      const newRefreshToken: string = data.refreshToken;

      TokenManager.setTokens({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      // Retry queued requests
      processQueue(null, newAccessToken);

      // Retry the original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Clear tokens and redirect to login
      TokenManager.clearTokens();
      console.error("Session expired — redirecting to login");
      window.location.href = "/auth";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ------------------------------------------------------------------
// Public API — typed convenience methods
// ------------------------------------------------------------------
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

const Request = {
  async get<T = unknown>(url: string, params?: Record<string, unknown>) {
    const res = await apiClient.get<T>(url, { params });
    return res.data;
  },

  async post<T = unknown>(
    url: string,
    payload?: unknown,
    config?: AxiosRequestConfig
  ) {
    const res = await apiClient.post<T>(url, payload, config);
    return res.data;
  },

  async put<T = unknown>(
    url: string,
    payload?: unknown,
    config?: AxiosRequestConfig
  ) {
    const res = await apiClient.put<T>(url, payload, config);
    return res.data;
  },

  async patch<T = unknown>(
    url: string,
    payload?: unknown,
    config?: AxiosRequestConfig
  ) {
    const res = await apiClient.patch<T>(url, payload, config);
    return res.data;
  },

  async delete<T = unknown>(url: string, params?: Record<string, unknown>) {
    const res = await apiClient.delete<T>(url, { params });
    return res.data;
  },
};

export { apiClient };
export default Request;
