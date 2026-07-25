import type { CreateSellerRequest, UpdateSellerRequest } from "@/types/seller";

import type { SellerFormValues } from "./seller.schema";

/**
 * ==========================================
 * Common Mapper
 * ==========================================
 */

function buildCommonPayload(values: SellerFormValues) {
  return {
    shopName: values.shopName.trim(),

    ownerName: values.ownerName.trim(),

    email: values.email.trim().toLowerCase(),

    phone: values.phone.trim(),

    address: values.address.trim(),

    city: values.city.trim(),

    gstNumber: values.gstNumber.trim(),

    businessRegistration: values.businessRegistration.trim(),

    logo: {
      url: "",
      publicId: "",
    },

    cover: {
      url: "",
      publicId: "",
    },

    workingDays: values.workingDays
      .split(",")
      .map((day) => day.trim())
      .filter(Boolean),

    workingHours: {
      open: values.workingOpen,
      close: values.workingClose,
    },

    bank: {
      accountName: values.accountName.trim(),

      accountNumber: values.accountNumber.trim(),

      ifsc: values.ifsc.trim().toUpperCase(),
    },

    commissionRate: values.commissionRate ? Number(values.commissionRate) : null,

    isVerified: values.isVerified,
  };
}

/**
 * ==========================================
 * Create Payload
 * ==========================================
 */

export function createSellerPayload(
  values: SellerFormValues,
): CreateSellerRequest {
  if (!values.password) {
    throw new Error("Password is required");
  }

  return {
    ...buildCommonPayload(values),

    password: values.password,
  };
}

/**
 * ==========================================
 * Update Payload
 * ==========================================
 */

export function updateSellerPayload(
  values: SellerFormValues,
): UpdateSellerRequest {
  return {
    ...buildCommonPayload(values),

    ...(values.password
      ? {
          password: values.password,
        }
      : {}),
  };
}
