import uploadApi from "@/api/upload.api";

import type { UploadedImage } from "@/types/upload";

interface UploadOptions {
  onProgress?: (percent: number) => void;
}

/**
 * Uploads a file to our backend (`POST /api/v1/uploads`), which stores it
 * in ImageKit and returns the real hosted URL — used by banner/category
 * banner forms. Other forms still use uploadImageLocally's base64 stopgap;
 * see localImageUpload.ts.
 */
export async function uploadImage(
  file: File,
  { onProgress }: UploadOptions = {},
): Promise<UploadedImage> {
  const { data } = await uploadApi.create(file, onProgress);
  return data;
}
