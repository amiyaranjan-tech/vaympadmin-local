import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Search } from "lucide-react";

import useOrders from "@/hooks/useOrders";
import useSellers from "@/hooks/useSellers";

import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableRowSkeleton } from "@/components/common/Skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import type { Order, OrderQueryParams } from "@/types/order";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/utils/format";

const STATUS = ["all", "Out for Delivery", "Delivered", "Cancelled"] as const;

const PAYMENT = ["all", "paid", "pending", "failed", "refunded"] as const;

export default function Orders() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [sellerId, setSellerId] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);

  // Any filter change jumps back to page 1 — same pattern Users.tsx uses.
  const filterKey = `${q}|${status}|${payment}|${sellerId}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const { sellers } = useSellers({ limit: 100 });

  const queryParams = useMemo<OrderQueryParams>(() => {
    const params: OrderQueryParams = { page };

    if (q.trim()) params.search = q.trim();
    if (status !== "all") params.status = status as OrderQueryParams["status"];
    if (payment !== "all") params.paymentStatus = payment as OrderQueryParams["paymentStatus"];
    if (sellerId !== "all") params.sellerId = sellerId;

    return params;
  }, [page, q, status, payment, sellerId]);

  const { orders, total, totalPages, loading, error, fetchOrders } = useOrders();

  useEffect(() => {
    void fetchOrders(queryParams, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Card className="rounded-2xl p-8 text-center">
          <h2 className="text-lg font-semibold">Unable to load orders</h2>

          <p className="mt-2 text-sm text-muted-foreground">{error}</p>

          <Button
            className="mt-6 rounded-xl"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <PageHeader
        title="Orders"
        description={`${orders.length} of ${total} marketplace orders.`}
      />

      <Card className="shrink-0 rounded-2xl p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Search */}

          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium">Search</label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Order ID, customer or shop..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Status */}

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {STATUS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item === "all" ? "All" : item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment */}

          <div>
            <label className="mb-2 block text-sm font-medium">Payment</label>

            <Select value={payment} onValueChange={setPayment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {PAYMENT.map((item) => (
                  <SelectItem key={item} value={item} className="capitalize">
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seller */}

          <div>
            <label className="mb-2 block text-sm font-medium">Seller</label>

            <Select value={sellerId} onValueChange={setSellerId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Sellers</SelectItem>

                {sellers.map((seller) => (
                  <SelectItem key={seller._id} value={seller._id}>
                    {seller.shopName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl shadow-soft">
        {/* Horizontal scroll stays inside the card */}
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="min-w-[1500px] w-full border-collapse text-sm">
            <thead className="sticky top-0 z-20 bg-muted">
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold">Order</th>

                <th className="px-4 py-3 text-left font-semibold">Customer</th>

                <th className="px-4 py-3 text-left font-semibold">Shop</th>

                <th className="px-4 py-3 text-left font-semibold">Product</th>

                <th className="px-4 py-3 text-center font-semibold">Qty</th>

                <th className="px-4 py-3 text-right font-semibold">Amount</th>

                <th className="px-4 py-3 text-right font-semibold">
                  Commission
                </th>

                <th className="px-4 py-3 text-left font-semibold">Payment</th>

                <th className="px-4 py-3 text-left font-semibold">Status</th>

                <th className="px-4 py-3 text-left font-semibold">Date</th>

                <th className="px-4 py-3 text-center font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <TableRowSkeleton rows={8} cols={11} />
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <motion.tr
                    key={o._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-border hover:bg-muted/40"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-medium">
                      {o.orderNumber}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {o.customerName}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {o.shops[0]?.shopName ?? "—"}

                      {o.shops.length > 1 && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          +{o.shops.length - 1} more
                        </span>
                      )}
                    </td>

                    <td className="max-w-[260px] px-4 py-4">
                      <div className="truncate font-medium">
                        {o.items[0]?.productName}
                      </div>

                      {o.items.length > 1 && (
                        <div className="text-xs text-muted-foreground">
                          +{o.items.length - 1} more products
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {o.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                      {formatCurrency(o.total)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      {formatCurrency(o.commission)}
                    </td>

                    <td className="px-4 py-4">
                      <Badge
                        variant="outline"
                        className="capitalize whitespace-nowrap"
                      >
                        {o.paymentStatus}
                      </Badge>
                    </td>

                    <td className="px-4 py-4">
                      <Badge
                        className="whitespace-nowrap"
                        variant={
                          o.status === "Delivered"
                            ? "default"
                            : o.status === "Cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                      {formatDate(o.createdAt)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelected(o)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <Pagination className="shrink-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            <PaginationItem>
              <span className="px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
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
                {/* Summary */}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-muted/40 p-4">
                    <div className="text-xs text-muted-foreground">
                      Customer
                    </div>

                    <div className="mt-1 font-medium">
                      {selected.customerName}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {selected.customerPhone}
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-4">
                    <div className="text-xs text-muted-foreground">Payment</div>

                    <div className="mt-1 font-medium capitalize">
                      {selected.paymentStatus}
                    </div>

                    <div className="text-xs text-muted-foreground uppercase">
                      {selected.paymentMethod}
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-4 col-span-2">
                    <div className="text-xs text-muted-foreground">
                      Commission
                    </div>

                    <div className="mt-1 font-semibold">
                      {formatCurrency(selected.commission)}
                    </div>
                  </div>
                </div>

                {/* Shops */}

                <div>
                  <h3 className="mb-3 text-sm font-semibold">Shops</h3>

                  <div className="space-y-3">
                    {selected.shops.map((shop, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border p-4"
                      >
                        <div>
                          <div className="font-medium">{shop.shopName}</div>

                          <div className="text-xs text-muted-foreground">
                            {shop.sellerStatus}
                          </div>
                        </div>

                        <div className="font-semibold">
                          {formatCurrency(shop.shopTotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products */}

                <div>
                  <h3 className="mb-3 text-sm font-semibold">Products</h3>

                  <div className="space-y-3">
                    {selected.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border p-4"
                      >
                        <div>
                          <div className="font-medium">{item.productName}</div>

                          <div className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </div>
                        </div>

                        <div className="font-semibold">
                          {formatCurrency(item.quantity * item.price)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-4 font-semibold">
                    <span>Total</span>

                    <span>{formatCurrency(selected.total)}</span>
                  </div>
                </div>

                {/* Timeline */}

                <div>
                  <h3 className="mb-4 text-sm font-semibold">Timeline</h3>

                  <ol className="space-y-4 border-l pl-5">
                    {selected.timeline.map((event, index) => (
                      <li key={index} className="relative">
                        <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary" />

                        <div className="font-medium">{event.label}</div>

                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(event.date)}
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
