import type { UploadedImage } from "@/types/upload";

interface UploadOptions {
  onProgress?: (percent: number) => void;
}

// ponytail: offer banners (BogoOfferForm/TieredDealsForm/SpendThresholdOfferForm)
// skip Cloudinary for now — reads the file locally and hands back a base64
// data URI as `url` instead, stored as-is on the Offer document's
// bannerImage.url (a plain string field, see offer.validation.js). Swap
// back to uploadImageToCloudinary (cloudinaryUpload.ts — still used by the
// marketing BannerForm) once offer banners get real image hosting too.
export async function uploadOfferBannerImage(
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
