/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface NotificationApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

export type NotificationPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";
export type BroadcastStatus = "PENDING" | "SENDING" | "SENT" | "PARTIAL" | "FAILED";
export type AudienceType = "ALL_CONSUMERS" | "SPECIFIC_CONSUMER" | "SELECTED_CONSUMERS";

/**
 * ==========================================
 * Admin's own operational inbox
 * (ADMIN_NEW_ORDER, ADMIN_LOW_STOCK, ...)
 * ==========================================
 */

export interface AdminNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  priority: NotificationPriority;
  status: NotificationStatus;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResult {
  items: AdminNotification[];
  total: number;
  page: number;
  limit: number;
}

/**
 * ==========================================
 * Consumer broadcasts — the "compose and send" flow
 * ==========================================
 */

export interface NotificationAudience {
  type: AudienceType;
  userId?: string;
  userIds?: string[];
}

export interface NotificationBroadcast {
  _id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  audience: NotificationAudience;
  createdBy: string;
  status: BroadcastStatus;
  targetCount: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

export interface BroadcastListResult {
  items: NotificationBroadcast[];
  total: number;
  page: number;
  limit: number;
}

export interface BroadcastStats {
  totalBroadcasts: number;
  totalTargeted: number;
  totalSuccess: number;
  totalFailed: number;
}

export interface CreateBroadcastPayload {
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  audience: NotificationAudience;
}

// Every consumer-broadcastable type — kept in sync with the backend's
// constants/notification.js by convention (separate repos), same as
// analytics.ts's own MAX_BATCH_SIZE comment on the mobile side.
export const BROADCAST_TYPES = [
  "NEW_DEAL",
  "NEW_SHOP_ONBOARDED",
  "COUPON_AVAILABLE",
  "DEAL_ENDING_SOON",
  "MARKETING_CAMPAIGN",
  "GENERAL_ANNOUNCEMENT",
] as const;
