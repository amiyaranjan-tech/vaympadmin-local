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
  // Percentage points shaved off a seller-priced product's own discount
  // when computing the buyer-facing price — the gap between that and the
  // seller's actual payout (sellerPrice) is Vaymp's margin, on top of
  // commissionRate. See backend's models/Product.js#computeDerivedFields.
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
