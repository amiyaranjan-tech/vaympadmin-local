/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface OrderApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

/**
 * ==========================================
 * Order Status
 * ==========================================
 * Mirrors models/Order.js's own `status` enum — this app doesn't model
 * intermediate states like "packed"/"confirmed" at the order level, only
 * per-shop (see OrderShop.sellerStatus below).
 */

export type OrderStatus = "Out for Delivery" | "Delivered" | "Cancelled";

export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderSellerStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

/**
 * ==========================================
 * Order Item
 * ==========================================
 */

export interface OrderItem {
  productName: string;
  brand: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

/**
 * ==========================================
 * Order Shop
 * ==========================================
 * A multi-seller order has one of these per shop — its own fulfilment
 * status, independent of the order-wide `status` above.
 */

export interface OrderShop {
  sellerId: string | null;
  shopName: string;
  shopLogo: string;
  shopTotal: number;
  sellerStatus: OrderSellerStatus;
  courier: string;
  trackingNumber: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string;
}

/**
 * ==========================================
 * Timeline
 * ==========================================
 */

export interface OrderTimelineEvent {
  label: string;
  date: string;
}

/**
 * ==========================================
 * Order
 * ==========================================
 */

export interface Order {
  _id: string;
  orderNumber: string;

  customerName: string;
  customerEmail: string;
  customerPhone: string;

  shops: OrderShop[];
  items: OrderItem[];

  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  // Platform's cut — computed from each shop's effective commission
  // rate, never stored on the order itself.
  commission: number;

  paymentMethod: string;
  paymentStatus: OrderPaymentStatus;
  status: OrderStatus;

  timeline: OrderTimelineEvent[];

  createdAt: string;
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
 * Order List Response
 * ==========================================
 */

export interface OrderListResponse {
  items: Order[];
  pagination: Pagination;
}

/**
 * ==========================================
 * Query Params
 * ==========================================
 */

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;

  status?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  sellerId?: string;
}

/**
 * ==========================================
 * API Error
 * ==========================================
 */

export interface OrderApiError {
  statusCode?: number;
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]> | string[];
  timestamp?: string;
}
