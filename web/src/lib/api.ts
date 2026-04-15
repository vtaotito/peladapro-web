const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const isApiEnabled = (): boolean => !!API_URL;

let accessToken: string | null =
  typeof window !== "undefined"
    ? localStorage.getItem("peladapro_access_token")
    : null;

let refreshToken: string | null =
  typeof window !== "undefined"
    ? localStorage.getItem("peladapro_refresh_token")
    : null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("peladapro_access_token", access);
  localStorage.setItem("peladapro_refresh_token", refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("peladapro_access_token");
  localStorage.removeItem("peladapro_refresh_token");
}

async function tryRefreshToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && refreshToken) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${accessToken}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? body.error ?? "Erro na requisição");
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      apiFetch<{ accessToken: string; refreshToken: string; user: Record<string, unknown> }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify(data) },
      ),
    login: (data: { email: string; password: string }) =>
      apiFetch<{ accessToken: string; refreshToken: string; user: Record<string, unknown> }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify(data) },
      ),
    me: () => apiFetch<Record<string, unknown>>("/auth/me"),
  },

  groups: {
    list: () => apiFetch<Record<string, unknown>[]>("/groups"),
    get: (id: string) => apiFetch<Record<string, unknown>>(`/groups/${id}`),
    create: (data: Record<string, unknown>) =>
      apiFetch<Record<string, unknown>>("/groups", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    join: (id: string, inviteCode: string) =>
      apiFetch(`/groups/${id}/join`, {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      }),
    members: (id: string) =>
      apiFetch<Record<string, unknown>[]>(`/groups/${id}/members`),
  },

  matches: {
    listByGroup: (groupId: string) =>
      apiFetch<Record<string, unknown>[]>(`/groups/${groupId}/matches`),
    get: (id: string) => apiFetch<Record<string, unknown>>(`/matches/${id}`),
    create: (groupId: string, data: Record<string, unknown>) =>
      apiFetch<Record<string, unknown>>(`/groups/${groupId}/matches`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    confirm: (id: string, data: { status: string; isGoalkeeper?: boolean }) =>
      apiFetch(`/matches/${id}/confirm`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    draft: (id: string) =>
      apiFetch(`/matches/${id}/draft`, { method: "POST" }),
    start: (id: string) =>
      apiFetch(`/matches/${id}/start`, { method: "POST" }),
    end: (id: string) =>
      apiFetch(`/matches/${id}/end`, { method: "POST" }),
    addEvent: (id: string, data: Record<string, unknown>) =>
      apiFetch(`/matches/${id}/events`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  players: {
    me: () => apiFetch<Record<string, unknown>>("/players/me"),
    update: (data: Record<string, unknown>) =>
      apiFetch<Record<string, unknown>>("/players/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    get: (id: string) => apiFetch<Record<string, unknown>>(`/players/${id}`),
    stats: (id: string) =>
      apiFetch<Record<string, unknown>>(`/players/${id}/stats`),
  },

  finance: {
    summary: (groupId: string) =>
      apiFetch<Record<string, unknown>>(`/groups/${groupId}/finance`),
    transactions: (groupId: string, data: Record<string, unknown>) =>
      apiFetch(`/groups/${groupId}/finance/transactions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  notifications: {
    list: () => apiFetch<Record<string, unknown>[]>("/notifications"),
    read: (id: string) =>
      apiFetch(`/notifications/${id}/read`, { method: "PUT" }),
  },
};
