import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import useSellers from "@/hooks/useSellers";
import type { OfferProductPreview, OfferScope } from "@/types/offer";

import { ShopProductSelector } from "@/components/deals/ShopProductSelector";
import { TargetPicker } from "@/pages/marketing/banners/TargetPicker";

import { uploadOfferBannerImage } from "@/utils/localImageUpload";

import { bogoOfferSchema, BogoOfferFormValues as Form } from "./offer.schema";
import { buildBogoOfferPayload } from "./offer.mapper";
import { EMPTY_SHOP_BANNER, padShopBanners } from "./shopBanners";

// Stable reference — useSellers keys its initial-load effect off this
// object's identity; a fresh literal on every render would re-fire the
// fetch in an infinite loop (see hooks/useProducts.ts).
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Opened from Seller Details ("+ Add BOGO offer") — preselect that seller
  // instead of making the admin pick it again (?seller=<id>&shopName=<name>).
  const presetSellerId = searchParams.get("seller") ?? "";
  const presetShopName = searchParams.get("shopName") ?? "";

  const { getOffer, createBogo, updateBogo } = useOffers();

  const [loadingOffer, setLoadingOffer] = useState(isEdit);
  const [sellerSearch, setSellerSearch] = useState("");

  const [uploadingShopBannerIndex, setUploadingShopBannerIndex] = useState<number | null>(null);
  const shopBannerInputRef = useRef<HTMLInputElement>(null);
  const shopBannerSlotRef = useRef<number | null>(null);

  const form = useForm<Form>({
    resolver: zodResolver(bogoOfferSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      seller: presetSellerId,
      scope: "selected_products",
      products: [],
      buyQuantity: 1,
      getQuantity: 1,
      getDiscountPercent: 100,
      freeProductIds: [],
      maximumFreeItems: "",
      isEnabled: true,
      priority: 0,
      shopBanners: padShopBanners(),
      startDate: "",
      endDate: "",
    },
  });

  const seller = form.watch("seller");
  const scope = form.watch("scope");
  const products = form.watch("products");
  const buyQuantity = form.watch("buyQuantity");
  const getQuantity = form.watch("getQuantity");
  const freeProductIds = form.watch("freeProductIds");
  const shopBanners = form.watch("shopBanners");

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

  const sellerOptions = useMemo(() => {
    const options = sellers.map((s) => ({ id: s._id, label: s.shopName, sublabel: s.city }));

    // presetSellerId may not be on the first fetched page — seed it so the
    // picker shows the shop name immediately instead of a blank placeholder.
    if (presetSellerId && presetShopName && !options.some((o) => o.id === presetSellerId)) {
      options.unshift({ id: presetSellerId, label: presetShopName, sublabel: undefined });
    }

    return options;
  }, [sellers, presetSellerId, presetShopName]);

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

  const handleShopBannerFile = async (index: number, file: File) => {
    try {
      setUploadingShopBannerIndex(index);
      const uploaded = await uploadOfferBannerImage(file);
      const next = [...form.getValues("shopBanners")];
      next[index] = { ...uploaded, caption: next[index]?.caption ?? "" };
      form.setValue("shopBanners", next, { shouldValidate: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Banner upload failed");
    } finally {
      setUploadingShopBannerIndex(null);
    }
  };

  const removeShopBanner = (index: number) => {
    const next = [...form.getValues("shopBanners")];
    next[index] = EMPTY_SHOP_BANNER;
    form.setValue("shopBanners", next, { shouldValidate: true });
  };

  const setShopBannerCaption = (index: number, caption: string) => {
    const next = [...form.getValues("shopBanners")];
    next[index] = { ...next[index], caption };
    form.setValue("shopBanners", next);
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
          freeProductIds: freeProductPreviews.map((p) => p._id),
          maximumFreeItems: offer.maximumFreeItems != null ? String(offer.maximumFreeItems) : "",
          isEnabled: offer.isEnabled,
          priority: offer.priority,
          shopBanners: padShopBanners(offer.shopBanners),
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
            <Input placeholder="e.g. Buy 2 Get 1 FREE" {...form.register("title")} />
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
                  <ShopProductSelector
                    sellerId={seller}
                    selectedIds={products}
                    onChange={(vals) => form.setValue("products", vals, { shouldValidate: true })}
                  />
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

          {seller && (
            <div className="space-y-2">
              <Label>Choose products customers can receive FREE</Label>
              <ShopProductSelector
                sellerId={seller}
                selectedIds={freeProductIds}
                onChange={(vals) =>
                  form.setValue("freeProductIds", vals, { shouldValidate: true })
                }
              />
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
        {/* Shop Page Banners */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading
            title="Shop Page Banners (optional)"
            description="Up to 5 images shown on this offer's own card in the shop's 'Deals at this Shop' section. Slot order is display order — slot 1 shows first and also doubles as this offer's image on the site-wide Home/Deals promotional carousel."
          />

          <input
            ref={shopBannerInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              const index = shopBannerSlotRef.current;
              if (file && index !== null) void handleShopBannerFile(index, file);
              e.target.value = "";
            }}
          />

          <div className="space-y-3">
            {shopBanners.map((banner, index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl border p-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {banner.url ? (
                    <img src={banner.url} alt={`Banner ${index + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Optional caption shown on this banner"
                    value={banner.caption}
                    onChange={(e) => setShopBannerCaption(index, e.target.value)}
                  />
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={uploadingShopBannerIndex === index}
                    onClick={() => {
                      shopBannerSlotRef.current = index;
                      shopBannerInputRef.current?.click();
                    }}
                  >
                    {uploadingShopBannerIndex === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : banner.url ? (
                      "Change"
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>

                  {banner.url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-destructive"
                      onClick={() => removeShopBanner(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
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
              Used when multiple executable BOGO offers match the same product. Also orders this
              offer's banner on the site-wide Home/Deals promotional carousel — higher shows first.
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
