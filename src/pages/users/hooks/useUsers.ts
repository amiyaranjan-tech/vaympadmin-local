import { useMemo, useState } from "react";

import { users as usersMock } from "@/data/mock";
import type { User } from "@/types";
import { filterUsers } from "../utils/filterUsers";


export function useUsers() {
  // Basic Filters
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("all");

  // Advanced Filters
  const [orders, setOrders] = useState("all");
  const [minSpend, setMinSpend] = useState("");
  const [maxSpend, setMaxSpend] = useState("");
  const [joinedDate, setJoinedDate] = useState("all");
  const [wishlist, setWishlist] = useState("all");
  const [customerType, setCustomerType] = useState("all");

  // Selected User
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const now = useMemo(() => new Date(), []);

  const filteredUsers = useMemo(
    () =>
      filterUsers(usersMock, {
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
      }),
    [
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
    ],
  );

  return {
    users: usersMock,
    filteredUsers,

    // Selected User
    selectedUser,
    setSelectedUser,

    // Basic Filters
    search,
    setSearch,

    userId,
    setUserId,

    status,
    setStatus,

    city,
    setCity,

    // Advanced Filters
    orders,
    setOrders,

    minSpend,
    setMinSpend,

    maxSpend,
    setMaxSpend,

    joinedDate,
    setJoinedDate,

    wishlist,
    setWishlist,

    customerType,
    setCustomerType,
  };
}
