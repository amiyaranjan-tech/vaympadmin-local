import authApi from "@/api/auth.api";
import type { Admin, LoginRequest } from "@/types/auth";

const TOKEN_KEY = "vaymp_token";
const ADMIN_KEY = "vaymp_admin";

class AuthService {
  /**
   * Login
   */
  async login(payload: LoginRequest): Promise<Admin> {
    const response = await authApi.login(payload);

    if (!response.success) {
      throw new Error(response.message);
    }

    const { token, admin } = response.data;

    this.setSession(token, admin);

    return admin;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Ignore API errors
    } finally {
      this.clearSession();
    }
  }

  /**
   * Logged-in Admin Profile
   */
  async getProfile(): Promise<Admin> {
    try {
      const response = await authApi.getProfile();

      if (!response.success) {
        throw new Error(response.message);
      }

      localStorage.setItem(ADMIN_KEY, JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  /**
   * Store Session
   */
  setSession(token: string, admin: Admin): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  }

  /**
   * Stored Admin
   */
  getStoredAdmin(): Admin | null {
    const admin = localStorage.getItem(ADMIN_KEY);

    if (!admin) {
      return null;
    }

    try {
      return JSON.parse(admin) as Admin;
    } catch {
      this.clearSession();
      return null;
    }
  }

  /**
   * JWT Token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Authentication Status
   */
  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  /**
   * Authorization Header
   */
  getAuthHeader() {
    const token = this.getToken();

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }

  /**
   * Clear Session
   */
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  }
}

export default new AuthService();
