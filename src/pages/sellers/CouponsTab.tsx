// src/pages/sellers/CouponsTab.tsx

import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import { EmptyState } from "@/components/common/EmptyState";

import { formatCurrency } from "@/utils/format";

import type { CouponsTabProps } from "./SellerTabs.types";

export default function CouponsTab({ shopCoupons }: CouponsTabProps) {
  return (
    <TabsContent value="coupons" className="mt-4">
      <div className="mb-3 flex justify-end">
        <Button asChild className="rounded-xl">
          <Link to="/deals">
            <Plus className="mr-2 h-4 w-4" />
            Create coupon
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {shopCoupons.map((coupon) => (
          <Card key={coupon.id} className="rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-lg font-bold">{coupon.code}</div>

                <div className="text-xs text-muted-foreground">
                  {coupon.discount}% · min {formatCurrency(coupon.minOrder)}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {coupon.used}/{coupon.usageLimit} used
              </div>
            </div>
          </Card>
        ))}

        {shopCoupons.length === 0 && <EmptyState title="No coupons" />}
      </div>
    </TabsContent>
  );
}
