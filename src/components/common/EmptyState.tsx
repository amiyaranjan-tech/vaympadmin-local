import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title = "Nothing here yet", description, action }: { title?: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-muted"><Inbox className="h-6 w-6 text-muted-foreground" /></div>
      <div className="mt-4 text-base font-semibold">{title}</div>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
