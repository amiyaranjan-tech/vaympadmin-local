import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import useOffers from "@/hooks/useOffers";
import useSellers from "@/hooks/useSellers";
import type { Seller } from "@/types/seller";
import type { OfferScope } from "@/types/offer";

import { ShopProductSelector } from "@/components/deals/ShopProductSelector";

import { uploadImageLocally } from "@/utils/localImageUpload";

import { tierRowsSchema, TierRowsFormValues as Form } from "./offer.schema";
import { buildTierBulkPayload } from "./offer.mapper";
import { TierRowsField } from "./TierRowsField";
import { EMPTY_SHOP_BANNER, padShopBanners } from "./shopBanners";

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

const EMPTY_ROW: Form["tiers"][number] = {
  title: "",
  description: "",
  type: "tier_amount",
  minSpend: 999,
  discountAmount: 0,
  discountPercent: 0,
  maximumDiscount: "",
  maxUses: "",
  isEnabled: true,
  priority: 0,
  startDate: "",
  endDate: "",
};

/**
 * Full multi-tier builder for one shop — "the tier list" is fully
 * replaced by whatever's submitted here (see
 * offer.service.ts#bulkUpsertTiered): existing tiers not represented by a
 * row with a matching `_id` are dropped.
 */
export default function TieredDealsForm() {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const { getTieredBySeller, bulkUpsertTiered } = useOffers();
  const { getSeller } = useSellers();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  const [uploadingShopBannerIndex, setUploadingShopBannerIndex] = useState<number | null>(null);
  const shopBannerInputRef = useRef<HTMLInputElement>(null);
  const shopBannerSlotRef = useRef<number | null>(null);

  const form = useForm<Form>({
    resolver: zodResolver(tierRowsSchema),
    mode: "onTouched",
    defaultValues: {
      scope: "entire_shop",
      products: [],
      shopBanners: padShopBanners(),
      tiers: [EMPTY_ROW],
    },
  });

  const scope = form.watch("scope");
  const products = form.watch("products");
  const shopBanners = form.watch("shopBanners");

  const handleShopBannerFile = async (index: number, file: File) => {
    try {
      setUploadingShopBannerIndex(index);
      const uploaded = await uploadImageLocally(file);
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

  useEffect(() => {
    if (!sellerId) return;

    const load = async () => {
      try {
        setLoading(true);

        const [sellerDoc, tiers] = await Promise.all([
          getSeller(sellerId),
          getTieredBySeller(sellerId),
        ]);

        setSeller(sellerDoc);

        if (tiers.length > 0) {
          // scope/products are ladder-level — every tier row shares the
          // same one (see offer.service.js#bulkUpsertTiered), so the
          // first tier's value speaks for the whole ladder.
          const first = tiers[0];

          form.reset({
            scope: first.scope ?? "entire_shop",
            products: (first.products as { _id: string }[] | string[]).map((p) =>
              typeof p === "string" ? p : p._id,
            ),
            // The banner set lives on whichever tier is first, per the
            // backend's own convention — see offer.service.js#bulkUpsertTiered.
            shopBanners: padShopBanners(first.shopBanners),
            tiers: tiers.map((offer) => ({
              _id: offer._id,
              title: offer.title,
              description: offer.description,
              type: offer.type as Form["tiers"][number]["type"],
              minSpend: offer.minSpend,
              discountAmount: offer.discountAmount,
              discountPercent: offer.discountPercent,
              maximumDiscount:
                offer.maximumDiscount != null ? String(offer.maximumDiscount) : "",
              maxUses: offer.maxUses != null ? String(offer.maxUses) : "",
              isEnabled: offer.isEnabled,
              priority: offer.priority,
              startDate: offer.startDate.slice(0, 10),
              endDate: offer.endDate.slice(0, 10),
            })),
          });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load tiered deals");
        navigate("/deals");
      } finally {
        setLoading(false);
      }
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  const onSubmit = async (values: Form) => {
    if (!sellerId) return;

    try {
      await bulkUpsertTiered(sellerId, buildTierBulkPayload(values));

      navigate("/deals");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Tiered Deals — ${seller?.shopName ?? "Shop"}`}
        description="Every active tier for this shop — spend thresholds compare against the customer's whole cart, and only the single best-value tier ever applies at once."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ========================================== */}
        {/* Targeting — ladder-level, shared by every tier row below */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading
            title="Targeting"
            description="Applies to the whole ladder — you don't need to re-select products for every tier."
          />

          <div className="space-y-2">
            <Label>Offer Applies To</Label>
            <RadioGroup
              value={scope}
              onValueChange={(v) => form.setValue("scope", v as OfferScope, { shouldValidate: true })}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <Label htmlFor="ladder-scope-entire" className="cursor-pointer">
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="entire_shop" id="ladder-scope-entire" className="mt-4" />
                  <ScopeCard
                    label="Entire Shop"
                    description="All eligible products from this shop can contribute toward this ladder — including ones added later."
                    selected={scope === "entire_shop"}
                  />
                </div>
              </Label>

              <Label htmlFor="ladder-scope-specific" className="cursor-pointer">
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="selected_products" id="ladder-scope-specific" className="mt-4" />
                  <ScopeCard
                    label="Specific Products"
                    description="Only the products you select below contribute toward this ladder."
                    selected={scope === "selected_products"}
                  />
                </div>
              </Label>
            </RadioGroup>
          </div>

          {scope === "selected_products" && sellerId && (
            <div className="space-y-2">
              <Label>Qualifying Products</Label>
              <ShopProductSelector
                sellerId={sellerId}
                selectedIds={products}
                onChange={(ids) => form.setValue("products", ids, { shouldValidate: true })}
              />
              {form.formState.errors.products && (
                <p className="text-xs text-destructive">{form.formState.errors.products.message}</p>
              )}
            </div>
          )}
        </Card>

        {/* ========================================== */}
        {/* Shop Page Banners — one set for the WHOLE ladder */}
        {/* ========================================== */}
        <Card className="space-y-4 rounded-2xl p-6 shadow-soft">
          <SectionHeading
            title="Shop Page Banners (optional)"
            description="Represents the whole tier campaign, not any single tier — this ladder works normally without one. Slot order is display order — slot 1 shows first and also doubles as this campaign's image on the site-wide Home/Deals promotional carousel."
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

        <TierRowsField form={form} />

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
            ) : (
              "Save tiered deals"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
