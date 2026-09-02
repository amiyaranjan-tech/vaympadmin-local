import type { UploadedImage } from "@/types/upload";

interface UploadOptions {
  onProgress?: (percent: number) => void;
}

// ponytail: every admin image upload (offer/category banners, marketing
// banners, product images, seller images) skips Cloudinary for now — reads
// the file locally and hands back a base64 data URI as `url` instead,
// stored as-is on the plain string url fields. Swap back to
// uploadImageToCloudinary (cloudinaryUpload.ts) once real image hosting is
// wanted again.
export async function uploadImageLocally(
  file: File,
  { onProgress }: UploadOptions = {},
): Promise<UploadedImage> {
  return new Promise<UploadedImage>((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    reader.onload = () => resolve({ url: reader.result as string, publicId: "" });
    reader.onerror = () => reject(new Error("Image upload failed"));

    reader.readAsDataURL(file);
  });
}
