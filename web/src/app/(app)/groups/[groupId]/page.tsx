"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Calendar,
  Trophy,
  MessageSquare,
  Star,
  Crown,
  Shield,
  MapPin,
  Clock,
  ChevronRight,
  Goal as GoalIcon,
  CalendarCheck,
  Shuffle,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  myGroups,
  groupMembers,
  upcomingMatch,
  recentMatches,
  type MatchStatus,
} from "@/lib/mock-data";
import { getInitials, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ConfirmButtons, PresenceList } from "@/components/presence-list";

const tabs = [
  { id: "mural", label: "Mural", icon: MessageSquare },
  { id: "jogos", label: "Jogos", icon: Calendar },
  { id: "membros", label: "Membros", icon: Users },
  { id: "ranking", label: "Ranking", icon: Trophy },
];

const roleLabels: Record<string, string> = {
  admin: "Admin",
  moderator: "Moderador",
  member: "Membro",
};

const roleBadgeVariant: Record<string, "default" | "info" | "secondary"> = {
  admin: "default",
  moderator: "info",
  member: "secondary",
};

export default function GroupDetailPage() {
  const [activeTab, setActiveTab] = useState("mural");
  const [myMatchStatus, setMyMatchStatus] = useState<MatchStatus>("confirmed");

  const group = myGroups[0];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/groups">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-lg"
            style={{ backgroundColor: group.color }}
          >
            {group.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-bold">
              {group.name}
            </h1>
            <p className="text-xs text-muted flex items-center gap-1">
              <Users className="h-3 w-3" />
              {group.memberCount} membros
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-tertiary p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
              activeTab === tab.id
                ? "bg-surface text-pitch shadow-sm"
                : "text-muted hover:text-muted-dark"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "mural" && (
        <div className="space-y-4">
          {/* Pinned Post */}
          <Card className="border-accent-200 bg-accent-50/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="warning" className="text-[10px]">
                  Fixado
                </Badge>
                <span className="text-xs text-muted">Admin • 2h atrás</span>
              </div>
              <p className="text-sm">
                Fala, galera! Pelada de sexta confirmada. Já temos 14
                confirmados! Quem não confirmou ainda, confirma aí. Pagamento no
                local: R$ 25,00. Bora! ⚽
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px]">LK</AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-xs font-semibold">Lukinha</span>
                  <span className="text-xs text-muted"> • 5h atrás</span>
                </div>
              </div>
              <p className="text-sm">
                Quem ficou devendo da semana passada? Lembrem de acertar com o
                Vitinho.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px]">GB</AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-xs font-semibold">Gabigol</span>
                  <span className="text-xs text-muted"> • 1 dia atrás</span>
                </div>
              </div>
              <p className="text-sm">
                Hat-trick na última pelada! Quem vai parar o artilheiro? 😎🔥
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "jogos" && (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
          <div className="space-y-4">
          {/* Next Match */}
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="pitch-gradient px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">
                  Próxima Pelada
                </p>
                <Badge className="border-white/20 bg-white/15 text-white text-[10px]">
                  {upcomingMatch.format}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-dark">
                  <Clock className="h-4 w-4 text-muted" />
                  {new Date(upcomingMatch.date).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}{" "}
                  • {formatTime(upcomingMatch.date)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-dark">
                  <MapPin className="h-4 w-4 text-muted" />
                  {upcomingMatch.location}
                </div>
              </div>
              <div className="mb-2 flex justify-between text-xs">
                <span>Confirmados</span>
                <span className="font-bold text-brand-600">
                  {upcomingMatch.confirmed.length}/14
                </span>
              </div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-brand-100">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{
                    width: `${(upcomingMatch.confirmed.length / 14) * 100}%`,
                  }}
                />
              </div>

              <p className="mb-2 text-xs font-semibold text-muted-dark">Sua presença:</p>
              <ConfirmButtons currentStatus={myMatchStatus} onConfirm={setMyMatchStatus} />

              <div className="mt-4 flex gap-2">
                <Link href="/groups/group-1/shuffle" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Shuffle className="h-4 w-4" />
                    Sortear times
                  </Button>
                </Link>
                <Link href="/groups/group-1/match" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <ClipboardList className="h-4 w-4" />
                    Scout
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Presence List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarCheck className="h-4 w-4 text-muted" />
                Lista de Presença
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PresenceList
                confirmed={upcomingMatch.confirmed}
                maybe={upcomingMatch.maybe}
                waiting={upcomingMatch.waiting}
                totalSpots={14}
              />
            </CardContent>
          </Card>
          </div>

          {/* Recent Matches */}
          <div className="space-y-4">
          <h3 className="font-display font-bold">Partidas Anteriores</h3>
          {recentMatches.map((match) => (
            <Card key={match.id} className="border-border/50">
              <CardContent className="p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted">
                    {new Date(match.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <span className="flex-1 text-right text-sm font-semibold">
                    {match.teamA.name}
                  </span>
                  <span className="font-display text-2xl font-extrabold text-pitch">
                    {match.teamA.score}
                  </span>
                  <span className="font-bold text-muted-light">x</span>
                  <span className="font-display text-2xl font-extrabold text-pitch">
                    {match.teamB.score}
                  </span>
                  <span className="flex-1 text-sm font-semibold">
                    {match.teamB.name}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      )}

      {activeTab === "membros" && (
        <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {groupMembers.map((member) => (
            <Card key={member.id} className="border-border/50">
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-xs">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {member.nickname}
                    </p>
                    {member.role === "admin" && (
                      <Crown className="h-3.5 w-3.5 text-accent-500" />
                    )}
                    {member.role === "moderator" && (
                      <Shield className="h-3.5 w-3.5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Badge variant={roleBadgeVariant[member.role]} className="text-[9px] px-1.5 py-0">
                      {member.position}
                    </Badge>
                    <span>{member.matches} jogos</span>
                    <span>{member.goals} gols</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5">
                  <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                  <span className="text-xs font-bold text-accent-700">
                    {member.overall}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "ranking" && (
        <div className="space-y-4">
          {/* Top 3 */}
          <div className="flex items-end justify-center gap-3 py-4">
            {[groupMembers[1], groupMembers[0], groupMembers[2]].map(
              (member, idx) => {
                const positions = [2, 1, 3];
                const pos = positions[idx];
                const heights = ["h-20", "h-28", "h-16"];
                const bgColors = [
                  "bg-gray-200",
                  "bg-accent-100",
                  "bg-amber-100",
                ];
                const medals = ["🥈", "🥇", "🥉"];

                return (
                  <div
                    key={member.id}
                    className="flex flex-col items-center gap-2"
                  >
                    <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                      <AvatarFallback className="text-sm">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="text-xs font-bold">{member.nickname}</p>
                      <div className="flex items-center justify-center gap-0.5">
                        <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                        <span className="text-xs font-bold">
                          {member.overall}
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex w-20 items-start justify-center rounded-t-xl pt-2 text-xl",
                        heights[idx],
                        bgColors[idx]
                      )}
                    >
                      {medals[idx]}
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Full Ranking List */}
          <div className="space-y-1.5 lg:max-w-2xl lg:mx-auto">
            {groupMembers
              .sort((a, b) => b.overall - a.overall)
              .map((member, idx) => (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5",
                    idx < 3 ? "bg-accent-50/50" : "bg-surface-secondary"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 text-center text-sm font-bold",
                      idx === 0
                        ? "text-accent-600"
                        : idx < 3
                          ? "text-accent-500"
                          : "text-muted"
                    )}
                  >
                    {idx + 1}º
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {member.nickname}
                    </p>
                    <p className="text-[10px] text-muted">
                      {member.position} • {member.matches} jogos
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                    <span className="text-sm font-bold">{member.overall}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
