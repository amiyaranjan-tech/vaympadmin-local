import { z } from "zod";

export const riderSchema = z.object({
  name: z.string().min(2, "Name is required"),

  email: z.string().email("Invalid email"),

  password: z.string().min(8, "Minimum 8 characters"),

  phone: z.string().min(10, "Invalid phone"),

  vehicleType: z.enum(["bike", "scooter", "cycle"], {
    required_error: "Vehicle type is required",
  }),

  vehicleNumber: z.string().optional().or(z.literal("")),
});

export type RiderFormValues = z.infer<typeof riderSchema>;
