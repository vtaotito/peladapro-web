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
import { currentUser } from "@/lib/mock-data";
import {
  ACCOUNTS_KEY,
  readAccounts,
  writeAccounts,
  normalizeEmail,
  type StoredAccount,
} from "@/lib/account-storage";
import { PLATFORM_ADMIN_EMAIL, seedPlatformAdminIfNeeded } from "@/lib/platform-admin";

interface User {
  id?: string;
  name: string;
  email: string;
  nickname?: string;
  position?: string;
  positions?: string[];
}

function newUserId(email: string): string {
  if (email === normalizeEmail(currentUser.email)) return currentUser.id;
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `user-${Date.now()}`;
}

function withStableUserId(u: User): User {
  if (u.id) return u;
  const id = newUserId(u.email);
  return { ...u, id };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "peladapro_user";
const COOKIE_NAME = "peladapro_session";

function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    seedPlatformAdminIfNeeded();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        const withId = withStableUserId(parsed);
        if (withId.id !== parsed.id) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(withId));
        }
        setUser(withId);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const e = normalizeEmail(email);
      if (e === PLATFORM_ADMIN_EMAIL) {
        return { ok: false, error: "Use outro e-mail ou o painel administrativo para esta conta" };
      }

      const accounts = readAccounts();

      if (accounts[e]) {
        return { ok: false, error: "E-mail já cadastrado" };
      }

      const id = newUserId(e);
      const row: StoredAccount = {
        name,
        password,
        id,
        platformRole: "USER",
        disabled: false,
        createdAt: new Date().toISOString(),
      };
      accounts[e] = row;
      writeAccounts(accounts);

      const u: User = { id, name, email: e };
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
      const e = normalizeEmail(email);
      const accounts = readAccounts();

      const acc = accounts[e];
      if (!acc || acc.password !== password) {
        return { ok: false, error: "E-mail ou senha incorretos" };
      }

      if (acc.disabled) {
        return { ok: false, error: "Conta desativada. Entre em contato com o suporte." };
      }

      if (acc.platformRole === "PLATFORM_ADMIN") {
        return {
          ok: false,
          error: "Use o login do painel em admin.peladapro.cloud ou /admin/login",
        };
      }

      let id = acc.id ?? newUserId(e);
      if (!acc.id) {
        accounts[e] = { ...acc, id };
        writeAccounts(accounts);
      }

      const u: User = { id, name: acc.name, email: e };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setCookie(COOKIE_NAME, "1", 30);
      setUser(u);
      router.push("/dashboard");
      return { ok: true };
    },
    [router],
  );

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    deleteCookie(COOKIE_NAME);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** @deprecated use account-storage */
export { ACCOUNTS_KEY };
