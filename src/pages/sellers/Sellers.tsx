import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Ban,
  Trash2,
  Pencil,
  Loader2,
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

const PLACEHOLDER_COVER =
  "https://placehold.co/1200x400/e5e7eb/6b7280?text=Shop+Cover";

const PLACEHOLDER_LOGO = "https://placehold.co/200x200/e5e7eb/6b7280?text=Logo";

export default function Sellers() {
  const [q, setQ] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const {
    sellers,
    total,
    loading,
    error,
    approveSeller,
    suspendSeller,
    deleteSeller,
  } = useSellers();

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    if (!keyword) {
      return sellers;
    }

    return sellers.filter((seller) =>
      [seller.shopName, seller.ownerName, seller.city, seller.email]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [q, sellers]);

  const doAction = async (
    id: string,
    action: "approve" | "suspend" | "delete",
  ) => {
    try {
      setProcessingId(id);

      switch (action) {
        case "approve":
          await approveSeller(id);
          break;

        case "suspend":
          await suspendSeller(id);
          break;

        case "delete":
          if (!window.confirm("Are you sure you want to delete this seller?")) {
            return;
          }

          await deleteSeller(id);
          break;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            placeholder="Search shop, owner, city or email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((seller) => (
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

                      <DropdownMenuItem
                        disabled={processingId === seller._id}
                        onSelect={() => void doAction(seller._id, "suspend")}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Suspend
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-destructive"
                        disabled={processingId === seller._id}
                        onSelect={() => void doAction(seller._id, "delete")}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
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
                  <Badge
                    variant={
                      seller.status === "active"
                        ? "default"
                        : seller.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                    className="capitalize"
                  >
                    {seller.status}
                  </Badge>

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
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <Card className="rounded-2xl py-16 text-center shadow-soft">
          <h3 className="text-lg font-semibold">No sellers found</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Try another search or create a new seller.
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
