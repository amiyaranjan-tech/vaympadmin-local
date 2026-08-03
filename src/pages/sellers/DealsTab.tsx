// src/pages/sellers/DealsTab.tsx

import { Link } from "react-router-dom";

import { Plus, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";

import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency } from "@/utils/format";

import type { DealsTabProps } from "./SellerTabs.types";

/**
 * Only this shop's tier_amount/tier_percentage/free_shipping offers show
 * here (see SellerDetails.tsx — `seller` is a direct field on those Offer
 * docs). BOGO offers are scoped by product, not shop, so they're managed
 * from the main Deals page instead (see src/pages/deals/Deals.tsx).
 */
export default function DealsTab({ seller, shopDeals }: DealsTabProps) {
  return (
    <TabsContent value="deals" className="mt-4">
      <div className="mb-3 flex justify-end gap-2">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to={`/deals/bogo/new?seller=${seller._id}&shopName=${encodeURIComponent(seller.shopName)}`}>
            <Plus className="mr-2 h-4 w-4" />
            Add BOGO offer
          </Link>
        </Button>

        <Button asChild className="rounded-xl">
          <Link to={`/deals/spend-threshold/new?seller=${seller._id}&shopName=${encodeURIComponent(seller.shopName)}`}>
            <Plus className="mr-2 h-4 w-4" />
            Add spend offer
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {shopDeals.map((deal) => {
          const productCount = Array.isArray(deal.products) ? deal.products.length : 0;

          return (
          <Card key={deal._id} className="rounded-2xl p-4 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{deal.title}</div>

                <div className="text-xs text-muted-foreground">
                  Spend {formatCurrency(deal.minSpend)} →{" "}
                  {deal.type === "tier_amount" && `${formatCurrency(deal.discountAmount)} off`}
                  {deal.type === "tier_percentage" && `${deal.discountPercent}% off`}
                  {deal.type === "free_shipping" && "Free shipping"}
                </div>

                <div className="mt-1 text-xs font-medium text-muted-foreground">
                  Target:{" "}
                  {deal.scope === "entire_shop"
                    ? "Entire Shop"
                    : `${productCount} selected product${productCount === 1 ? "" : "s"}`}
                </div>
              </div>

              <Badge variant="outline">{deal.isEnabled ? "Enabled" : "Disabled"}</Badge>
            </div>

            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="rounded-lg" asChild>
                <Link to={`/deals/spend-threshold/${deal._id}/edit`}>
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Link>
              </Button>

              <Button size="sm" variant="outline" className="rounded-lg" asChild>
                <Link to={`/deals/tiered/${seller._id}`}>Manage all tiers</Link>
              </Button>
            </div>
          </Card>
          );
        })}

        {shopDeals.length === 0 && (
          <EmptyState title="No spend/tiered deals" description="This shop has no active spend-threshold or tiered offer yet." />
        )}
      </div>
    </TabsContent>
  );
}
