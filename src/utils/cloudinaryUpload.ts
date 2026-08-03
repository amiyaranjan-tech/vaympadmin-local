import uploadApi from "@/api/upload.api";

import type { UploadedImage } from "@/types/upload";

interface UploadOptions {
  folder?: string;
  onProgress?: (percent: number) => void;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

interface CloudinaryErrorResponse {
  error?: { message?: string };
}

/**
 * Uploads a file directly to Cloudinary using a short-lived signature from
 * our own backend (`POST /api/v1/uploads/sign`) — the file bytes never
 * pass through our server. Throws on any failure (no silent fallback);
 * callers must not persist anything but a real result from this function.
 */
export async function uploadImageToCloudinary(
  file: File,
  { folder, onProgress }: UploadOptions = {},
): Promise<UploadedImage> {
  const { data: signature } = await uploadApi.sign({ folder });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);

  return new Promise<UploadedImage>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    );

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let body: CloudinaryUploadResponse & CloudinaryErrorResponse;

      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Cloudinary returned an unexpected response"));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) {
        resolve({ url: body.secure_url, publicId: body.public_id });
        return;
      }

      reject(new Error(body.error?.message || "Image upload failed"));
    };

    xhr.onerror = () => reject(new Error("Image upload failed — check your connection"));

    xhr.send(formData);
  });
}
