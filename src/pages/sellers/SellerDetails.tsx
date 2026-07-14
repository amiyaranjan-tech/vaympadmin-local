import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  sellers, products, orders as ordersMock, deals, coupons, events, revenueSeries,
} from "@/data/mock";
import { formatCurrency, formatDate } from "@/utils/format";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { IndianRupee, ShoppingBag, Package, Star, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

export default function SellerDetails() {
  const { id } = useParams();
  const s = sellers.find((x) => x.id === id);
  if (!s) return <EmptyState title="Seller not found" />;

  const shopProducts = products.filter((p) => p.sellerId === s.id);
  const shopOrders = ordersMock.filter((o) => o.sellerId === s.id);
  const shopDeals = deals.filter((d) => d.sellerId === s.id);
  const shopCoupons = coupons.filter((c) => c.sellerId === s.id);
  const shopEvents = events.filter((e) => e.sellerId === s.id);

  const del = (kind: string) => toast.success(`${kind} deleted`);

  return (
    <div className="space-y-6">
      <PageHeader
        title={s.shopName}
        description={`${s.ownerName} · ${s.city} · Joined ${formatDate(s.createdAt)}`}
        actions={
          <>
            <Button variant="outline" asChild className="rounded-xl"><Link to={`/sellers/${s.id}/edit`}><Pencil className="mr-2 h-4 w-4" />Edit</Link></Button>
            <Button variant="outline" asChild className="rounded-xl"><Link to="/sellers">Back</Link></Button>
          </>
        }
      />

      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="h-36 w-full bg-cover bg-center" style={{ backgroundImage: `url(${s.cover})` }} />
        <div className="flex flex-wrap items-end gap-4 p-6">
          <img src={s.logo} alt="" className="-mt-14 h-20 w-20 rounded-2xl border-4 border-card bg-card object-cover" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xl font-bold">{s.shopName}</div>
              <Badge variant="outline" className="capitalize">{s.status}</Badge>
              <Badge variant="outline" className="capitalize">{s.shopStatus.replace("_", " ")}</Badge>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{s.email} · {s.phone} · {s.workingHours}</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatCurrency(s.revenue)} icon={IndianRupee} />
        <StatCard label="Orders" value={shopOrders.length} icon={ShoppingBag} tint="secondary" />
        <StatCard label="Products" value={shopProducts.length} icon={Package} tint="warning" />
        <StatCard label="Rating" value={`${s.rating.toFixed(1)}★`} icon={Star} tint="success" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="rounded-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl p-6 shadow-soft">
              <div className="mb-3 text-sm font-semibold">Business details</div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-muted-foreground">GST</dt><dd>{s.gst}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Business Reg.</dt><dd>{s.businessReg}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Address</dt><dd>{s.address}, {s.city}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Working days</dt><dd>{s.workingDays.join(", ")}</dd></div>
              </dl>
            </Card>
            <Card className="rounded-2xl p-6 shadow-soft">
              <div className="mb-3 text-sm font-semibold">Bank details</div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-muted-foreground">Account name</dt><dd>{s.bank.accountName}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Account no.</dt><dd className="font-mono">{s.bank.accountNumber}</dd></div>
                <div><dt className="text-xs text-muted-foreground">IFSC</dt><dd className="font-mono">{s.bank.ifsc}</dd></div>
              </dl>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <div className="mb-3 flex justify-end">
            <Button asChild className="rounded-xl"><Link to="/products/new"><Plus className="mr-2 h-4 w-4" />Add product</Link></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shopProducts.slice(0, 12).map((p) => (
              <Card key={p.id} className="flex gap-3 rounded-2xl p-3 shadow-soft">
                <img src={p.images[0]} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{formatCurrency(p.discountPrice)} · stock {p.stock}</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" asChild className="h-7 rounded-lg text-xs"><Link to={`/products/${p.id}/edit`}><Pencil className="mr-1 h-3 w-3" />Edit</Link></Button>
                    <Button size="sm" variant="ghost" onClick={() => del("Product")} className="h-7 rounded-lg text-xs text-destructive"><Trash2 className="mr-1 h-3 w-3" />Delete</Button>
                  </div>
                </div>
              </Card>
            ))}
            {shopProducts.length === 0 && <EmptyState title="No products" />}
          </div>
        </TabsContent>

        <TabsContent value="deals" className="mt-4">
          <div className="mb-3 flex justify-end"><Button asChild className="rounded-xl"><Link to="/deals"><Plus className="mr-2 h-4 w-4" />Create deal</Link></Button></div>
          <div className="grid gap-3 md:grid-cols-2">
            {shopDeals.map((d) => (
              <Card key={d.id} className="rounded-2xl p-4 shadow-soft">
                <div className="flex items-start justify-between">
                  <div><div className="font-medium">{d.title}</div><div className="text-xs text-muted-foreground capitalize">{d.type} · {d.discount}% off</div></div>
                  <Badge variant="outline" className="capitalize">{d.status}</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success("Deal updated")}><Pencil className="mr-1 h-3 w-3" />Edit</Button>
                  <Button size="sm" variant="ghost" className="rounded-lg text-destructive" onClick={() => del("Deal")}><Trash2 className="mr-1 h-3 w-3" />Delete</Button>
                </div>
              </Card>
            ))}
            {shopDeals.length === 0 && <EmptyState title="No deals" />}
          </div>
        </TabsContent>

        <TabsContent value="coupons" className="mt-4">
          <div className="mb-3 flex justify-end"><Button asChild className="rounded-xl"><Link to="/deals"><Plus className="mr-2 h-4 w-4" />Create coupon</Link></Button></div>
          <div className="grid gap-3 md:grid-cols-2">
            {shopCoupons.map((c) => (
              <Card key={c.id} className="rounded-2xl p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <div><div className="font-mono text-lg font-bold">{c.code}</div><div className="text-xs text-muted-foreground">{c.discount}% · min {formatCurrency(c.minOrder)}</div></div>
                  <div className="text-xs text-muted-foreground">{c.used}/{c.usageLimit} used</div>
                </div>
              </Card>
            ))}
            {shopCoupons.length === 0 && <EmptyState title="No coupons" />}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <div className="mb-3 flex justify-end"><Button asChild className="rounded-xl"><Link to="/events"><Plus className="mr-2 h-4 w-4" />Create event</Link></Button></div>
          <div className="grid gap-3 md:grid-cols-2">
            {shopEvents.map((e) => (
              <Card key={e.id} className="overflow-hidden rounded-2xl p-0 shadow-soft">
                <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${e.banner})` }} />
                <div className="p-4"><div className="font-medium">{e.title}</div><div className="text-xs text-muted-foreground">{e.location}</div></div>
              </Card>
            ))}
            {shopEvents.length === 0 && <EmptyState title="No events" />}
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <Card className="rounded-2xl p-6 shadow-soft">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueSeries}>
                <defs><linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="url(#rv)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card className="overflow-hidden rounded-2xl shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3 text-left font-medium">Order</th><th className="px-4 py-3 text-left font-medium">Customer</th><th className="px-4 py-3 text-left font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Total</th></tr></thead>
              <tbody>{shopOrders.map((o) => <tr key={o.id} className="border-t border-border/60"><td className="px-4 py-3 font-medium">{o.orderNumber}</td><td className="px-4 py-3">{o.customerName}</td><td className="px-4 py-3"><Badge variant="outline" className="capitalize">{o.status}</Badge></td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(o.total)}</td></tr>)}</tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card className="rounded-2xl p-6 shadow-soft"><div className="text-sm text-muted-foreground">Custom analytics for this shop coming from your data pipeline.</div></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
