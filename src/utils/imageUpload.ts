import uploadApi from "@/api/upload.api";

import type { UploadedImage } from "@/types/upload";

interface UploadOptions {
  onProgress?: (percent: number) => void;
}

/**
 * Uploads a file to our backend (`POST /api/v1/uploads`), which stores it
 * in ImageKit and returns the real hosted URL — used by every form that
 * uploads an image.
 */
export async function uploadImage(
  file: File,
  { onProgress }: UploadOptions = {},
): Promise<UploadedImage> {
  const { data } = await uploadApi.create(file, onProgress);
  return data;
}
