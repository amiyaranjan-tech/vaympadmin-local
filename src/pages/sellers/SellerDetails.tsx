import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import sellerService from "@/services/seller.service";
import useProducts from "@/hooks/useProducts";
import useOffers from "@/hooks/useOffers";

import type { Seller, SellerBrand } from "@/types/seller";
import type { Event, Order } from "./SellerTabs.types";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";

import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";

import {
  IndianRupee,
  Loader2,
  Package,
  Pencil,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import SellerTabs from "./SellerTabs";
import {
  SELLER_ACTION_META,
  SELLER_STATUS_ACTIONS,
  SELLER_STATUS_META,
} from "./seller.status";
import type { SellerAction } from "./seller.status";
import type { AdminRef } from "@/types/seller";

const PLACEHOLDER_COVER =
  "https://placehold.co/1200x400?text=Shop+Cover";

const PLACEHOLDER_LOGO =
  "https://placehold.co/200x200?text=Logo";

// verifiedBy/activatedBy/... are only populated (Admin doc) on the
// GET /sellers/:id response — fall back gracefully if it's ever a bare id.
function adminRefName(ref: AdminRef | undefined): string | null {
  if (!ref || typeof ref === "string") {
    return null;
  }

  return ref.username;
}

interface LifecycleRowProps {
  label: string;
  at?: string | null;
  by?: AdminRef;
}

function LifecycleRow({ label, at, by }: LifecycleRowProps) {
  if (!at) {
    return null;
  }

  const adminName = adminRefName(by);

  return (
    <div className="flex items-center justify-between border-b py-3 text-sm last:border-b-0">
      <div className="font-medium">{label}</div>

      <div className="text-right text-muted-foreground">
        <div>{formatDateTime(at)}</div>

        {adminName && <div className="text-xs">by {adminName}</div>}
      </div>
    </div>
  );
}

export default function SellerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [brands, setBrands] = useState<SellerBrand[]>([]);

  const [loading, setLoading] = useState(Boolean(id));

  const [activeTab, setActiveTab] = useState("overview");
  const [brandFilter, setBrandFilter] = useState<string | null>(null);

  const handleBrandClick = (brand: string) => {
    setBrandFilter(brand);
    setActiveTab("products");
  };

  const handleClearBrandFilter = () => {
    setBrandFilter(null);
  };

  const productParams = useMemo(
    () =>
      id
        ? {
            seller: id,
            status: "published" as const,
            ...(brandFilter ? { brand: brandFilter } : {}),
          }
        : undefined,
    [id, brandFilter],
  );

  const { products: fetchedShopProducts, deleteProduct } = useProducts(productParams);

  // Only show products that are actually available for this shop right
  // now — published (not draft) and with stock on hand. isDeleted is
  // already excluded server-side for every product query.
  const shopProducts = useMemo(
    () => fetchedShopProducts.filter((product) => product.totalStock > 0),
    [fetchedShopProducts],
  );

  // Both bogo AND tier_amount/tier_percentage/free_shipping offers are
  // directly seller-scoped on the backend (bogo's `seller` is required,
  // not just product-scoped — see DealsTab.tsx), so this plain `seller`
  // filter returns every deal type for this shop; DealsTab branches on
  // `deal.type` to render each correctly.
  const offerParams = useMemo(() => (id ? { seller: id, limit: 50 } : undefined), [id]);
  const { offers: shopDeals } = useOffers(offerParams);

  useEffect(() => {
    if (!id) {
      return;
    }

    let mounted = true;

    const loadSeller = async () => {
      try {
        const [data, sellerBrands] = await Promise.all([
          sellerService.getById(id),
          sellerService.getBrands(id),
        ]);

        if (!mounted) {
          return;
        }

        setSeller(data);
        setBrands(sellerBrands);
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

  const [actionPending, setActionPending] = useState(false);

  const runLifecycleAction = async (action: SellerAction) => {
    if (!id) return;

    if (!window.confirm(SELLER_ACTION_META[action].confirm)) {
      return;
    }

    try {
      setActionPending(true);

      if (action === "archive") {
        await sellerService.delete(id);

        toast.success("Seller archived successfully");
        navigate("/sellers");

        return;
      }

      const updated =
        action === "verify"
          ? await sellerService.verify(id)
          : action === "suspend"
            ? await sellerService.suspend(id)
            : action === "deactivate"
              ? await sellerService.deactivate(id)
              : await sellerService.reactivate(id);

      setSeller(updated);

      const successMessage: Record<SellerAction, string> = {
        verify: "Seller verified and activated",
        suspend: "Seller suspended",
        deactivate: "Seller deactivated",
        reactivate: "Seller reactivated",
        archive: "Seller archived successfully",
      };

      toast.success(successMessage[action]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to ${action} seller`,
      );
    } finally {
      setActionPending(false);
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
  const shopEvents: Event[] = [];

  const handleDelete = (type: string) => {
    toast.success(`${type} deleted`);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!window.confirm("Delete this product? This can't be undone.")) return;
    void deleteProduct(productId);
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
            {SELLER_STATUS_ACTIONS[seller.status].map((action) => {
              const meta = SELLER_ACTION_META[action];
              const Icon = meta.icon;

              return (
                <Button
                  key={action}
                  type="button"
                  variant={meta.destructive ? "outline" : "default"}
                  className={cn(
                    "rounded-xl",
                    meta.destructive && "text-destructive hover:text-destructive",
                  )}
                  disabled={actionPending}
                  onClick={() => void runLifecycleAction(action)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {meta.label}
                </Button>
              );
            })}

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

              <Badge className={cn("capitalize", SELLER_STATUS_META[seller.status].badgeClass)}>
                {SELLER_STATUS_META[seller.status].label}
              </Badge>

              {seller.isVerified && (
                <Badge variant="outline" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}

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

      <Card className="rounded-2xl p-6 shadow-soft">
        <div className="mb-2 text-sm font-semibold">Lifecycle</div>

        <div>
          <LifecycleRow label="Created" at={seller.createdAt} />
          <LifecycleRow label="Verified" at={seller.verifiedAt} by={seller.verifiedBy} />
          <LifecycleRow label="Activated" at={seller.activatedAt} by={seller.activatedBy} />
          <LifecycleRow label="Suspended" at={seller.suspendedAt} by={seller.suspendedBy} />
          <LifecycleRow label="Deactivated" at={seller.deactivatedAt} by={seller.deactivatedBy} />
          <LifecycleRow label="Updated" at={seller.updatedAt} />
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <SellerTabs
          seller={seller}
          shopProducts={shopProducts}
          shopOrders={shopOrders}
          shopDeals={shopDeals}
          shopEvents={shopEvents}
          brands={brands}
          onBrandClick={handleBrandClick}
          brandFilter={brandFilter}
          onClearBrandFilter={handleClearBrandFilter}
          onDelete={handleDelete}
          onDeleteProduct={handleDeleteProduct}
        />
      </Tabs>
    </div>
  );
}