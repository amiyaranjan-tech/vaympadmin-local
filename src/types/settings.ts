/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface SettingsApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

/**
 * ==========================================
 * Platform Settings
 * ==========================================
 */

export interface PlatformSettings {
  _id: string;
  companyName: string;
  supportEmail: string;
  address: string;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  companyName?: string;
  supportEmail?: string;
  address?: string;
  commissionRate?: number;
}
