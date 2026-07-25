/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface UserApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

/**
 * ==========================================
 * User Status
 * ==========================================
 */

export type UserStatus = "active" | "suspended" | "banned";

export type UserGender = "male" | "female" | "other";

/**
 * ==========================================
 * Image
 * ==========================================
 */

export interface UserImage {
  url: string;
  publicId: string;
}

/**
 * ==========================================
 * Address
 * ==========================================
 */

export interface UserAddress {
  _id?: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

/**
 * ==========================================
 * User
 * ==========================================
 */

export interface User {
  _id: string;

  name: string;
  email: string;
  phone: string;

  gender: UserGender;
  dob: string | null;

  avatar: UserImage;
  addresses: UserAddress[];

  status: UserStatus;

  isVerified: boolean;
  isDeleted: boolean;

  lastLogin: string | null;

  createdAt: string;
  updatedAt: string;
}

/**
 * ==========================================
 * Pagination
 * ==========================================
 */

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * ==========================================
 * User List Response
 * ==========================================
 */

export interface UserListResponse {
  items: User[];
  pagination: Pagination;
}

/**
 * ==========================================
 * Create User
 * ==========================================
 */

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;

  gender?: UserGender;
  dob?: string | null;

  avatar?: UserImage;
  addresses?: UserAddress[];

  status?: UserStatus;

  isVerified?: boolean;
  isDeleted?: boolean;
}

/**
 * ==========================================
 * Update User
 * ==========================================
 */

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;

  gender?: UserGender;
  dob?: string | null;

  avatar?: UserImage;
  addresses?: UserAddress[];

  status?: UserStatus;

  isVerified?: boolean;
  isDeleted?: boolean;
}

/**
 * ==========================================
 * User Status Request
 * ==========================================
 */

export interface UserStatusRequest {
  status: UserStatus;
}

/**
 * ==========================================
 * User Verification Request
 * ==========================================
 */

export interface VerifyUserRequest {
  isVerified: boolean;
}

/**
 * ==========================================
 * Query Params
 * ==========================================
 */

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;

  status?: UserStatus;
  isVerified?: boolean;
}

/**
 * ==========================================
 * API Error
 * ==========================================
 */

export interface UserApiError {
  statusCode?: number;
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]> | string[];
  timestamp?: string;
}
