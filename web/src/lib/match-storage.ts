import type { MatchStatus } from "@/lib/mock-data";

const CONFIRMATIONS_KEY = "peladapro_match_confirmations";
const RESULTS_KEY = "peladapro_match_results";

type ConfirmationMap = Record<string, MatchStatus>;

function confirmKey(matchId: string, userId: string) {
  return `${matchId}::${userId}`;
}

function readConfirmations(): ConfirmationMap {
  try {
    const raw = localStorage.getItem(CONFIRMATIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ConfirmationMap;
  } catch {
    return {};
  }
}

function writeConfirmations(map: ConfirmationMap) {
  localStorage.setItem(CONFIRMATIONS_KEY, JSON.stringify(map));
}

export function getMatchConfirmation(
  matchId: string,
  userId: string,
): MatchStatus | null {
  return readConfirmations()[confirmKey(matchId, userId)] ?? null;
}

export function setMatchConfirmation(
  matchId: string,
  userId: string,
  status: MatchStatus,
) {
  const map = readConfirmations();
  map[confirmKey(matchId, userId)] = status;
  writeConfirmations(map);
}

export interface MatchResult {
  matchId: string;
  groupId: string;
  teamAScore: number;
  teamBScore: number;
  events: MatchEvent[];
  endedAt: string;
}

export interface MatchEvent {
  type: "goal" | "assist" | "yellow" | "red" | "save";
  playerId: string;
  playerName: string;
  team: "A" | "B";
  minute: number;
}

function readResults(): MatchResult[] {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeResults(results: MatchResult[]) {
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

export function saveMatchResult(result: MatchResult) {
  const results = readResults();
  results.unshift(result);
  writeResults(results);
}

export function getMatchResults(groupId?: string): MatchResult[] {
  const all = readResults();
  if (!groupId) return all;
  return all.filter((r) => r.groupId === groupId);
}
