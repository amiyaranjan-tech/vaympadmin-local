/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface ProductApiResponse<T> {
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

export type ProductGender = "men" | "women" | "unisex" | "kids";

// draft -> pending_review -> approved -> published -> archived, with
// "hidden" and "rejected" as side-branches. See the backend's
// constants/productStatus.js for the enforced transition table.
export type ProductStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "published"
  | "hidden"
  | "archived"
  | "rejected";

export type ProductStockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type ProductDiscountFilter = "all" | "on_sale" | "no_discount";

export type ProductDateAddedFilter =
  | "all"
  | "today"
  | "7-days"
  | "30-days"
  | "3-months"
  | "1-year";

// Mirrors the backend's constants/dealType.js — a merchandising label
// shown on the product's deal badge, independent of the isFeatured/
// isTrending/... flags below. "none" means no deal badge at all.
export type DealType =
  | "none"
  | "bogo"
  | "buy2get1"
  | "buy2get_discount"
  | "tiered_amount"
  | "tiered_percentage"
  | "flash_sale"
  | "limited_offer"
  | "clearance"
  | "combo_offer"
  | "free_shipping";

/**
 * ==========================================
 * Image / Variant
 * ==========================================
 */

export interface ProductImage {
  url: string;
  publicId: string;
  alt?: string;
}

export interface ProductVariant {
  size: string;
  color: string;
  sku: string;
  stock: number;
}

/**
 * ==========================================
 * Product
 * ==========================================
 */

export interface Product {
  _id: string;

  name: string;
  description: string;

  brand: string;

  // Taxonomy — Category -> Group -> Subcategory
  // A product may belong to multiple groups within its category;
  // subcategory stays a single value valid for at least one of them.
  category: string;
  group: string[];
  subcategory: string;

  gender: ProductGender;
  tags: string[];

  // Cross-cutting merchandising tag (e.g. "Wedding Collection") —
  // deliberately NOT part of the category/group/subcategory chain.
  productCollection: string;

  seller: string | null;

  costPrice: number;
  sellingPrice: number;
  discountPercent: number;
  finalPrice: number;

  variants: ProductVariant[];
  totalStock: number;
  stockStatus: ProductStockStatus;

  color: string;
  season: string;

  // Which keys are present depends on the subcategory's attribute
  // template (e.g. Running Shoes -> material/occasion/closureType/sole;
  // Shirts -> material/pattern/occasion/sleeveType/neckType/fit).
  attributes: Record<string, string>;

  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isLimitedStock: boolean;
  isBogo: boolean;

  // Product Highlights — Try & Buy eligibility and a merchandising deal
  // type, independent of the flags above. The deal badge shown in the
  // consumer app is generated from dealType alone (no image needed).
  tryAndBuy: boolean;
  dealType: DealType;

  images: ProductImage[];
  video: string;

  status: ProductStatus;
  isDeleted: boolean;

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

export interface ProductListResponse {
  items: Product[];
  pagination: Pagination;
}

/**
 * ==========================================
 * Create Product
 * ==========================================
 */

export interface CreateProductRequest {
  name: string;
  description?: string;

  brand: string;
  category: string;
  group: string[];
  subcategory: string;

  gender?: ProductGender;
  tags?: string[];

  productCollection?: string;

  seller?: string | null;

  costPrice: number;
  sellingPrice: number;
  discountPercent?: number;

  variants?: ProductVariant[];

  color?: string;
  season?: string;
  attributes?: Record<string, string>;

  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isLimitedStock?: boolean;
  isBogo?: boolean;

  tryAndBuy?: boolean;
  dealType?: DealType;

  images?: ProductImage[];
  video?: string;

  status?: ProductStatus;
  isDeleted?: boolean;
}

/**
 * ==========================================
 * Update Product
 * ==========================================
 */

export type UpdateProductRequest = Partial<CreateProductRequest>;

/**
 * ==========================================
 * Product Status Request
 * ==========================================
 */

export interface ProductStatusRequest {
  status: ProductStatus;
}

/**
 * ==========================================
 * Query Params
 * ==========================================
 */

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;

  category?: string;
  group?: string;
  subcategory?: string;
  productCollection?: string;
  seller?: string;
  brand?: string;
  size?: string;
  gender?: ProductGender;
  color?: string;
  material?: string;
  stockStatus?: ProductStockStatus;

  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isLimitedStock?: boolean;
  isBogo?: boolean;

  tryAndBuy?: boolean;
  dealType?: DealType;

  discount?: ProductDiscountFilter;
  minDiscount?: number;

  minPrice?: number;
  maxPrice?: number;

  dateAdded?: ProductDateAddedFilter;

  status?: ProductStatus;
}

/**
 * ==========================================
 * API Error
 * ==========================================
 */

export interface ProductApiError {
  statusCode?: number;
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]> | string[];
  timestamp?: string;
}
