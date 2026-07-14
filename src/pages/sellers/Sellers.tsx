import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, ExternalLink, ShieldCheck, Ban, Trash2, Pencil } from "lucide-react";
import { sellers as sellersMock } from "@/data/mock";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Sellers() {
  const [q, setQ] = useState("");
  const [list, setList] = useState(sellersMock);

  const filtered = list.filter((s) =>
    !q || `${s.shopName} ${s.ownerName} ${s.city} ${s.email}`.toLowerCase().includes(q.toLowerCase())
  );

  const doAction = (id: string, action: "approve" | "suspend" | "delete") => {
    setList((prev) => {
      if (action === "delete") { toast.success("Seller deleted"); return prev.filter(s => s.id !== id); }
      if (action === "approve") { toast.success("Seller approved"); return prev.map(s => s.id === id ? { ...s, status: "active" as const } : s); }
      if (action === "suspend") { toast.success("Seller suspended"); return prev.map(s => s.id === id ? { ...s, status: "suspended" as const } : s); }
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sellers"
        description="All shops on the Vaymp marketplace."
        actions={<Button asChild className="rounded-xl"><Link to="/sellers/new"><Plus className="mr-2 h-4 w-4" />Add seller</Link></Button>}
      />

      <Card className="rounded-2xl p-4 shadow-soft">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shop, owner, city…" className="pl-9" />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => (
          <motion.div key={s.id} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
              <div className="h-24 w-full bg-cover bg-center" style={{ backgroundImage: `url(${s.cover})` }} />
              <div className="p-5">
                <div className="-mt-10 flex items-start justify-between">
                  <img src={s.logo} alt="" className="h-14 w-14 rounded-2xl border-4 border-card bg-card object-cover" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link to={`/sellers/${s.id}`}><ExternalLink className="mr-2 h-4 w-4" />View</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to={`/sellers/${s.id}/edit`}><Pencil className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => doAction(s.id, "approve")}><ShieldCheck className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => doAction(s.id, "suspend")}><Ban className="mr-2 h-4 w-4" />Suspend</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => doAction(s.id, "delete")} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Link to={`/sellers/${s.id}`} className="mt-3 block text-lg font-semibold hover:underline">{s.shopName}</Link>
                <div className="text-xs text-muted-foreground">{s.ownerName} · {s.city}</div>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline" className="capitalize">{s.status}</Badge>
                  <Badge variant="outline" className="capitalize">{s.shopStatus.replace("_", " ")}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                  <div><div className="text-xs text-muted-foreground">Revenue</div><div className="text-sm font-semibold">{formatCurrency(s.revenue)}</div></div>
                  <div><div className="text-xs text-muted-foreground">Orders</div><div className="text-sm font-semibold">{s.orders}</div></div>
                  <div><div className="text-xs text-muted-foreground">Rating</div><div className="text-sm font-semibold">{s.rating.toFixed(1)}★</div></div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
