import type { UploadedImage } from "@/types/upload";

interface UploadOptions {
  onProgress?: (percent: number) => void;
}

// ponytail: deal/offer forms still skip real hosting — reads the file
// locally and hands back a base64 data URI as `url` instead, stored as-is
// on the plain string url fields. Marketing banners, category banners, and
// product images now upload for real (see imageUpload.ts); swap these
// remaining callers over the same way once wanted.
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
