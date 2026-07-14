import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { refunds as refundsMock } from "@/data/mock";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";
import { Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import type { Refund } from "@/types";

export default function Refunds() {
  const [list, setList] = useState(refundsMock);
  const [selected, setSelected] = useState<Refund | null>(null);

  const decide = (id: string, status: "approved" | "rejected") => {
    setList((p) => p.map((r) => r.id === id ? { ...r, status } : r));
    toast.success(`Refund ${status}`);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Refunds" description="Review and process refund requests." />

      <Card className="overflow-hidden rounded-2xl shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Order</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Seller</th>
              <th className="px-4 py-3 text-left font-medium">Reason</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-t border-border/60 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{r.orderNumber}</td>
                <td className="px-4 py-3">{r.customerName}</td>
                <td className="px-4 py-3">{r.sellerName}</td>
                <td className="px-4 py-3">{r.reason}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{r.status}</Badge></td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(r.amount)}</td>
                <td className="px-4 py-3 text-right"><Button size="icon" variant="ghost" onClick={() => setSelected(r)}><Eye className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selected && (
            <>
              <SheetHeader><SheetTitle>Refund · {selected.orderNumber}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-muted/40 p-4"><div className="text-xs text-muted-foreground">Amount</div><div className="text-xl font-semibold">{formatCurrency(selected.amount)}</div></div>
                <div className="text-sm"><span className="text-muted-foreground">Reason:</span> {selected.reason}</div>
                <div className="text-sm"><span className="text-muted-foreground">Requested:</span> {formatDate(selected.createdAt)}</div>
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timeline</div>
                  <ol className="space-y-3 border-l border-border pl-4">
                    {selected.timeline.map((t, i) => (
                      <li key={i} className="relative">
                        <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <div className="text-sm font-medium">{t.label}</div>
                        <div className="text-xs text-muted-foreground">{formatDateTime(t.date)}</div>
                      </li>
                    ))}
                  </ol>
                </div>
                {selected.status === "pending" && (
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 rounded-xl" onClick={() => decide(selected.id, "approved")}><Check className="mr-2 h-4 w-4" />Approve</Button>
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => decide(selected.id, "rejected")}><X className="mr-2 h-4 w-4" />Reject</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
