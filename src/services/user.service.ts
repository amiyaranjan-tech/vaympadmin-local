import userApi from "@/api/user.api";

import type {
  CreateUserRequest,
  User,
  UserApiResponse,
  UserListResponse,
  UserQueryParams,
  UserStatus,
  UpdateUserRequest,
  VerifyUserRequest,
} from "@/types/user";

class UserService {
  /**
   * ==========================================
   * Handle API Response
   * ==========================================
   */

  private handleResponse<T>(response: UserApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  /**
   * ==========================================
   * Get All Users
   * ==========================================
   */

  async getAll(params?: UserQueryParams): Promise<UserListResponse> {
    const response = await userApi.getAll(params);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Get User By Id
   * ==========================================
   */

  async getById(id: string): Promise<User> {
    const response = await userApi.getById(id);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Create User
   * ==========================================
   */

  async create(payload: CreateUserRequest): Promise<User> {
    const response = await userApi.create(payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update User
   * ==========================================
   */

  async update(id: string, payload: UpdateUserRequest): Promise<User> {
    const response = await userApi.update(id, payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Delete User
   * ==========================================
   */

  async delete(id: string): Promise<void> {
    const response = await userApi.delete(id);

    this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update User Status
   * ==========================================
   */

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const response = await userApi.updateStatus(id, {
      status,
    });

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update User Verification
   * ==========================================
   */

  async updateVerification(
    id: string,
    payload: VerifyUserRequest,
  ): Promise<User> {
    const response = await userApi.updateVerification(id, payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Activate User
   * ==========================================
   */

  activate(id: string): Promise<User> {
    return this.updateStatus(id, "active");
  }

  /**
   * ==========================================
   * Suspend User
   * ==========================================
   */

  suspend(id: string): Promise<User> {
    return this.updateStatus(id, "suspended");
  }

  /**
   * ==========================================
   * Ban User
   * ==========================================
   */

  ban(id: string): Promise<User> {
    return this.updateStatus(id, "banned");
  }

  /**
   * ==========================================
   * Verify User
   * ==========================================
   */

  verify(id: string): Promise<User> {
    return this.updateVerification(id, {
      isVerified: true,
    });
  }

  /**
   * ==========================================
   * Remove Verification
   * ==========================================
   */

  unverify(id: string): Promise<User> {
    return this.updateVerification(id, {
      isVerified: false,
    });
  }

  /**
   * ==========================================
   * Search Users
   * ==========================================
   */

  search(search: string): Promise<UserListResponse> {
    return this.getAll({
      search,
    });
  }
}

export default new UserService();
