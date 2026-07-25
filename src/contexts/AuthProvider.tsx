import { useEffect, useState, type ReactNode } from "react";

import AuthContext from "./AuthContext";
import authService from "@/services/auth.service";
import type { Admin, AuthContextType } from "@/types/auth";

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Restore authentication on page refresh
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = authService.getToken();
        const storedAdmin = authService.getStoredAdmin();

        if (!storedToken) {
          setLoading(false);
          return;
        }

        setToken(storedToken);

        if (storedAdmin) {
          setAdmin(storedAdmin);
        }

        try {
          const profile = await authService.getProfile();
          setAdmin(profile);
        } catch (error) {
          console.error("Failed to restore session:", error);

          authService.clearSession();
          setAdmin(null);
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login
   */
  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const loggedInAdmin = await authService.login({
        username,
        password,
      });

      setAdmin(loggedInAdmin);
      setToken(authService.getToken());

      return true;
    } catch (error) {
      console.error("Login Error:", error);
      return false;
    }
  };

  /**
   * Logout
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      authService.clearSession();
      setAdmin(null);
      setToken(null);
    }
  };

  /**
   * Refresh Profile
   */
  const refreshProfile = async (): Promise<void> => {
    try {
      const profile = await authService.getProfile();
      setAdmin(profile);
    } catch (error) {
      console.error("Refresh Profile Error:", error);
    }
  };

  const value: AuthContextType = {
    admin,
    token,
    isAuthed: Boolean(token),
    loading,
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
