/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface RiderApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

/**
 * ==========================================
 * Rider Status
 * ==========================================
 */

export type RiderStatus = "pending" | "active" | "suspended" | "inactive" | "rejected";

export type VehicleType = "bike" | "scooter" | "cycle";

/**
 * ==========================================
 * Lifecycle Audit
 * ==========================================
 */

export interface PopulatedAdminRef {
  _id: string;
  username: string;
  email?: string;
}

export type AdminRef = PopulatedAdminRef | string | null;

/**
 * ==========================================
 * Rider
 * ==========================================
 */

export interface Rider {
  _id: string;

  name: string;
  email: string;
  phone: string;

  vehicleType: VehicleType;
  vehicleNumber: string;

  isOnline: boolean;

  status: RiderStatus;
  rejectionReason: string;
  isVerified: boolean;
  isDeleted: boolean;

  // Last GPS fix the Rider App reported (PATCH /rider-auth/location) —
  // null fields until the rider's first ping.
  lastLocation?: {
    lat: number | null;
    lng: number | null;
    updatedAt: string | null;
  };

  // Populated only when this rider currently has an order Out for
  // Delivery (see services/rider.service.js#attachActiveDelivery) — null
  // otherwise. Gates the Riders page's "Track" action.
  activeDelivery?: {
    orderId: string;
    orderNumber: string;
  } | null;

  // Lifetime count of orders this rider has marked Delivered.
  totalDeliveries?: number;

  verifiedAt?: string | null;
  verifiedBy?: AdminRef;

  activatedAt?: string | null;
  activatedBy?: AdminRef;

  suspendedAt?: string | null;
  suspendedBy?: AdminRef;

  deactivatedAt?: string | null;
  deactivatedBy?: AdminRef;

  rejectedAt?: string | null;
  rejectedBy?: AdminRef;

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

export interface RiderListResponse {
  items: Rider[];
  pagination: Pagination;
}

/**
 * ==========================================
 * Create Rider
 * ==========================================
 */

export interface CreateRiderRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleNumber?: string;
}

/**
 * ==========================================
 * Status / Verify / Reject Requests
 * ==========================================
 */

export interface RiderStatusRequest {
  status: Extract<RiderStatus, "active" | "suspended" | "inactive">;
}

export interface VerifyRiderRequest {
  isVerified: true;
}

export interface RejectRiderRequest {
  reason: string;
}

/**
 * ==========================================
 * Query Params
 * ==========================================
 */

export interface RiderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: RiderStatus;
  isVerified?: boolean;
}
