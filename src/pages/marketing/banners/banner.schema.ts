import { z } from "zod";

import { TARGET_TYPES_REQUIRING_ID } from "./bannerMeta";

const targetTypeEnum = z.enum([
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
]);

export const bannerSchema = z
  .object({
    name: z.string().min(2, "Required"),
    description: z.string().optional().or(z.literal("")),

    type: z.enum([
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
    ]),

    position: z.enum([
      "home_hero",
      "home_secondary",
      "category_page",
      "brand_page",
      "shop_page",
      "offers_page",
      "bottom_banner",
    ]),

    priority: z.coerce.number().int().default(0),

    targetType: targetTypeEnum,
    // Required-ness depends on targetType — enforced below via
    // superRefine (mirrors the backend's Joi.when conditional).
    targetId: z.string().optional().or(z.literal("")),

    buttonText: z.string().optional().or(z.literal("")),
    offerText: z.string().optional().or(z.literal("")),
    backgroundColor: z.string().optional().or(z.literal("")),
    tags: z.string(),

    startDate: z.string().min(1, "Required"),
    endDate: z.string().min(1, "Required"),

    status: z.enum(["draft", "published", "hidden", "inactive"]),
  })
  .superRefine((values, ctx) => {
    const needsTarget = (TARGET_TYPES_REQUIRING_ID as string[]).includes(
      values.targetType,
    );

    if (needsTarget && !values.targetId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetId"],
        message:
          values.targetType === "custom_url"
            ? "A URL is required for Custom URL banners"
            : "Please select a target",
      });
    }

    if (values.targetType === "custom_url" && values.targetId) {
      try {
        void new URL(values.targetId);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetId"],
          message: "Must be a valid URL",
        });
      }
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

export type BannerFormValues = z.infer<typeof bannerSchema>;
