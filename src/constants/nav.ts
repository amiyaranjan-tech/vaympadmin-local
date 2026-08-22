import {
  LayoutDashboard, ShoppingBag, Store, Package, ClipboardCheck, Image, LayoutGrid, Tag, Calendar,
  Users, Bell, DoorOpen, BarChart3, RotateCcw, Settings,
} from "lucide-react";

export const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/sellers", label: "Sellers", icon: Store },
  { to: "/products", label: "Products", icon: Package },
  { to: "/products/approvals", label: "Product Approvals", icon: ClipboardCheck },
  { to: "/marketing/banners", label: "Banners", icon: Image },
  { to: "/category-banners", label: "Category Banners", icon: LayoutGrid },
  { to: "/deals", label: "Deals", icon: Tag },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/users", label: "Users", icon: Users },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/shop-status", label: "Shop Status", icon: DoorOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/refunds", label: "Refunds", icon: RotateCcw },
  { to: "/settings", label: "Settings", icon: Settings },
];
