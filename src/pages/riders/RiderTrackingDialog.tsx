import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { LiveLocationMap } from "@/components/map/LiveLocationMap";
import riderService from "@/services/rider.service";
import { formatDateTime } from "@/utils/format";
import type { Rider } from "@/types/rider";

const POLL_MS = 10000;

interface RiderTrackingDialogProps {
  rider: Rider | null;
  onOpenChange: (open: boolean) => void;
}

// Polls GET /riders/:id (already enriched with lastLocation by
// services/rider.service.js) while open — no dedicated location endpoint
// needed, the existing rider detail fetch already carries it.
export function RiderTrackingDialog({ rider, onOpenChange }: RiderTrackingDialogProps) {
  const [current, setCurrent] = useState<Rider | null>(rider);

  useEffect(() => {
    setCurrent(rider);

    if (!rider) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const fresh = await riderService.getById(rider._id);
        if (!cancelled) setCurrent(fresh);
      } catch {
        // A missed poll is fine — the next tick tries again.
      }
    };

    const interval = setInterval(poll, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [rider]);

  const location = current?.lastLocation;
  const hasFix = typeof location?.lat === "number" && typeof location?.lng === "number";

  return (
    <Dialog open={!!rider} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{rider?.name}'s live location</DialogTitle>
          <DialogDescription>
            {rider?.activeDelivery
              ? `Out for delivery — order #${rider.activeDelivery.orderNumber}`
              : "No longer out for delivery"}
          </DialogDescription>
        </DialogHeader>

        {hasFix && location ? (
          <>
            <LiveLocationMap lat={location.lat as number} lng={location.lng as number} />
            <p className="text-xs text-muted-foreground">
              Last updated {location.updatedAt ? formatDateTime(location.updatedAt) : "—"} ·
              refreshes every {POLL_MS / 1000}s
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Waiting for the rider's first location ping...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
