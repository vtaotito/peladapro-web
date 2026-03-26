"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "peladapro_user";
const ACCOUNTS_KEY = "peladapro_accounts";
const COOKIE_NAME = "peladapro_session";

function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setIsLoading(false);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const accounts: Record<string, { name: string; password: string }> =
        JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");

      if (accounts[email]) {
        return { ok: false, error: "E-mail já cadastrado" };
      }

      accounts[email] = { name, password };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

      const u: User = { name, email };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setCookie(COOKIE_NAME, "1", 30);
      setUser(u);
      router.push("/dashboard");
      return { ok: true };
    },
    [router],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const accounts: Record<string, { name: string; password: string }> =
        JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");

      const acc = accounts[email];
      if (!acc || acc.password !== password) {
        return { ok: false, error: "E-mail ou senha incorretos" };
      }

      const u: User = { name: acc.name, email };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setCookie(COOKIE_NAME, "1", 30);
      setUser(u);
      router.push("/dashboard");
      return { ok: true };
    },
    [router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    deleteCookie(COOKIE_NAME);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
