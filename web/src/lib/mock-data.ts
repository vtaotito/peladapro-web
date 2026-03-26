export const currentUser = {
  id: "user-1",
  name: "Vitor Almeida",
  nickname: "Vitinho",
  email: "vitor@email.com",
  position: "MEI" as const,
  positions: ["MEI", "ATA"] as string[],
  overall: 7.8,
  avatar: null,
  memberSince: "2024-03-15",
};

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

export const myGroups: Group[] = [
  {
    id: "group-1",
    name: "Pelada do Parque",
    description: "Pelada semanal toda sexta à noite. Nível intermediário a avançado. Ambiente competitivo mas respeitoso.",
    memberCount: 28,
    maxMembers: 40,
    role: "admin",
    color: "#16a34a",
    visibility: "public",
    owner: { id: "user-1", name: "Vitor Almeida", nickname: "Vitinho", avatar: null, phone: "(11) 99999-0001" },
    address: "Quadra do Parque Municipal, Av. Brasil, 1200",
    city: "São Paulo",
    neighborhood: "Centro",
    dayOfWeek: "Sexta-feira",
    time: "19:00",
    format: "7x7",
    pricePerMatch: 25,
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
    description: "Pelada descontraída toda terça. Todos os níveis são bem-vindos!",
    memberCount: 22,
    maxMembers: 30,
    role: "member",
    color: "#2563eb",
    visibility: "public",
    owner: { id: "user-2", name: "Lucas Santos", nickname: "Lukinha", avatar: null, phone: "(11) 99999-0002" },
    address: "Arena Society Centro, Rua Augusta, 450",
    city: "São Paulo",
    neighborhood: "Consolação",
    dayOfWeek: "Terça-feira",
    time: "20:30",
    format: "7x7",
    pricePerMatch: 30,
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
    description: "Grupo exclusivo para veteranos 35+. Ritmo moderado, muita experiência.",
    memberCount: 18,
    maxMembers: 30,
    role: "member",
    color: "#d97706",
    visibility: "private",
    owner: { id: "user-3", name: "André Lima", nickname: "Dedé", avatar: null, phone: "(11) 99999-0003" },
    address: "Campo da Associação, Rua das Flores, 89",
    city: "São Paulo",
    neighborhood: "Vila Mariana",
    dayOfWeek: "Quarta-feira",
    time: "18:00",
    format: "11x11",
    pricePerMatch: 20,
    nextMatch: {
      date: "2026-04-02T18:00:00",
      location: "Campo da Associação",
      confirmedCount: 6,
      totalSpots: 22,
    },
  },
];

export const publicGroups: Group[] = [
  {
    id: "pub-1",
    name: "Society do Ibirapuera",
    description: "Pelada no parque toda quarta e sábado. Galera gente boa, todos bem-vindos.",
    memberCount: 35,
    maxMembers: 50,
    role: "member",
    color: "#059669",
    visibility: "public",
    owner: { id: "user-10", name: "Ricardo Mendes", nickname: "Ricardão", avatar: null },
    address: "Campo Society Ibirapuera, Av. Pedro Álvares Cabral",
    city: "São Paulo",
    neighborhood: "Ibirapuera",
    dayOfWeek: "Quarta e Sábado",
    time: "18:00",
    format: "7x7",
    pricePerMatch: 35,
    nextMatch: { date: "2026-03-29T18:00:00", location: "Campo Society Ibirapuera", confirmedCount: 10, totalSpots: 14 },
  },
  {
    id: "pub-2",
    name: "Pelada da Vila",
    description: "Pelada raiz de domingo de manhã. Nível misto, diversão garantida.",
    memberCount: 20,
    maxMembers: 30,
    role: "member",
    color: "#7c3aed",
    visibility: "public",
    owner: { id: "user-11", name: "Fernando Costa", nickname: "Fernandão", avatar: null },
    address: "Quadra Poliesportiva Vila Madalena, Rua Harmonia, 200",
    city: "São Paulo",
    neighborhood: "Vila Madalena",
    dayOfWeek: "Domingo",
    time: "09:00",
    format: "5x5",
    pricePerMatch: 20,
    nextMatch: { date: "2026-03-30T09:00:00", location: "Quadra Poliesportiva Vila Madalena", confirmedCount: 7, totalSpots: 10 },
  },
  {
    id: "pub-3",
    name: "Fut de Quinta Premium",
    description: "Society premium com vestiário e churrasco pós-jogo. Vagas limitadas.",
    memberCount: 42,
    maxMembers: 50,
    role: "member",
    color: "#dc2626",
    visibility: "public",
    owner: { id: "user-12", name: "Marcelo Souza", nickname: "Marcelinho", avatar: null },
    address: "Arena Premium Moema, Rua Normandia, 500",
    city: "São Paulo",
    neighborhood: "Moema",
    dayOfWeek: "Quinta-feira",
    time: "20:00",
    format: "7x7",
    pricePerMatch: 50,
    nextMatch: { date: "2026-03-27T20:00:00", location: "Arena Premium Moema", confirmedCount: 14, totalSpots: 14 },
  },
  {
    id: "pub-4",
    name: "Boleiros de Pinheiros",
    description: "Pelada semanal em Pinheiros. Ambiente amigável, nível intermediário.",
    memberCount: 15,
    maxMembers: 25,
    role: "member",
    color: "#0891b2",
    visibility: "public",
    owner: { id: "user-13", name: "Paulo Henrique", nickname: "Paulão", avatar: null },
    address: "Quadra Municipal Pinheiros, Rua dos Pinheiros, 1100",
    city: "São Paulo",
    neighborhood: "Pinheiros",
    dayOfWeek: "Segunda-feira",
    time: "19:30",
    format: "6x6",
    pricePerMatch: 25,
    nextMatch: { date: "2026-03-30T19:30:00", location: "Quadra Municipal Pinheiros", confirmedCount: 8, totalSpots: 12 },
  },
  {
    id: "pub-5",
    name: "Pelada do ABC",
    description: "Maior pelada do ABC Paulista. Jogos intensos todo sábado à tarde.",
    memberCount: 50,
    maxMembers: 60,
    role: "member",
    color: "#ea580c",
    visibility: "public",
    owner: { id: "user-14", name: "Carlos Silva", nickname: "Carlão", avatar: null },
    address: "Centro Esportivo São Bernardo, Av. Senador Vergueiro, 2000",
    city: "São Bernardo do Campo",
    neighborhood: "Centro",
    dayOfWeek: "Sábado",
    time: "15:00",
    format: "11x11",
    pricePerMatch: 15,
    nextMatch: { date: "2026-03-29T15:00:00", location: "Centro Esportivo São Bernardo", confirmedCount: 18, totalSpots: 22 },
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
  { id: "rm-1", date: "2026-03-21T19:00:00", group: "Pelada do Parque", teamA: { name: "Time Verde", score: 5 }, teamB: { name: "Time Branco", score: 3 }, playerRating: 8.2, goals: 1, assists: 2 },
  { id: "rm-2", date: "2026-03-18T20:30:00", group: "Bola de Terça", teamA: { name: "Time A", score: 4 }, teamB: { name: "Time B", score: 4 }, playerRating: 7.5, goals: 0, assists: 1 },
  { id: "rm-3", date: "2026-03-14T19:00:00", group: "Pelada do Parque", teamA: { name: "Time Verde", score: 6 }, teamB: { name: "Time Branco", score: 2 }, playerRating: 9.0, goals: 3, assists: 1 },
];

export const playerStats = {
  totalMatches: 87, wins: 42, draws: 21, losses: 24,
  goals: 34, assists: 51, overall: 7.8, presenceRate: 92, streak: 8,
  monthlyMatches: [4, 5, 3, 6, 4, 5],
  overallHistory: [7.2, 7.4, 7.5, 7.6, 7.8, 7.8],
};

export const financialSummary = {
  balance: -25.0, monthlyDue: 100.0, paid: 75.0, pendingMembers: 8, nextDueDate: "2026-04-05",
};

export const groupMembers = [
  { id: "p1", name: "Vitor Almeida", nickname: "Vitinho", position: "MEI", positions: ["MEI", "ATA"], overall: 7.8, role: "admin", matches: 87, goals: 34, avatar: null },
  { id: "p5", name: "Gabriel Oliveira", nickname: "Gabigol", position: "ATA", positions: ["ATA"], overall: 8.5, role: "member", matches: 72, goals: 58, avatar: null },
  { id: "p2", name: "Lucas Santos", nickname: "Lukinha", position: "ATA", positions: ["ATA", "MEI"], overall: 8.2, role: "member", matches: 65, goals: 45, avatar: null },
  { id: "p7", name: "André Lima", nickname: "Dedé", position: "ZAG", positions: ["ZAG"], overall: 7.9, role: "moderator", matches: 80, goals: 5, avatar: null },
  { id: "p8", name: "Bruno Ferreira", nickname: "Bruninho", position: "GOL", positions: ["GOL"], overall: 8.0, role: "member", matches: 90, goals: 0, avatar: null },
  { id: "p14", name: "João Pedro", nickname: "JP", position: "MEI", positions: ["MEI", "LAT"], overall: 7.8, role: "member", matches: 55, goals: 22, avatar: null },
  { id: "p3", name: "Rafael Costa", nickname: "Rafa", position: "ZAG", positions: ["ZAG", "LAT"], overall: 7.5, role: "member", matches: 60, goals: 3, avatar: null },
  { id: "p9", name: "Thiago Souza", nickname: "Thiaguinho", position: "MEI", positions: ["MEI"], overall: 7.6, role: "member", matches: 48, goals: 18, avatar: null },
  { id: "p4", name: "Pedro Henrique", nickname: "PH", position: "LAT", positions: ["LAT", "ZAG"], overall: 7.1, role: "member", matches: 92, goals: 12, avatar: null },
  { id: "p6", name: "Matheus Silva", nickname: "Matheuzinho", position: "MEI", positions: ["MEI", "ATA"], overall: 7.3, role: "member", matches: 40, goals: 15, avatar: null },
];

export const notifications = [
  { id: "n1", type: "match" as const, title: "Pelada confirmada!", message: "A pelada de sexta (28/03) já tem 14 confirmados. Você está na lista!", time: "2h atrás", read: false },
  { id: "n2", type: "payment" as const, title: "Mensalidade pendente", message: "Sua mensalidade de Março do grupo Pelada do Parque está pendente. Valor: R$ 25,00", time: "1 dia atrás", read: false },
  { id: "n3", type: "award" as const, title: "Você foi eleito Garçom! 🎯", message: "Parabéns! Você liderou em assistências na última semana com 4 passes decisivos.", time: "2 dias atrás", read: true },
  { id: "n4", type: "match" as const, title: "Sorteio dos times realizado", message: "Os times para a pelada de terça (31/03) foram sorteados. Confira!", time: "3 dias atrás", read: true },
  { id: "n5", type: "group" as const, title: "Novo membro no grupo", message: "Ricardo Mendes entrou no grupo Pelada do Parque.", time: "4 dias atrás", read: true },
  { id: "n6", type: "match" as const, title: "Lembrete: Pelada amanhã!", message: "Não esqueça da pelada amanhã às 19h na Quadra do Parque Municipal.", time: "5 dias atrás", read: true },
];
