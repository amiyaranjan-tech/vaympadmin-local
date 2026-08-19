import { Link } from "react-router-dom";
import { Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { Offer } from "@/types/offer";
import { offerMechanicLabel } from "./dealMatching";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offers: Offer[];
}

// Same "view a product's own deals" idea as the Consumer app's
// ProductDealsSheet (opened from its "DEAL ›" chip / single-deal label) —
// a read-only sidebar naming every currently-active offer this product
// qualifies for, with each one's own mechanic and description.
export function ProductDealSheet({ open, onOpenChange, offers }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{offers.length > 1 ? "Active Deals" : offers[0]?.title ?? "Deal"}</SheetTitle>

          <SheetDescription>
            {offers.length > 1
              ? `This product qualifies for ${offers.length} active deals.`
              : "This product's active deal."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {offers.map((offer) => (
            <div key={offer._id} className="rounded-2xl border p-4 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{offer.title}</div>

                <Badge className="shrink-0 gap-1 bg-amber-500 text-white">
                  <Tag className="h-3 w-3" />
                  {offerMechanicLabel(offer)}
                </Badge>
              </div>

              {offer.description && (
                <p className="mt-2 text-sm text-muted-foreground">{offer.description}</p>
              )}

              <Button size="sm" variant="outline" className="mt-3 rounded-lg" asChild>
                <Link
                  to={
                    offer.type === "bogo"
                      ? `/deals/bogo/${offer._id}/edit`
                      : `/deals/spend-threshold/${offer._id}/edit`
                  }
                >
                  Manage this deal
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
