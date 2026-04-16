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
import {
  ACCOUNTS_KEY,
  readAccounts,
  writeAccounts,
  normalizeEmail,
  type StoredAccount,
} from "@/lib/account-storage";
import { PLATFORM_ADMIN_EMAIL, seedPlatformAdminIfNeeded } from "@/lib/platform-admin";
import { api, isApiEnabled, setTokens, clearTokens, ApiError } from "@/lib/api";

interface User {
  id?: string;
  name: string;
  email: string;
  nickname?: string;
  position?: string;
  positions?: string[];
}

function newUserId(_email: string): string {
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
  register: (name: string, email: string, password: string, redirectTo?: string) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string, redirectTo?: string) => Promise<{ ok: boolean; error?: string }>;
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

function persistUser(u: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  setCookie(COOKIE_NAME, "1", 30);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    seedPlatformAdminIfNeeded();

    async function restore() {
      if (isApiEnabled()) {
        try {
          const me = await api.auth.me();
          const u: User = {
            id: me.id as string,
            name: me.name as string,
            email: me.email as string,
          };
          persistUser(u);
          setUser(u);
          setIsLoading(false);
          return;
        } catch {
          clearTokens();
        }
      }

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
      } catch { /* empty */ }
      setIsLoading(false);
    }

    restore();
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, redirectTo?: string) => {
      const e = normalizeEmail(email);
      const dest = redirectTo || "/dashboard";

      if (isApiEnabled()) {
        try {
          const res = await api.auth.register({ name, email: e, password });
          setTokens(res.accessToken, res.refreshToken);
          const u: User = {
            id: res.user.id as string,
            name: res.user.name as string,
            email: res.user.email as string,
          };
          persistUser(u);
          setUser(u);
          router.push(dest);
          return { ok: true };
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : "Erro ao criar conta";
          return { ok: false, error: msg };
        }
      }

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
      persistUser(u);
      setUser(u);
      router.push(dest);
      return { ok: true };
    },
    [router],
  );

  const login = useCallback(
    async (email: string, password: string, redirectTo?: string) => {
      const e = normalizeEmail(email);
      const dest = redirectTo || "/dashboard";

      if (isApiEnabled()) {
        try {
          const res = await api.auth.login({ email: e, password });
          setTokens(res.accessToken, res.refreshToken);
          const u: User = {
            id: res.user.id as string,
            name: res.user.name as string,
            email: res.user.email as string,
          };
          persistUser(u);
          setUser(u);
          router.push(dest);
          return { ok: true };
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : "Credenciais inválidas";
          return { ok: false, error: msg };
        }
      }

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
      persistUser(u);
      setUser(u);
      router.push(dest);
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
    clearTokens();
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
