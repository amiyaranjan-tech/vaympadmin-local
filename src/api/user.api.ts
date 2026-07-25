import api from "./axios";

import type {
  CreateUserRequest,
  User,
  UserApiResponse,
  UserListResponse,
  UserQueryParams,
  UserStatusRequest,
  UpdateUserRequest,
  VerifyUserRequest,
} from "@/types/user";

/**
 * User API
 */
const userApi = {
  /**
   * ==========================================
   * Get Users
   * ==========================================
   */
  getAll: async (
    params?: UserQueryParams,
  ): Promise<UserApiResponse<UserListResponse>> => {
    const response = await api.get<UserApiResponse<UserListResponse>>(
      "/users",
      {
        params,
      },
    );

    return response.data;
  },

  /**
   * ==========================================
   * Get User By ID
   * ==========================================
   */
  getById: async (id: string): Promise<UserApiResponse<User>> => {
    const response = await api.get<UserApiResponse<User>>(`/users/${id}`);

    return response.data;
  },

  /**
   * ==========================================
   * Create User
   * ==========================================
   */
  create: async (
    payload: CreateUserRequest,
  ): Promise<UserApiResponse<User>> => {
    const response = await api.post<UserApiResponse<User>>(
      "/users",
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Update User
   * ==========================================
   */
  update: async (
    id: string,
    payload: UpdateUserRequest,
  ): Promise<UserApiResponse<User>> => {
    const response = await api.put<UserApiResponse<User>>(
      `/users/${id}`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Delete User
   * ==========================================
   */
  delete: async (id: string): Promise<UserApiResponse<null>> => {
    const response = await api.delete<UserApiResponse<null>>(`/users/${id}`);

    return response.data;
  },

  /**
   * ==========================================
   * Update User Status
   * ==========================================
   */
  updateStatus: async (
    id: string,
    payload: UserStatusRequest,
  ): Promise<UserApiResponse<User>> => {
    const response = await api.patch<UserApiResponse<User>>(
      `/users/${id}/status`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Update User Verification
   * PATCH /users/:id/verify
   * ==========================================
   */
  updateVerification: async (
    id: string,
    payload: VerifyUserRequest,
  ): Promise<UserApiResponse<User>> => {
    const response = await api.patch<UserApiResponse<User>>(
      `/users/${id}/verify`,
      payload,
    );

    return response.data;
  },
};

export default userApi;
