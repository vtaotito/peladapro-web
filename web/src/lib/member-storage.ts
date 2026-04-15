const STORAGE_KEY = "peladapro_group_members";

export interface GroupMember {
  id: string;
  name: string;
  nickname: string;
  position: string;
  overall: number;
  role: "admin" | "moderator" | "member";
  joinedAt: string;
}

type MemberMap = Record<string, GroupMember[]>;

function readAll(): MemberMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MemberMap;
  } catch {
    return {};
  }
}

function writeAll(map: MemberMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getGroupMembers(groupId: string): GroupMember[] {
  return readAll()[groupId] ?? [];
}

export function setGroupMembers(groupId: string, members: GroupMember[]) {
  const map = readAll();
  map[groupId] = members;
  writeAll(map);
}

export function addGroupMember(groupId: string, member: GroupMember) {
  const members = getGroupMembers(groupId);
  if (members.some((m) => m.id === member.id)) return;
  members.push(member);
  setGroupMembers(groupId, members);
}

export function removeGroupMember(groupId: string, memberId: string) {
  setGroupMembers(
    groupId,
    getGroupMembers(groupId).filter((m) => m.id !== memberId),
  );
}

export function updateGroupMember(
  groupId: string,
  memberId: string,
  data: Partial<GroupMember>,
) {
  const members = getGroupMembers(groupId);
  const idx = members.findIndex((m) => m.id === memberId);
  if (idx === -1) return;
  members[idx] = { ...members[idx], ...data };
  setGroupMembers(groupId, members);
}

export function initGroupOwnerAsMember(
  groupId: string,
  owner: { id: string; name: string; nickname: string },
) {
  const members = getGroupMembers(groupId);
  if (members.length > 0) return;
  addGroupMember(groupId, {
    id: owner.id,
    name: owner.name,
    nickname: owner.nickname,
    position: "MEI",
    overall: 7.0,
    role: "admin",
    joinedAt: new Date().toISOString(),
  });
}
