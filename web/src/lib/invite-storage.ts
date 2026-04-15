import type { Group } from "@/lib/mock-data";
import { myGroups } from "@/lib/mock-data";
import { findUserGroup } from "@/lib/group-storage";

const INVITES_KEY = "peladapro_group_invites";

export interface GroupInvite {
  code: string;
  groupId: string;
  createdAt: string;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function readInvites(): GroupInvite[] {
  try {
    const raw = localStorage.getItem(INVITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeInvites(invites: GroupInvite[]) {
  localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
}

export function getOrCreateInvite(groupId: string): GroupInvite {
  const invites = readInvites();
  const existing = invites.find((i) => i.groupId === groupId);
  if (existing) return existing;

  const invite: GroupInvite = {
    code: generateCode(),
    groupId,
    createdAt: new Date().toISOString(),
  };
  invites.push(invite);
  writeInvites(invites);
  return invite;
}

export function findInviteByCode(code: string): GroupInvite | undefined {
  return readInvites().find((i) => i.code === code);
}

export function resolveGroupFromInvite(code: string): Group | undefined {
  const invite = findInviteByCode(code);
  if (!invite) return undefined;

  return (
    myGroups.find((g) => g.id === invite.groupId) ??
    findUserGroup(invite.groupId)
  );
}

export function buildInviteUrl(code: string): string {
  if (typeof window === "undefined") return `/invite/${code}`;
  return `${window.location.origin}/invite/${code}`;
}
