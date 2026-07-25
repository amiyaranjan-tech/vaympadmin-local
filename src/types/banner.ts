/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface BannerApiResponse<T> {
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
 */

export type BannerType =
  | "offer"
  | "brand_promotion"
  | "shop_promotion"
  | "category_promotion"
  | "collection_promotion"
  | "product_promotion"
  | "festival"
  | "announcement"
  | "seasonal"
  | "flash_sale"
  | "clearance_sale"
  | "new_arrival"
  | "trending";

export type DisplayPosition =
  | "home_hero"
  | "home_secondary"
  | "category_page"
  | "brand_page"
  | "shop_page"
  | "offers_page"
  | "bottom_banner";

export type TargetType =
  | "none"
  | "product"
  | "category"
  | "group"
  | "subcategory"
  | "collection"
  | "brand"
  | "seller_shop"
  | "custom_url"
  | "dynamic_ui";

// Admin-set intent only — "scheduled"/"expired" are computed server-side
// (Banner.computeEffectiveStatus) and only ever appear as `effectiveStatus`.
export type BannerStatus = "draft" | "published" | "hidden" | "inactive";

export type EffectiveStatus = BannerStatus | "scheduled" | "expired";

export type BannerActiveFilter = "all" | "active" | "scheduled" | "expired";

export type BannerSort =
  | "priority"
  | "createdAt"
  | "views"
  | "clicks"
  | "startDate"
  | "endDate";

/**
 * ==========================================
 * Image
 * ==========================================
 */

export interface BannerImage {
  url: string;
  publicId: string;
}

/**
 * ==========================================
 * Banner
 * ==========================================
 */

export interface Banner {
  _id: string;

  name: string;
  description: string;

  type: BannerType;

  image: BannerImage;
  thumbnail: BannerImage;

  position: DisplayPosition;
  priority: number;

  targetType: TargetType;
  targetId: string;

  buttonText: string;
  offerText: string;
  backgroundColor: string;
  tags: string[];

  startDate: string;
  endDate: string;

  status: BannerStatus;
  // Server-computed — never sent on create/update payloads.
  effectiveStatus: EffectiveStatus;

  views: number;
  clicks: number;
  // Server-computed (clicks / views * 100, rounded to 2dp).
  ctr: number;

  createdBy: string | null;
  updatedBy: string | null;

  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}

/**
 * ==========================================
 * Pagination
 * ==========================================
 */

export interface BannerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BannerListResponse {
  items: Banner[];
  pagination: BannerPagination;
}

/**
 * ==========================================
 * Create Banner
 * ==========================================
 */

export interface CreateBannerRequest {
  name: string;
  description?: string;

  type: BannerType;

  image: BannerImage;
  thumbnail?: BannerImage;

  position: DisplayPosition;
  priority?: number;

  targetType?: TargetType;
  targetId?: string;

  buttonText?: string;
  offerText?: string;
  backgroundColor?: string;
  tags?: string[];

  startDate: string;
  endDate: string;

  status?: BannerStatus;
}

/**
 * ==========================================
 * Update Banner
 * ==========================================
 */

export type UpdateBannerRequest = Partial<CreateBannerRequest>;

/**
 * ==========================================
 * Banner Status Request
 * ==========================================
 */

export interface BannerStatusRequest {
  status: BannerStatus;
}

/**
 * ==========================================
 * Query Params
 * ==========================================
 */

export interface BannerQueryParams {
  page?: number;
  limit?: number;
  search?: string;

  position?: DisplayPosition;
  type?: BannerType;
  status?: BannerStatus;
  activeFilter?: BannerActiveFilter;

  sort?: BannerSort;
}

/**
 * ==========================================
 * API Error
 * ==========================================
 */

export interface BannerApiError {
  statusCode?: number;
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]> | string[];
  timestamp?: string;
}
