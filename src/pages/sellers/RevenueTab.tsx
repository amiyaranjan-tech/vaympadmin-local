// src/pages/sellers/RevenueTab.tsx

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import type { RevenueTabProps } from "./SellerTabs.types";

export default function RevenueTab({ seller }: RevenueTabProps) {
  // Temporary data until backend analytics API is available.
  const revenueSeries = [
    {
      month: "Current",
      revenue: seller.revenue,
    },
  ];

  return (
    <TabsContent value="revenue" className="mt-4">
      <Card className="rounded-2xl p-6 shadow-soft">
        {seller.revenue > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueSeries}>
              <defs>
                <linearGradient
                  id="seller-revenue-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.4}
                  />

                  <stop
                    offset="100%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                fontSize={11}
                stroke="var(--color-muted-foreground)"
              />

              <YAxis fontSize={11} stroke="var(--color-muted-foreground)" />

              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-popover)",
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-primary)"
                fill="url(#seller-revenue-gradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Revenue analytics will appear once sales data is available.
          </div>
        )}
      </Card>
    </TabsContent>
  );
}
