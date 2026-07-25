// src/pages/sellers/EventsTab.tsx

import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import { EmptyState } from "@/components/common/EmptyState";

import type { EventsTabProps } from "./SellerTabs.types";

export default function EventsTab({ shopEvents }: EventsTabProps) {
  return (
    <TabsContent value="events" className="mt-4">
      <div className="mb-3 flex justify-end">
        <Button asChild className="rounded-xl">
          <Link to="/events">
            <Plus className="mr-2 h-4 w-4" />
            Create event
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {shopEvents.map((event) => (
          <Card
            key={event.id}
            className="overflow-hidden rounded-2xl p-0 shadow-soft"
          >
            <div
              className="h-28 bg-cover bg-center"
              style={{
                backgroundImage: `url(${event.banner})`,
              }}
            />

            <div className="p-4">
              <div className="font-medium">{event.title}</div>

              <div className="text-xs text-muted-foreground">
                {event.location}
              </div>
            </div>
          </Card>
        ))}

        {shopEvents.length === 0 && <EmptyState title="No events" />}
      </div>
    </TabsContent>
  );
}
