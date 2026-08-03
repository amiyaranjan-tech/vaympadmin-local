import { z } from "zod";

/**
 * ==========================================
 * BOGO / "Buy & Get Free" Offer
 * ==========================================
 * Covers classic BOGO (buyQuantity 1 / getQuantity 1) and "Buy 2 Get 2"
 * (buyQuantity 2 / getQuantity 2) — same shape, admin just picks the
 * numbers (mirrors the backend's validations/offer.validation.js).
 */

// Same enum values as the backend (models/Offer.js#scope) — do not rename.
const offerScope = z.enum(["entire_shop", "selected_products"]);

// Up to 5 optional banners — for "bogo" they show on THIS offer's own
// card in the shop's "Deals at this Shop" carousel; for a tier ladder,
// the whole campaign's set (see tierRowsSchema below). Array order IS
// display priority (index 0 = first); slot 0 also doubles as the site-
// wide Home/Deals promotional-carousel image when present.
const shopBannersSchema = z
  .array(
    z.object({
      url: z.string(),
      publicId: z.string(),
      caption: z.string().max(120).default(""),
    }),
  )
  .max(5)
  .default([]);

export const bogoOfferSchema = z
  .object({
    title: z.string().min(2, "Required"),
    description: z.string().optional().or(z.literal("")),

    // ONE BOGO OFFER = ONE SHOP — required, selected before anything else.
    seller: z.string().min(1, "Select a shop"),
    scope: offerScope.default("selected_products"),
    products: z.array(z.string()).default([]),

    buyQuantity: z.coerce.number().int().min(1).default(1),
    getQuantity: z.coerce.number().int().min(1).default(1),
    getDiscountPercent: z.coerce.number().min(0).max(100).default(100),

    // Admin always picks the free-item pool explicitly — no more
    // "automatic same-collection -> category -> shop cascade" mode.
    freeProductIds: z.array(z.string()).default([]),
    // Kept as a raw string ("" = uncapped) rather than z.coerce.number() —
    // Number("") is 0, not NaN, so a coerced-number union would silently
    // turn "leave blank for uncapped" into a real cap of 0. Converted to
    // number|null in offer.mapper.ts instead.
    maximumFreeItems: z.string().optional().or(z.literal("")),

    isEnabled: z.boolean().default(true),
    // Deal-conflict resolution — also doubles as the site-wide
    // promotional-carousel ordering (see backend models/Offer.js#priority).
    priority: z.coerce.number().int().default(0),

    shopBanners: shopBannersSchema,

    startDate: z.string().min(1, "Required"),
    endDate: z.string().min(1, "Required"),
  })
  .superRefine((values, ctx) => {
    if (values.scope === "selected_products" && values.products.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["products"],
        message: "Select at least one qualifying product",
      });
    }

    if (values.freeProductIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["freeProductIds"],
        message: "Select at least one free product",
      });
    }

    if (values.startDate && values.endDate) {
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);

      if (!(end > start)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date must be after start date",
        });
      }
    }
  });

export type BogoOfferFormValues = z.infer<typeof bogoOfferSchema>;

/**
 * ==========================================
 * Tier Offer (tier_amount / tier_percentage / free_shipping)
 * ==========================================
 * One shape for both the simple "Buy X Amount Get X OFF" single-offer
 * form (always type "tier_amount") and each row inside the Tiered Deals
 * builder.
 */

const tierOfferBaseSchema = z.object({
  title: z.string().min(2, "Required"),
  description: z.string().optional().or(z.literal("")),

  type: z.enum(["tier_amount", "tier_percentage", "free_shipping"]),

  seller: z.string().min(1, "Required"),
  scope: offerScope.default("entire_shop"),
  products: z.array(z.string()).default([]),

  minSpend: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).default(0),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  // Raw strings ("" = uncapped) for the same reason as
  // bogoOfferSchema.maximumFreeItems above — converted in offer.mapper.ts.
  maximumDiscount: z.string().optional().or(z.literal("")),
  maxUses: z.string().optional().or(z.literal("")),

  isEnabled: z.boolean().default(true),
  // Deal-conflict resolution — also doubles as the site-wide
  // promotional-carousel ordering (see backend models/Offer.js#priority).
  priority: z.coerce.number().int().default(0),

  // Optional — unlike bogo, a tier offer works fine with no shop banners
  // at all.
  shopBanners: shopBannersSchema,

  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
});

// Shared per-row rule set — applied once for the single-offer form
// (superRefine below) and once per row for the bulk Tiered Deals builder
// (see tierRowsSchema), so both stay in sync with the backend's
// validations/offer.validation.js `discountAmount`/`discountPercent`
// when/otherwise pair.
function checkTierRules(
  values: { type: string; discountAmount: number; discountPercent: number; startDate: string; endDate: string },
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
) {
  if (values.type === "tier_amount" && !(values.discountAmount > 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [...pathPrefix, "discountAmount"],
      message: "Discount amount must be greater than 0",
    });
  }

  if (values.type === "tier_percentage" && !(values.discountPercent > 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [...pathPrefix, "discountPercent"],
      message: "Discount percent must be greater than 0",
    });
  }

  if (values.startDate && values.endDate) {
    const start = new Date(values.startDate);
    const end = new Date(values.endDate);

    if (!(end > start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [...pathPrefix, "endDate"],
        message: "End date must be after start date",
      });
    }
  }
}

// Shared with tierRowsSchema's ladder-level scope/products below — same
// rule as bogoOfferSchema's: "selected_products" requires at least one
// qualifying product, checked wherever scope/products actually live.
function checkTargetingRules(
  values: { scope: string; products: string[] },
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
) {
  if (values.scope === "selected_products" && values.products.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [...pathPrefix, "products"],
      message: "Select at least one qualifying product",
    });
  }
}

export const tierOfferSchema = tierOfferBaseSchema.superRefine((values, ctx) => {
  checkTierRules(values, ctx);
  checkTargetingRules(values, ctx);
});

export type TierOfferFormValues = z.infer<typeof tierOfferSchema>;

/**
 * ==========================================
 * Tier Row (inside the per-shop Tiered Deals builder)
 * ==========================================
 * Same as tierOfferSchema, minus `seller`/`scope`/`products`/`shopBanners`
 * (see tierRowsSchema below — these are ladder-level settings, one
 * selection covers every row, never reconfigured per tier) and with an
 * optional `_id` marking an existing Offer to update in place.
 */

export const tierRowSchema = tierOfferBaseSchema
  .omit({ seller: true, scope: true, products: true, shopBanners: true })
  .extend({
    _id: z.string().optional(),
  });

export type TierRowFormValues = z.infer<typeof tierRowSchema>;

export const tierRowsSchema = z
  .object({
    scope: offerScope.default("entire_shop"),
    products: z.array(z.string()).default([]),
    // One optional banner set for the whole ladder, not per tier — same
    // shape/reasoning as tierOfferBaseSchema's shopBanners above, just
    // ladder-level here (see offer.mapper.ts#buildTierBulkPayload).
    shopBanners: shopBannersSchema,
    tiers: z.array(tierRowSchema).min(1, "Add at least one tier"),
  })
  .superRefine((values, ctx) => {
    checkTargetingRules(values, ctx);

    values.tiers.forEach((tier, index) => {
      checkTierRules(tier, ctx, ["tiers", index]);
    });
  });

export type TierRowsFormValues = z.infer<typeof tierRowsSchema>;
