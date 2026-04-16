export type Player = {
  id: string;
  name: string;
  nickname: string;
  position: string;
  positions?: string[];
  overall: number;
  avatar: string | null;
};

export type MatchStatus = "confirmed" | "maybe" | "waiting" | "declined";

export type MatchPlayer = Player & {
  status: MatchStatus;
};

export type GroupVisibility = "private" | "public";

export type GroupOwner = {
  id: string;
  name: string;
  nickname: string;
  avatar: string | null;
  phone?: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  role: "admin" | "moderator" | "member";
  color: string;
  emblem?: string;
  imageUrl?: string | null;
  visibility: GroupVisibility;
  owner: GroupOwner;
  address: string;
  city: string;
  neighborhood: string;
  dayOfWeek: string;
  time: string;
  format: string;
  pricePerMatch: number;
  nextMatch: {
    date: string;
    location: string;
    confirmedCount: number;
    totalSpots: number;
  };
};

export type Notification = {
  id: string;
  type: "match" | "payment" | "award" | "group";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export type GroupMember = {
  id: string;
  name: string;
  nickname: string;
  position: string;
  positions?: string[];
  overall: number;
  role: string;
  matches: number;
  goals: number;
  avatar: string | null;
};
