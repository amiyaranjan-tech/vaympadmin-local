// src/pages/sellers/DealsTab.tsx

import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Plus, Pencil, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";

import { EmptyState } from "@/components/common/EmptyState";

import type { DealsTabProps } from "./SellerTabs.types";

export default function DealsTab({ shopDeals, onDelete }: DealsTabProps) {
  return (
    <TabsContent value="deals" className="mt-4">
      <div className="mb-3 flex justify-end">
        <Button asChild className="rounded-xl">
          <Link to="/deals">
            <Plus className="mr-2 h-4 w-4" />
            Create deal
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {shopDeals.map((deal) => (
          <Card key={deal.id} className="rounded-2xl p-4 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{deal.title}</div>

                <div className="text-xs capitalize text-muted-foreground">
                  {deal.type} · {deal.discount}% off
                </div>
              </div>

              <Badge variant="outline" className="capitalize">
                {deal.status}
              </Badge>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() => toast.success("Deal updated")}
              >
                <Pencil className="mr-1 h-3 w-3" />
                Edit
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg text-destructive"
                onClick={() => onDelete("Deal")}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            </div>
          </Card>
        ))}

        {shopDeals.length === 0 && <EmptyState title="No deals" />}
      </div>
    </TabsContent>
  );
}
