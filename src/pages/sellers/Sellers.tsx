import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import useSellers from "@/hooks/useSellers";

import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";
import { CardGridSkeleton } from "@/components/common/Skeletons";

import {
  SELLER_ACTION_META,
  SELLER_STATUS_ACTIONS,
  SELLER_STATUS_META,
} from "./seller.status";
import type { SellerAction } from "./seller.status";
import type { Seller, SellerStatus } from "@/types/seller";

const PLACEHOLDER_COVER =
  "https://placehold.co/1200x400/e5e7eb/6b7280?text=Shop+Cover";

const PLACEHOLDER_LOGO = "https://placehold.co/200x200/e5e7eb/6b7280?text=Logo";

type QuickFilter =
  | "all"
  | "pending"
  | "active"
  | "suspended"
  | "inactive"
  | "verified"
  | "unverified";

const FILTERS: { key: QuickFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
  { key: "inactive", label: "Inactive" },
  { key: "verified", label: "Verified" },
  { key: "unverified", label: "Unverified" },
];

export default function Sellers() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<QuickFilter>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isFirstRender = useRef(true);

  const {
    sellers,
    total,
    loading,
    error,
    fetchSellers,
    verifySeller,
    suspendSeller,
    deactivateSeller,
    reactivateSeller,
    deleteSeller,
  } = useSellers();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (filter === "verified") {
      void fetchSellers({ isVerified: true });
    } else if (filter === "unverified") {
      void fetchSellers({ isVerified: false });
    } else if (filter === "all") {
      void fetchSellers({});
    } else {
      void fetchSellers({ status: filter as SellerStatus });
    }
  }, [filter, fetchSellers]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    if (!keyword) {
      return sellers;
    }

    return sellers.filter((seller) =>
      [
        seller.shopName,
        seller.ownerName,
        seller.city,
        seller.email,
        seller.phone,
        seller.gstNumber,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [q, sellers]);

  const runAction = async (id: string, action: SellerAction) => {
    if (!window.confirm(SELLER_ACTION_META[action].confirm)) {
      return;
    }

    try {
      setProcessingId(id);

      switch (action) {
        case "verify":
          await verifySeller(id);
          break;

        case "suspend":
          await suspendSeller(id);
          break;

        case "deactivate":
          await deactivateSeller(id);
          break;

        case "reactivate":
          await reactivateSeller(id);
          break;

        case "archive":
          await deleteSeller(id);
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Card className="rounded-2xl p-8 text-center">
          <h2 className="text-lg font-semibold">Unable to load sellers</h2>

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
    <div className="space-y-6">
      <PageHeader
        title="Sellers"
        description={`${total} seller${total !== 1 ? "s" : ""} on the marketplace`}
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/sellers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Seller
            </Link>
          </Button>
        }
      />

      <Card className="rounded-2xl p-4 shadow-soft">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search shop, owner, email, phone, city or GST..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={filter === key ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {loading ? (
        <CardGridSkeleton count={6} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" />
      ) : (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((seller: Seller) => {
          const statusMeta = SELLER_STATUS_META[seller.status];
          const actions = SELLER_STATUS_ACTIONS[seller.status];

          return (
            <motion.div
              key={seller._id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
                <img
                  src={seller.cover?.url || PLACEHOLDER_COVER}
                  alt={seller.shopName}
                  className="h-24 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_COVER;
                  }}
                />

                <div className="p-5">
                  <div className="-mt-10 flex items-start justify-between">
                    <img
                      src={seller.logo?.url || PLACEHOLDER_LOGO}
                      alt={seller.shopName}
                      className="h-14 w-14 rounded-2xl border-4 border-card bg-card object-cover"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_LOGO;
                      }}
                    />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={processingId === seller._id}
                        >
                          {processingId === seller._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/sellers/${seller._id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link to={`/sellers/${seller._id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>

                        {actions.map((action) => {
                          const meta = SELLER_ACTION_META[action];
                          const Icon = meta.icon;

                          return (
                            <DropdownMenuItem
                              key={action}
                              className={meta.destructive ? "text-destructive" : undefined}
                              disabled={processingId === seller._id}
                              onSelect={() => void runAction(seller._id, action)}
                            >
                              <Icon className="mr-2 h-4 w-4" />
                              {meta.label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Link
                    to={`/sellers/${seller._id}`}
                    className="mt-3 block text-lg font-semibold hover:underline"
                  >
                    {seller.shopName}
                  </Link>

                  <div className="text-xs text-muted-foreground">
                    {seller.ownerName} • {seller.city}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className={cn("capitalize", statusMeta.badgeClass)}>
                      {statusMeta.label}
                    </Badge>

                    {seller.isVerified && (
                      <Badge variant="outline" className="gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}

                    <Badge variant="outline" className="capitalize">
                      {(seller.shopStatus ?? "").replaceAll("_", " ")}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Revenue</div>

                      <div className="text-sm font-semibold">
                        {formatCurrency(seller.revenue)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">Orders</div>

                      <div className="text-sm font-semibold">{seller.orders}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        Products
                      </div>

                      <div className="text-sm font-semibold">
                        {seller.products}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="rounded-2xl py-16 text-center shadow-soft">
          <h3 className="text-lg font-semibold">No sellers found</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Try another search or filter, or create a new seller.
          </p>

          <Button asChild className="mt-6 rounded-xl">
            <Link to="/sellers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Seller
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
