import { useEffect, useMemo, useState } from "react";

import useUsers from "@/hooks/useUsers";

import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { UserSearch } from "./UserSearch";
import { UserTable } from "./UserTable";
import { UserDetailsSheet } from "./UserDetailsSheet";

import type { User, UserQueryParams } from "@/types/user";

export default function Users() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [isVerified, setIsVerified] = useState("all");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Any filter change should jump back to page 1 — adjusted during render
  // (not in an effect) to avoid the extra commit a setState-in-effect would
  // cause, same pattern Banners.tsx already uses.
  const filterKey = `${search}|${status}|${isVerified}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const { users, total, totalPages, loading, error, fetchUsers } = useUsers();

  const queryParams = useMemo<UserQueryParams>(() => {
    const params: UserQueryParams = { page };

    if (search.trim()) params.search = search.trim();
    if (status !== "all") params.status = status as UserQueryParams["status"];
    if (isVerified !== "all") params.isVerified = isVerified === "yes";

    return params;
  }, [page, search, status, isVerified]);

  useEffect(() => {
    void fetchUsers(queryParams, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

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
        description={`${users.length} of ${total} shoppers on Vaymp`}
      />

      <UserSearch
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        isVerified={isVerified}
        onVerifiedChange={setIsVerified}
      />

      <UserTable users={users} onView={setSelectedUser} loading={loading} />

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            <PaginationItem>
              <span className="px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

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
