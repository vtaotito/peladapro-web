"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Target,
  Star,
  CalendarCheck,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  Flame,
  TrendingUp,
  Wallet,
  Award,
  ShieldCheck,
  Footprints,
  Goal as GoalIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  currentUser,
  myGroups,
  upcomingMatch,
  weeklyHighlights,
  recentMatches,
  playerStats,
  financialSummary,
  type MatchStatus,
} from "@/lib/mock-data";
import { formatCurrency, formatTime, getInitials } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { ConfirmButtons, PresenceList } from "@/components/presence-list";
import { getHiddenGroupIds } from "@/lib/group-membership-storage";
import { readUserGroups } from "@/lib/group-storage";
import { getMatchConfirmation, setMatchConfirmation } from "@/lib/match-storage";

export default function DashboardPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const displayName = user?.name?.split(" ")[0] || currentUser.nickname;
  const userId = user?.id ?? (user?.email === currentUser.email ? currentUser.id : undefined);
  const [myStatus, setMyStatus] = useState<MatchStatus | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [userGroups, setUserGroups] = useState<typeof myGroups>([]);

  useEffect(() => {
    setHiddenIds(getHiddenGroupIds());
    setUserGroups(readUserGroups());
    if (userId) {
      const matchId = upcomingMatch.id ?? upcomingMatch.groupId;
      const saved = getMatchConfirmation(matchId, userId);
      if (saved) setMyStatus(saved);
    }
  }, [pathname, userId]);

  const handleConfirmPresence = (status: MatchStatus) => {
    setMyStatus(status);
    if (userId) {
      const matchId = upcomingMatch.id ?? upcomingMatch.groupId;
      setMatchConfirmation(matchId, userId, status);
    }
  };

  const visibleMyGroups = useMemo(
    () => [...userGroups, ...myGroups].filter((g) => !hiddenIds.has(g.id)),
    [hiddenIds, userGroups],
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Greeting */}
      <div className="lg:flex lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold lg:text-3xl">
            Salve, {displayName}! 👋
          </h1>
          <p className="text-sm text-muted">Pronto pra mais uma pelada?</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Jogos",
            value: playerStats.totalMatches,
            icon: Footprints,
            color: "text-brand-600",
            bg: "bg-brand-50",
          },
          {
            label: "Gols",
            value: playerStats.goals,
            icon: GoalIcon,
            color: "text-accent-600",
            bg: "bg-accent-50",
          },
          {
            label: "Overall",
            value: playerStats.overall.toFixed(1),
            icon: Star,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Presença",
            value: `${playerStats.presenceRate}%`,
            icon: CalendarCheck,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-3.5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="font-display text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column layout on desktop */}
      <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-5 lg:space-y-0">

      {/* Left Column */}
      <div className="lg:col-span-3 space-y-5">

      {/* Next Match */}
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="pitch-gradient px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/70">
                Próxima pelada
              </p>
              <p className="font-display text-lg font-bold text-white">
                {upcomingMatch.groupName}
              </p>
            </div>
            <Badge className="border-white/20 bg-white/15 text-white">
              {upcomingMatch.format}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-dark">
              <Clock className="h-4 w-4 text-muted" />
              <span>
                {new Date(upcomingMatch.date).toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                })}{" "}
                • {formatTime(upcomingMatch.date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-dark">
              <MapPin className="h-4 w-4 text-muted" />
              <span>{upcomingMatch.location}</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">Confirmados</span>
              <span className="font-bold text-brand-600">
                {upcomingMatch.confirmed.length}/14
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${(upcomingMatch.confirmed.length / 14) * 100}%` }}
              />
            </div>
          </div>

          <ConfirmButtons currentStatus={myStatus} onConfirm={handleConfirmPresence} />

          <div className="mt-4">
            <PresenceList
              confirmed={upcomingMatch.confirmed}
              maybe={upcomingMatch.maybe}
              waiting={upcomingMatch.waiting}
              totalSpots={14}
              collapsible
              defaultOpen={false}
            />
          </div>

          <Link href={`/groups/${upcomingMatch.groupId}`} className="block mt-3">
            <Button variant="outline" size="sm" className="w-full">
              Ver detalhes da pelada
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* My Groups */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Meus Grupos</h2>
          <Link href="/groups">
            <Button variant="ghost" size="sm" className="text-xs">
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {visibleMyGroups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="transition-all active:scale-[0.99] hover:border-brand-200 hover:shadow-md cursor-pointer mb-3">
                <CardContent className="flex items-center gap-3.5 p-3.5">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm"
                    style={{ backgroundColor: group.color }}
                  >
                    {group.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-sm">
                        {group.name}
                      </p>
                      {group.role === "admin" && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.memberCount}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(group.nextMatch.date).toLocaleDateString(
                          "pt-BR",
                          { weekday: "short", day: "2-digit", month: "short" }
                        )}
                      </span>
                      <span className="text-xs font-medium text-brand-600">
                        {group.nextMatch.confirmedCount}/{group.nextMatch.totalSpots}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-light" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Matches */}
      <div>
        <h2 className="mb-3 font-display text-lg font-bold">
          Partidas Recentes
        </h2>
        <div className="space-y-3">
          {recentMatches.map((match) => (
            <Card key={match.id} className="border-border/50">
              <CardContent className="p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted">
                    {new Date(match.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    — {match.group}
                  </span>
                  <div className="flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5">
                    <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                    <span className="text-xs font-bold text-accent-700">
                      {match.playerRating}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center flex-1">
                    <p className="font-semibold text-sm">{match.teamA.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl font-extrabold text-pitch">
                      {match.teamA.score}
                    </span>
                    <span className="text-muted-light font-bold">x</span>
                    <span className="font-display text-2xl font-extrabold text-pitch">
                      {match.teamB.score}
                    </span>
                  </div>
                  <div className="text-center flex-1">
                    <p className="font-semibold text-sm">{match.teamB.name}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted">
                  {match.goals > 0 && (
                    <span className="flex items-center gap-1">
                      <GoalIcon className="h-3 w-3" />
                      {match.goals} {match.goals === 1 ? "gol" : "gols"}
                    </span>
                  )}
                  {match.assists > 0 && (
                    <span className="flex items-center gap-1">
                      <Footprints className="h-3 w-3" />
                      {match.assists}{" "}
                      {match.assists === 1 ? "assistência" : "assistências"}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      </div>{/* End Left Column */}

      {/* Right Column */}
      <div className="lg:col-span-2 space-y-5">

      {/* Weekly Highlights */}
      <div>
        <h2 className="mb-3 font-display text-lg font-bold">
          Destaques da Semana
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              title: "MVP",
              icon: Award,
              ...weeklyHighlights.mvp,
              color: "text-accent-600",
              bg: "bg-accent-50",
            },
            {
              title: "Artilheiro",
              icon: Target,
              ...weeklyHighlights.topScorer,
              color: "text-red-500",
              bg: "bg-red-50",
            },
            {
              title: "Garçom",
              icon: Footprints,
              ...weeklyHighlights.bestAssist,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              title: "Paredão",
              icon: ShieldCheck,
              ...weeklyHighlights.bestDefender,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map((highlight) => (
            <Card key={highlight.title} className="border-border/50">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${highlight.bg}`}
                  >
                    <highlight.icon
                      className={`h-3.5 w-3.5 ${highlight.color}`}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted">
                    {highlight.title}
                  </span>
                </div>
                <p className="font-display text-sm font-bold">
                  {highlight.name}
                </p>
                <p className="text-xs text-muted">
                  {highlight.value} — {highlight.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Financial Quick View */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-muted" />
              Financeiro
            </CardTitle>
            <Badge variant={financialSummary.balance < 0 ? "danger" : "success"}>
              {financialSummary.balance < 0 ? "Pendente" : "Em dia"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-display text-lg font-bold text-danger">
                {formatCurrency(Math.abs(financialSummary.balance))}
              </p>
              <p className="text-[10px] text-muted">Saldo devedor</p>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-brand-600">
                {formatCurrency(financialSummary.paid)}
              </p>
              <p className="text-[10px] text-muted">Pago no mês</p>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-muted-dark">
                {formatCurrency(financialSummary.monthlyDue)}
              </p>
              <p className="text-[10px] text-muted">Mensalidade</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Evolution */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-muted" />
            Evolução do Overall
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-24">
            {playerStats.overallHistory.map((ovr, i) => {
              const height = ((ovr - 6.5) / 3.5) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-brand-600">
                    {ovr}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-brand-400 transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[9px] text-muted">
                    {["Out", "Nov", "Dez", "Jan", "Fev", "Mar"][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      </div>{/* End Right Column */}
      </div>{/* End Two-column grid */}

      {/* Presence Streak */}
      <Card className="border-brand-200 bg-brand-50/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
            <Flame className="h-6 w-6 text-brand-600" />
          </div>
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-brand-700">
              {playerStats.streak} jogos seguidos!
            </p>
            <p className="text-sm text-brand-600/80">
              Sequência de presença ativa. Continue assim!
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
