import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton } from "@/components/common/Skeletons";
import { Skeleton } from "@/components/ui/skeleton";

import useOffers from "@/hooks/useOffers";
import useProducts from "@/hooks/useProducts";
import type { Offer } from "@/types/offer";

import { formatCurrency, formatDate } from "@/utils/format";
import { isOfferActiveNow } from "@/pages/products/dealMatching";

// A stable module-level reference — useOffers keys its "initial load"
// useEffect off this object's identity, so a fresh literal on every render
// (the mistake this avoids) would re-fire the fetch in an infinite loop.
const LIST_PARAMS = { limit: 100 };

// Mirrors the backend's MASSIVE_DEAL_MIN_DISCOUNT_PERCENT (constants/massiveDeal.js)
// — display-only. Eligibility itself is decided entirely server-side.
const MASSIVE_DEAL_MIN_DISCOUNT_PERCENT = 50;

// Shared by both the BOGO and Tiered/Spend tabs — a shop can run more
// than one offer of the same type at once, so both group their own
// offer list by seller instead of one flat grid.
function groupOffersBySeller(offers: Offer[]) {
  const groups = new Map<string, { shopName: string; sellerId: string; offers: Offer[] }>();

  for (const offer of offers) {
    const sellerId = typeof offer.seller === "string" ? offer.seller : offer.seller?._id;
    const shopName =
      typeof offer.seller === "string" || !offer.seller ? "Unknown shop" : offer.seller.shopName;

    if (!sellerId) continue;

    if (!groups.has(sellerId)) {
      groups.set(sellerId, { shopName, sellerId, offers: [] });
    }

    groups.get(sellerId)!.offers.push(offer);
  }

  return [...groups.values()];
}

/**
 * ==========================================
 * Deals
 * ==========================================
 * Backed by real Offer data across the two configurable deal types (see
 * backend constants/offer.js): BOGO (also covers "Buy 2 Get 2") and
 * Tiered/Spend Deals. Massive Deals has no Offer/campaign of its own — it's
 * an automatic classification (Product.discountPercent >= 50, see
 * constants/massiveDeal.js on the backend) surfaced here purely as a
 * read-only info panel, not a third configurable deal type.
 */
export default function Deals() {
  // A single fetch covers both bogo and tier offers (client-split below) —
  // simpler than the query API supporting a "not this type" filter, and
  // this is a low-volume admin list, not a paginated storefront feed.
  const { offers, loading: offersLoading, deleteOffer, updateStatus } = useOffers(LIST_PARAMS);

  // Just needs the count — the products themselves live on the Products
  // page (View Products deep-links there filtered by discount).
  const { total: massiveDealProductCount, loading: massiveLoading } = useProducts({
    minDiscount: MASSIVE_DEAL_MIN_DISCOUNT_PERCENT,
    limit: 1,
  });

  const bogoOffers = useMemo(() => offers.filter((o) => o.type === "bogo"), [offers]);
  const tierOffers = useMemo(() => offers.filter((o) => o.type !== "bogo"), [offers]);

  const bogoOffersBySeller = useMemo(() => groupOffersBySeller(bogoOffers), [bogoOffers]);
  const tierOffersBySeller = useMemo(() => groupOffersBySeller(tierOffers), [tierOffers]);

  const handleDeleteOffer = (id: string) => {
    if (!window.confirm("Delete this offer? This can't be undone.")) return;
    void deleteOffer(id);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Deals" description="Manage discounts across the marketplace." />

      <Tabs defaultValue="bogo">
        <TabsList className="rounded-xl">
          <TabsTrigger value="bogo">BOGO Deals</TabsTrigger>
          <TabsTrigger value="tiered">Spend & Tiered Deals</TabsTrigger>
          <TabsTrigger value="massive">Massive Deals</TabsTrigger>
        </TabsList>

        {/* ========================================== */}
        {/* BOGO / Buy 2 Get 2 */}
        {/* ========================================== */}
        <TabsContent value="bogo" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button asChild className="rounded-xl">
              <Link to="/deals/bogo/new">
                <Plus className="mr-2 h-4 w-4" />
                Create BOGO offer
              </Link>
            </Button>
          </div>

          {offersLoading ? (
            <CardGridSkeleton count={3} className="space-y-3" />
          ) : bogoOffersBySeller.length === 0 ? (
            <EmptyState
              title="No BOGO offers yet"
              description="buyQuantity/getQuantity covers both classic BOGO and Buy 2 Get 2 — just different numbers on the same offer."
            />
          ) : (
            <div className="space-y-3">
              {bogoOffersBySeller.map((group) => (
                <Card key={group.sellerId} className="rounded-2xl p-4 shadow-soft">
                  <div className="font-medium">{group.shopName}</div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {group.offers.map((offer) => {
                      const productCount = Array.isArray(offer.products) ? offer.products.length : 0;
                      const freePoolCount = Array.isArray(offer.freeProductIds)
                        ? offer.freeProductIds.length
                        : 0;

                      return (
                        <Card key={offer._id} className="overflow-hidden rounded-2xl p-0 shadow-soft">
                          {offer.shopBanners[0]?.url && (
                            <div
                              className="h-24 bg-cover bg-center bg-muted"
                              style={{ backgroundImage: `url(${offer.shopBanners[0].url})` }}
                            />
                          )}

                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-medium">{offer.title}</div>
                                  {isOfferActiveNow(offer) ? (
                                    <Badge className="bg-emerald-600 text-white">Active</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Buy {offer.buyQuantity} → Get {offer.getQuantity} FREE
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {offer.scope === "entire_shop" ? "Entire Shop" : `Specific Products · ${productCount} product${productCount === 1 ? "" : "s"}`}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Free Pool · {freePoolCount > 0 ? `${freePoolCount} product${freePoolCount === 1 ? "" : "s"}` : "Automatic"}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Offer Priority: {offer.priority}
                                  {offer.shopBanners.length > 0 &&
                                    ` · ${offer.shopBanners.length} banner${offer.shopBanners.length === 1 ? "" : "s"}`}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
                                </div>
                              </div>
                              <Switch
                                checked={offer.isEnabled}
                                onCheckedChange={(v) => void updateStatus(offer._id, v)}
                              />
                            </div>

                            <div className="mt-3 flex gap-2">
                              <Button size="sm" variant="outline" className="rounded-lg" asChild>
                                <Link to={`/deals/bogo/${offer._id}/edit`}>
                                  <Pencil className="mr-1 h-3 w-3" />
                                  Edit
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-lg text-destructive"
                                onClick={() => handleDeleteOffer(offer._id)}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========================================== */}
        {/* Spend Threshold + Tiered Deals */}
        {/* ========================================== */}
        <TabsContent value="tiered" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button asChild className="rounded-xl">
              <Link to="/deals/spend-threshold/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Buy X Amount Get X OFF
              </Link>
            </Button>
          </div>

          {offersLoading ? (
            <CardGridSkeleton count={3} className="space-y-3" />
          ) : tierOffersBySeller.length === 0 ? (
            <EmptyState
              title="No tiered or spend offers yet"
              description="Both a quick spend-threshold offer and a full multi-tier Tiered Deal are the same underlying offer type, scoped to one shop."
            />
          ) : (
            <div className="space-y-3">
              {tierOffersBySeller.map((group) => (
                <Card key={group.sellerId} className="rounded-2xl p-4 shadow-soft">
                  <div className="flex items-start justify-between">
                    <div className="font-medium">{group.shopName}</div>
                    <Button size="sm" variant="outline" className="rounded-lg" asChild>
                      <Link to={`/deals/tiered/${group.sellerId}`}>Manage Tiered Deals</Link>
                    </Button>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {group.offers.map((offer) => {
                      const productCount = Array.isArray(offer.products) ? offer.products.length : 0;

                      return (
                        <Card key={offer._id} className="overflow-hidden rounded-2xl p-0 shadow-soft">
                          {offer.shopBanners[0]?.url && (
                            <div
                              className="h-24 bg-cover bg-center bg-muted"
                              style={{ backgroundImage: `url(${offer.shopBanners[0].url})` }}
                            />
                          )}

                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-medium">{offer.title}</div>
                                  {isOfferActiveNow(offer) ? (
                                    <Badge className="bg-emerald-600 text-white">Active</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Spend {formatCurrency(offer.minSpend)} →{" "}
                                  {offer.type === "tier_amount" && `${formatCurrency(offer.discountAmount)} off`}
                                  {offer.type === "tier_percentage" && `${offer.discountPercent}% off`}
                                  {offer.type === "free_shipping" && "Free shipping"}
                                  {offer.maxUses != null && ` · ${offer.usedCount}/${offer.maxUses} used`}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {offer.scope === "entire_shop"
                                    ? "Entire Shop"
                                    : `Specific Products · ${productCount} product${productCount === 1 ? "" : "s"}`}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Offer Priority: {offer.priority}
                                  {offer.shopBanners.length > 0 &&
                                    ` · ${offer.shopBanners.length} banner${offer.shopBanners.length === 1 ? "" : "s"}`}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {formatDate(offer.startDate)} → {formatDate(offer.endDate)}
                                </div>
                              </div>
                              <Switch
                                checked={offer.isEnabled}
                                onCheckedChange={(v) => void updateStatus(offer._id, v)}
                              />
                            </div>

                            <div className="mt-3 flex gap-2">
                              <Button size="sm" variant="outline" className="rounded-lg" asChild>
                                <Link to={`/deals/spend-threshold/${offer._id}/edit`}>
                                  <Pencil className="mr-1 h-3 w-3" />
                                  Edit
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-lg text-destructive"
                                onClick={() => handleDeleteOffer(offer._id)}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========================================== */}
        {/* Massive Deals — automatic classification, not a deal admin */}
        {/* configures. Its own tab purely for visibility/discovery. */}
        {/* ========================================== */}
        <TabsContent value="massive" className="mt-4 space-y-4">
          <Card className="rounded-2xl p-4 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">Massive Deals</div>
                <div className="mt-1 text-xs font-medium text-primary">
                  Automatic · {MASSIVE_DEAL_MIN_DISCOUNT_PERCENT}% OFF &amp; Above
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {massiveLoading ? (
                    <Skeleton className="h-3 w-40" />
                  ) : (
                    `${massiveDealProductCount} product${massiveDealProductCount === 1 ? "" : "s"} currently qualify`
                  )}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  No setup required. Products with {MASSIVE_DEAL_MIN_DISCOUNT_PERCENT}% or more discount
                  automatically qualify and enter or leave this section as their pricing changes.
                </div>
              </div>

              <Button size="sm" variant="outline" className="shrink-0 rounded-lg" asChild>
                <Link to={`/products?discount=${MASSIVE_DEAL_MIN_DISCOUNT_PERCENT}`}>View Products</Link>
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
