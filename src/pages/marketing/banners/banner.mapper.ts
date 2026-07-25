import type {
  BannerImage,
  CreateBannerRequest,
  UpdateBannerRequest,
} from "@/types/banner";

import type { BannerFormValues } from "./banner.schema";

/**
 * ==========================================
 * Common Mapper
 * ==========================================
 */

function buildCommonPayload(
  values: BannerFormValues,
  image: BannerImage,
  thumbnail: BannerImage,
) {
  return {
    name: values.name.trim(),

    description: values.description?.trim() ?? "",

    type: values.type,

    image,
    thumbnail,

    position: values.position,

    priority: values.priority,

    targetType: values.targetType,

    targetId: values.targetId?.trim() ?? "",

    buttonText: values.buttonText?.trim() ?? "",

    offerText: values.offerText?.trim() ?? "",

    backgroundColor: values.backgroundColor?.trim() ?? "",

    tags: values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),

    startDate: values.startDate,

    endDate: values.endDate,

    status: values.status,
  };
}

/**
 * ==========================================
 * Create Payload
 * ==========================================
 */

export function createBannerPayload(
  values: BannerFormValues,
  image: BannerImage,
  thumbnail: BannerImage,
): CreateBannerRequest {
  return buildCommonPayload(values, image, thumbnail);
}

/**
 * ==========================================
 * Update Payload
 * ==========================================
 */

export function updateBannerPayload(
  values: BannerFormValues,
  image: BannerImage,
  thumbnail: BannerImage,
): UpdateBannerRequest {
  return buildCommonPayload(values, image, thumbnail);
}
