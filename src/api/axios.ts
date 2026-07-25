import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * API Error Response
 */
interface ApiError {
  statusCode?: number;
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]> | string[];
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach JWT Token to every request
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("vaymp_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError<ApiError>) => Promise.reject(error),
);

/**
 * Handle API Responses
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("vaymp_token");
      localStorage.removeItem("vaymp_admin");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Optional: Log API errors during development
    if (import.meta.env.DEV) {
      console.error("API Error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url,
      });
    }

    // Surface the backend's actual error message instead of Axios's generic
    // "Request failed with status code ..." string.
    const backendMessage = error.response?.data?.message;

    return Promise.reject(
      backendMessage ? new Error(backendMessage) : error,
    );
  },
);

export default api;
