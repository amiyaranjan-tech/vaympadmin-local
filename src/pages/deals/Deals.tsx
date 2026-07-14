import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deals as dealsMock, coupons as couponsMock, sellers, CATEGORIES_LIST } from "@/data/mock";
import { formatCurrency, formatDate } from "@/utils/format";
import { Plus, Pencil, Trash2, Zap, Sparkles, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const dealSchema = z.object({
  title: z.string().min(2), type: z.string(), discount: z.coerce.number().min(0).max(100),
  sellerId: z.string(), startDate: z.string(), endDate: z.string(),
});
type DealForm = z.infer<typeof dealSchema>;

const couponSchema = z.object({
  code: z.string().min(3), discount: z.coerce.number().min(0).max(100), maxDiscount: z.coerce.number(),
  minOrder: z.coerce.number(), sellerId: z.string(), category: z.string(),
  startDate: z.string(), endDate: z.string(), usageLimit: z.coerce.number(),
});
type CouponForm = z.infer<typeof couponSchema>;

export default function Deals() {
  const [deals, setDeals] = useState(dealsMock);
  const [coupons, setCoupons] = useState(couponsMock);
  const [dealOpen, setDealOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);

  const dealForm = useForm<DealForm>({ resolver: zodResolver(dealSchema), defaultValues: { title: "", type: "flat", discount: 10, sellerId: sellers[0].id, startDate: "", endDate: "" } });
  const couponForm = useForm<CouponForm>({ resolver: zodResolver(couponSchema), defaultValues: { code: "", discount: 10, maxDiscount: 500, minOrder: 999, sellerId: sellers[0].id, category: CATEGORIES_LIST[0], startDate: "", endDate: "", usageLimit: 100 } });

  const createDeal = (v: DealForm) => {
    setDeals([{ id: `dl_${Date.now()}`, title: v.title, type: v.type as any, discount: v.discount, category: "deal", sellerId: v.sellerId, startDate: v.startDate, endDate: v.endDate, status: "active", banner: "https://picsum.photos/seed/new/800/300" }, ...deals]);
    toast.success("Deal created"); setDealOpen(false); dealForm.reset();
  };
  const createCoupon = (v: CouponForm) => {
    setCoupons([{ id: `cp_${Date.now()}`, ...v, used: 0, banner: "https://picsum.photos/seed/newc/800/300" }, ...coupons]);
    toast.success("Coupon created"); setCouponOpen(false); couponForm.reset();
  };

  const flash = deals.filter((d) => d.category === "flash");
  const festival = deals.filter((d) => d.category === "festival");

  return (
    <div className="space-y-6">
      <PageHeader title="Deals & Coupons" description="Manage discounts across the marketplace." />
      <Tabs defaultValue="deals">
        <TabsList className="rounded-xl">
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="flash">Flash Sales</TabsTrigger>
          <TabsTrigger value="festival">Festival Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={dealOpen} onOpenChange={setDealOpen}>
              <DialogTrigger asChild><Button className="rounded-xl"><Plus className="mr-2 h-4 w-4" />Create deal</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>New deal</DialogTitle></DialogHeader>
                <form onSubmit={dealForm.handleSubmit(createDeal)} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input {...dealForm.register("title")} /></div>
                  <div className="space-y-2"><Label>Type</Label>
                    <Select value={dealForm.watch("type")} onValueChange={(v) => dealForm.setValue("type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["flat", "percentage", "combo", "bogo"].map((x) => <SelectItem key={x} value={x} className="capitalize">{x}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Discount %</Label><Input type="number" {...dealForm.register("discount")} /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Seller</Label>
                    <Select value={dealForm.watch("sellerId")} onValueChange={(v) => dealForm.setValue("sellerId", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{sellers.map((s) => <SelectItem key={s.id} value={s.id}>{s.shopName}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Start date</Label><Input type="date" {...dealForm.register("startDate")} /></div>
                  <div className="space-y-2"><Label>End date</Label><Input type="date" {...dealForm.register("endDate")} /></div>
                  <DialogFooter className="md:col-span-2"><Button type="submit" className="rounded-xl">Create deal</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <DealsList items={deals.filter((d) => d.category === "deal")} onDelete={(id) => { setDeals(deals.filter(d => d.id !== id)); toast.success("Deal deleted"); }} />
        </TabsContent>

        <TabsContent value="coupons" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={couponOpen} onOpenChange={setCouponOpen}>
              <DialogTrigger asChild><Button className="rounded-xl"><Plus className="mr-2 h-4 w-4" />Create coupon</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>New coupon</DialogTitle></DialogHeader>
                <form onSubmit={couponForm.handleSubmit(createCoupon)} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2"><Label>Coupon Code</Label><Input className="font-mono uppercase" {...couponForm.register("code")} /></div>
                  <div className="space-y-2"><Label>Discount %</Label><Input type="number" {...couponForm.register("discount")} /></div>
                  <div className="space-y-2"><Label>Max Discount</Label><Input type="number" {...couponForm.register("maxDiscount")} /></div>
                  <div className="space-y-2"><Label>Min Order</Label><Input type="number" {...couponForm.register("minOrder")} /></div>
                  <div className="space-y-2"><Label>Usage Limit</Label><Input type="number" {...couponForm.register("usageLimit")} /></div>
                  <div className="space-y-2"><Label>Seller</Label>
                    <Select value={couponForm.watch("sellerId")} onValueChange={(v) => couponForm.setValue("sellerId", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{sellers.map((s) => <SelectItem key={s.id} value={s.id}>{s.shopName}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Category</Label>
                    <Select value={couponForm.watch("category")} onValueChange={(v) => couponForm.setValue("category", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES_LIST.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Start</Label><Input type="date" {...couponForm.register("startDate")} /></div>
                  <div className="space-y-2"><Label>End</Label><Input type="date" {...couponForm.register("endDate")} /></div>
                  <DialogFooter className="md:col-span-2"><Button type="submit" className="rounded-xl">Create coupon</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {coupons.map((c) => (
              <Card key={c.id} className="rounded-2xl p-5 shadow-soft">
                <div className="flex items-start justify-between">
                  <div><div className="font-mono text-xl font-bold">{c.code}</div><div className="text-xs text-muted-foreground">{c.discount}% off · max {formatCurrency(c.maxDiscount)}</div></div>
                  <TagIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground"><div>Min order<br /><span className="font-medium text-foreground">{formatCurrency(c.minOrder)}</span></div><div>Usage<br /><span className="font-medium text-foreground">{c.used}/{c.usageLimit}</span></div></div>
                <div className="mt-3 text-xs text-muted-foreground">{formatDate(c.startDate)} → {formatDate(c.endDate)}</div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success("Coupon updated")}><Pencil className="mr-1 h-3 w-3" />Edit</Button>
                  <Button size="sm" variant="ghost" className="rounded-lg text-destructive" onClick={() => { setCoupons(coupons.filter(x => x.id !== c.id)); toast.success("Coupon deleted"); }}><Trash2 className="mr-1 h-3 w-3" />Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flash" className="mt-4"><DealsList items={flash} onDelete={(id) => { setDeals(deals.filter(d => d.id !== id)); toast.success("Deleted"); }} icon={Zap} /></TabsContent>
        <TabsContent value="festival" className="mt-4"><DealsList items={festival} onDelete={(id) => { setDeals(deals.filter(d => d.id !== id)); toast.success("Deleted"); }} icon={Sparkles} /></TabsContent>
      </Tabs>
    </div>
  );
}

function DealsList({ items, onDelete, icon: Icon = TagIcon }: { items: any[]; onDelete: (id: string) => void; icon?: any }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map((d) => (
        <Card key={d.id} className="overflow-hidden rounded-2xl p-0 shadow-soft">
          <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${d.banner})` }} />
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /><div className="font-medium">{d.title}</div></div>
                <div className="mt-1 text-xs text-muted-foreground capitalize">{d.type} · {d.discount}% off</div>
              </div>
              <Badge variant="outline" className="capitalize">{d.status}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success("Deal updated")}><Pencil className="mr-1 h-3 w-3" />Edit</Button>
              <Button size="sm" variant="ghost" className="rounded-lg text-destructive" onClick={() => onDelete(d.id)}><Trash2 className="mr-1 h-3 w-3" />Delete</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
