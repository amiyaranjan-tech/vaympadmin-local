import api from "./axios";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  Admin,
} from "@/types/auth";

/**
 * Authentication API
 */
const authApi = {
  /**
   * Admin Login
   */
  login: async (payload: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      payload,
    );

    return response.data;
  },

  /**
   * Get Logged-in Admin Profile
   */
  getProfile: async (): Promise<ApiResponse<Admin>> => {
    const response = await api.get<ApiResponse<Admin>>("/auth/profile");

    return response.data;
  },

  /**
   * Logout
   */
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>("/auth/logout");

    return response.data;
  },
};

export default authApi;
