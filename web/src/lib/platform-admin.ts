import {
  ACCOUNTS_KEY,
  readAccounts,
  writeAccounts,
  normalizeEmail,
  type StoredAccount,
  type PlatformRole,
} from "@/lib/account-storage";

export const ADMIN_SESSION_COOKIE = "peladapro_admin_session";

/** E-mail do administrador da plataforma (definir em produção via env). */
export const PLATFORM_ADMIN_EMAIL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
    ? process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL.toLowerCase()
    : "admin@peladapro.cloud";

/** Senha inicial do ADM (altere em produção com NEXT_PUBLIC_PLATFORM_ADMIN_PASSWORD). */
export function getPlatformAdminInitialPassword(): string {
  return (
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_PLATFORM_ADMIN_PASSWORD) ||
    "PeladaPro!Admin2025"
  );
}

export type AppUserRow = {
  email: string;
  name: string;
  id: string;
  platformRole: PlatformRole;
  disabled: boolean;
  createdAt: string | null;
};

/** Garante conta ADM no localStorage (apenas browser). */
export function seedPlatformAdminIfNeeded(): void {
  if (typeof window === "undefined") return;
  const accounts = readAccounts();
  const email = PLATFORM_ADMIN_EMAIL;
  if (!accounts[email]) {
    accounts[email] = {
      name: "Administrador PeladaPro",
      password: getPlatformAdminInitialPassword(),
      id: "platform-admin-1",
      platformRole: "PLATFORM_ADMIN",
      disabled: false,
      createdAt: new Date().toISOString(),
    };
    writeAccounts(accounts);
    return;
  }
  const acc = accounts[email];
  if (acc.platformRole !== "PLATFORM_ADMIN") {
    accounts[email] = { ...acc, platformRole: "PLATFORM_ADMIN", disabled: false };
    writeAccounts(accounts);
  }
}

export function isPlatformAdminAccount(email: string, password: string): boolean {
  const e = normalizeEmail(email);
  const accounts = readAccounts();
  const acc = accounts[e];
  if (!acc || acc.platformRole !== "PLATFORM_ADMIN") return false;
  if (acc.disabled) return false;
  return acc.password === password;
}

export function listAppUsers(): AppUserRow[] {
  const accounts = readAccounts();
  return Object.entries(accounts)
    .map(([email, acc]) => ({
      email,
      name: acc.name,
      id: acc.id || email,
      platformRole: acc.platformRole || "USER",
      disabled: Boolean(acc.disabled),
      createdAt: acc.createdAt || null,
    }))
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export type AdminStats = {
  total: number;
  active: number;
  blocked: number;
  recentSignups7d: number;
  platformAdmins: number;
  players: number;
  activePlayers: number;
  activeAdmins: number;
};

export function getAdminStats(): AdminStats {
  const users = listAppUsers();
  const now = Date.now();
  const weekMs = 7 * 86400000;
  let recentSignups7d = 0;
  for (const u of users) {
    if (!u.createdAt) continue;
    if (now - new Date(u.createdAt).getTime() <= weekMs) recentSignups7d += 1;
  }
  const platformAdmins = users.filter((u) => u.platformRole === "PLATFORM_ADMIN").length;
  const activePlayers = users.filter(
    (u) => !u.disabled && u.platformRole !== "PLATFORM_ADMIN",
  ).length;
  const activeAdmins = users.filter(
    (u) => !u.disabled && u.platformRole === "PLATFORM_ADMIN",
  ).length;
  return {
    total: users.length,
    active: users.filter((u) => !u.disabled).length,
    blocked: users.filter((u) => u.disabled).length,
    recentSignups7d,
    platformAdmins,
    players: users.filter((u) => u.platformRole !== "PLATFORM_ADMIN").length,
    activePlayers,
    activeAdmins,
  };
}

export function usersToCsv(rows: AppUserRow[]): string {
  const header = ["email", "name", "id", "role", "status", "createdAt"];
  const lines = [header.join(",")];
  for (const u of rows) {
    const role = u.platformRole === "PLATFORM_ADMIN" ? "PLATFORM_ADMIN" : "USER";
    const status = u.disabled ? "blocked" : "active";
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    lines.push(
      [esc(u.email), esc(u.name), esc(u.id), role, status, esc(u.createdAt || "")].join(","),
    );
  }
  return lines.join("\n");
}

export function updateAppUser(
  email: string,
  patch: Partial<Pick<StoredAccount, "name" | "disabled" | "password">>,
): { ok: boolean; error?: string } {
  const e = normalizeEmail(email);
  const accounts = readAccounts();
  if (!accounts[e]) return { ok: false, error: "Usuário não encontrado" };
  if (accounts[e].platformRole === "PLATFORM_ADMIN" && patch.disabled === true) {
    return { ok: false, error: "Não é possível desativar o administrador da plataforma" };
  }
  accounts[e] = { ...accounts[e], ...patch };
  writeAccounts(accounts);
  return { ok: true };
}

export function createAppUser(
  email: string,
  name: string,
  password: string,
): { ok: boolean; error?: string } {
  const e = normalizeEmail(email);
  if (!e || !name.trim() || !password) return { ok: false, error: "Preencha todos os campos" };
  if (e === PLATFORM_ADMIN_EMAIL) {
    return { ok: false, error: "Este e-mail é reservado ao administrador da plataforma" };
  }
  const accounts = readAccounts();
  if (accounts[e]) return { ok: false, error: "Já existe conta com este e-mail" };
  accounts[e] = {
    name: name.trim(),
    password,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
    platformRole: "USER",
    disabled: false,
    createdAt: new Date().toISOString(),
  };
  writeAccounts(accounts);
  return { ok: true };
}

export function setAdminSessionCookie() {
  const d = new Date();
  d.setTime(d.getTime() + 1 * 86400000);
  document.cookie = `${ADMIN_SESSION_COOKIE}=1;expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

export function clearAdminSessionCookie() {
  document.cookie = `${ADMIN_SESSION_COOKIE}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

/** Indica se o host atual é o subdomínio administrativo (browser). */
export function isAdminHostname(host: string): boolean {
  const h = host.split(":")[0].toLowerCase();
  return (
    h === "admin.peladapro.cloud" ||
    (h.startsWith("admin.") && h.endsWith("peladapro.cloud")) ||
    h === "admin.localhost" ||
    h.startsWith("admin.localhost.")
  );
}
