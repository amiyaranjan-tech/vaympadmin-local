import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import sellerService from "@/services/seller.service";
import useProducts from "@/hooks/useProducts";

import type { Seller } from "@/types/seller";
import type { Coupon, Deal, Event, Order } from "./SellerTabs.types";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";

import { formatCurrency, formatDate } from "@/utils/format";

import {
  IndianRupee,
  Loader2,
  Package,
  Pencil,
  ShoppingBag,
} from "lucide-react";

import SellerTabs from "./SellerTabs";

const PLACEHOLDER_COVER =
  "https://placehold.co/1200x400?text=Shop+Cover";

const PLACEHOLDER_LOGO =
  "https://placehold.co/200x200?text=Logo";

export default function SellerDetails() {
  const { id } = useParams();

  const [seller, setSeller] = useState<Seller | null>(null);

  const [loading, setLoading] = useState(Boolean(id));

  const productParams = useMemo(
    () => (id ? { seller: id, status: "published" as const } : undefined),
    [id],
  );

  const { products: fetchedShopProducts } = useProducts(productParams);

  // Only show products that are actually available for this shop right
  // now — published (not draft) and with stock on hand. isDeleted is
  // already excluded server-side for every product query.
  const shopProducts = useMemo(
    () => fetchedShopProducts.filter((product) => product.totalStock > 0),
    [fetchedShopProducts],
  );

  useEffect(() => {
    if (!id) {
      return;
    }

    let mounted = true;

    const loadSeller = async () => {
      try {
        const data = await sellerService.getById(id);

        if (!mounted) {
          return;
        }

        setSeller(data);
      } catch (error) {
        if (!mounted) {
          return;
        }

        toast.error(
          error instanceof Error ? error.message : "Failed to load seller",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadSeller();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleShopStatusChange = async (
    action: "open" | "closed" | "auto",
  ) => {
    if (!id) return;

    try {
      const updated =
        action === "open"
          ? await sellerService.openShop(id)
          : action === "closed"
            ? await sellerService.closeShop(id)
            : await sellerService.setAutoShopStatus(id);

      setSeller(updated);
      toast.success(
        action === "auto"
          ? "Shop status set to automatic"
          : `Shop marked as ${action}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update shop status",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!seller) {
    return <EmptyState title="Seller not found" />;
  }

  // These will come from backend APIs later.
  const shopOrders: Order[] = [];
  const shopDeals: Deal[] = [];
  const shopCoupons: Coupon[] = [];
  const shopEvents: Event[] = [];

  const handleDelete = (type: string) => {
    toast.success(`${type} deleted`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={seller.shopName}
        description={`${seller.ownerName} · ${seller.city} · Joined ${formatDate(
          seller.createdAt,
        )}`}
        actions={
          <>
            <Button variant="outline" asChild className="rounded-xl">
              <Link to={`/sellers/${seller._id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>

            <Button variant="outline" asChild className="rounded-xl">
              <Link to="/sellers">Back</Link>
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div
          className="h-36 w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${seller.cover?.url || PLACEHOLDER_COVER})`,
          }}
        />

        <div className="flex flex-wrap items-end gap-4 p-6">
          <img
            src={seller.logo?.url || PLACEHOLDER_LOGO}
            alt={seller.shopName}
            className="-mt-14 h-20 w-20 rounded-2xl border-4 border-card bg-card object-cover"
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xl font-bold">{seller.shopName}</div>

              <Badge className="capitalize">{seller.status}</Badge>

              <Badge variant="outline" className="capitalize">
                {seller.shopStatus.replaceAll("_", " ")}
              </Badge>

              <Badge variant="secondary" className="capitalize">
                {seller.shopStatusMode === "manual" ? "Manual override" : "Auto"}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() => handleShopStatusChange("open")}
              >
                Force Open
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() => handleShopStatusChange("closed")}
              >
                Force Closed
              </Button>
              {seller.shopStatusMode === "manual" && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="rounded-lg"
                  onClick={() => handleShopStatusChange("auto")}
                >
                  Reset to Automatic
                </Button>
              )}
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              {seller.email} · {seller.phone} · {seller.workingHours.open} -{" "}
              {seller.workingHours.close}
            </div>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          label="Revenue"
          value={formatCurrency(seller.revenue)}
          icon={IndianRupee}
        />

        <StatCard
          label="Orders"
          value={seller.orders}
          icon={ShoppingBag}
          tint="secondary"
        />

        <StatCard
          label="Products"
          value={seller.products}
          icon={Package}
          tint="warning"
        />

        <StatCard
          label="Commission"
          value={formatCurrency(seller.commission)}
          icon={IndianRupee}
          tint="success"
        />

        <StatCard
          label="Returns"
          value={seller.returns}
          icon={Package}
          tint="warning"
        />

        <StatCard
          label="Refunds"
          value={formatCurrency(seller.refunds)}
          icon={IndianRupee}
          tint="destructive"
        />
      </div>

      <Tabs defaultValue="overview">
        <SellerTabs
          seller={seller}
          shopProducts={shopProducts}
          shopOrders={shopOrders}
          shopDeals={shopDeals}
          shopCoupons={shopCoupons}
          shopEvents={shopEvents}
          onDelete={handleDelete}
        />
      </Tabs>
    </div>
  );
}