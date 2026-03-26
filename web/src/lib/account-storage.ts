/** Chave única do registro local de contas (app + painel usam o mesmo store). */
export const ACCOUNTS_KEY = "peladapro_accounts";

export type PlatformRole = "USER" | "PLATFORM_ADMIN";

export type StoredAccount = {
  name: string;
  password: string;
  id?: string;
  platformRole?: PlatformRole;
  disabled?: boolean;
  createdAt?: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function readAccounts(): Record<string, StoredAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, StoredAccount>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeAccounts(accounts: Record<string, StoredAccount>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
