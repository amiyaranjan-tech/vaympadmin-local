import type {
  BulkUpsertTieredRequest,
  CreateBogoOfferRequest,
  CreateTierOfferRequest,
  TierRow,
} from "@/types/offer";

import type {
  BogoOfferFormValues,
  TierOfferFormValues,
  TierRowFormValues,
  TierRowsFormValues,
} from "./offer.schema";

/** "" (left blank = uncapped) -> null; a real value -> Number(...). */
function toNullableNumber(value: string | undefined): number | null | undefined {
  if (value === undefined) return undefined;
  if (value.trim() === "") return null;

  return Number(value);
}

/**
 * ==========================================
 * BOGO
 * ==========================================
 */

// A full CreateXRequest already structurally satisfies UpdateXRequest
// (Partial<CreateXRequest>), so one builder covers both create and update
// call sites — the form always has every field populated either way.
export function buildBogoOfferPayload(values: BogoOfferFormValues): CreateBogoOfferRequest {
  return {
    title: values.title.trim(),
    description: values.description?.trim() ?? "",

    seller: values.seller,
    scope: values.scope,
    products: values.scope === "entire_shop" ? [] : values.products,

    buyQuantity: values.buyQuantity,
    getQuantity: values.getQuantity,
    getDiscountPercent: values.getDiscountPercent,

    // "automatic" mode submits an empty pool — the backend's existing
    // same-collection -> category -> shop cascade takes over (see
    // cart.service.js#resolveEligibleFreeProducts); "selected_products"
    // submits exactly the admin-chosen ids, restricting the pool to them.
    freeProductIds: values.freeProductMode === "automatic" ? [] : values.freeProductIds,
    maximumFreeItems: toNullableNumber(values.maximumFreeItems),

    isEnabled: values.isEnabled,
    priority: values.priority,

    bannerImage: values.bannerImage,
    bannerPriority: values.bannerPriority,

    startDate: values.startDate,
    endDate: values.endDate,
  };
}

/**
 * ==========================================
 * Tier Offer (single — "Buy X Amount Get X OFF")
 * ==========================================
 */

export function buildTierOfferPayload(values: TierOfferFormValues): CreateTierOfferRequest {
  return {
    title: values.title.trim(),
    description: values.description?.trim() ?? "",

    type: values.type,
    seller: values.seller,
    scope: values.scope,
    products: values.scope === "entire_shop" ? [] : values.products,

    minSpend: values.minSpend,
    discountAmount: values.discountAmount,
    discountPercent: values.discountPercent,
    maximumDiscount: toNullableNumber(values.maximumDiscount),
    maxUses: toNullableNumber(values.maxUses),

    isEnabled: values.isEnabled,
    priority: values.priority,

    // Optional — omitted entirely (not an empty-url object) when no
    // banner was uploaded, so the backend's optionalImageSchema default
    // takes over rather than persisting a pointless empty object.
    bannerImage: values.bannerImage.url ? values.bannerImage : undefined,
    bannerPriority: toNullableNumber(values.bannerPriority),

    startDate: values.startDate,
    endDate: values.endDate,
  };
}

/**
 * ==========================================
 * Tier Row (bulk Tiered Deals builder)
 * ==========================================
 */

export function buildTierRowPayload(values: TierRowFormValues): TierRow {
  return {
    _id: values._id,

    title: values.title.trim(),
    description: values.description?.trim() ?? "",

    type: values.type,

    minSpend: values.minSpend,
    discountAmount: values.discountAmount,
    discountPercent: values.discountPercent,
    maximumDiscount: toNullableNumber(values.maximumDiscount),
    maxUses: toNullableNumber(values.maxUses),

    isEnabled: values.isEnabled,
    priority: values.priority,

    startDate: values.startDate,
    endDate: values.endDate,
  };
}

/**
 * ==========================================
 * Tiered Deals — Bulk Upsert Envelope
 * ==========================================
 * scope/products are ladder-level (one selection covers every tier row —
 * see offer.schema.ts#tierRowsSchema), submitted once here rather than
 * per-row.
 */

export function buildTierBulkPayload(values: TierRowsFormValues): BulkUpsertTieredRequest {
  return {
    scope: values.scope,
    products: values.scope === "entire_shop" ? [] : values.products,

    // Optional — omitted entirely (not an empty-url object) when no
    // banner was uploaded, same reasoning as buildTierOfferPayload above.
    bannerImage: values.bannerImage.url ? values.bannerImage : undefined,
    bannerPriority: toNullableNumber(values.bannerPriority),

    tiers: values.tiers.map(buildTierRowPayload),
  };
}
