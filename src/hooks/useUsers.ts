import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import userService from "@/services/user.service";

import type {
  CreateUserRequest,
  User,
  UserQueryParams,
  UpdateUserRequest,
} from "@/types/user";

export default function useUsers(initialParams?: UserQueryParams) {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  /**
   * ==========================================
   * Fetch Users
   * ==========================================
   */

  const fetchUsers = useCallback(
    
    async (params?: UserQueryParams, showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        const response = await userService.getAll({
          ...initialParams,
          ...params,
        });

        setUsers(response.items);

        setTotal(response.pagination.total);

        setPage(response.pagination.page);

        setLimit(response.pagination.limit);

        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error ? error.message : "Failed to fetch users";

        setError(message);

        toast.error(message);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [initialParams],
  );

  /**
   * ==========================================
   * Refresh
   * ==========================================
   */

  const refresh = useCallback(async () => {
    await fetchUsers(undefined, true);
  }, [fetchUsers]);

  /**
   * ==========================================
   * Get User
   * ==========================================
   */

  const getUser = useCallback(async (id: string) => {
    return userService.getById(id);
  }, []);

  /**
   * ==========================================
   * Create User
   * ==========================================
   */

  const createUser = useCallback(async (payload: CreateUserRequest) => {
    try {
      const user = await userService.create(payload);

      toast.success("User created successfully");

      setUsers((prev) => [user, ...prev]);

      setTotal((prev) => prev + 1);

      return user;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create user";

      toast.error(message);

      throw error;
    }
  }, []);

  /**
   * ==========================================
   * Update User
   * ==========================================
   */

  const updateUser = useCallback(
    async (id: string, payload: UpdateUserRequest) => {
      try {
        const user = await userService.update(id, payload);

        toast.success("User updated successfully");

        setUsers((prev) =>
          prev.map((item) => (item._id === user._id ? user : item)),
        );

        return user;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update user";

        toast.error(message);

        throw error;
      }
    },
    [],
  );

  /**
   * ==========================================
   * Delete User
   * ==========================================
   */

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        await userService.delete(id);

        toast.success("User deleted successfully");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete user";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Activate User
   * ==========================================
   */

  const activateUser = useCallback(
    async (id: string) => {
      try {
        await userService.activate(id);

        toast.success("User activated");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to activate user";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Suspend User
   * ==========================================
   */

  const suspendUser = useCallback(
    async (id: string) => {
      try {
        await userService.suspend(id);

        toast.success("User suspended");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to suspend user";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Ban User
   * ==========================================
   */

  const banUser = useCallback(
    async (id: string) => {
      try {
        await userService.ban(id);

        toast.success("User banned");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to ban user";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Update User Verification
   * ==========================================
   */

  const updateVerification = useCallback(
    async (id: string, isVerified: boolean) => {
      try {
        const user = await userService.updateVerification(id, {
          isVerified,
        });

        toast.success(
          isVerified
            ? "User verified successfully"
            : "User verification removed",
        );

        setUsers((prev) =>
          prev.map((item) => (item._id === user._id ? user : item)),
        );

        return user;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update verification";

        toast.error(message);

        throw error;
      }
    },
    [],
  );

  /**
   * ==========================================
   * Initial Load
   * ==========================================
   */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await userService.getAll(initialParams);

        if (cancelled) {
          return;
        }

        setError(null);

        setUsers(response.items);

        setTotal(response.pagination.total);

        setPage(response.pagination.page);

        setLimit(response.pagination.limit);

        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to fetch users";

        setError(message);

        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [initialParams]);

  return {
    users,

    loading,
    error,

    total,
    page,
    limit,
    totalPages,

    refresh,
    fetchUsers,

    getUser,

    createUser,
    updateUser,
    deleteUser,

    activateUser,
    suspendUser,
    banUser,

    updateVerification,
  };
}
