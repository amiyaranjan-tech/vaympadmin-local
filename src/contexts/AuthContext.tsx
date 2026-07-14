import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthCtx {
  user: { username: string; name: string; avatar: string } | null;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  isAuthed: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "vaymp_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthCtx["user"]>(null);
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);
  const login = async (username: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    if (username === "admin" && password === "admin123") {
      const u = { username, name: "Admin User", avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Admin" };
      localStorage.setItem(KEY, JSON.stringify(u));
      setUser(u);
      return true;
    }
    return false;
  };
  const logout = () => { localStorage.removeItem(KEY); setUser(null); };
  return <Ctx.Provider value={{ user, login, logout, isAuthed: !!user }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};
