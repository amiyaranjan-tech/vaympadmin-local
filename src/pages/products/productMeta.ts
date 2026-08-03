import type { DealType } from "@/types/product";

// Presentational metadata only — the actual enum values are enforced by
// the backend (constants/dealType.js). Mirrors bannerMeta.ts's shape.
// Exactly the 5 supported deal types (see constants/offer.js) — "bogo"
// here is normally set/cleared automatically by the Offer admin CRUD
// (routes/offer.routes.js), not hand-picked per product.

export const DEAL_TYPES: DealType[] = [
  "none",
  "bogo",
  "tier_amount",
  "tier_percentage",
  "free_shipping",
];

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  none: "None",
  bogo: "Buy & Get Free (BOGO)",
  tier_amount: "Tiered — Amount Off",
  tier_percentage: "Tiered — Percentage Off",
  free_shipping: "Free Shipping",
};
