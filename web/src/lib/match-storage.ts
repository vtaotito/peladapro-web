const STORAGE_KEY = "peladapro_matches_v2";
const LEGACY_RESULTS_KEY = "peladapro_match_results";

export type MatchStatus = "active" | "ended";

export interface MatchPlayerStats {
  goals: number;
  assists: number;
  isolou: number;
  pacocada: number;
  inacreditavel: number;
  faltaCometida: number;
  faltaSofrida: number;
  undaia: number;
  escanteio: number;
  defesaBonita: number;
}

export const defaultPlayerStats = (): MatchPlayerStats => ({
  goals: 0,
  assists: 0,
  isolou: 0,
  pacocada: 0,
  inacreditavel: 0,
  faltaCometida: 0,
  faltaSofrida: 0,
  undaia: 0,
  escanteio: 0,
  defesaBonita: 0,
});

export interface MatchTeamPlayer {
  id: string;
  name: string;
  nickname: string;
  position: string;
  overall: number;
  stats: MatchPlayerStats;
}

export interface MatchEvent {
  type: "goal" | "assist" | "yellow" | "red" | "save";
  playerId: string;
  playerName: string;
  team: "A" | "B";
  minute: number;
}

export interface Match {
  id: string;
  groupId: string;
  status: MatchStatus;
  teamA: MatchTeamPlayer[];
  teamB: MatchTeamPlayer[];
  scoreA: number;
  scoreB: number;
  events: MatchEvent[];
  elapsedSeconds: number;
  createdAt: string;
  endedAt: string | null;
}

function readAll(): Match[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(matches: Match[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

export function getGroupMatches(groupId: string): Match[] {
  return readAll().filter((m) => m.groupId === groupId);
}

export function getActiveMatch(groupId: string): Match | null {
  return readAll().find((m) => m.groupId === groupId && m.status === "active") ?? null;
}

export function getMatchHistory(groupId: string): Match[] {
  return readAll()
    .filter((m) => m.groupId === groupId && m.status === "ended")
    .sort((a, b) => new Date(b.endedAt ?? b.createdAt).getTime() - new Date(a.endedAt ?? a.createdAt).getTime());
}

export function findMatch(matchId: string): Match | null {
  return readAll().find((m) => m.id === matchId) ?? null;
}

export function createMatch(groupId: string, teamA: MatchTeamPlayer[], teamB: MatchTeamPlayer[]): Match {
  const existing = getActiveMatch(groupId);
  if (existing) throw new Error("Já existe uma partida ativa neste grupo.");

  const match: Match = {
    id: `match-${Date.now()}`,
    groupId,
    status: "active",
    teamA,
    teamB,
    scoreA: 0,
    scoreB: 0,
    events: [],
    elapsedSeconds: 0,
    createdAt: new Date().toISOString(),
    endedAt: null,
  };

  const all = readAll();
  all.unshift(match);
  writeAll(all);
  return match;
}

export function updateMatch(matchId: string, data: Partial<Match>) {
  const all = readAll();
  const idx = all.findIndex((m) => m.id === matchId);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...data };
  writeAll(all);
}

export function endMatch(matchId: string, scoreA: number, scoreB: number, teamA: MatchTeamPlayer[], teamB: MatchTeamPlayer[], events: MatchEvent[], elapsedSeconds: number) {
  updateMatch(matchId, {
    status: "ended",
    scoreA,
    scoreB,
    teamA,
    teamB,
    events,
    elapsedSeconds,
    endedAt: new Date().toISOString(),
  });
}

export function deleteMatch(matchId: string) {
  writeAll(readAll().filter((m) => m.id !== matchId));
}

export interface LegacyMatchResult {
  matchId: string;
  groupId: string;
  teamAScore: number;
  teamBScore: number;
  events: MatchEvent[];
  endedAt: string;
}

export function getLegacyResults(groupId?: string): LegacyMatchResult[] {
  try {
    const raw = localStorage.getItem(LEGACY_RESULTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    const all = Array.isArray(parsed) ? (parsed as LegacyMatchResult[]) : [];
    if (!groupId) return all;
    return all.filter((r) => r.groupId === groupId);
  } catch {
    return [];
  }
}
