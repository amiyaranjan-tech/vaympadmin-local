import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IndianRupee, Percent, ShoppingBag, Users as UsersIcon, Store, Package,
  Tag, TrendingUp, Plus, ArrowRight, Send,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { revenueSeries, categorySales, dailyOrders, orders as ordersMock, sellers, products, users as usersMock, deals } from "@/data/mock";
import { formatCurrency, formatNumber, formatDate } from "@/utils/format";

const totalRevenue = ordersMock.reduce((a, b) => a + b.total, 0);
const totalCommission = ordersMock.reduce((a, b) => a + b.commission, 0);
const CHART_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-primary)"];

const topSellers = [...sellers].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
const topProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);

export default function Dashboard() {
  const navigate = useNavigate();
  const quickActions = [
    { label: "Add Seller", icon: Store, to: "/sellers/new" },
    { label: "Add Product", icon: Package, to: "/products/new" },
    { label: "Create Deal", icon: Tag, to: "/deals" },
    { label: "Create Coupon", icon: Percent, to: "/deals" },
    { label: "Create Event", icon: Plus, to: "/events" },
    { label: "Send Notification", icon: Send, to: "/notifications" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your hyperlocal fashion marketplace."
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/analytics">View analytics <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} delta="+12.4% MoM" icon={IndianRupee} />
        <StatCard label="Commission" value={formatCurrency(totalCommission)} delta="+9.2%" icon={Percent} tint="secondary" />
        <StatCard label="Orders" value={formatNumber(ordersMock.length)} delta="+4.1%" icon={ShoppingBag} tint="warning" />
        <StatCard label="Users" value={formatNumber(usersMock.length)} delta="+18 new" icon={UsersIcon} tint="success" />
        <StatCard label="Sellers" value={formatNumber(sellers.length)} delta="+2 pending" icon={Store} />
        <StatCard label="Products" value={formatNumber(products.length)} delta="+23 this week" icon={Package} tint="secondary" />
        <StatCard label="Active Deals" value={formatNumber(deals.filter(d => d.status === "active").length)} icon={Tag} tint="warning" />
        <StatCard label="Monthly Growth" value="14.8%" delta="↑ 3.2 pts" icon={TrendingUp} tint="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="col-span-2 rounded-2xl p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Revenue & Commission</div>
              <div className="text-xs text-muted-foreground">Last 12 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueSeries}>
              <defs>
                <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="r2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="url(#r1)" strokeWidth={2} />
              <Area type="monotone" dataKey="commission" stroke="var(--color-secondary)" fill="url(#r2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4">
            <div className="text-sm font-semibold">Category Sales</div>
            <div className="text-xs text-muted-foreground">Share by category</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categorySales} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {categorySales.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Daily Orders</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
              <Bar dataKey="orders" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Orders trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
              <Line dataKey="orders" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Quick actions</div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <motion.button
                  key={a.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(a.to)}
                  className="flex flex-col items-start gap-2 rounded-xl border border-border p-3 text-left transition hover:border-primary/50 hover:bg-accent"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">{a.label}</span>
                </motion.button>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Top sellers</div>
            <Button variant="ghost" size="sm" asChild><Link to="/sellers">View all</Link></Button>
          </div>
          <div className="space-y-3">
            {topSellers.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-xs font-semibold">{i + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.shopName}</div>
                  <div className="truncate text-xs text-muted-foreground">{s.city} · {s.orders} orders</div>
                </div>
                <div className="text-sm font-semibold">{formatCurrency(s.revenue)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Top products</div>
            <Button variant="ghost" size="sm" asChild><Link to="/products">View all</Link></Button>
          </div>
          <div className="space-y-3">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
                <img src={p.images[0]} alt="" className="h-11 w-11 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.brand} · {p.sold} sold</div>
                </div>
                <div className="text-sm font-semibold">{formatCurrency(p.discountPrice)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold">Recent orders</div>
          <Button variant="ghost" size="sm" asChild><Link to="/orders">View all</Link></Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 text-left font-medium">Order</th>
                <th className="py-2 text-left font-medium">Customer</th>
                <th className="py-2 text-left font-medium">Seller</th>
                <th className="py-2 text-left font-medium">Date</th>
                <th className="py-2 text-left font-medium">Status</th>
                <th className="py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {ordersMock.slice(0, 6).map((o) => (
                <tr key={o.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-medium">{o.orderNumber}</td>
                  <td className="py-3">{o.customerName}</td>
                  <td className="py-3">{o.sellerName}</td>
                  <td className="py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                  <td className="py-3"><Badge variant="outline" className="capitalize">{o.status}</Badge></td>
                  <td className="py-3 text-right font-semibold">{formatCurrency(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
