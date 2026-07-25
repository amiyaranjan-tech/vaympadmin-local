import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import useUsers from "@/hooks/useUsers";

import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { UserSearch } from "./UserSearch";
import { UserTable } from "./UserTable";
import { UserDetailsSheet } from "./UserDetailsSheet";

import type { User } from "@/types/user";

export default function Users() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [isVerified, setIsVerified] = useState("all");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { users, total, loading, error, fetchUsers } = useUsers();

  useEffect(() => {
    void fetchUsers(
      {
        status: status === "all" ? undefined : (status as User["status"]),
        isVerified: isVerified === "all" ? undefined : isVerified === "yes",
      },
      false,
    );
  }, [status, isVerified, fetchUsers]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.phone]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [search, users]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Card className="rounded-2xl p-8 text-center">
          <h2 className="text-lg font-semibold">Unable to load users</h2>

          <p className="mt-2 text-sm text-muted-foreground">{error}</p>

          <Button
            className="mt-6 rounded-xl"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={`${filteredUsers.length} of ${total} shoppers on Vaymp`}
      />

      <UserSearch
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        isVerified={isVerified}
        onVerifiedChange={setIsVerified}
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
