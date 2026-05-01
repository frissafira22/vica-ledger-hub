import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./types";

const LS = "vica-auth-v1";

export interface AuthUser {
  username: string;
  role: Role;
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PROFILES: Record<Role, AuthUser> = {
  admin: { username: "admin", role: "admin", displayName: "Admin Vica" },
  gudang: { username: "gudang", role: "gudang", displayName: "Staf Gudang" },
  toko: { username: "toko", role: "toko", displayName: "Staf Toko" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LS);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const login = (role: Role) => {
    const u = PROFILES[role];
    setUser(u);
    if (typeof window !== "undefined") localStorage.setItem(LS, JSON.stringify(u));
  };
  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") localStorage.removeItem(LS);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
