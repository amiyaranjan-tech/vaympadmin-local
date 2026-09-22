import type { CreateSellerRequest, SellerImage, UpdateSellerRequest } from "@/types/seller";

import type { SellerFormValues } from "./seller.schema";

const emptyImage: SellerImage = { url: "", publicId: "" };

/**
 * ==========================================
 * Common Mapper
 * ==========================================
 */

function buildCommonPayload(
  values: SellerFormValues,
  logo: SellerImage,
  cover: SellerImage,
) {
  return {
    shopName: values.shopName.trim(),

    ownerName: values.ownerName.trim(),

    shopCategory: values.shopCategory?.trim() ?? "",

    email: values.email.trim().toLowerCase(),

    phone: values.phone.trim(),

    address: values.address.trim(),

    city: values.city.trim(),

    gstNumber: values.gstNumber.trim(),

    businessRegistration: values.businessRegistration.trim(),

    description: values.description?.trim() ?? "",

    logo,

    cover,

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
  };
}

/**
 * ==========================================
 * Create Payload
 * ==========================================
 */

export function createSellerPayload(
  values: SellerFormValues,
  logo: SellerImage = emptyImage,
  cover: SellerImage = emptyImage,
): CreateSellerRequest {
  if (!values.password) {
    throw new Error("Password is required");
  }

  return {
    ...buildCommonPayload(values, logo, cover),

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
  logo: SellerImage = emptyImage,
  cover: SellerImage = emptyImage,
): UpdateSellerRequest {
  return {
    ...buildCommonPayload(values, logo, cover),

    ...(values.password
      ? {
          password: values.password,
        }
      : {}),
  };
}
