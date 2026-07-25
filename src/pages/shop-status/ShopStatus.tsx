import { Link } from "react-router-dom";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useSellers from "@/hooks/useSellers";
import { formatCurrency } from "@/utils/format";
import { DoorOpen, DoorClosed, Clock, Timer, Loader2 } from "lucide-react";

const PLACEHOLDER_LOGO = "https://placehold.co/64x64?text=Logo";

export default function ShopStatus() {
  const { sellers, loading, openShop, closeShop, setAutoShopStatus } =
    useSellers({ limit: 100 });

  const open = sellers.filter((s) => s.shopStatus === "open");
  const closed = sellers.filter((s) => s.shopStatus === "closed");
  const openingSoon = sellers.filter((s) => s.shopStatus === "opening_soon");
  const closingSoon = sellers.filter((s) => s.shopStatus === "closing_soon");

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
        title="Shop Status"
        description="Live operational status across the marketplace, computed from each shop's working hours (or a manual override)."
      />

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
              <th className="px-4 py-3 text-left font-medium">Mode</th>
              <th className="px-4 py-3 text-right font-medium">Revenue</th>
              <th className="px-4 py-3 text-right font-medium">Orders</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s._id} className="border-t border-border/60 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    to={`/sellers/${s._id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <img
                      src={s.logo?.url || PLACEHOLDER_LOGO}
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                    <div className="font-medium">{s.shopName}</div>
                  </Link>
                </td>
                <td className="px-4 py-3">{s.city}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="capitalize">
                    {s.shopStatus.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="capitalize">
                    {s.shopStatusMode === "manual" ? "Manual" : "Auto"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(s.revenue)}</td>
                <td className="px-4 py-3 text-right">{s.orders}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => openShop(s._id)}
                    >
                      Open
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => closeShop(s._id)}
                    >
                      Close
                    </Button>
                    {s.shopStatusMode === "manual" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="rounded-lg"
                        onClick={() => setAutoShopStatus(s._id)}
                      >
                        Auto
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
