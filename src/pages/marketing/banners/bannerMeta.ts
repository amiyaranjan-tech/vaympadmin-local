import type { BannerType, DisplayPosition, TargetType } from "@/types/banner";

// Presentational metadata only — the actual enum values are enforced by
// the backend (constants/banner.js). Kept as ordered arrays + label maps
// so both the form's <Select> options and the list's filter/badge text
// stay in one place.

export const BANNER_TYPES: BannerType[] = [
  "offer",
  "brand_promotion",
  "shop_promotion",
  "category_promotion",
  "collection_promotion",
  "product_promotion",
  "festival",
  "announcement",
  "seasonal",
  "flash_sale",
  "clearance_sale",
  "new_arrival",
  "trending",
];

export const BANNER_TYPE_LABELS: Record<BannerType, string> = {
  offer: "Offer Banner",
  brand_promotion: "Brand Promotion",
  shop_promotion: "Shop Promotion",
  category_promotion: "Category Promotion",
  collection_promotion: "Collection Promotion",
  product_promotion: "Product Promotion",
  festival: "Festival Banner",
  announcement: "Announcement",
  seasonal: "Seasonal Banner",
  flash_sale: "Flash Sale",
  clearance_sale: "Clearance Sale",
  new_arrival: "New Arrival",
  trending: "Trending",
};

export const POSITIONS: DisplayPosition[] = [
  "home_hero",
  "home_secondary",
  "category_page",
  "brand_page",
  "shop_page",
  "offers_page",
  "bottom_banner",
];

export const POSITION_LABELS: Record<DisplayPosition, string> = {
  home_hero: "Home Hero Banner",
  home_secondary: "Home Secondary Banner",
  category_page: "Category Page",
  brand_page: "Brand Page",
  shop_page: "Shop Page",
  offers_page: "Offers Page",
  bottom_banner: "Bottom Banner",
};

export const TARGET_TYPES: TargetType[] = [
  "none",
  "product",
  "category",
  "group",
  "subcategory",
  "collection",
  "brand",
  "seller_shop",
  "custom_url",
  "dynamic_ui",
];

export const TARGET_TYPE_LABELS: Record<TargetType, string> = {
  none: "None",
  product: "Product",
  category: "Category",
  group: "Group",
  subcategory: "Subcategory",
  collection: "Collection",
  brand: "Brand",
  seller_shop: "Seller Shop",
  custom_url: "Custom URL",
  dynamic_ui: "Dynamic UI",
};

// Target types that need a targetId picked — mirrors
// constants/banner.js#TARGET_TYPES_REQUIRING_ID on the backend.
export const TARGET_TYPES_REQUIRING_ID: TargetType[] = TARGET_TYPES.filter(
  (type) => type !== "none" && type !== "dynamic_ui",
);
