"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
  CalendarCheck,
  Shuffle,
  ClipboardList,
  Info,
  Phone,
  MessageCircle,
  LogOut,
  Lock,
  Globe,
  DollarSign,
  Footprints,
  X,
  Trash2,
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
  currentUser,
  type MatchStatus,
} from "@/lib/mock-data";
import { getInitials, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ConfirmButtons, PresenceList } from "@/components/presence-list";
import { useAuth } from "@/lib/auth";
import {
  markGroupLeft,
  markGroupDeleted,
  isGroupHiddenFromUser,
} from "@/lib/group-membership-storage";
import { findUserGroup, removeUserGroup } from "@/lib/group-storage";
import { getMatchConfirmation, setMatchConfirmation, getMatchResults } from "@/lib/match-storage";

const tabs = [
  { id: "info", label: "Info", icon: Info },
  { id: "jogos", label: "Jogos", icon: Calendar },
  { id: "membros", label: "Membros", icon: Users },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "mural", label: "Mural", icon: MessageSquare },
];

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [myMatchStatus, setMyMatchStatus] = useState<MatchStatus | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const groupId =
    typeof params.groupId === "string"
      ? params.groupId
      : Array.isArray(params.groupId)
        ? params.groupId[0]
        : "";

  const isMockGroup = useMemo(() => myGroups.some((g) => g.id === groupId), [groupId]);

  const group = useMemo(
    () => myGroups.find((g) => g.id === groupId) ?? findUserGroup(groupId),
    [groupId],
  );

  const userId = user?.id ?? (user?.email === currentUser.email ? currentUser.id : undefined);
  const isProprietor = Boolean(group && userId && group.owner.id === userId);

  useEffect(() => {
    if (!groupId) return;
    if (isGroupHiddenFromUser(groupId)) {
      router.replace("/groups");
    }
  }, [groupId, router]);

  useEffect(() => {
    if (!groupId || group) return;
    router.replace("/groups");
  }, [groupId, group, router]);

  useEffect(() => {
    if (!groupId || !userId) return;
    const matchId = upcomingMatch.id ?? groupId;
    const saved = getMatchConfirmation(matchId, userId);
    if (saved) setMyMatchStatus(saved);
  }, [groupId, userId]);

  const handleConfirmPresence = (status: MatchStatus) => {
    setMyMatchStatus(status);
    if (userId) {
      const matchId = upcomingMatch.id ?? groupId;
      setMatchConfirmation(matchId, userId, status);
    }
  };

  const handleLeaveGroup = () => {
    if (group) markGroupLeft(group.id);
    setShowLeaveModal(false);
    router.push("/groups");
  };

  const handleDeleteGroup = () => {
    if (group) {
      markGroupDeleted(group.id);
      removeUserGroup(group.id);
    }
    setShowDeleteModal(false);
    router.push("/groups");
  };

  if (!group) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Carregando…
      </div>
    );
  }

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
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-lg font-bold">
                {group.name}
              </h1>
              <Badge
                variant={group.visibility === "public" ? "info" : "secondary"}
                className="text-[10px] px-1.5 py-0 shrink-0"
              >
                {group.visibility === "public" ? (
                  <><Globe className="h-2.5 w-2.5 mr-0.5" />Público</>
                ) : (
                  <><Lock className="h-2.5 w-2.5 mr-0.5" />Privado</>
                )}
              </Badge>
            </div>
            <p className="text-xs text-muted flex items-center gap-1">
              <Users className="h-3 w-3" />
              {group.memberCount}/{group.maxMembers} membros
            </p>
          </div>
        </div>
        {isProprietor ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteModal(true)}
            aria-label="Excluir grupo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setShowLeaveModal(true)}
            aria-label="Sair do grupo"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-tertiary p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-lg py-2.5 text-xs font-semibold transition-all whitespace-nowrap min-w-0 px-2",
              activeTab === tab.id
                ? "bg-surface text-pitch shadow-sm"
                : "text-muted hover:text-muted-dark"
            )}
          >
            <tab.icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {activeTab === "info" && (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sobre o grupo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-dark">{group.description}</p>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{group.address}</p>
                      <p className="text-xs text-muted">{group.neighborhood}, {group.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-brand-500 shrink-0" />
                    <p>{group.dayOfWeek}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-brand-500 shrink-0" />
                    <p>{group.time}h</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Footprints className="h-4 w-4 text-brand-500 shrink-0" />
                    <p>Formato {group.format}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="h-4 w-4 text-brand-500 shrink-0" />
                    <p>R$ {group.pricePerMatch.toFixed(2)} por partida</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {group.visibility === "public" ? (
                      <Globe className="h-4 w-4 text-brand-500 shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 text-brand-500 shrink-0" />
                    )}
                    <p>{group.visibility === "public" ? "Grupo público - entrada com aprovação" : "Grupo privado - apenas convidados"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Card */}
            <Card className="border-brand-200 bg-brand-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown className="h-4 w-4 text-accent-500" />
                  Proprietário do grupo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-brand-200">
                    <AvatarFallback className="text-sm font-bold bg-brand-100 text-brand-700">
                      {getInitials(group.owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{group.owner.name}</p>
                    <p className="text-xs text-muted">@{group.owner.nickname}</p>
                  </div>
                  {!isProprietor && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowContactModal(true)}
                      className="shrink-0"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contato
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-surface-secondary p-3 text-center">
                    <p className="text-2xl font-bold text-brand-600">{group.memberCount}</p>
                    <p className="text-xs text-muted">Membros</p>
                  </div>
                  <div className="rounded-lg bg-surface-secondary p-3 text-center">
                    <p className="text-2xl font-bold text-brand-600">{group.format}</p>
                    <p className="text-xs text-muted">Formato</p>
                  </div>
                  <div className="rounded-lg bg-surface-secondary p-3 text-center">
                    <p className="text-2xl font-bold text-accent-600">R${group.pricePerMatch}</p>
                    <p className="text-xs text-muted">Por partida</p>
                  </div>
                  <div className="rounded-lg bg-surface-secondary p-3 text-center">
                    <p className="text-2xl font-bold text-pitch">{group.dayOfWeek.slice(0, 3)}</p>
                    <p className="text-xs text-muted">Dia fixo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isProprietor ? (
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4" />
                Excluir grupo
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowLeaveModal(true)}
              >
                <LogOut className="h-4 w-4" />
                Sair do grupo
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tab: Jogos */}
      {activeTab === "jogos" && (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
          {isMockGroup ? (
            <>
              <div className="space-y-4">
                <Card className="overflow-hidden border-none shadow-lg">
                  <div className="pitch-gradient px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Próxima Pelada</p>
                      <Badge className="border-white/20 bg-white/15 text-white text-[10px]">{upcomingMatch.format}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-dark">
                        <Clock className="h-4 w-4 text-muted" />
                        {new Date(upcomingMatch.date).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} • {formatTime(upcomingMatch.date)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-dark">
                        <MapPin className="h-4 w-4 text-muted" />
                        {upcomingMatch.location}
                      </div>
                    </div>
                    <div className="mb-2 flex justify-between text-xs">
                      <span>Confirmados</span>
                      <span className="font-bold text-brand-600">{upcomingMatch.confirmed.length}/14</span>
                    </div>
                    <div className="mb-4 h-2 overflow-hidden rounded-full bg-brand-100">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${(upcomingMatch.confirmed.length / 14) * 100}%` }} />
                    </div>
                    <p className="mb-2 text-xs font-semibold text-muted-dark">Sua presença:</p>
                    <ConfirmButtons currentStatus={myMatchStatus} onConfirm={handleConfirmPresence} />
                    <div className="mt-4 flex gap-2">
                      <Link href={`/groups/${group.id}/shuffle`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Shuffle className="h-4 w-4" />
                          Sortear times
                        </Button>
                      </Link>
                      <Link href={`/groups/${group.id}/match`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <ClipboardList className="h-4 w-4" />
                          Scout
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarCheck className="h-4 w-4 text-muted" />
                      Lista de Presença
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PresenceList confirmed={upcomingMatch.confirmed} maybe={upcomingMatch.maybe} waiting={upcomingMatch.waiting} totalSpots={14} />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="font-display font-bold">Partidas Anteriores</h3>
                {recentMatches.map((match) => (
                  <Card key={match.id} className="border-border/50">
                    <CardContent className="p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted">
                          {new Date(match.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <span className="flex-1 text-right text-sm font-semibold">{match.teamA.name}</span>
                        <span className="font-display text-2xl font-extrabold text-pitch">{match.teamA.score}</span>
                        <span className="font-bold text-muted-light">x</span>
                        <span className="font-display text-2xl font-extrabold text-pitch">{match.teamB.score}</span>
                        <span className="flex-1 text-sm font-semibold">{match.teamB.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="lg:col-span-2 space-y-4">
              {(() => {
                const savedResults = getMatchResults(groupId);
                if (savedResults.length === 0) {
                  return (
                    <Card className="border-border/50">
                      <CardContent className="py-12 text-center">
                        <Calendar className="h-10 w-10 text-muted-light mx-auto mb-3" />
                        <p className="font-display font-bold">Nenhuma partida ainda</p>
                        <p className="text-sm text-muted mt-1">Crie a primeira partida deste grupo usando o Scout.</p>
                        <Link href={`/groups/${group.id}/match`} className="mt-4 inline-block">
                          <Button size="sm">
                            <ClipboardList className="h-4 w-4" />
                            Iniciar Scout
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                }
                return savedResults.map((result) => (
                  <Card key={result.matchId} className="border-border/50">
                    <CardContent className="p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted">
                          {new Date(result.endedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <span className="flex-1 text-right text-sm font-semibold">Time A</span>
                        <span className="font-display text-2xl font-extrabold text-pitch">{result.teamAScore}</span>
                        <span className="font-bold text-muted-light">x</span>
                        <span className="font-display text-2xl font-extrabold text-pitch">{result.teamBScore}</span>
                        <span className="flex-1 text-sm font-semibold">Time B</span>
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>
          )}
        </div>
      )}

      {/* Tab: Membros */}
      {activeTab === "membros" && (
        isMockGroup ? (
        <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {groupMembers.map((member) => (
            <Card key={member.id} className="border-border/50">
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{member.nickname}</p>
                    {member.role === "admin" && <Crown className="h-3.5 w-3.5 text-accent-500" />}
                    {member.role === "moderator" && <Shield className="h-3.5 w-3.5 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted flex-wrap">
                    {(member.positions || [member.position]).map((pos) => (
                      <Badge key={pos} variant="secondary" className="text-[9px] px-1.5 py-0">{pos}</Badge>
                    ))}
                    <span>{member.matches} jogos</span>
                    <span>{member.goals} gols</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5">
                  <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                  <span className="text-xs font-bold text-accent-700">{member.overall}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        ) : (
        <div className="space-y-2">
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-3 p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-xs">{getInitials(group.owner.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{group.owner.nickname}</p>
                  <Crown className="h-3.5 w-3.5 text-accent-500" />
                </div>
                <p className="text-xs text-muted">Criador do grupo</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed border-border">
            <CardContent className="py-8 text-center">
              <Users className="h-8 w-8 text-muted-light mx-auto mb-2" />
              <p className="text-sm text-muted">Convide jogadores para o grupo!</p>
            </CardContent>
          </Card>
        </div>
        )
      )}

      {/* Tab: Ranking */}
      {activeTab === "ranking" && (
        isMockGroup ? (
        <div className="space-y-4">
          <div className="flex items-end justify-center gap-3 py-4">
            {[groupMembers[1], groupMembers[0], groupMembers[2]].map((member, idx) => {
              const heights = ["h-20", "h-28", "h-16"];
              const bgColors = ["bg-gray-200", "bg-accent-100", "bg-amber-100"];
              const medals = ["🥈", "🥇", "🥉"];
              return (
                <div key={member.id} className="flex flex-col items-center gap-2">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                    <AvatarFallback className="text-sm">{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-xs font-bold">{member.nickname}</p>
                    <div className="flex items-center justify-center gap-0.5">
                      <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                      <span className="text-xs font-bold">{member.overall}</span>
                    </div>
                  </div>
                  <div className={cn("flex w-20 items-start justify-center rounded-t-xl pt-2 text-xl", heights[idx], bgColors[idx])}>
                    {medals[idx]}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="space-y-1.5 lg:max-w-2xl lg:mx-auto">
            {groupMembers.sort((a, b) => b.overall - a.overall).map((member, idx) => (
              <div
                key={member.id}
                className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5", idx < 3 ? "bg-accent-50/50" : "bg-surface-secondary")}
              >
                <span className={cn("w-6 text-center text-sm font-bold", idx === 0 ? "text-accent-600" : idx < 3 ? "text-accent-500" : "text-muted")}>{idx + 1}º</span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[10px]">{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{member.nickname}</p>
                  <p className="text-[10px] text-muted">{(member.positions || [member.position]).join(", ")} • {member.matches} jogos</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                  <span className="text-sm font-bold">{member.overall}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        ) : (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Trophy className="h-10 w-10 text-muted-light mx-auto mb-3" />
            <p className="font-display font-bold">Ranking em construção</p>
            <p className="text-sm text-muted mt-1">Jogue partidas para gerar o ranking do grupo.</p>
          </CardContent>
        </Card>
        )
      )}

      {/* Tab: Mural */}
      {activeTab === "mural" && (
        <div className="space-y-4">
          <Card className="border-accent-200 bg-accent-50/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="warning" className="text-[10px]">Fixado</Badge>
                <span className="text-xs text-muted">Admin • 2h atrás</span>
              </div>
              <p className="text-sm">
                Fala, galera! Pelada de sexta confirmada. Já temos 14 confirmados! Quem não confirmou ainda, confirma aí. Pagamento no local: R$ 25,00. Bora! ⚽
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">LK</AvatarFallback></Avatar>
                <div>
                  <span className="text-xs font-semibold">Lukinha</span>
                  <span className="text-xs text-muted"> • 5h atrás</span>
                </div>
              </div>
              <p className="text-sm">Quem ficou devendo da semana passada? Lembrem de acertar com o Vitinho.</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">GB</AvatarFallback></Avatar>
                <div>
                  <span className="text-xs font-semibold">Gabigol</span>
                  <span className="text-xs text-muted"> • 1 dia atrás</span>
                </div>
              </div>
              <p className="text-sm">Hat-trick na última pelada! Quem vai parar o artilheiro? 😎🔥</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leave Group Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm animate-fade-in">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <LogOut className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Sair do grupo?</h3>
                <p className="mt-1 text-sm text-muted">
                  Você perderá acesso ao mural, partidas e rankings de <strong>{group.name}</strong>. Você poderá solicitar entrada novamente.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowLeaveModal(false)}>
                  Cancelar
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleLeaveGroup}>
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Group Modal (proprietário) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm animate-fade-in">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Excluir grupo?</h3>
                <p className="mt-1 text-sm text-muted">
                  Esta ação remove <strong>{group.name}</strong> da sua lista. O histórico e membros serão perdidos neste dispositivo (demonstração). Esta operação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleDeleteGroup}>
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Owner Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm animate-fade-in">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Contato do proprietário</h3>
                <button onClick={() => setShowContactModal(false)} className="text-muted hover:text-muted-dark">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm font-bold">{getInitials(group.owner.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{group.owner.name}</p>
                  <p className="text-xs text-muted">@{group.owner.nickname}</p>
                </div>
              </div>
              <div className="space-y-2">
                {group.owner.phone && (
                  <a
                    href={`https://wa.me/55${group.owner.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                    <span className="ml-auto text-xs text-green-500">{group.owner.phone}</span>
                  </a>
                )}
                {group.owner.phone && (
                  <a
                    href={`tel:${group.owner.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <Phone className="h-5 w-5" />
                    Ligar
                    <span className="ml-auto text-xs text-blue-500">{group.owner.phone}</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
