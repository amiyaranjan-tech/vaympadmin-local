import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sellers } from "@/data/mock";
import { formatCurrency } from "@/utils/format";
import { DoorOpen, DoorClosed, Clock, Timer } from "lucide-react";

export default function ShopStatus() {
  const open = sellers.filter((s) => s.shopStatus === "open");
  const closed = sellers.filter((s) => s.shopStatus === "closed");
  const openingSoon = sellers.filter((s) => s.shopStatus === "opening_soon");
  const closingSoon = sellers.filter((s) => s.shopStatus === "closing_soon");

  return (
    <div className="space-y-6">
      <PageHeader title="Shop Status" description="Live operational status across the marketplace." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Shops" value={open.length} icon={DoorOpen} tint="success" />
        <StatCard label="Closed Shops" value={closed.length} icon={DoorClosed} tint="destructive" />
        <StatCard label="Opening Soon" value={openingSoon.length} icon={Clock} tint="warning" />
        <StatCard label="Closing Soon" value={closingSoon.length} icon={Timer} tint="secondary" />
      </div>

      <Card className="overflow-hidden rounded-2xl shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Shop</th>
              <th className="px-4 py-3 text-left font-medium">City</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Revenue</th>
              <th className="px-4 py-3 text-right font-medium">Orders</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s.id} className="border-t border-border/60 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={s.logo} className="h-8 w-8 rounded-lg" />
                    <div className="font-medium">{s.shopName}</div>
                  </div>
                </td>
                <td className="px-4 py-3">{s.city}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{s.shopStatus.replace("_", " ")}</Badge></td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(s.revenue)}</td>
                <td className="px-4 py-3 text-right">{s.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
