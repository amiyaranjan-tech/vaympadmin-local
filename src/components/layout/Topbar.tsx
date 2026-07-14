import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Moon, Sun, Search, LogOut, User as UserIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { products, sellers, orders as ordersMock, users as usersMock, deals, coupons, events, notifications } from "@/data/mock";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();

  const results = useMemo(() => {
    if (!q.trim()) return null;
    const s = q.toLowerCase();
    return {
      products: products.filter((p) => p.name.toLowerCase().includes(s)).slice(0, 4),
      sellers: sellers.filter((x) => x.shopName.toLowerCase().includes(s) || x.ownerName.toLowerCase().includes(s)).slice(0, 4),
      orders: ordersMock.filter((x) => x.orderNumber.toLowerCase().includes(s) || x.customerName.toLowerCase().includes(s)).slice(0, 3),
      users: usersMock.filter((x) => x.name.toLowerCase().includes(s) || x.email.toLowerCase().includes(s)).slice(0, 3),
      deals: deals.filter((x) => x.title.toLowerCase().includes(s)).slice(0, 3),
      coupons: coupons.filter((x) => x.code.toLowerCase().includes(s)).slice(0, 3),
      events: events.filter((x) => x.title.toLowerCase().includes(s)).slice(0, 3),
      notifications: notifications.filter((x) => x.title.toLowerCase().includes(s)).slice(0, 3),
    };
  }, [q]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search products, sellers, orders, users…"
          className="h-10 rounded-xl border-transparent bg-muted pl-9"
        />
        {open && results && q && (
          <div className="absolute left-0 right-0 top-12 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-popover p-2 shadow-elevated">
            {Object.entries(results).map(([key, list]) => list.length > 0 && (
              <div key={key} className="mb-2">
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{key}</div>
                {list.map((item: any) => (
                  <button
                    key={item.id}
                    onMouseDown={() => {
                      const path = key === "products" ? `/products` : key === "sellers" ? `/sellers/${item.id}` : `/${key}`;
                      navigate(path);
                      setOpen(false);
                      setQ("");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span className="truncate">{item.name || item.shopName || item.title || item.code || item.orderNumber}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="hidden gap-2 rounded-xl md:inline-flex">
            <Calendar className="h-4 w-4" />
            {range?.from ? `${range.from.toLocaleDateString()} – ${range.to?.toLocaleDateString() ?? "…"}` : "Date range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-0">
          <CalendarComponent mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
        </PopoverContent>
      </Popover>

      <Button variant="ghost" size="icon" onClick={toggle} className="rounded-xl">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-xl">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.slice(0, 5).map((n) => (
            <DropdownMenuItem key={n.id} onSelect={() => navigate("/notifications")} className="flex-col items-start gap-1 py-2">
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground">{n.message}</div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-muted">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:inline">{user?.name}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile"><UserIcon className="mr-2 h-4 w-4" /> Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
