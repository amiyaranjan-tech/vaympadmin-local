// src/pages/sellers/AnalyticsTab.tsx

import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import type { AnalyticsTabProps } from "./SellerTabs.types";

export default function AnalyticsTab({ seller }: AnalyticsTabProps) {
  const stats = [
    {
      label: "Revenue",
      value: `₹${seller.revenue.toLocaleString()}`,
    },
    {
      label: "Orders",
      value: seller.orders,
    },
    {
      label: "Products",
      value: seller.products,
    },
    {
      label: "Commission",
      value: `₹${seller.commission.toLocaleString()}`,
    },
    {
      label: "Returns",
      value: seller.returns,
    },
    {
      label: "Refunds",
      value: seller.refunds,
    },
  ];

  return (
    <TabsContent value="analytics" className="mt-4">
      <Card className="rounded-2xl p-6 shadow-soft">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Seller Analytics</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Current analytics generated from seller data.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border p-4">
              <div className="text-sm text-muted-foreground">{item.label}</div>

              <div className="mt-2 text-2xl font-bold">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-dashed p-5">
          <h4 className="font-medium">Upcoming Analytics</h4>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Revenue trends by day, week and month</li>
            <li>Order growth analytics</li>
            <li>Top-selling products</li>
            <li>Conversion rate</li>
            <li>Customer retention</li>
            <li>Average order value (AOV)</li>
            <li>Repeat customer analysis</li>
            <li>Return and refund insights</li>
            <li>Inventory performance</li>
            <li>Sales by category</li>
          </ul>
        </div>
      </Card>
    </TabsContent>
  );
}
