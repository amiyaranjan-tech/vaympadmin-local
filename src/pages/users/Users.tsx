import { PageHeader } from "@/components/common/PageHeader";

import { useUsers } from "./hooks/useUsers";

import { UserSearch } from "./UserSearch";
import { UserTable } from "./UserTable";
import { UserDetailsSheet } from "./UserDetailsSheet";

export default function Users() {
  const {
    users,
    filteredUsers,

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

    // Selected User
    selectedUser,
    setSelectedUser,
  } = useUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={`${filteredUsers.length} of ${users.length} shoppers on Vaymp`}
      />

      <UserSearch
        search={search}
        onSearchChange={setSearch}
        userId={userId}
        onUserIdChange={setUserId}
        status={status}
        onStatusChange={setStatus}
        city={city}
        onCityChange={setCity}
        orders={orders}
        onOrdersChange={setOrders}
        minSpend={minSpend}
        onMinSpendChange={setMinSpend}
        maxSpend={maxSpend}
        onMaxSpendChange={setMaxSpend}
        joinedDate={joinedDate}
        onJoinedDateChange={setJoinedDate}
        wishlist={wishlist}
        onWishlistChange={setWishlist}
        customerType={customerType}
        onCustomerTypeChange={setCustomerType}
      />

      <UserTable users={filteredUsers} onView={setSelectedUser} />

      <UserDetailsSheet
        open={!!selectedUser}
        user={selectedUser}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
          }
        }}
      />
    </div>
  );
}
