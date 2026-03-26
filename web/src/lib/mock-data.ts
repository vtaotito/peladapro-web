export const currentUser = {
  id: "user-1",
  name: "Vitor Almeida",
  nickname: "Vitinho",
  email: "vitor@email.com",
  position: "MEI" as const,
  overall: 7.8,
  avatar: null,
  memberSince: "2024-03-15",
};

export type Player = {
  id: string;
  name: string;
  nickname: string;
  position: string;
  overall: number;
  avatar: string | null;
};

export type MatchStatus = "confirmed" | "maybe" | "waiting" | "declined";

export type MatchPlayer = Player & {
  status: MatchStatus;
};

export const myGroups = [
  {
    id: "group-1",
    name: "Pelada do Parque",
    memberCount: 28,
    role: "admin" as const,
    color: "#16a34a",
    nextMatch: {
      date: "2026-03-28T19:00:00",
      location: "Quadra do Parque Municipal",
      confirmedCount: 14,
      totalSpots: 14,
    },
  },
  {
    id: "group-2",
    name: "Bola de Terça",
    memberCount: 22,
    role: "member" as const,
    color: "#2563eb",
    nextMatch: {
      date: "2026-03-31T20:30:00",
      location: "Arena Society Centro",
      confirmedCount: 9,
      totalSpots: 14,
    },
  },
  {
    id: "group-3",
    name: "Veteranos FC",
    memberCount: 18,
    role: "member" as const,
    color: "#d97706",
    nextMatch: {
      date: "2026-04-02T18:00:00",
      location: "Campo da Associação",
      confirmedCount: 6,
      totalSpots: 22,
    },
  },
];

export const upcomingMatch = {
  id: "match-1",
  groupId: "group-1",
  groupName: "Pelada do Parque",
  date: "2026-03-28T19:00:00",
  location: "Quadra do Parque Municipal",
  address: "Av. Brasil, 1200 - Centro",
  format: "7x7",
  price: 25.0,
  confirmed: [
    { id: "p1", name: "Vitor Almeida", nickname: "Vitinho", position: "MEI", overall: 7.8, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p2", name: "Lucas Santos", nickname: "Lukinha", position: "ATA", overall: 8.2, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p3", name: "Rafael Costa", nickname: "Rafa", position: "ZAG", overall: 7.5, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p4", name: "Pedro Henrique", nickname: "PH", position: "LAT", overall: 7.1, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p5", name: "Gabriel Oliveira", nickname: "Gabigol", position: "ATA", overall: 8.5, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p6", name: "Matheus Silva", nickname: "Matheuzinho", position: "MEI", overall: 7.3, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p7", name: "André Lima", nickname: "Dedé", position: "ZAG", overall: 7.9, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p8", name: "Bruno Ferreira", nickname: "Bruninho", position: "GOL", overall: 8.0, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p9", name: "Thiago Souza", nickname: "Thiaguinho", position: "MEI", overall: 7.6, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p10", name: "Diego Martins", nickname: "Dieguinho", position: "LAT", overall: 7.4, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p11", name: "Carlos Eduardo", nickname: "Cadú", position: "ATA", overall: 7.7, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p12", name: "Felipe Rocha", nickname: "Felipão", position: "ZAG", overall: 7.2, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p13", name: "Marcos Vinícius", nickname: "Marquinhos", position: "GOL", overall: 7.0, avatar: null, status: "confirmed" as MatchStatus },
    { id: "p14", name: "João Pedro", nickname: "JP", position: "MEI", overall: 7.8, avatar: null, status: "confirmed" as MatchStatus },
  ] as MatchPlayer[],
  maybe: [
    { id: "p15", name: "Renato Augusto", nickname: "Renatinho", position: "MEI", overall: 8.1, avatar: null, status: "maybe" as MatchStatus },
    { id: "p16", name: "Gustavo Nunes", nickname: "Guga", position: "LAT", overall: 7.3, avatar: null, status: "maybe" as MatchStatus },
  ] as MatchPlayer[],
  waiting: [
    { id: "p17", name: "Caio Ribeiro", nickname: "Caio", position: "ATA", overall: 7.6, avatar: null, status: "waiting" as MatchStatus },
    { id: "p18", name: "Leandro Farias", nickname: "Leandrão", position: "ZAG", overall: 7.0, avatar: null, status: "waiting" as MatchStatus },
  ] as MatchPlayer[],
};

export const weeklyHighlights = {
  mvp: { name: "Gabigol", value: "9.2", detail: "Overall da partida" },
  topScorer: { name: "Lukinha", value: "3", detail: "Gols na semana" },
  bestDefender: { name: "Dedé", value: "9.0", detail: "Nota defensiva" },
  bestAssist: { name: "Vitinho", value: "4", detail: "Assistências" },
  mostPresent: { name: "PH", value: "100%", detail: "Presença no mês" },
};

export const recentMatches = [
  {
    id: "rm-1",
    date: "2026-03-21T19:00:00",
    group: "Pelada do Parque",
    teamA: { name: "Time Verde", score: 5 },
    teamB: { name: "Time Branco", score: 3 },
    playerRating: 8.2,
    goals: 1,
    assists: 2,
  },
  {
    id: "rm-2",
    date: "2026-03-18T20:30:00",
    group: "Bola de Terça",
    teamA: { name: "Time A", score: 4 },
    teamB: { name: "Time B", score: 4 },
    playerRating: 7.5,
    goals: 0,
    assists: 1,
  },
  {
    id: "rm-3",
    date: "2026-03-14T19:00:00",
    group: "Pelada do Parque",
    teamA: { name: "Time Verde", score: 6 },
    teamB: { name: "Time Branco", score: 2 },
    playerRating: 9.0,
    goals: 3,
    assists: 1,
  },
];

export const playerStats = {
  totalMatches: 87,
  wins: 42,
  draws: 21,
  losses: 24,
  goals: 34,
  assists: 51,
  overall: 7.8,
  presenceRate: 92,
  streak: 8,
  monthlyMatches: [4, 5, 3, 6, 4, 5],
  overallHistory: [7.2, 7.4, 7.5, 7.6, 7.8, 7.8],
};

export const financialSummary = {
  balance: -25.0,
  monthlyDue: 100.0,
  paid: 75.0,
  pendingMembers: 8,
  nextDueDate: "2026-04-05",
};

export const groupMembers = [
  { id: "p1", name: "Vitor Almeida", nickname: "Vitinho", position: "MEI", overall: 7.8, role: "admin", matches: 87, goals: 34, avatar: null },
  { id: "p5", name: "Gabriel Oliveira", nickname: "Gabigol", position: "ATA", overall: 8.5, role: "member", matches: 72, goals: 58, avatar: null },
  { id: "p2", name: "Lucas Santos", nickname: "Lukinha", position: "ATA", overall: 8.2, role: "member", matches: 65, goals: 45, avatar: null },
  { id: "p7", name: "André Lima", nickname: "Dedé", position: "ZAG", overall: 7.9, role: "moderator", matches: 80, goals: 5, avatar: null },
  { id: "p8", name: "Bruno Ferreira", nickname: "Bruninho", position: "GOL", overall: 8.0, role: "member", matches: 90, goals: 0, avatar: null },
  { id: "p14", name: "João Pedro", nickname: "JP", position: "MEI", overall: 7.8, role: "member", matches: 55, goals: 22, avatar: null },
  { id: "p3", name: "Rafael Costa", nickname: "Rafa", position: "ZAG", overall: 7.5, role: "member", matches: 60, goals: 3, avatar: null },
  { id: "p9", name: "Thiago Souza", nickname: "Thiaguinho", position: "MEI", overall: 7.6, role: "member", matches: 48, goals: 18, avatar: null },
  { id: "p4", name: "Pedro Henrique", nickname: "PH", position: "LAT", overall: 7.1, role: "member", matches: 92, goals: 12, avatar: null },
  { id: "p6", name: "Matheus Silva", nickname: "Matheuzinho", position: "MEI", overall: 7.3, role: "member", matches: 40, goals: 15, avatar: null },
];

export const notifications = [
  {
    id: "n1",
    type: "match" as const,
    title: "Pelada confirmada!",
    message: "A pelada de sexta (28/03) já tem 14 confirmados. Você está na lista!",
    time: "2h atrás",
    read: false,
  },
  {
    id: "n2",
    type: "payment" as const,
    title: "Mensalidade pendente",
    message: "Sua mensalidade de Março do grupo Pelada do Parque está pendente. Valor: R$ 25,00",
    time: "1 dia atrás",
    read: false,
  },
  {
    id: "n3",
    type: "award" as const,
    title: "Você foi eleito Garçom! 🎯",
    message: "Parabéns! Você liderou em assistências na última semana com 4 passes decisivos.",
    time: "2 dias atrás",
    read: true,
  },
  {
    id: "n4",
    type: "match" as const,
    title: "Sorteio dos times realizado",
    message: "Os times para a pelada de terça (31/03) foram sorteados. Confira!",
    time: "3 dias atrás",
    read: true,
  },
  {
    id: "n5",
    type: "group" as const,
    title: "Novo membro no grupo",
    message: "Ricardo Mendes entrou no grupo Pelada do Parque.",
    time: "4 dias atrás",
    read: true,
  },
  {
    id: "n6",
    type: "match" as const,
    title: "Lembrete: Pelada amanhã!",
    message: "Não esqueça da pelada amanhã às 19h na Quadra do Parque Municipal.",
    time: "5 dias atrás",
    read: true,
  },
];
