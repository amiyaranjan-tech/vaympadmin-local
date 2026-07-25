import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  LogOut,
  Moon,
  Search,
  Sun,
  User as UserIcon,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import { useTheme } from "@/contexts/ThemeContext";
import useAuth from "@/hooks/useAuth";

import { toast } from "sonner";

import {
  coupons,
  deals,
  events,
  notifications,
  orders as ordersMock,
  products,
  sellers,
  users as usersMock,
} from "@/data/mock";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface SearchItem {
  id: string;
  name?: string;
  shopName?: string;
  title?: string;
  code?: string;
  orderNumber?: string;
}

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { admin, logout } = useAuth();

  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();

  const results = useMemo(() => {
    if (!q.trim()) {
      return null;
    }

    const search = q.toLowerCase();

    return {
      products: products
        .filter((item) => item.name.toLowerCase().includes(search))
        .slice(0, 4),

      sellers: sellers
        .filter(
          (item) =>
            item.shopName.toLowerCase().includes(search) ||
            item.ownerName.toLowerCase().includes(search),
        )
        .slice(0, 4),

      orders: ordersMock
        .filter(
          (item) =>
            item.orderNumber.toLowerCase().includes(search) ||
            item.customerName.toLowerCase().includes(search),
        )
        .slice(0, 3),

      users: usersMock
        .filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            item.email.toLowerCase().includes(search),
        )
        .slice(0, 3),

      deals: deals
        .filter((item) => item.title.toLowerCase().includes(search))
        .slice(0, 3),

      coupons: coupons
        .filter((item) => item.code.toLowerCase().includes(search))
        .slice(0, 3),

      events: events
        .filter((item) => item.title.toLowerCase().includes(search))
        .slice(0, 3),

      notifications: notifications
        .filter((item) => item.title.toLowerCase().includes(search))
        .slice(0, 3),
    };
  }, [q]);

  const handleLogout = async () => {
    await logout();

    toast.success("Signed out");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
      <div className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search products, sellers, orders, users..."
          className="h-10 rounded-xl border-transparent bg-muted pl-9"
        />

        {open && results && q && (
          <div className="absolute left-0 right-0 top-12 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-popover p-2 shadow-elevated">
            {Object.entries(results).map(([key, list]) =>
              list.length > 0 ? (
                <div key={key} className="mb-2">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {key}
                  </div>

                  {(list as SearchItem[]).map((item) => (
                    <button
                      key={item.id}
                      onMouseDown={() => {
                        const path =
                          key === "products"
                            ? "/products"
                            : key === "sellers"
                              ? `/sellers/${item.id}`
                              : `/${key}`;

                        navigate(path);

                        setOpen(false);
                        setQ("");
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <span className="truncate">
                        {item.name ||
                          item.shopName ||
                          item.title ||
                          item.code ||
                          item.orderNumber}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 rounded-xl md:inline-flex"
          >
            <Calendar className="h-4 w-4" />

            {range?.from
              ? `${range.from.toLocaleDateString()} – ${
                  range.to?.toLocaleDateString() ?? "..."
                }`
              : "Date range"}
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-auto p-0">
          <CalendarComponent
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="rounded-xl"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
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

          {notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onSelect={() => navigate("/notifications")}
              className="flex-col items-start gap-1 py-2"
            >
              <div className="text-sm font-medium">{notification.title}</div>

              <div className="text-xs text-muted-foreground">
                {notification.message}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-muted">
            <Avatar className="h-8 w-8">
              <AvatarImage src={admin?.avatar || undefined} />

              <AvatarFallback>
                {admin?.username?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>

            <div className="hidden flex-col items-start md:flex">
              <span className="text-sm font-medium leading-none">
                {admin?.username}
              </span>

              <span className="mt-1 text-xs text-muted-foreground">
                {admin?.role}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {admin?.username}
              </p>

              <p className="text-xs text-muted-foreground">{admin?.email}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to="/settings" className="cursor-pointer">
              <Sun className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={async () => {
              await handleLogout();
            }}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}