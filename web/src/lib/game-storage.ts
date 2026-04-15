const STORAGE_KEY = "peladapro_scheduled_games";

export interface ScheduledGame {
  id: string;
  groupId: string;
  date: string;
  time: string;
  location: string;
  format: string;
  pricePerMatch: number;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

function readAll(): ScheduledGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(games: ScheduledGame[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function getGroupGames(groupId: string): ScheduledGame[] {
  return readAll().filter((g) => g.groupId === groupId);
}

export function addGame(game: ScheduledGame) {
  const games = readAll();
  games.unshift(game);
  writeAll(games);
}

export function updateGame(id: string, data: Partial<ScheduledGame>) {
  const games = readAll();
  const idx = games.findIndex((g) => g.id === id);
  if (idx === -1) return;
  games[idx] = { ...games[idx], ...data };
  writeAll(games);
}

export function removeGame(id: string) {
  writeAll(readAll().filter((g) => g.id !== id));
}

export function findGame(id: string): ScheduledGame | undefined {
  return readAll().find((g) => g.id === id);
}
