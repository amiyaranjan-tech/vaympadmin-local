import type { CreateRiderRequest } from "@/types/rider";
import type { RiderFormValues } from "./rider.schema";

export function createRiderPayload(values: RiderFormValues): CreateRiderRequest {
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
    phone: values.phone.trim(),
    vehicleType: values.vehicleType,
    vehicleNumber: values.vehicleNumber?.trim() || "",
  };
}
