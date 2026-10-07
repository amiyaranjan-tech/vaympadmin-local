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
  // Vaymp's own discount (%), funded by Vaymp, taken off a product's
  // sellerPrice to get the buyer price. See backend's
  // models/Product.js#computeDerivedFields.
  priceMarginPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  companyName?: string;
  supportEmail?: string;
  address?: string;
  commissionRate?: number;
  priceMarginPercent?: number;
}
