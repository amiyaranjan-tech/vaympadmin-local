import type { User } from "@/types";

export interface UserFilterOptions {
  search: string;
  userId: string;
  status: string;
  city: string;
  orders: string;
  minSpend: string;
  maxSpend: string;
  joinedDate: string;
  wishlist: string;
  customerType: string;
  now: Date;
}

export function filterUsers(users: User[], filters: UserFilterOptions): User[] {
  const {
    search,
    userId,
    status,
    city,
    orders,
    minSpend,
    maxSpend,
    joinedDate,
    wishlist,
    customerType,
    now,
  } = filters;

  return users.filter((user) => {
    const searchText = [
      user.id,
      user.name,
      user.email,
      user.phone,
      user.city,
      user.address,
      user.status,
    ]
      .join(" ")
      .toLowerCase();

    const daysSinceJoined =
      (now.getTime() - new Date(user.createdAt).getTime()) / 86400000;

    // Search
    if (search && !searchText.includes(search.trim().toLowerCase())) {
      return false;
    }

    // User ID
    if (userId && !user.id.toLowerCase().includes(userId.toLowerCase())) {
      return false;
    }

    // Status
    if (status !== "all" && user.status !== status) {
      return false;
    }

    // City
    if (city !== "all" && user.city !== city) {
      return false;
    }

    // Orders
    if (orders !== "all") {
      const minOrders = Number(orders.replace("+", ""));

      if (user.totalOrders < minOrders) {
        return false;
      }
    }

    // Minimum Spend
    if (minSpend && user.totalSpend < Number(minSpend)) {
      return false;
    }

    // Maximum Spend
    if (maxSpend && user.totalSpend > Number(maxSpend)) {
      return false;
    }

    // Joined Date
    if (joinedDate !== "all") {
      switch (joinedDate) {
        case "today":
          if (daysSinceJoined > 1) return false;
          break;

        case "7-days":
          if (daysSinceJoined > 7) return false;
          break;

        case "30-days":
          if (daysSinceJoined > 30) return false;
          break;

        case "3-months":
          if (daysSinceJoined > 90) return false;
          break;

        case "1-year":
          if (daysSinceJoined > 365) return false;
          break;
      }
    }

    // Wishlist
    if (wishlist !== "all") {
      if (wishlist === "yes" && user.wishlist.length === 0) {
        return false;
      }

      if (wishlist === "no" && user.wishlist.length > 0) {
        return false;
      }
    }

    // Customer Type
    if (customerType !== "all") {
      const type =
        user.totalOrders >= 20
          ? "vip"
          : user.totalOrders >= 5
            ? "regular"
            : "new";

      if (type !== customerType) {
        return false;
      }
    }

    return true;
  });
}
