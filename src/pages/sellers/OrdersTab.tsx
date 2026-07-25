// src/pages/sellers/OrdersTab.tsx

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import { formatCurrency } from "@/utils/format";

import type { OrdersTabProps } from "./SellerTabs.types";

export default function OrdersTab({ shopOrders }: OrdersTabProps) {
  return (
    <TabsContent value="orders" className="mt-4">
      <Card className="overflow-hidden rounded-2xl shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Order</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>

          <tbody>
            {shopOrders.map((order) => (
              <tr key={order.id} className="border-t border-border/60">
                <td className="px-4 py-3 font-medium">{order.orderNumber}</td>

                <td className="px-4 py-3">{order.customerName}</td>

                <td className="px-4 py-3">
                  <Badge variant="outline" className="capitalize">
                    {order.status}
                  </Badge>
                </td>

                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(order.total)}
                </td>
              </tr>
            ))}

            {shopOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </TabsContent>
  );
}
