/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface SellerApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

/**
 * ==========================================
 * Seller Status
 * ==========================================
 */

export type SellerStatus = "pending" | "active" | "suspended" | "inactive";

export type ShopStatus = "open" | "closed" | "opening_soon" | "closing_soon";

export type ShopStatusMode = "auto" | "manual";

/**
 * ==========================================
 * Seller Brands
 * ==========================================
 *
 * GET /sellers/:id/brands — distinct brand names across every
 * non-deleted product for this seller (any status), with per-brand
 * product counts.
 */

export interface SellerBrand {
  brand: string;
  count: number;
}

/**
 * ==========================================
 * Image
 * ==========================================
 */

export interface SellerImage {
  url: string;
  publicId: string;
}

/**
 * ==========================================
 * Working Hours
 * ==========================================
 */

export interface WorkingHours {
  open: string;
  close: string;
}

/**
 * ==========================================
 * Bank
 * ==========================================
 */

export interface SellerBank {
  accountName: string;
  accountNumber: string;
  ifsc: string;
}

/**
 * ==========================================
 * Lifecycle Audit
 * ==========================================
 */

// Populated on GET /sellers/:id only — a plain string id elsewhere
// (e.g. before population, or if a ref is ever returned unpopulated).
export interface PopulatedAdminRef {
  _id: string;
  username: string;
  email?: string;
}

export type AdminRef = PopulatedAdminRef | string | null;

/**
 * ==========================================
 * Seller
 * ==========================================
 */

export interface Seller {
  _id: string;

  shopName: string;
  ownerName: string;
  shopCategory: string;

  email: string;
  phone: string;

  address: string;
  city: string;

  gstNumber: string;
  businessRegistration: string;

  description: string;

  logo: SellerImage;
  cover: SellerImage;

  workingDays: string[];
  workingHours: WorkingHours;

  bank: SellerBank;

  revenue: number;
  commission: number;
  // Per-seller override (%); null means "use the platform default".
  commissionRate: number | null;
  // Resolved rate actually in effect (override, or platform default).
  effectiveCommissionRate: number;
  orders: number;
  returns: number;
  refunds: number;
  products: number;

  status: SellerStatus;
  shopStatus: ShopStatus;
  shopStatusMode: ShopStatusMode;

  isVerified: boolean;
  isDeleted: boolean;

  // Lifecycle audit — all optional, only set once the corresponding
  // action has actually happened.
  verifiedAt?: string | null;
  verifiedBy?: AdminRef;

  unverifiedAt?: string | null;
  unverifiedBy?: AdminRef;

  activatedAt?: string | null;
  activatedBy?: AdminRef;

  suspendedAt?: string | null;
  suspendedBy?: AdminRef;

  deactivatedAt?: string | null;
  deactivatedBy?: AdminRef;

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
 * Seller List Response
 * ==========================================
 */

export interface SellerListResponse {
  items: Seller[];
  pagination: Pagination;
}

/**
 * ==========================================
 * Create Seller
 * ==========================================
 */

export interface CreateSellerRequest {
  shopName: string;
  ownerName: string;
  shopCategory?: string;

  email: string;
  password: string;

  phone: string;

  address: string;
  city: string;

  gstNumber: string;
  businessRegistration: string;

  description?: string;

  logo?: SellerImage;
  cover?: SellerImage;

  workingDays: string[];
  workingHours: WorkingHours;

  bank: SellerBank;

  commissionRate?: number | null;

  revenue?: number;
  commission?: number;
  orders?: number;
  returns?: number;
  refunds?: number;
  products?: number;

  // status and isVerified are not accepted here — a seller is always
  // created pending/unverified. See SellerStatusRequest /
  // VerifySellerRequest for the dedicated lifecycle actions.
  shopStatus?: ShopStatus;

  isDeleted?: boolean;
}

/**
 * ==========================================
 * Update Seller
 * ==========================================
 */

export interface UpdateSellerRequest {
  shopName?: string;
  ownerName?: string;
  shopCategory?: string;

  email?: string;
  password?: string;

  phone?: string;

  address?: string;
  city?: string;

  gstNumber?: string;
  businessRegistration?: string;

  description?: string;

  logo?: SellerImage;
  cover?: SellerImage;

  workingDays?: string[];
  workingHours?: WorkingHours;

  bank?: SellerBank;

  commissionRate?: number | null;

  revenue?: number;
  commission?: number;
  orders?: number;
  returns?: number;
  refunds?: number;
  products?: number;

  // status and isVerified are not accepted here — see
  // SellerStatusRequest / VerifySellerRequest below.
  shopStatus?: ShopStatus;

  isDeleted?: boolean;
}

/**
 * ==========================================
 * Seller Status Request
 * ==========================================
 */

export interface SellerStatusRequest {
  status: SellerStatus;
}

/**
 * ==========================================
 * Shop Status Request
 * ==========================================
 */

export interface ShopStatusRequest {
  shopStatusMode: ShopStatusMode;
  shopStatus?: ShopStatus;
}

/**
 * ==========================================
 * Seller Verification Request
 * ==========================================
 */

export interface VerifySellerRequest {
  isVerified: boolean;
}

/**
 * ==========================================
 * Query Params
 * ==========================================
 */

export interface SellerQueryParams {
  page?: number;
  limit?: number;
  search?: string;

  status?: SellerStatus;
  city?: string;

  isVerified?: boolean;
}

/**
 * ==========================================
 * API Error
 * ==========================================
 */

export interface SellerApiError {
  statusCode?: number;
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]> | string[];
  timestamp?: string;
}
