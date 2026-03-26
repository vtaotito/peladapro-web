const LEFT_KEY = "peladapro_left_groups";
const DELETED_KEY = "peladapro_deleted_groups";

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}

export function markGroupLeft(groupId: string) {
  const ids = readIds(LEFT_KEY);
  if (!ids.includes(groupId)) writeIds(LEFT_KEY, [...ids, groupId]);
}

export function markGroupDeleted(groupId: string) {
  const ids = readIds(DELETED_KEY);
  if (!ids.includes(groupId)) writeIds(DELETED_KEY, [...ids, groupId]);
}

export function getHiddenGroupIds(): Set<string> {
  return new Set([...readIds(LEFT_KEY), ...readIds(DELETED_KEY)]);
}

export function isGroupHiddenFromUser(groupId: string): boolean {
  return getHiddenGroupIds().has(groupId);
}
