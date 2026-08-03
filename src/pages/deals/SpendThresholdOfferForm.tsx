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
import { Combobox } from "@/components/ui/combobox";

import useOffers from "@/hooks/useOffers";
import useSellers from "@/hooks/useSellers";
import useDropdownOptions from "@/hooks/useDropdownOptions";
import type { BannerPriorityEntry, OfferScope } from "@/types/offer";

import { ShopProductSelector } from "@/components/deals/ShopProductSelector";
import { TargetPicker } from "@/pages/marketing/banners/TargetPicker";

import { uploadOfferBannerImage } from "@/utils/localImageUpload";

import { tierOfferSchema, TierOfferFormValues as Form } from "./offer.schema";
import { buildTierOfferPayload } from "./offer.mapper";

// Stable reference — see BogoOfferForm.tsx's INITIAL_PRODUCT_PARAMS for why
// this can't be a fresh literal on every render.
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

/**
 * "Buy X Amount Get X OFF" — a simple single-offer form over the same
 * tier_amount Offer shape the full Tiered Deals builder uses (see
 * TieredDealsForm.tsx), just always `type: "tier_amount"` and one row
 * instead of several.
 */
export default function SpendThresholdOfferForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Opened from Seller Details ("+ Add Spend Offer") — preselect that
  // seller instead of making the admin pick it again (?seller=<id>&shopName=<name>).
  const presetSellerId = searchParams.get("seller") ?? "";
  const presetShopName = searchParams.get("shopName") ?? "";

  const { getOffer, createTier, updateTier, getBannerPriorities } = useOffers();
  const { options, addOption } = useDropdownOptions();

  const [loadingOffer, setLoadingOffer] = useState(isEdit);
  const [sellerSearch, setSellerSearch] = useState("");
  const [bannerPriorities, setBannerPriorities] = useState<BannerPriorityEntry[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<Form>({
    resolver: zodResolver(tierOfferSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      type: "tier_amount",
      seller: presetSellerId,
      scope: "entire_shop",
      products: [],
      minSpend: 999,
      discountAmount: 0,
      discountPercent: 0,
      maximumDiscount: "",
      maxUses: "",
      isEnabled: true,
      priority: 0,
      bannerImage: { url: "", publicId: "" },
      bannerPriority: "",
      startDate: "",
      endDate: "",
    },
  });

  const seller = form.watch("seller");
  const scope = form.watch("scope");
  const products = form.watch("products");
  const bannerImage = form.watch("bannerImage");
  const bannerPriority = form.watch("bannerPriority");

  // Tracks whether the seller field has ever resolved to a real value yet
  // — the very first time it's set (initial pick/preselect, or edit
  // hydration) must NOT trigger the "clear qualifying products" confirmation.
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
  // Shop Change — clears qualifying products (RULE: never retain another
  // shop's product ids under a new shop)
  // ==========================================
  useEffect(() => {
    if (!hydratedRef.current) {
      previousSellerRef.current = seller;
      hydratedRef.current = true;
      return;
    }

    if (seller === previousSellerRef.current) return;

    if (products.length > 0 && !window.confirm("Changing the shop will clear the selected products.")) {
      form.setValue("seller", previousSellerRef.current);
      return;
    }

    form.setValue("products", []);
    previousSellerRef.current = seller;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller]);

  // ==========================================
  // Banner Priority — duplicate-avoidance UX (backend is authoritative;
  // this is a proactive hint, not the real validation)
  // ==========================================
  useEffect(() => {
    void getBannerPriorities().then(setBannerPriorities).catch(() => undefined);
  }, [getBannerPriorities]);

  const bannerPriorityNum = !bannerPriority?.trim() ? null : Number(bannerPriority);

  const priorityConflict = useMemo(
    () =>
      bannerPriorityNum == null
        ? undefined
        : bannerPriorities.find((p) => p._id !== id && p.bannerPriority === bannerPriorityNum),
    [bannerPriorities, bannerPriorityNum, id],
  );

  const handleBannerFile = async (file: File) => {
    try {
      setUploadingBanner(true);
      const uploaded = await uploadOfferBannerImage(file);
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
        const sellerId =
          typeof offer.seller === "string" ? offer.seller : (offer.seller?._id ?? "");

        previousSellerRef.current = sellerId;
        hydratedRef.current = true;

        form.reset({
          title: offer.title,
          description: offer.description,
          type: offer.type as Form["type"],
          seller: sellerId,
          // Legacy offers predating targeting default to "Entire Shop" —
          // matches the backend's own missing-scope semantics for tier
          // offers (see models/Offer.js#scope).
          scope: offer.scope ?? "entire_shop",
          products: (offer.products as { _id: string }[] | string[]).map((p) =>
            typeof p === "string" ? p : p._id,
          ),
          minSpend: offer.minSpend,
          discountAmount: offer.discountAmount,
          discountPercent: offer.discountPercent,
          maximumDiscount: offer.maximumDiscount != null ? String(offer.maximumDiscount) : "",
          maxUses: offer.maxUses != null ? String(offer.maxUses) : "",
          isEnabled: offer.isEnabled,
          priority: offer.priority,
          bannerImage: offer.bannerImage ?? { url: "", publicId: "" },
          bannerPriority: offer.bannerPriority != null ? String(offer.bannerPriority) : "",
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
      const payload = buildTierOfferPayload(values);

      if (isEdit && id) {
        await updateTier(id, payload);
      } else {
        await createTier(payload);
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
        title={isEdit ? "Edit spend offer" : "New Buy X Amount Get X OFF offer"}
        description="A flat-amount discount once a customer's eligible spend at this shop reaches a threshold."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ========================================== */}
        {/* Offer Details */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading title="Offer Details" />

          <div className="space-y-2">
            <Label>Offer Title</Label>
            <Combobox
              value={form.watch("title")}
              onChange={(v) => form.setValue("title", v, { shouldValidate: true })}
              onCreate={(v) => addOption({ field: "offerTitle", value: v })}
              options={options.offerTitles}
              placeholder="Select or add an offer title"
              searchPlaceholder="Search or type to add…"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={2} {...form.register("description")} />
            <p className="text-xs text-muted-foreground">
              Display text only — it never controls which products are eligible. Configure that below.
            </p>
          </div>
        </Card>

        {/* ========================================== */}
        {/* Targeting */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading
            title="Targeting"
            description="Every Spend offer belongs to exactly one shop — products from other shops can never count toward it."
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
                        description="All eligible products from this shop can contribute toward this offer — including ones added later."
                        selected={scope === "entire_shop"}
                      />
                    </div>
                  </Label>

                  <Label htmlFor="scope-specific" className="cursor-pointer">
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="selected_products" id="scope-specific" className="mt-4" />
                      <ScopeCard
                        label="Specific Products"
                        description="Only the products you select below contribute toward this offer."
                        selected={scope === "selected_products"}
                      />
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              {scope === "selected_products" && (
                <div className="space-y-2">
                  <Label>Qualifying Products</Label>
                  <ShopProductSelector
                    sellerId={seller}
                    selectedIds={products}
                    onChange={(ids) => form.setValue("products", ids, { shouldValidate: true })}
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
        {/* Offer Rule */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading title="Offer Rule" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Minimum Spend (₹)</Label>
              <Input type="number" min={0} {...form.register("minSpend")} />
            </div>

            <div className="space-y-2">
              <Label>Discount Amount (₹)</Label>
              <Input type="number" min={0} {...form.register("discountAmount")} />
              {form.formState.errors.discountAmount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.discountAmount.message}
                </p>
              )}
            </div>
          </div>

          <p className="rounded-lg bg-muted px-3 py-2 text-sm">
            Preview:{" "}
            <span className="font-medium">
              Spend ₹{form.watch("minSpend") || 0} → Get ₹{form.watch("discountAmount") || 0} OFF
            </span>
          </p>
        </Card>

        {/* ========================================== */}
        {/* Limits */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading title="Limits" />

          <div className="space-y-2">
            <Label>Usage Cap (optional)</Label>
            <Input type="number" min={0} placeholder="Uncapped" {...form.register("maxUses")} />
            <p className="text-xs text-muted-foreground">
              Total number of times this offer can be redeemed, across all customers.
            </p>
          </div>
        </Card>

        {/* ========================================== */}
        {/* Promotional Banner */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading
            title="Promotional Banner"
            description="Optional — this offer works normally without one."
          />

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
                    onClick={() =>
                      form.setValue("bannerImage", { url: "", publicId: "" }, { shouldValidate: true })
                    }
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
          </div>

          {bannerImage.url && (
            <div className="space-y-2">
              <Label>Banner Priority</Label>
              <Input type="number" min={1} placeholder="e.g. 1" {...form.register("bannerPriority")} />
              <p className="text-xs text-muted-foreground">
                Controls this offer banner's position in the consumer promotional banner carousel. 1
                appears first.
              </p>
              {priorityConflict && (
                <p className="text-xs text-destructive">
                  Priority {bannerPriorityNum} is already in use by "{priorityConflict.title}".
                </p>
              )}
            </div>
          )}
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
              Used when multiple executable offers match the same cart — never confused with Banner
              Priority above, which only controls UI ordering.
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
                Only enabled, in-window offers are ever applied at checkout.
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
