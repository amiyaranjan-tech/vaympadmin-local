/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface OfferApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

/**
 * ==========================================
 * Enums
 * ==========================================
 * Exactly the 5 supported deal types (see backend constants/offer.js):
 * "bogo" (also covers "Buy 2 Get 2" via buyQuantity/getQuantity),
 * "tier_amount"/"tier_percentage"/"free_shipping" cover both the simple
 * "Buy X Amount Get X OFF" single-offer form and full per-shop Tiered
 * Deals — same Offer shape either way.
 */

export type OfferType = "bogo" | "tier_amount" | "tier_percentage" | "free_shipping";

export const TIER_OFFER_TYPES: OfferType[] = ["tier_amount", "tier_percentage", "free_shipping"];

/**
 * ==========================================
 * Product / Seller Preview (populated on Offer reads)
 * ==========================================
 */

export interface OfferProductPreview {
  _id: string;
  name: string;
  images: { url: string; publicId: string }[];
  sellingPrice: number;
  finalPrice: number;
  dealType: string;
}

export interface OfferSellerPreview {
  _id: string;
  shopName: string;
  logo: { url: string; publicId: string };
}

// Same {url, publicId} shape as UploadedImage (types/upload.ts) — a real
// Cloudinary upload result, reused as-is rather than a duplicate type.
export interface OfferBannerImage {
  url: string;
  publicId: string;
}

// "entire_shop": every eligible product currently belonging to `seller`
// participates dynamically. "selected_products": only `products` (or, for
// free-product pool, `freeProductIds`) participate. Mirrors the backend's
// exact enum values (models/Offer.js) — do not introduce a different label.
export type OfferScope = "entire_shop" | "selected_products";

/**
 * ==========================================
 * Offer
 * ==========================================
 */

export interface Offer {
  _id: string;

  title: string;
  description: string;

  type: OfferType;

  // Shop targeting — required for bogo (ONE BOGO OFFER = ONE SHOP) and for
  // shop-scoped tier offers; null only for a catalog-wide tier offer.
  // `scope`/`products` are shared by both bogo and tier: "entire_shop"
  // means every eligible product from `seller` participates dynamically,
  // "selected_products" restricts to exactly `products`.
  seller: OfferSellerPreview | string | null;
  scope: OfferScope;
  products: OfferProductPreview[] | string[];

  // bogo only
  buyQuantity: number;
  getQuantity: number;
  getDiscountPercent: number;
  freeProductIds: OfferProductPreview[] | string[];
  maximumFreeItems: number | null;

  // Promotional banner — required for bogo, optional for tier offers (see
  // backend models/Offer.js). Same field, same ordering mechanism either way.
  bannerImage: OfferBannerImage;
  // UI banner-carousel position (1 = first) — NOT `priority` below, which
  // is deal-conflict resolution. Null when this offer has no banner.
  bannerPriority: number | null;

  // tier types only
  minSpend: number;
  discountAmount: number;
  discountPercent: number;
  maximumDiscount: number | null;

  // usage cap (tier types)
  maxUses: number | null;
  usedCount: number;

  isEnabled: boolean;
  startDate: string;
  endDate: string;
  // Deal-conflict resolution only (which executable offer wins on a
  // matching product/cart line) — see `bannerPriority` above for the
  // separate, UI-only banner-ordering concept.
  priority: number;

  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}

/**
 * ==========================================
 * Banner Priorities (admin — duplicate-avoidance UX)
 * ==========================================
 */

export interface BannerPriorityEntry {
  _id: string;
  title: string;
  type: OfferType;
  bannerPriority: number;
}

/**
 * ==========================================
 * Pagination
 * ==========================================
 */

export interface OfferPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OfferListResponse {
  items: Offer[];
  pagination: OfferPagination;
}

/**
 * ==========================================
 * Create / Update — BOGO
 * ==========================================
 */

export interface CreateBogoOfferRequest {
  title: string;
  description?: string;
  seller: string;
  scope: OfferScope;
  products: string[];
  buyQuantity?: number;
  getQuantity?: number;
  getDiscountPercent?: number;
  freeProductIds?: string[];
  maximumFreeItems?: number | null;
  isEnabled?: boolean;
  priority?: number;
  bannerImage: OfferBannerImage;
  bannerPriority: number;
  startDate: string;
  endDate: string;
}

export type UpdateBogoOfferRequest = Partial<CreateBogoOfferRequest>;

/**
 * ==========================================
 * Create / Update — Tier Offer
 * ==========================================
 */

export interface CreateTierOfferRequest {
  title: string;
  description?: string;
  type: Extract<OfferType, "tier_amount" | "tier_percentage" | "free_shipping">;
  seller: string;
  scope: OfferScope;
  products: string[];
  minSpend: number;
  discountAmount?: number;
  discountPercent?: number;
  maximumDiscount?: number | null;
  maxUses?: number | null;
  isEnabled?: boolean;
  priority?: number;
  // Optional — a tier offer works fine with no promotional banner at all.
  bannerImage?: OfferBannerImage;
  bannerPriority?: number | null;
  startDate: string;
  endDate: string;
}

export type UpdateTierOfferRequest = Partial<CreateTierOfferRequest>;

/**
 * ==========================================
 * Tiered Deals — Bulk Upsert By Seller
 * ==========================================
 */

export interface TierRow {
  _id?: string;
  title: string;
  description?: string;
  type: Extract<OfferType, "tier_amount" | "tier_percentage" | "free_shipping">;
  minSpend: number;
  discountAmount?: number;
  discountPercent?: number;
  maximumDiscount?: number | null;
  maxUses?: number | null;
  isEnabled?: boolean;
  priority?: number;
  startDate: string;
  endDate: string;
}

export interface BulkUpsertTieredRequest {
  // Ladder-level setting — one selection covers every tier row below (see
  // backend offer.service.js#bulkUpsertTiered), never reconfigured per tier.
  scope: OfferScope;
  products: string[];
  // One optional promotional banner for the WHOLE ladder, not per tier —
  // the backend stores it on exactly one underlying Offer document, never
  // duplicated across rows (see offer.service.js#bulkUpsertTiered).
  bannerImage?: OfferBannerImage;
  bannerPriority?: number | null;
  tiers: TierRow[];
}

/**
 * ==========================================
 * Status Toggle
 * ==========================================
 */

export interface OfferStatusRequest {
  isEnabled: boolean;
}

/**
 * ==========================================
 * Query Params
 * ==========================================
 */

export interface OfferQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: OfferType;
  seller?: string;
  isEnabled?: boolean;
  sort?: "priority" | "createdAt";
}
