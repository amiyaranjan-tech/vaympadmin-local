import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IndianRupee,
  Percent,
  ShoppingBag,
  Users as UsersIcon,
  Store,
  Package,
  Tag,
  Plus,
  ArrowRight,
  Send,
  Clock,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCardRowSkeleton, CardSkeleton } from "@/components/common/Skeletons";

import useDashboard from "@/hooks/useDashboard";

import { formatCurrency, formatNumber, formatDate } from "@/utils/format";

const PLACEHOLDER_PRODUCT =
  "https://placehold.co/200x200/e5e7eb/6b7280?text=Product";

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, loading, error } = useDashboard();

  const quickActions = [
    { label: "Add Seller", icon: Store, to: "/sellers/new" },
    { label: "Add Product", icon: Package, to: "/products/new" },
    { label: "Create Deal", icon: Tag, to: "/deals" },
    { label: "Create Event", icon: Plus, to: "/events" },
    { label: "Send Notification", icon: Send, to: "/notifications" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Real-time overview of your hyperlocal fashion marketplace."
        />

        <StatCardRowSkeleton count={6} className="sm:grid-cols-2 lg:grid-cols-3" />

        <div className="grid gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Card className="rounded-2xl p-8 text-center">
          <h2 className="text-lg font-semibold">Unable to load dashboard</h2>

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

  const { counts, revenue, topSellers, recentSellers, recentUsers, recentProducts } =
    stats;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your hyperlocal fashion marketplace."
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/analytics">
              View analytics <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(revenue.total)}
          icon={IndianRupee}
        />

        <StatCard
          label="Commission"
          value={formatCurrency(revenue.commission)}
          icon={Percent}
          tint="secondary"
        />

        <StatCard
          label="Orders"
          value={formatNumber(revenue.orders)}
          icon={ShoppingBag}
          tint="warning"
        />

        <StatCard
          label="Users"
          value={formatNumber(counts.users)}
          delta={
            counts.newUsers > 0 ? `+${counts.newUsers} in last 30 days` : undefined
          }
          icon={UsersIcon}
          tint="success"
        />

        <StatCard
          label="Sellers"
          value={formatNumber(counts.sellers)}
          delta={
            counts.pendingSellers > 0
              ? `${counts.pendingSellers} pending`
              : undefined
          }
          icon={Store}
        />

        <StatCard
          label="Products"
          value={formatNumber(counts.products)}
          delta={
            counts.newProducts > 0
              ? `+${counts.newProducts} this week`
              : undefined
          }
          icon={Package}
          tint="secondary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="col-span-2 rounded-2xl p-6 shadow-soft">
          <div className="mb-4">
            <div className="text-sm font-semibold">Revenue &amp; Orders Analytics</div>
            <div className="text-xs text-muted-foreground">
              Trends, category sales and daily order charts
            </div>
          </div>

          <EmptyState
            icon={Clock}
            title="Not available yet"
            description="These charts need order history, which requires the Orders module to be built on the backend."
          />
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Quick actions</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <motion.button
                  key={action.label}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(action.to)}
                  className="flex flex-col items-start gap-2 rounded-xl border border-border p-3 text-left transition hover:border-primary/50 hover:bg-accent"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Top sellers by revenue</div>

            <Button variant="ghost" size="sm" asChild>
              <Link to="/sellers">View all</Link>
            </Button>
          </div>

          {topSellers.length === 0 ? (
            <EmptyState title="No sellers yet" />
          ) : (
            <div className="space-y-3">
              {topSellers.map((seller, i) => (
                <div
                  key={seller._id}
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-3"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-xs font-semibold">
                    {i + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {seller.shopName}
                    </div>

                    <div className="truncate text-xs text-muted-foreground">
                      {seller.city} · {seller.orders} orders
                    </div>
                  </div>

                  <div className="text-sm font-semibold">
                    {formatCurrency(seller.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Recently added products</div>

            <Button variant="ghost" size="sm" asChild>
              <Link to="/products">View all</Link>
            </Button>
          </div>

          {recentProducts.length === 0 ? (
            <EmptyState title="No products yet" />
          ) : (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-3"
                >
                  <img
                    src={product.images[0]?.url || PLACEHOLDER_PRODUCT}
                    alt=""
                    className="h-11 w-11 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_PRODUCT;
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {product.name}
                    </div>

                    <div className="truncate text-xs text-muted-foreground">
                      {product.brand} · {formatDate(product.createdAt)}
                    </div>
                  </div>

                  <div className="text-sm font-semibold">
                    {formatCurrency(product.finalPrice)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Recently joined sellers</div>

            <Button variant="ghost" size="sm" asChild>
              <Link to="/sellers">View all</Link>
            </Button>
          </div>

          {recentSellers.length === 0 ? (
            <EmptyState title="No sellers yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium">Shop</th>
                    <th className="py-2 text-left font-medium">City</th>
                    <th className="py-2 text-left font-medium">Joined</th>
                    <th className="py-2 text-right font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentSellers.map((seller) => (
                    <tr
                      key={seller._id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3 font-medium">{seller.shopName}</td>
                      <td className="py-3">{seller.city}</td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(seller.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant="outline" className="capitalize">
                          {seller.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Recently joined users</div>

            <Button variant="ghost" size="sm" asChild>
              <Link to="/users">View all</Link>
            </Button>
          </div>

          {recentUsers.length === 0 ? (
            <EmptyState title="No users yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium">Name</th>
                    <th className="py-2 text-left font-medium">Email</th>
                    <th className="py-2 text-left font-medium">Joined</th>
                    <th className="py-2 text-right font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3 font-medium">{user.name}</td>
                      <td className="py-3 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant="outline" className="capitalize">
                          {user.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
