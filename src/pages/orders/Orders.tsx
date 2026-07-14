import { useState, useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { orders as ordersMock, sellers } from "@/data/mock";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";
import { Search, Eye } from "lucide-react";
import type { Order } from "@/types";
import { motion } from "framer-motion";

const STATUS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const;
const PAYMENT = ["all", "paid", "pending", "failed", "refunded"] as const;

export default function Orders() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [payment, setPayment] = useState<string>("all");
  const [sellerId, setSellerId] = useState<string>("all");
  const [selected, setSelected] = useState<Order | null>(null);

  const list = useMemo(() => ordersMock.filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    if (payment !== "all" && o.paymentStatus !== payment) return false;
    if (sellerId !== "all" && o.sellerId !== sellerId) return false;
    if (q && !(`${o.orderNumber} ${o.customerName} ${o.sellerName}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [q, status, payment, sellerId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track and manage marketplace orders."
      />

      <Card className="rounded-2xl p-4 shadow-soft">
        <div className="grid gap-4 md:grid-cols-5">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Order ID, customer or seller..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Payment
            </label>
            <Select value={payment} onValueChange={setPayment}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seller */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Seller
            </label>
            <Select value={sellerId} onValueChange={setSellerId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sellers</SelectItem>
                {sellers.map((seller) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.shopName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-2xl shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Seller</th>
                <th className="px-4 py-3 text-left font-medium">Payment</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-border/60 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">{o.sellerName}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {o.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {o.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatCurrency(o.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelected(o)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.orderNumber}</SheetTitle>
                <SheetDescription>
                  Placed {formatDateTime(selected.createdAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-xs text-muted-foreground">
                      Customer
                    </div>
                    <div className="font-medium">{selected.customerName}</div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-xs text-muted-foreground">Seller</div>
                    <div className="font-medium">{selected.sellerName}</div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-xs text-muted-foreground">Payment</div>
                    <div className="font-medium capitalize">
                      {selected.paymentStatus} · {selected.paymentMethod}
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-xs text-muted-foreground">
                      Commission
                    </div>
                    <div className="font-medium">
                      {formatCurrency(selected.commission)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Products
                  </div>
                  <div className="space-y-2">
                    {selected.items.map((it) => (
                      <div
                        key={it.productId}
                        className="flex items-center justify-between rounded-xl border border-border/60 p-3"
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {it.productName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Qty {it.qty}
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          {formatCurrency(it.price * it.qty)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(selected.total)}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Timeline
                  </div>
                  <ol className="space-y-3 border-l border-border pl-4">
                    {selected.timeline.map((t, i) => (
                      <li key={i} className="relative">
                        <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <div className="text-sm font-medium">{t.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(t.date)}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
