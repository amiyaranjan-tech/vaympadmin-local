import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Required"),
  description: z.string().min(10, "At least 10 chars"),
  brand: z.string().min(1, "Required"),

  // Taxonomy — Gender -> Category -> Subcategory
  category: z.string().min(1, "Required"),
  subcategory: z.string().min(1, "Required"),

  gender: z.enum(["men", "women", "unisex", "kids"]),
  tags: z.string(),

  // Merchandising — optional, independent of taxonomy. Internally still
  // `group` (matches the backend field); labeled "Collections" in the UI.
  group: z.array(z.string()).default([]),

  seller: z.string().min(1, "Please select a shop"),

  sellingPrice: z.coerce.number().positive("Must be > 0"),
  costPrice: z.coerce.number().positive("Must be > 0"),
  discountPercent: z.coerce.number().min(0).max(100),

  variants: z
    .array(
      z.object({
        size: z.string().min(1, "Required"),
        color: z.string().optional().or(z.literal("")),
        sku: z.string().optional().or(z.literal("")),
        stock: z.coerce.number().min(0),
      }),
    )
    .min(1, "At least 1 variant"),

  color: z.string().min(1, "Required"),
  season: z.string().min(1, "Required"),

  // Which keys are valid depends on the selected subcategory's attribute
  // template (loaded dynamically) — enforced server-side; kept permissive
  // here since Zod can't express a cross-field DB lookup.
  attributes: z.record(z.string()),

  isFeatured: z.boolean(),
  isTrending: z.boolean(),
  isNewArrival: z.boolean(),
  isLimitedStock: z.boolean(),
  isBogo: z.boolean(),

  // Product Highlights
  tryAndBuy: z.boolean(),
  dealType: z.enum(["none", "bogo", "tier_amount", "tier_percentage", "free_shipping"]),

  video: z.string().optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productSchema>;
