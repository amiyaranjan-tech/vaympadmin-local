import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Required"),
  description: z.string().min(10, "At least 10 chars"),
  brand: z.string().min(1, "Required"),

  // Taxonomy — Category -> Group -> Subcategory
  category: z.string().min(1, "Required"),
  group: z.string().min(1, "Required"),
  subcategory: z.string().min(1, "Required"),

  gender: z.enum(["men", "women", "unisex", "kids"]),
  tags: z.string(),

  // Cross-cutting merchandising tag — independent of the taxonomy chain.
  productCollection: z.string().optional().or(z.literal("")),

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

  video: z.string().optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productSchema>;
