import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bike,
  Loader2,
  Mail,
  MoreHorizontal,
  Navigation,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";

import useRiders from "@/hooks/useRiders";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton } from "@/components/common/Skeletons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

import {
  getRiderActions,
  RIDER_ACTION_META,
  RIDER_STATUS_META,
} from "./rider.status";
import type { RiderAction } from "./rider.status";
import type { Rider, RiderStatus, VehicleType } from "@/types/rider";
import { RiderTrackingDialog } from "./RiderTrackingDialog";

type QuickFilter = "all" | RiderStatus;

const FILTERS: { key: QuickFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Blocked" },
  { key: "inactive", label: "Inactive" },
  { key: "rejected", label: "Rejected" },
];

const VEHICLE_ICON: Record<VehicleType, typeof Bike> = {
  bike: Bike,
  scooter: Truck,
  cycle: Bike,
};

export default function Riders() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<QuickFilter>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [rejectTarget, setRejectTarget] = useState<Rider | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [trackingRider, setTrackingRider] = useState<Rider | null>(null);

  const isFirstRender = useRef(true);

  const {
    riders,
    total,
    loading,
    error,
    fetchRiders,
    verifyRider,
    rejectRider,
    blockRider,
    unblockRider,
    deleteRider,
  } = useRiders();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    void fetchRiders(filter === "all" ? {} : { status: filter });
  }, [filter, fetchRiders]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    if (!keyword) return riders;

    return riders.filter((rider) =>
      [rider.name, rider.email, rider.phone, rider.vehicleNumber]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [q, riders]);

  const openRejectDialog = (rider: Rider) => {
    setRejectTarget(rider);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;

    try {
      setProcessingId(rejectTarget._id);
      await rejectRider(rejectTarget._id, rejectReason.trim());
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const runAction = async (id: string, action: RiderAction) => {
    if (action === "reject") {
      const rider = riders.find((r) => r._id === id);
      if (rider) openRejectDialog(rider);
      return;
    }

    if (!window.confirm(RIDER_ACTION_META[action].confirm)) {
      return;
    }

    try {
      setProcessingId(id);

      switch (action) {
        case "verify":
          await verifyRider(id);
          break;

        case "block":
          await blockRider(id);
          break;

        case "unblock":
          await unblockRider(id);
          break;

        case "delete":
          await deleteRider(id);
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
          <h2 className="text-lg font-semibold">Unable to load riders</h2>

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
        title="Riders"
        description={`${total} rider${total !== 1 ? "s" : ""} on the platform`}
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/riders/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Rider
            </Link>
          </Button>
        }
      />

      <Card className="rounded-2xl p-4 shadow-soft">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search name, email, phone or vehicle number..."
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
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="No riders found"
          description="Try another search or filter, or add a new rider."
          action={
            <Button asChild className="rounded-xl">
              <Link to="/riders/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Rider
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((rider) => {
            const statusMeta = RIDER_STATUS_META[rider.status];
            const actions = getRiderActions(rider);
            const VehicleIcon = VEHICLE_ICON[rider.vehicleType];
            const busy = processingId === rider._id;

            return (
              <motion.div
                key={rider._id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden rounded-2xl p-5 shadow-soft">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted">
                        <UserRound className="h-6 w-6 text-muted-foreground" />

                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card",
                            rider.isOnline ? "bg-success" : "bg-muted-foreground/40",
                          )}
                          title={rider.isOnline ? "Online" : "Offline"}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold">
                          {rider.name}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <VehicleIcon className="h-3.5 w-3.5" />
                          <span className="capitalize">{rider.vehicleType}</span>
                          {rider.vehicleNumber && <span>• {rider.vehicleNumber}</span>}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={busy}>
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {actions.length === 0 && (
                          <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
                        )}

                        {actions.map((action) => {
                          const meta = RIDER_ACTION_META[action];
                          const Icon = meta.icon;

                          return (
                            <DropdownMenuItem
                              key={action}
                              className={meta.destructive ? "text-destructive" : undefined}
                              disabled={busy}
                              onSelect={() => void runAction(rider._id, action)}
                            >
                              <Icon className="mr-2 h-4 w-4" />
                              {meta.label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{rider.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{rider.phone}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                    <Badge className={cn("capitalize", statusMeta.badgeClass)}>
                      {statusMeta.label}
                    </Badge>

                    {rider.isVerified && (
                      <Badge variant="outline" className="gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}

                    <span className="ml-auto text-xs text-muted-foreground">
                      Joined {formatDate(rider.createdAt)}
                    </span>
                  </div>

                  {rider.activeDelivery && (
                    <button
                      type="button"
                      onClick={() => setTrackingRider(rider)}
                      className="mt-3 flex w-full items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-left text-xs font-medium text-primary transition hover:bg-primary/15"
                    >
                      <span>Out for delivery — #{rider.activeDelivery.orderNumber}</span>
                      <span className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        Track
                      </span>
                    </button>
                  )}

                  {rider.status === "rejected" && rider.rejectionReason && (
                    <p className="mt-3 rounded-lg bg-muted/60 p-2 text-xs text-muted-foreground">
                      Rejected: {rider.rejectionReason}
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reject "{rejectTarget?.name}"</DialogTitle>
            <DialogDescription>
              The rider will see this reason on their account screen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Vehicle documents didn't match the registration."
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={!rejectReason.trim() || processingId === rejectTarget?._id}
              onClick={() => void confirmReject()}
            >
              Reject rider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RiderTrackingDialog
        rider={trackingRider}
        onOpenChange={(open) => !open && setTrackingRider(null)}
      />
    </div>
  );
}
