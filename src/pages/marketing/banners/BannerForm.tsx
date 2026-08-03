import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, ChevronRight, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { cn } from "@/lib/utils";

import useBanners from "@/hooks/useBanners";
import useProducts from "@/hooks/useProducts";
import useSellers from "@/hooks/useSellers";
import useDropdownOptions from "@/hooks/useDropdownOptions";
import type { BannerImage } from "@/types/banner";

import { uploadImageToCloudinary } from "@/utils/cloudinaryUpload";

import { bannerSchema, BannerFormValues as Form } from "./banner.schema";
import { createBannerPayload, updateBannerPayload } from "./banner.mapper";
import { TargetPicker } from "./TargetPicker";
import {
  BANNER_TYPES,
  BANNER_TYPE_LABELS,
  POSITIONS,
  POSITION_LABELS,
  TARGET_TYPES,
  TARGET_TYPE_LABELS,
} from "./bannerMeta";
import { STATUS_LABELS } from "./bannerStatus";

const STEPS = [
  "Basics",
  "Media",
  "Placement & Targeting",
  "CTA & Style",
  "Schedule & Status",
  "Preview",
];

/**
 * ==========================================
 * Image Upload State
 * ==========================================
 * `image` is the only value that ever gets submitted — it's set once,
 * atomically, from either an edit-mode load or a *successful* Cloudinary
 * upload. `previewUrl` is purely visual (a local blob URL while a real
 * upload is in flight); it never leaks into the submit payload.
 */
interface ImageUploadState {
  image: BannerImage;
  previewUrl: string;
  status: "idle" | "uploading" | "error";
  error: string | null;
  progress: number;
}

const EMPTY_IMAGE_STATE: ImageUploadState = {
  image: { url: "", publicId: "" },
  previewUrl: "",
  status: "idle",
  error: null,
  progress: 0,
};

export default function BannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { getBanner, createBanner, updateBanner } = useBanners();
  const { options, addOption } = useDropdownOptions();

  const [loadingBanner, setLoadingBanner] = useState(isEdit);
  const [step, setStep] = useState(0);
  const [imageState, setImageState] = useState<ImageUploadState>(EMPTY_IMAGE_STATE);
  const [thumbnailState, setThumbnailState] = useState<ImageUploadState>(EMPTY_IMAGE_STATE);
  const [targetSearch, setTargetSearch] = useState("");

  const form = useForm<Form>({
    resolver: zodResolver(bannerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      type: "offer",
      position: "home_hero",
      priority: 0,
      targetType: "none",
      targetId: "",
      buttonText: "",
      offerText: "",
      backgroundColor: "",
      tags: "",
      startDate: "",
      endDate: "",
      status: "draft",
    },
  });

  const targetType = form.watch("targetType");
  const targetId = form.watch("targetId") ?? "";

  /**
   * ==========================================
   * Target Option Sources
   * ==========================================
   * Product/Seller Shop targets search a live, paginated list; the rest
   * pick from the same taxonomy data the Product form uses.
   */

  const { products: targetProducts, fetchProducts: fetchTargetProducts } =
    useProducts({ limit: 20 });

  const { sellers: targetSellers, fetchSellers: fetchTargetSellers } =
    useSellers({ limit: 20 });

  useEffect(() => {
    setTargetSearch("");
  }, [targetType]);

  useEffect(() => {
    if (targetType !== "product" && targetType !== "seller_shop") {
      return;
    }

    const timeout = setTimeout(() => {
      if (targetType === "product") {
        void fetchTargetProducts({ search: targetSearch, limit: 20 }, false);
      } else {
        void fetchTargetSellers({ search: targetSearch, limit: 20 }, false);
      }
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetSearch]);

  const targetProductOptions = useMemo(
    () =>
      targetProducts.map((product) => ({
        id: product._id,
        label: product.name,
        sublabel: product.brand,
      })),
    [targetProducts],
  );

  const targetSellerOptions = useMemo(
    () =>
      targetSellers.map((seller) => ({
        id: seller._id,
        label: seller.shopName,
        sublabel: seller.city,
      })),
    [targetSellers],
  );

  /**
   * ==========================================
   * Load Banner (Edit)
   * ==========================================
   */

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadBanner = async () => {
      try {
        setLoadingBanner(true);

        const banner = await getBanner(id);

        form.reset({
          name: banner.name,
          description: banner.description,
          type: banner.type,
          position: banner.position,
          priority: banner.priority,
          targetType: banner.targetType,
          targetId: banner.targetId,
          buttonText: banner.buttonText,
          offerText: banner.offerText,
          backgroundColor: banner.backgroundColor,
          tags: banner.tags.join(", "),
          startDate: banner.startDate.slice(0, 10),
          endDate: banner.endDate.slice(0, 10),
          status: banner.status,
        });

        setImageState({
          image: banner.image,
          previewUrl: banner.image.url,
          status: "idle",
          error: null,
          progress: 0,
        });
        setThumbnailState({
          image: banner.thumbnail,
          previewUrl: banner.thumbnail.url,
          status: "idle",
          error: null,
          progress: 0,
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load banner",
        );

        navigate("/marketing/banners");
      } finally {
        setLoadingBanner(false);
      }
    };

    void loadBanner();
  }, [id, form, getBanner, navigate]);

  const stepFields: Record<number, (keyof Form)[]> = {
    0: ["name", "description", "type"],
    1: [],
    2: ["position", "priority", "targetType", "targetId"],
    3: [],
    4: ["startDate", "endDate", "status"],
    5: [],
  };

  const next = async () => {
    const ok = await form.trigger(stepFields[step]);

    if (!ok) {
      toast.error("Please fix the errors");
      return;
    }

    if (step === 1) {
      if (imageState.status === "uploading") {
        toast.error("Please wait for the image to finish uploading");
        return;
      }

      if (!imageState.image.url) {
        toast.error("A banner image is required");
        return;
      }
    }

    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const onSubmit = async (values: Form) => {
    if (imageState.status === "uploading") {
      toast.error("Please wait for the image to finish uploading");
      setStep(1);
      return;
    }

    if (!imageState.image.url) {
      toast.error("A banner image is required");
      setStep(1);
      return;
    }

    try {
      if (isEdit && id) {
        await updateBanner(
          id,
          updateBannerPayload(values, imageState.image, thumbnailState.image),
        );
      } else {
        await createBanner(
          createBannerPayload(values, imageState.image, thumbnailState.image),
        );
      }

      navigate("/marketing/banners");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  const handleImageFile = async (
    files: FileList | null,
    kind: "image" | "thumbnail",
  ) => {
    const file = files?.[0];

    if (!file) return;

    const setState = kind === "image" ? setImageState : setThumbnailState;
    const previewUrl = URL.createObjectURL(file);

    setState((prev) => ({
      ...prev,
      previewUrl,
      status: "uploading",
      error: null,
      progress: 0,
    }));

    try {
      const uploaded = await uploadImageToCloudinary(file, {
        folder: `vaymp/banners/${kind}`,
        onProgress: (progress) => setState((prev) => ({ ...prev, progress })),
      });

      setState({
        image: uploaded,
        previewUrl: uploaded.url,
        status: "idle",
        error: null,
        progress: 100,
      });

      toast.success(kind === "image" ? "Image uploaded" : "Thumbnail uploaded");
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      }));

      toast.error(
        error instanceof Error ? error.message : "Image upload failed",
      );
    }
  };

  if (loadingBanner) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit banner" : "New banner"}
        description="Six focused steps to publish a banner."
      />

      <div className="flex items-center gap-2 overflow-x-auto">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition",
              i === step
                ? "border-primary bg-primary text-primary-foreground"
                : i < step
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground",
            )}
          >
            {i < step ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-current/20 text-[10px]">
                {i + 1}
              </span>
            )}
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-2xl p-6 shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {/* ========================================== */}
              {/* Step 0 — Basics */}
              {/* ========================================== */}
              {step === 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Banner Name</Label>
                    <Input {...form.register("name")} />
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Subtitle</Label>
                    <Textarea rows={3} {...form.register("description")} />
                    {form.formState.errors.description && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Banner Type</Label>
                    <Select
                      value={form.watch("type")}
                      onValueChange={(v) => form.setValue("type", v as Form["type"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BANNER_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {BANNER_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* Step 1 — Media */}
              {/* ========================================== */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Mobile Banner Image (required)</Label>

                    <label
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 hover:bg-muted/40",
                        imageState.status === "uploading"
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer",
                      )}
                    >
                      {imageState.status === "uploading" ? (
                        <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                      )}
                      <div className="text-sm font-medium">
                        {imageState.status === "uploading"
                          ? `Uploading… ${imageState.progress}%`
                          : imageState.image.url
                            ? "Replace image"
                            : "Upload image"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Recommended 3:2 or 16:9
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={imageState.status === "uploading"}
                        onChange={(e) => void handleImageFile(e.target.files, "image")}
                      />
                    </label>

                    {imageState.error && (
                      <p className="flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {imageState.error}
                      </p>
                    )}

                    {(imageState.previewUrl || imageState.image.url) && (
                      <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-xl bg-muted">
                        <img
                          src={imageState.previewUrl || imageState.image.url}
                          className="h-full w-full object-cover"
                          alt="Banner preview"
                        />
                        {imageState.status === "uploading" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Thumbnail (optional)</Label>

                    <label
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 hover:bg-muted/40",
                        thumbnailState.status === "uploading"
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer",
                      )}
                    >
                      {thumbnailState.status === "uploading" ? (
                        <Loader2 className="mb-2 h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="text-xs font-medium">
                        {thumbnailState.status === "uploading"
                          ? `Uploading… ${thumbnailState.progress}%`
                          : "Upload thumbnail"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={thumbnailState.status === "uploading"}
                        onChange={(e) => void handleImageFile(e.target.files, "thumbnail")}
                      />
                    </label>

                    {thumbnailState.error && (
                      <p className="flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {thumbnailState.error}
                      </p>
                    )}

                    {(thumbnailState.previewUrl || thumbnailState.image.url) && (
                      <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
                        <img
                          src={thumbnailState.previewUrl || thumbnailState.image.url}
                          className="h-full w-full object-cover"
                          alt="Thumbnail preview"
                        />
                        {thumbnailState.status === "uploading" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* Step 2 — Placement & Targeting */}
              {/* ========================================== */}
              {step === 2 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Display Position</Label>
                    <Select
                      value={form.watch("position")}
                      onValueChange={(v) => form.setValue("position", v as Form["position"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map((position) => (
                          <SelectItem key={position} value={position}>
                            {POSITION_LABELS[position]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Display Order (Priority)</Label>
                    <Input type="number" {...form.register("priority")} />
                    <p className="text-xs text-muted-foreground">
                      Controls carousel order — higher numbers show first.
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Target Type</Label>
                    <Select
                      value={targetType}
                      onValueChange={(v) => {
                        form.setValue("targetType", v as Form["targetType"]);
                        form.setValue("targetId", "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TARGET_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {TARGET_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {targetType === "product" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Product</Label>
                      <TargetPicker
                        value={targetId}
                        onChange={(v) => form.setValue("targetId", v)}
                        options={targetProductOptions}
                        onSearch={setTargetSearch}
                        placeholder="Select a product"
                        searchPlaceholder="Search products…"
                      />
                    </div>
                  )}

                  {targetType === "seller_shop" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Seller Shop</Label>
                      <TargetPicker
                        value={targetId}
                        onChange={(v) => form.setValue("targetId", v)}
                        options={targetSellerOptions}
                        onSearch={setTargetSearch}
                        placeholder="Select a shop"
                        searchPlaceholder="Search shops…"
                      />
                    </div>
                  )}

                  {targetType === "category" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Category</Label>
                      <Combobox
                        value={targetId}
                        onChange={(v) => form.setValue("targetId", v)}
                        options={options.categories}
                        allowCreate={false}
                        placeholder="Select a category"
                      />
                    </div>
                  )}

                  {targetType === "group" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Group</Label>
                      <Combobox
                        value={targetId}
                        onChange={(v) => form.setValue("targetId", v)}
                        options={Object.values(options.groupsByCategory).flat()}
                        allowCreate={false}
                        placeholder="Select a group"
                      />
                    </div>
                  )}

                  {targetType === "subcategory" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Subcategory</Label>
                      <Combobox
                        value={targetId}
                        onChange={(v) => form.setValue("targetId", v)}
                        options={Object.values(options.subcategoriesByGroup).flat()}
                        allowCreate={false}
                        placeholder="Select a subcategory"
                      />
                    </div>
                  )}

                  {targetType === "collection" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Collection</Label>
                      <Combobox
                        value={targetId}
                        onChange={(v) => form.setValue("targetId", v)}
                        options={options.productCollections}
                        allowCreate={false}
                        placeholder="Select a collection"
                      />
                    </div>
                  )}

                  {targetType === "brand" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Brand</Label>
                      <Combobox
                        value={targetId}
                        onChange={(v) => form.setValue("targetId", v)}
                        options={options.brands}
                        allowCreate={false}
                        placeholder="Select a brand"
                      />
                    </div>
                  )}

                  {targetType === "custom_url" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Custom URL</Label>
                      <Input
                        placeholder="https://…"
                        value={targetId}
                        onChange={(e) => form.setValue("targetId", e.target.value)}
                      />
                    </div>
                  )}

                  {form.formState.errors.targetId && (
                    <p className="text-xs text-destructive md:col-span-2">
                      {form.formState.errors.targetId.message}
                    </p>
                  )}
                </div>
              )}

              {/* ========================================== */}
              {/* Step 3 — CTA & Style */}
              {/* ========================================== */}
              {step === 3 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Badge Text (optional)</Label>
                    <Input
                      placeholder="⚡ LIMITED TIME"
                      {...form.register("offerText")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown as a small pill on the banner. Any text/emoji —
                      nothing is added automatically.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>CTA Button Text (optional)</Label>
                    <Input placeholder="Shop Now" {...form.register("buttonText")} />
                    <p className="text-xs text-muted-foreground">
                      Hidden on mobile if left blank, or if Target Type is
                      "None".
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        className="h-10 w-14 p-1"
                        value={form.watch("backgroundColor") || "#ffffff"}
                        onChange={(e) => form.setValue("backgroundColor", e.target.value)}
                      />
                      <Input
                        placeholder="#FFFFFF"
                        {...form.register("backgroundColor")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <MultiCombobox
                      values={form
                        .watch("tags")
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)}
                      onChange={(vals) => form.setValue("tags", vals.join(", "))}
                      onCreate={(v) => addOption({ field: "tag", value: v })}
                      options={options.tags}
                      placeholder="Select or add tags"
                    />
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* Step 4 — Schedule & Status */}
              {/* ========================================== */}
              {step === 4 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" {...form.register("startDate")} />
                    {form.formState.errors.startDate && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.startDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" {...form.register("endDate")} />
                    {form.formState.errors.endDate && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.endDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Status</Label>
                    <Select
                      value={form.watch("status")}
                      onValueChange={(v) => form.setValue("status", v as Form["status"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      A banner only appears in the Consumer app while
                      Published and within its start/end dates.
                    </p>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* Step 5 — Preview */}
              {/* ========================================== */}
              {step === 5 && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs text-muted-foreground">
                    Approximates the mobile Deals hero card — exact spacing
                    may vary slightly by device width.
                  </p>

                  {/*
                    Mirrors src/components/deals/DealsHeroCard.tsx in the
                    mobile app: a horizontal card, backgroundColor behind
                    everything, text column on the left, image *contained*
                    on the right (not a full-bleed cover photo).
                  */}
                  <div
                    className="flex w-full max-w-md flex-row items-center gap-4 overflow-hidden rounded-[20px] border p-5 shadow-soft"
                    style={{
                      backgroundColor: form.watch("backgroundColor") || "#F3EDFF",
                      aspectRatio: "1000 / 420",
                    }}
                  >
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      {form.watch("offerText") && (
                        <span className="mb-2 w-fit rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
                          {form.watch("offerText")}
                        </span>
                      )}

                      <span className="text-xl font-bold leading-tight text-foreground line-clamp-2">
                        {form.watch("name") || "Banner Title"}
                      </span>

                      {form.watch("description") && (
                        <span className="mt-1 mb-3 text-sm text-muted-foreground line-clamp-1">
                          {form.watch("description")}
                        </span>
                      )}

                      {form.watch("buttonText") && form.watch("targetType") !== "none" && (
                        <span className="mt-1 flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                          {form.watch("buttonText")}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex h-full w-[42%] shrink-0 items-center justify-center">
                      {imageState.image.url ? (
                        <img
                          src={imageState.image.url}
                          className="max-h-full max-w-full object-contain"
                          alt="Banner illustration"
                        />
                      ) : (
                        <span className="text-center text-xs text-muted-foreground">
                          No image uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))}
            className="rounded-xl"
          >
            {step > 0 ? "Back" : "Cancel"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next} className="rounded-xl">
              Next
            </Button>
          ) : (
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
                "Save changes"
              ) : (
                "Save as draft"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
