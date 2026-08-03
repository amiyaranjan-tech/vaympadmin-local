import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import useOffers from "@/hooks/useOffers";
import useProducts from "@/hooks/useProducts";
import useSellers from "@/hooks/useSellers";
import type { BannerPriorityEntry, OfferProductPreview, OfferScope } from "@/types/offer";

import { ProductMultiPicker } from "@/components/deals/ProductMultiPicker";
import { TargetPicker } from "@/pages/marketing/banners/TargetPicker";

import { uploadImageToCloudinary } from "@/utils/cloudinaryUpload";

import { bogoOfferSchema, BogoOfferFormValues as Form } from "./offer.schema";
import { buildBogoOfferPayload } from "./offer.mapper";

// Stable references — useProducts/useSellers key their initial-load effect
// off this object's identity; a fresh literal on every render would
// re-fire the fetch in an infinite loop (see hooks/useProducts.ts).
const INITIAL_PRODUCT_PARAMS = { limit: 20 };
const INITIAL_SELLER_PARAMS = { limit: 20 };

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

function ScopeCard({
  label,
  description,
  selected,
}: {
  label: string;
  description: string;
  selected: boolean;
}) {
  return (
    <div
      className={`flex-1 rounded-xl border p-4 transition-colors ${
        selected ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="font-medium">{label}</div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export default function BogoOfferForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { getOffer, createBogo, updateBogo, getBannerPriorities } = useOffers();

  const [loadingOffer, setLoadingOffer] = useState(isEdit);
  const [productSearch, setProductSearch] = useState("");
  const [freeProductSearch, setFreeProductSearch] = useState("");
  const [sellerSearch, setSellerSearch] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>({});
  const [bannerPriorities, setBannerPriorities] = useState<BannerPriorityEntry[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<Form>({
    resolver: zodResolver(bogoOfferSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      seller: "",
      scope: "selected_products",
      products: [],
      buyQuantity: 1,
      getQuantity: 1,
      getDiscountPercent: 100,
      freeProductMode: "automatic",
      freeProductIds: [],
      maximumFreeItems: "",
      isEnabled: true,
      priority: 0,
      bannerImage: { url: "", publicId: "" },
      bannerPriority: 1,
      startDate: "",
      endDate: "",
    },
  });

  const seller = form.watch("seller");
  const scope = form.watch("scope");
  const products = form.watch("products");
  const buyQuantity = form.watch("buyQuantity");
  const getQuantity = form.watch("getQuantity");
  const freeProductMode = form.watch("freeProductMode");
  const freeProductIds = form.watch("freeProductIds");
  const bannerImage = form.watch("bannerImage");
  const bannerPriority = form.watch("bannerPriority");

  // Tracks whether the seller field has ever resolved to a real value yet
  // — the very first time it's set (initial pick, or edit hydration) must
  // NOT trigger the "clear qualifying/free products" confirmation below.
  const previousSellerRef = useRef<string>("");
  const hydratedRef = useRef(false);

  const { sellers, fetchSellers } = useSellers(INITIAL_SELLER_PARAMS);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchSellers({ search: sellerSearch, limit: 20 }, false);
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerSearch]);

  const sellerOptions = useMemo(
    () => sellers.map((s) => ({ id: s._id, label: s.shopName, sublabel: s.city })),
    [sellers],
  );

  // ==========================================
  // Shop Change — clears qualifying/free products (RULE: never retain
  // another shop's product ids under a new shop)
  // ==========================================
  useEffect(() => {
    if (!hydratedRef.current) {
      previousSellerRef.current = seller;
      hydratedRef.current = true;
      return;
    }

    if (seller === previousSellerRef.current) return;

    const hadSelections = products.length > 0 || freeProductIds.length > 0;

    if (
      hadSelections &&
      !window.confirm("Changing the shop will clear selected qualifying and free products.")
    ) {
      form.setValue("seller", previousSellerRef.current);
      return;
    }

    form.setValue("products", []);
    form.setValue("freeProductIds", []);
    previousSellerRef.current = seller;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller]);

  // ==========================================
  // Qualifying Products — scoped to the selected shop only
  // ==========================================
  const { products: productResults, fetchProducts } = useProducts(INITIAL_PRODUCT_PARAMS);

  useEffect(() => {
    if (!seller) return;

    const timeout = setTimeout(() => {
      void fetchProducts({ search: productSearch, seller, limit: 20 }, false);
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSearch, seller]);

  const productOptions = useMemo(
    () => productResults.map((p) => ({ id: p._id, label: p.name, sublabel: p.brand })),
    [productResults],
  );

  // ==========================================
  // Free Products — ALSO scoped to the selected shop only (never
  // cross-shop — see cart.service.js#resolveEligibleFreeProducts, which
  // enforces this same rule server-side regardless of what this picker shows)
  // ==========================================
  const { products: freeProductResults, fetchProducts: fetchFreeProducts } =
    useProducts(INITIAL_PRODUCT_PARAMS);

  useEffect(() => {
    if (!seller) return;

    const timeout = setTimeout(() => {
      void fetchFreeProducts({ search: freeProductSearch, seller, limit: 20 }, false);
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeProductSearch, seller]);

  const freeProductOptions = useMemo(
    () => freeProductResults.map((p) => ({ id: p._id, label: p.name, sublabel: p.brand })),
    [freeProductResults],
  );

  // ==========================================
  // Banner Priority — duplicate-avoidance UX (backend is authoritative;
  // this is a proactive hint, not the real validation)
  // ==========================================
  useEffect(() => {
    void getBannerPriorities().then(setBannerPriorities).catch(() => undefined);
  }, [getBannerPriorities]);

  const priorityConflict = useMemo(
    () => bannerPriorities.find((p) => p._id !== id && p.bannerPriority === bannerPriority),
    [bannerPriorities, bannerPriority, id],
  );

  const suggestedPriority = useMemo(() => {
    const used = new Set(
      bannerPriorities.filter((p) => p._id !== id).map((p) => p.bannerPriority),
    );
    let candidate = 1;
    while (used.has(candidate)) candidate += 1;
    return candidate;
  }, [bannerPriorities, id]);

  const handleBannerFile = async (file: File) => {
    try {
      setUploadingBanner(true);
      const uploaded = await uploadImageToCloudinary(file, { folder: "vaymp/offer-banners" });
      form.setValue("bannerImage", uploaded, { shouldValidate: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Banner upload failed");
    } finally {
      setUploadingBanner(false);
    }
  };

  /**
   * ==========================================
   * Load Offer (Edit)
   * ==========================================
   */

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoadingOffer(true);

        const offer = await getOffer(id);

        const productPreviews = offer.products as OfferProductPreview[];
        const freeProductPreviews = offer.freeProductIds as OfferProductPreview[];

        const labels: Record<string, string> = {};
        productPreviews.forEach((p) => (labels[p._id] = p.name));
        freeProductPreviews.forEach((p) => (labels[p._id] = p.name));
        setSelectedLabels(labels);

        const sellerId =
          typeof offer.seller === "string" ? offer.seller : (offer.seller?._id ?? "");

        previousSellerRef.current = sellerId;
        hydratedRef.current = true;

        form.reset({
          title: offer.title,
          description: offer.description,
          seller: sellerId,
          scope: offer.scope ?? "selected_products",
          products: productPreviews.map((p) => p._id),
          buyQuantity: offer.buyQuantity,
          getQuantity: offer.getQuantity,
          getDiscountPercent: offer.getDiscountPercent,
          freeProductMode: freeProductPreviews.length > 0 ? "selected_products" : "automatic",
          freeProductIds: freeProductPreviews.map((p) => p._id),
          maximumFreeItems: offer.maximumFreeItems != null ? String(offer.maximumFreeItems) : "",
          isEnabled: offer.isEnabled,
          priority: offer.priority,
          bannerImage: offer.bannerImage ?? { url: "", publicId: "" },
          bannerPriority: offer.bannerPriority ?? 1,
          startDate: offer.startDate.slice(0, 10),
          endDate: offer.endDate.slice(0, 10),
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load offer");
        navigate("/deals");
      } finally {
        setLoadingOffer(false);
      }
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values: Form) => {
    try {
      const payload = buildBogoOfferPayload(values);

      if (isEdit && id) {
        await updateBogo(id, payload);
      } else {
        await createBogo(payload);
      }

      navigate("/deals");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  if (loadingOffer) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit BOGO offer" : "New BOGO offer"}
        description="Buy & Get Free — the same mechanic covers classic BOGO (1/1) and Buy 2 Get 2 (2/2), just different numbers. One offer belongs to exactly one shop."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ========================================== */}
        {/* Offer Details */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading title="Offer Details" />

          <div className="space-y-2">
            <Label>Offer Title</Label>
            <Input placeholder="Buy One Get One FREE" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={2} {...form.register("description")} />
          </div>
        </Card>

        {/* ========================================== */}
        {/* Shop & Qualifying Products */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading
            title="Shop & Qualifying Products"
            description="Every BOGO offer belongs to exactly one shop — products from other shops can never be mixed in."
          />

          <div className="space-y-2">
            <Label>Shop</Label>
            <TargetPicker
              value={seller}
              onChange={(v) => form.setValue("seller", v, { shouldValidate: true })}
              options={sellerOptions}
              onSearch={setSellerSearch}
              placeholder="Select a shop"
              searchPlaceholder="Search shops…"
            />
            {form.formState.errors.seller && (
              <p className="text-xs text-destructive">{form.formState.errors.seller.message}</p>
            )}
          </div>

          {seller && (
            <>
              <div className="space-y-2">
                <Label>Offer Applies To</Label>
                <RadioGroup
                  value={scope}
                  onValueChange={(v) => form.setValue("scope", v as OfferScope, { shouldValidate: true })}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <Label htmlFor="scope-entire" className="cursor-pointer">
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="entire_shop" id="scope-entire" className="mt-4" />
                      <ScopeCard
                        label="Entire Shop"
                        description="Every eligible product from this shop qualifies automatically — including ones added later."
                        selected={scope === "entire_shop"}
                      />
                    </div>
                  </Label>

                  <Label htmlFor="scope-specific" className="cursor-pointer">
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="selected_products" id="scope-specific" className="mt-4" />
                      <ScopeCard
                        label="Specific Products"
                        description="Only the products you select below qualify."
                        selected={scope === "selected_products"}
                      />
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              {scope === "selected_products" && (
                <div className="space-y-2">
                  <Label>Select Qualifying Products</Label>
                  <ProductMultiPicker
                    values={products}
                    onChange={(vals) => form.setValue("products", vals, { shouldValidate: true })}
                    options={productOptions}
                    onSearch={setProductSearch}
                    selectedLabels={selectedLabels}
                    placeholder="Select products this offer applies to"
                  />
                  <p className="text-xs text-muted-foreground">
                    {products.length} product{products.length === 1 ? "" : "s"} selected
                  </p>
                  {form.formState.errors.products && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.products.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </Card>

        {/* ========================================== */}
        {/* BOGO Rule */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading title="BOGO Rule" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Buy Quantity</Label>
              <Input type="number" min={1} {...form.register("buyQuantity")} />
            </div>

            <div className="space-y-2">
              <Label>Get Quantity (FREE)</Label>
              <Input type="number" min={1} {...form.register("getQuantity")} />
            </div>
          </div>

          <p className="rounded-lg bg-muted px-3 py-2 text-sm">
            Preview: <span className="font-medium">Buy {buyQuantity} → Get {getQuantity} FREE</span>
          </p>
        </Card>

        {/* ========================================== */}
        {/* Free Product Settings */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading
            title="Free Product Settings"
            description="Free products must come from the SAME shop as the qualifying products — enforced by the server regardless of what's picked here."
          />

          <div className="space-y-2">
            <Label>Free Product Selection</Label>
            <RadioGroup
              value={freeProductMode}
              onValueChange={(v) =>
                form.setValue("freeProductMode", v as Form["freeProductMode"], {
                  shouldValidate: true,
                })
              }
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <Label htmlFor="free-automatic" className="cursor-pointer">
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="automatic" id="free-automatic" className="mt-4" />
                  <ScopeCard
                    label="Automatic Eligible Products"
                    description="Customer picks from the same collection, then category, then shop — never exceeding the purchased item's price."
                    selected={freeProductMode === "automatic"}
                  />
                </div>
              </Label>

              <Label htmlFor="free-specific" className="cursor-pointer">
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="selected_products" id="free-specific" className="mt-4" />
                  <ScopeCard
                    label="Select Specific Free Products"
                    description="Only the products you choose below can ever be given away free for this offer."
                    selected={freeProductMode === "selected_products"}
                  />
                </div>
              </Label>
            </RadioGroup>
          </div>

          {freeProductMode === "selected_products" && seller && (
            <div className="space-y-2">
              <Label>Choose products customers can receive FREE</Label>
              <ProductMultiPicker
                values={freeProductIds}
                onChange={(vals) =>
                  form.setValue("freeProductIds", vals, { shouldValidate: true })
                }
                options={freeProductOptions}
                onSearch={setFreeProductSearch}
                selectedLabels={selectedLabels}
                placeholder="Select this shop's free-item pool"
              />
              <p className="text-xs text-muted-foreground">
                {freeProductIds.length} free product{freeProductIds.length === 1 ? "" : "s"} selected
              </p>
              {form.formState.errors.freeProductIds && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.freeProductIds.message}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* ========================================== */}
        {/* Limits */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading title="Limits" />

          <div className="space-y-2">
            <Label>Maximum Free Items</Label>
            <Input
              type="number"
              min={0}
              placeholder="Unlimited"
              {...form.register("maximumFreeItems")}
            />
            <p className="text-xs text-muted-foreground">
              Hard ceiling on free units per cart, regardless of quantity purchased.
            </p>
          </div>
        </Card>

        {/* ========================================== */}
        {/* Offer Banner */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading title="Offer Banner" />

          <div className="space-y-2">
            <Label>Banner Image</Label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleBannerFile(file);
                e.target.value = "";
              }}
            />

            {bannerImage.url ? (
              <div className="space-y-2">
                <img
                  src={bannerImage.url}
                  alt="Offer banner preview"
                  className="h-32 w-full rounded-xl border object-cover"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={uploadingBanner}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Image
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-destructive"
                    onClick={() => form.setValue("bannerImage", { url: "", publicId: "" }, { shouldValidate: true })}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                disabled={uploadingBanner}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingBanner ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploadingBanner ? "Uploading..." : "Upload Banner"}
              </Button>
            )}

            {form.formState.errors.bannerImage && (
              <p className="text-xs text-destructive">
                {form.formState.errors.bannerImage.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Banner Priority</Label>
            <Input type="number" min={1} {...form.register("bannerPriority")} />
            <p className="text-xs text-muted-foreground">
              Controls this banner's position in the consumer promotional banner section. 1 appears
              first.
            </p>
            {priorityConflict ? (
              <p className="text-xs text-destructive">
                Priority {bannerPriority} is already in use by "{priorityConflict.title}". Try{" "}
                {suggestedPriority} instead.
              </p>
            ) : (
              form.formState.errors.bannerPriority && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.bannerPriority.message}
                </p>
              )
            )}
          </div>
        </Card>

        {/* ========================================== */}
        {/* Offer Resolution */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading title="Offer Resolution" />

          <div className="space-y-2">
            <Label>Offer Priority</Label>
            <Input type="number" {...form.register("priority")} />
            <p className="text-xs text-muted-foreground">
              Used when multiple executable BOGO offers match the same product — never confused with
              Banner Priority above, which only controls UI ordering.
            </p>
          </div>
        </Card>

        {/* ========================================== */}
        {/* Schedule & Status */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading title="Schedule" />

          <div className="grid gap-4 sm:grid-cols-2">
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
                <p className="text-xs text-destructive">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <Label>Enabled</Label>
              <p className="text-xs text-muted-foreground">
                Turning this off removes the BOGO badge and banner (unless another offer still
                covers the product).
              </p>
            </div>
            <Switch
              checked={form.watch("isEnabled")}
              onCheckedChange={(v) => form.setValue("isEnabled", v)}
            />
          </div>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate("/deals")} className="rounded-xl">
            Cancel
          </Button>

          <Button type="submit" className="rounded-xl" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create offer"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
