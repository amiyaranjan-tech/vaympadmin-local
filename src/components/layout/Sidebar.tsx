import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, Sparkles } from "lucide-react";
import { NAV } from "@/constants/nav";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

interface SidebarNavProps {
  // Closes the mobile Sheet after a link is tapped — no-op on desktop.
  onNavigate?: () => void;
}

function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <>
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="text-lg font-bold tracking-tight text-sidebar-foreground">Vaymp</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Admin console</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <SidebarNav />
    </aside>
  );
}

// Hamburger trigger + slide-in drawer for screens below the `md` breakpoint,
// where the fixed Sidebar above is hidden entirely. Rendered from Topbar so
// the trigger sits in the header; the Sheet manages its own open state.
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 rounded-xl md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
