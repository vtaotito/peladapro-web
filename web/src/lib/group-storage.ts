import type { Group } from "@/lib/mock-data";

const STORAGE_KEY = "peladapro_user_groups";

export function readUserGroups(): Group[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeUserGroups(groups: Group[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

export function addUserGroup(group: Group) {
  const groups = readUserGroups();
  groups.unshift(group);
  writeUserGroups(groups);
}

export function findUserGroup(id: string): Group | undefined {
  return readUserGroups().find((g) => g.id === id);
}

export function updateUserGroup(id: string, data: Partial<Group>) {
  const groups = readUserGroups();
  const idx = groups.findIndex((g) => g.id === id);
  if (idx === -1) return;
  groups[idx] = { ...groups[idx], ...data };
  writeUserGroups(groups);
}

export function removeUserGroup(id: string) {
  writeUserGroups(readUserGroups().filter((g) => g.id !== id));
}
