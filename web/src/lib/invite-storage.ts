import type { Group } from "@/lib/mock-data";
import { findUserGroup } from "@/lib/group-storage";

const INVITES_KEY = "peladapro_group_invites";

export interface GroupInvite {
  code: string;
  groupId: string;
  createdAt: string;
}

interface InvitePayload {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  color: string;
  visibility: "public" | "private";
  ownerName: string;
  ownerNickname: string;
  ownerId: string;
  address: string;
  city: string;
  neighborhood: string;
  dayOfWeek: string;
  time: string;
  format: string;
  pricePerMatch: number;
}

function encodePayload(payload: InvitePayload): string {
  try {
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch {
    return "";
  }
}

function decodePayload(encoded: string): InvitePayload | null {
  try {
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const json = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(json) as InvitePayload;
  } catch {
    return null;
  }
}

function payloadFromGroup(group: Group): InvitePayload {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    memberCount: group.memberCount,
    maxMembers: group.maxMembers,
    color: group.color,
    visibility: group.visibility,
    ownerName: group.owner.name,
    ownerNickname: group.owner.nickname,
    ownerId: group.owner.id,
    address: group.address,
    city: group.city,
    neighborhood: group.neighborhood,
    dayOfWeek: group.dayOfWeek,
    time: group.time,
    format: group.format,
    pricePerMatch: group.pricePerMatch,
  };
}

function groupFromPayload(payload: InvitePayload): Group {
  const totalSpots = parseInt(payload.format.split("x")[0], 10) * 2;
  return {
    id: payload.id,
    name: payload.name,
    description: payload.description,
    memberCount: payload.memberCount,
    maxMembers: payload.maxMembers,
    role: "member",
    color: payload.color,
    visibility: payload.visibility,
    owner: {
      id: payload.ownerId,
      name: payload.ownerName,
      nickname: payload.ownerNickname,
      avatar: null,
    },
    address: payload.address,
    city: payload.city,
    neighborhood: payload.neighborhood,
    dayOfWeek: payload.dayOfWeek,
    time: payload.time,
    format: payload.format,
    pricePerMatch: payload.pricePerMatch,
    nextMatch: {
      date: new Date().toISOString(),
      location: payload.address,
      confirmedCount: 0,
      totalSpots,
    },
  };
}

function readInvites(): GroupInvite[] {
  try {
    if (typeof window === "undefined") return [];
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
    code: groupId,
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

/**
 * Resolve a group from an invite code.
 * First tries localStorage lookup, then attempts to decode group data
 * embedded in the code itself.
 */
export function resolveGroupFromInvite(code: string): Group | undefined {
  const invite = findInviteByCode(code);
  if (invite) {
    const group = findUserGroup(invite.groupId);
    if (group) return group;
  }

  const directGroup = findUserGroup(code);
  if (directGroup) return directGroup;

  const payload = decodePayload(code);
  if (payload) return groupFromPayload(payload);

  return undefined;
}

/**
 * Build a shareable invite URL that embeds group data.
 * Works across devices — no localStorage dependency for the recipient.
 */
export function buildInviteUrl(code: string, group?: Group): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  if (group) {
    const payload = payloadFromGroup(group);
    const encoded = encodePayload(payload);
    if (encoded) return `${origin}/invite/${encoded}`;
  }

  return `${origin}/invite/${code}`;
}
