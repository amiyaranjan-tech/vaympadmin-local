/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface DashboardApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

/**
 * ==========================================
 * Counts
 * ==========================================
 */

export interface DashboardCounts {
  sellers: number;
  pendingSellers: number;
  verifiedSellers: number;

  products: number;
  newProducts: number;

  users: number;
  newUsers: number;
  verifiedUsers: number;
}

/**
 * ==========================================
 * Revenue
 * ==========================================
 */

export interface DashboardRevenue {
  total: number;
  commission: number;
  orders: number;
}

/**
 * ==========================================
 * Top Seller
 * ==========================================
 */

export interface DashboardTopSeller {
  _id: string;
  shopName: string;
  city: string;
  revenue: number;
  orders: number;
}

/**
 * ==========================================
 * Recent Seller
 * ==========================================
 */

export interface DashboardRecentSeller {
  _id: string;
  shopName: string;
  ownerName: string;
  city: string;
  status: string;
  createdAt: string;
}

/**
 * ==========================================
 * Recent User
 * ==========================================
 */

export interface DashboardRecentUser {
  _id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

/**
 * ==========================================
 * Recent Product
 * ==========================================
 */

export interface DashboardRecentProduct {
  _id: string;
  name: string;
  brand: string;
  finalPrice: number;
  images: { url: string; publicId: string }[];
  createdAt: string;
}

/**
 * ==========================================
 * Dashboard Stats
 * ==========================================
 */

export interface DashboardStats {
  counts: DashboardCounts;
  revenue: DashboardRevenue;
  topSellers: DashboardTopSeller[];
  recentSellers: DashboardRecentSeller[];
  recentUsers: DashboardRecentUser[];
  recentProducts: DashboardRecentProduct[];
}

/**
 * ==========================================
 * Engagement Analytics (derived from the generic Event log)
 * ==========================================
 */

export interface EngagementTopScreen {
  screen: string;
  views: number;
}

export interface EngagementTopEvent {
  event: string;
  count: number;
}

export interface EngagementAnalytics {
  range: { from: string; to: string };
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  sessionsStarted: number;
  avgActiveDurationMs: number;
  topScreens: EngagementTopScreen[];
  topEvents: EngagementTopEvent[];
}

/**
 * ==========================================
 * Per-User Activity (one calendar day)
 * ==========================================
 */

export interface UserActivityScreen {
  screen: string;
  views: number;
}

export interface UserActivityEntry {
  userId: string;
  name: string;
  phone: string;
  sessionsCount: number;
  totalActiveMs: number;
  firstSeen: string;
  lastSeen: string;
  screensVisited: UserActivityScreen[];
}

/**
 * ==========================================
 * API Error
 * ==========================================
 */

export interface DashboardApiError {
  statusCode?: number;
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]> | string[];
  timestamp?: string;
}
