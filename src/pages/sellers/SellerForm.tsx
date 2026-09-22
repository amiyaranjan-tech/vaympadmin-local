import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import useSellers from "@/hooks/useSellers";
import { uploadImage } from "@/utils/imageUpload";

import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { SellerImage } from "@/types/seller";

import SellerBasicForm from "./SellerBasicForm";
import { SellerFormValues, sellerSchema } from "./seller.schema";
import { createSellerPayload, updateSellerPayload } from "./seller.mapper";

const emptyImage: SellerImage = { url: "", publicId: "" };

export default function SellerForm() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = Boolean(id);

  const { getSeller, createSeller, updateSeller } = useSellers();

  const [loadingSeller, setLoadingSeller] = useState(isEdit);
  const [logo, setLogo] = useState<SellerImage>(emptyImage);
  const [cover, setCover] = useState<SellerImage>(emptyImage);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [draggingField, setDraggingField] = useState<"logo" | "cover" | null>(null);

  /**
   * ==========================================
   * React Hook Form
   * ==========================================
   */

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),

    defaultValues: {
      shopName: "",
      ownerName: "",
      shopCategory: "",
      email: "",
      password: "",

      phone: "",

      address: "",
      city: "",

      gstNumber: "",
      businessRegistration: "",

      description: "",

      workingDays: "Mon,Tue,Wed,Thu,Fri",

      workingOpen: "09:00",
      workingClose: "18:00",

      accountName: "",
      accountNumber: "",
      ifsc: "",

      commissionRate: "",
    },
  });

  /**
   * ==========================================
   * Load Seller (Edit)
   * ==========================================
   */

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadSeller = async () => {
      try {
        setLoadingSeller(true);

        const seller = await getSeller(id);

        form.reset({
          shopName: seller.shopName,

          ownerName: seller.ownerName,

          shopCategory: seller.shopCategory ?? "",

          email: seller.email,

          password: "",

          phone: seller.phone,

          address: seller.address,

          city: seller.city,

          gstNumber: seller.gstNumber,

          businessRegistration: seller.businessRegistration,

          description: seller.description ?? "",

          workingDays: seller.workingDays.join(","),

          workingOpen: seller.workingHours.open,

          workingClose: seller.workingHours.close,

          accountName: seller.bank.accountName,

          accountNumber: seller.bank.accountNumber,

          ifsc: seller.bank.ifsc,

          commissionRate:
            seller.commissionRate === null ? "" : String(seller.commissionRate),
        });

        setLogo(seller.logo ?? emptyImage);
        setCover(seller.cover ?? emptyImage);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load seller",
        );

        navigate("/sellers");
      } finally {
        setLoadingSeller(false);
      }
    };

    void loadSeller();
  }, [id, form, getSeller, navigate]);

  /**
   * ==========================================
   * Loading Screen
   * ==========================================
   */

  if (loadingSeller) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /**
   * ==========================================
   * Submit Handler
   * (Continue in Part 2)
   * ==========================================
   */
const onSubmit = async (values: SellerFormValues) => {
  try {
    if (isEdit && id) {
      await updateSeller(id, updateSellerPayload(values, logo, cover));
    } else {
      await createSeller(createSellerPayload(values, logo, cover));
    }

    navigate("/sellers");
  } catch {
    // useSellers already surfaces a toast for create/update failures.
  }
};

const handleAssetUpload = async (
  files: FileList | null,
  kind: "logo" | "cover",
) => {
  const file = files?.[0];
  if (!file) return;

  const setImage = kind === "logo" ? setLogo : setCover;
  const setUploading = kind === "logo" ? setUploadingLogo : setUploadingCover;

  setUploading(true);

  try {
    setImage(await uploadImage(file));
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Image upload failed");
  } finally {
    setUploading(false);
  }
};

const dragHandlers = (kind: "logo" | "cover") => ({
  onDragOver: (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingField(kind);
  },
  onDragLeave: () => setDraggingField(null),
  onDrop: (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingField(null);
    void handleAssetUpload(e.dataTransfer.files, kind);
  },
  onPaste: (e: React.ClipboardEvent) => {
    void handleAssetUpload(e.clipboardData.files, kind);
  },
});

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Seller" : "Add Seller"}
        description={
          isEdit
            ? "Manage seller information. Verification and status are managed from the seller list or details page."
            : "Manage seller information. The seller starts as pending and must be verified before it goes live."
        }
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-3"
      >
        <SellerBasicForm form={form} existing={isEdit} />

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Brand Assets</div>

          <div className="space-y-4">
            <label
              tabIndex={0}
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border p-6 transition hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                draggingField === "logo" && "ring-2 ring-primary ring-inset",
              )}
              {...dragHandlers("logo")}
            >
              {logo.url ? (
                <img
                  src={logo.url}
                  alt="Logo"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
              )}

              {(uploadingLogo || !logo.url) && (
                <div
                  className={
                    logo.url
                      ? "absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white"
                      : "flex flex-col items-center"
                  }
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="text-sm font-medium">
                        {draggingField === "logo" ? "Drop to upload" : "Upload Logo"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PNG / JPG — drag & drop or paste
                      </div>
                    </>
                  )}
                </div>
              )}

              {logo.url && !uploadingLogo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition hover:bg-black/40 hover:text-white">
                  <span className="text-xs font-medium">Replace</span>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingLogo}
                onChange={(e) => void handleAssetUpload(e.target.files, "logo")}
              />
            </label>

            <label
              tabIndex={0}
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border p-6 transition hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                draggingField === "cover" && "ring-2 ring-primary ring-inset",
              )}
              {...dragHandlers("cover")}
            >
              {cover.url ? (
                <img
                  src={cover.url}
                  alt="Cover"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
              )}

              {(uploadingCover || !cover.url) && (
                <div
                  className={
                    cover.url
                      ? "absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white"
                      : "flex flex-col items-center"
                  }
                >
                  {uploadingCover ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="text-sm font-medium">
                        {draggingField === "cover" ? "Drop to upload" : "Upload Cover"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Wide Banner — drag & drop or paste
                      </div>
                    </>
                  )}
                </div>
              )}

              {cover.url && !uploadingCover && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition hover:bg-black/40 hover:text-white">
                  <span className="text-xs font-medium">Replace</span>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingCover}
                onChange={(e) => void handleAssetUpload(e.target.files, "cover")}
              />
            </label>
          </div>
        </Card>

        <div className="flex justify-end gap-3 lg:col-span-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate("/sellers")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="rounded-xl"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Seller"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}