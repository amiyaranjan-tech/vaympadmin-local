// src/pages/sellers/OverviewTab.tsx

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

import type { OverviewTabProps } from "./SellerTabs.types";

export default function OverviewTab({
  seller,
  shopProducts,
  brands,
  onBrandClick,
}: OverviewTabProps) {
  return (
    <TabsContent value="overview" className="mt-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Business Details */}
        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-base font-semibold">Business Details</div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">GST Number</dt>

              <dd className="mt-1 font-medium">{seller.gstNumber || "-"}</dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">
                Business Registration
              </dt>

              <dd className="mt-1 font-medium">
                {seller.businessRegistration || "-"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Address</dt>

              <dd className="mt-1">
                {seller.address}, {seller.city}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Joined Date</dt>

              <dd className="mt-1">{formatDate(seller.createdAt)}</dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Working Days</dt>

              <dd className="mt-1">{seller.workingDays?.join(", ") || "-"}</dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Working Hours</dt>

              <dd className="mt-1">
                {seller.workingHours
                  ? `${seller.workingHours.open} - ${seller.workingHours.close}`
                  : "-"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>

              <dd className="mt-1">
                <Badge variant="outline" className="capitalize">
                  {seller.status}
                </Badge>
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Shop Status</dt>

              <dd className="mt-1">
                <Badge variant="outline" className="capitalize">
                  {seller.shopStatus.replaceAll("_", " ")}
                </Badge>
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Verified</dt>

              <dd className="mt-1">
                <Badge variant={seller.isVerified ? "default" : "secondary"}>
                  {seller.isVerified ? "Verified" : "Not Verified"}
                </Badge>
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Products</dt>

              <dd className="mt-1 font-medium">
                {seller.products ?? shopProducts.length}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Orders</dt>

              <dd className="mt-1 font-medium">{seller.orders}</dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Returns</dt>

              <dd className="mt-1 font-medium">{seller.returns}</dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Return Rate</dt>

              <dd className="mt-1 font-medium text-orange-600">
                {seller.orders > 0
                  ? `${((seller.returns / seller.orders) * 100).toFixed(1)}%`
                  : "0%"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Commission</dt>

              <dd className="mt-1 font-medium text-emerald-600">
                {formatCurrency(seller.commission)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Refunds</dt>

              <dd className="mt-1 font-medium text-red-600">
                {formatCurrency(seller.refunds)}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Bank Details */}
        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-base font-semibold">Bank Details</div>

          <dl className="grid gap-5 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Account Name</dt>

              <dd className="mt-1 font-medium">
                {seller.bank?.accountName || "-"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Account Number</dt>

              <dd className="mt-1 font-mono">
                {seller.bank?.accountNumber || "-"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">IFSC Code</dt>

              <dd className="mt-1 font-mono">{seller.bank?.ifsc || "-"}</dd>
            </div>
          </dl>
        </Card>

        {/* Brands */}
        <Card className="rounded-2xl p-6 shadow-soft md:col-span-2">
          <div className="mb-4 text-base font-semibold">Brands</div>

          {brands.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No products yet — brands will appear here once this seller
              lists products.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {brands.map(({ brand, count }) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onBrandClick(brand)}
                  className={cn(
                    badgeVariants({ variant: "outline" }),
                    "cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {brand} ({count})
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </TabsContent>
  );
}
