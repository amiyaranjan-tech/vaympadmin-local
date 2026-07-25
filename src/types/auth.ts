/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * ==========================================
 * Admin
 * ==========================================
 */

export interface Admin {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  role: "super-admin" | "admin";
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * ==========================================
 * Login
 * ==========================================
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

/**
 * ==========================================
 * Auth State
 * ==========================================
 */

export interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
}

/**
 * ==========================================
 * Auth Context
 * ==========================================
 */

export interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isAuthed: boolean;
  loading: boolean;

  login: (username: string, password: string) => Promise<boolean>;

  logout: () => Promise<void>;

  refreshProfile: () => Promise<void>;
}

/**
 * ==========================================
 * API Error
 * ==========================================
 */

export interface ApiError {
  statusCode?: number;
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]> | string[];
  timestamp?: string;
}
