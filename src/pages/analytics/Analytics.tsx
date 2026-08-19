import { useState } from "react";
import { Activity, Clock, Smartphone, Users } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { Card } from "@/components/ui/card";
import { StatCardRowSkeleton } from "@/components/common/Skeletons";
import { revenueSeries, categorySales, dailyOrders, sellers, products, CATEGORIES_LIST } from "@/data/mock";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { formatCurrency } from "@/utils/format";
import useEngagementAnalytics from "@/hooks/useEngagementAnalytics";

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-primary)"];

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function Analytics() {
  const [range, setRange] = useState<DateRange | undefined>();

  const { data: engagement, loading: engagementLoading } = useEngagementAnalytics(
    range?.from ? { from: range.from.toISOString(), to: range.to?.toISOString() } : undefined,
  );

  const topBrands = Object.entries(products.reduce<Record<string, number>>((a, p) => { a[p.brand] = (a[p.brand] ?? 0) + p.sold; return a; }, {}))
    .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  const topCategories = CATEGORIES_LIST.map((c) => ({ name: c, value: products.filter(p => p.category === c).reduce((a, b) => a + b.sold, 0) })).sort((a, b) => b.value - a.value).slice(0, 6);

  const topSellers = [...sellers].sort((a, b) => b.revenue - a.revenue).slice(0, 6).map((s) => ({ name: s.shopName, revenue: s.revenue }));
  const topProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 6).map((p) => ({ name: p.name.slice(0, 12), sold: p.sold }));

  const heatmap = Array.from({ length: 7 }, (_, r) => Array.from({ length: 12 }, (_, c) => ({ r, c, v: (r * 7 + c * 11) % 90 })));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep insight into revenue, commission and demand."
        actions={<DateRangeFilter value={range} onChange={setRange} />}
      />

      <div>
        <div className="mb-3 text-sm font-semibold text-muted-foreground">
          Engagement (last {range?.from ? "selected range" : "7 days"})
        </div>

        {engagementLoading ? (
          <StatCardRowSkeleton count={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Unique users"
              value={engagement?.uniqueUsers ?? 0}
              icon={Users}
              tint="primary"
            />
            <StatCard
              label="Sessions"
              value={engagement?.sessionsStarted ?? 0}
              icon={Smartphone}
              tint="secondary"
            />
            <StatCard
              label="Avg. active time"
              value={formatDuration(engagement?.avgActiveDurationMs ?? 0)}
              icon={Clock}
              tint="success"
            />
            <StatCard
              label="Total events"
              value={engagement?.totalEvents ?? 0}
              icon={Activity}
              tint="warning"
            />
          </div>
        )}

        {!engagementLoading && engagement && (engagement.topScreens.length > 0 || engagement.topEvents.length > 0) && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {engagement.topScreens.length > 0 && (
              <Card className="rounded-2xl p-6 shadow-soft">
                <div className="mb-4 text-sm font-semibold">Top screens</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={engagement.topScreens} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis dataKey="screen" type="category" stroke="var(--color-muted-foreground)" fontSize={11} width={100} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
                    <Bar dataKey="views" fill="var(--color-chart-1)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {engagement.topEvents.length > 0 && (
              <Card className="rounded-2xl p-6 shadow-soft">
                <div className="mb-4 text-sm font-semibold">Top events</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={engagement.topEvents} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis dataKey="event" type="category" stroke="var(--color-muted-foreground)" fontSize={11} width={140} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
                    <Bar dataKey="count" fill="var(--color-chart-2)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        )}
      </div>

      <div className="mb-1 text-sm font-semibold text-muted-foreground">
        Sales overview (demo data — connects once the Orders module ships)
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Revenue</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueSeries}>
              <defs><linearGradient id="a1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="url(#a1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Commission trend</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
              <Line dataKey="commission" stroke="var(--color-secondary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Orders</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
              <Bar dataKey="orders" fill="var(--color-chart-3)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Top categories</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categorySales} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                {categorySales.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Top brands</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topBrands} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="var(--color-muted-foreground)" fontSize={11} width={90} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
              <Bar dataKey="value" fill="var(--color-chart-1)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Top sellers by revenue</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topSellers}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} interval={0} angle={-20} height={60} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
              <Bar dataKey="revenue" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Top products</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} interval={0} angle={-20} height={60} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-popover)" }} />
              <Bar dataKey="sold" fill="var(--color-chart-4)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Category demand ({topCategories.length})</div>
          <div className="space-y-2">
            {topCategories.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex items-center justify-between text-xs"><span>{c.name}</span><span className="font-medium">{c.value}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (c.value / topCategories[0].value) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl p-6 shadow-soft">
        <div className="mb-4 text-sm font-semibold">Activity heatmap</div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 pr-2 text-[10px] text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="h-5 leading-5">{d}</div>)}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            {heatmap.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map((cell) => (
                  <div key={cell.c} className="h-5 flex-1 rounded" style={{ backgroundColor: `oklch(0.55 0.22 265 / ${0.1 + (cell.v / 100) * 0.8})` }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
