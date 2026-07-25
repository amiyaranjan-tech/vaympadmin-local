import { z } from "zod";

export const sellerSchema = z.object({
  shopName: z.string().min(2, "Shop name is required"),

  ownerName: z.string().min(2, "Owner name is required"),

  email: z.string().email("Invalid email"),

  password: z
    .string()
    .min(8, "Minimum 8 characters")
    .optional()
    .or(z.literal("")),

  phone: z.string().min(10, "Invalid phone"),

  address: z.string().min(3, "Address is required"),

  city: z.string().min(2, "City is required"),

  gstNumber: z.string().min(5, "GST Number is required"),

  businessRegistration: z.string().min(3, "Business Registration is required"),

  workingDays: z.string().min(2, "Working days required"),

  workingOpen: z.string().min(1, "Opening time required"),

  workingClose: z.string().min(1, "Closing time required"),

  accountName: z.string().min(2, "Required"),

  accountNumber: z.string().min(6, "Required"),

  ifsc: z.string().min(5, "Required"),

  /**
   * Per-seller commission rate override (%). Empty means "use the
   * platform default" — kept as a raw string here since it's bound to a
   * text input; converted to number|null in the mapper.
   */
  commissionRate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || (Number(v) >= 0 && Number(v) <= 100),
      "Must be between 0 and 100",
    ),

  /**
   * Admin Verification
   */
  isVerified: z.boolean().default(false),
});

export type SellerFormValues = z.infer<typeof sellerSchema>;
