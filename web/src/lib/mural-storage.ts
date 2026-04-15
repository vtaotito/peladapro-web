const STORAGE_KEY = "peladapro_mural_posts";

export interface MuralPost {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorNickname: string;
  content: string;
  pinned: boolean;
  reactions: Record<string, string[]>;
  createdAt: string;
}

function readAll(): MuralPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(posts: MuralPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function getGroupPosts(groupId: string): MuralPost[] {
  return readAll()
    .filter((p) => p.groupId === groupId)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function addPost(post: MuralPost) {
  const posts = readAll();
  posts.unshift(post);
  writeAll(posts);
}

export function removePost(postId: string) {
  writeAll(readAll().filter((p) => p.id !== postId));
}

export function togglePin(postId: string) {
  const posts = readAll();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx === -1) return;
  posts[idx].pinned = !posts[idx].pinned;
  writeAll(posts);
}

export function toggleReaction(postId: string, emoji: string, userId: string) {
  const posts = readAll();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx === -1) return;
  const reactions = posts[idx].reactions ?? {};
  if (!reactions[emoji]) reactions[emoji] = [];
  const userIdx = reactions[emoji].indexOf(userId);
  if (userIdx >= 0) {
    reactions[emoji].splice(userIdx, 1);
    if (reactions[emoji].length === 0) delete reactions[emoji];
  } else {
    reactions[emoji].push(userId);
  }
  posts[idx].reactions = reactions;
  writeAll(posts);
}

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}sem`;
}
