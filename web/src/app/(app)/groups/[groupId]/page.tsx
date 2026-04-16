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
  Share2,
  Link2,
  Check,
  Pencil,
  UserCog,
  CalendarPlus,
  Send,
  Pin,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  markGroupLeft,
  markGroupDeleted,
  isGroupHiddenFromUser,
} from "@/lib/group-membership-storage";
import { findUserGroup, removeUserGroup } from "@/lib/group-storage";
import { getMatchHistory, getActiveMatch, getLegacyResults } from "@/lib/match-storage";
import { getOrCreateInvite, buildInviteUrl } from "@/lib/invite-storage";
import { getGroupMembers, initGroupOwnerAsMember } from "@/lib/member-storage";
import { getGroupGames } from "@/lib/game-storage";
import {
  getGroupPosts,
  addPost,
  removePost,
  togglePin,
  toggleReaction,
  timeAgo,
  type MuralPost,
} from "@/lib/mural-storage";

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
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [muralPosts, setMuralPosts] = useState<MuralPost[]>([]);
  const [newPostText, setNewPostText] = useState("");
  const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);
  const [muralToast, setMuralToast] = useState<string | null>(null);

  const groupId =
    typeof params.groupId === "string"
      ? params.groupId
      : Array.isArray(params.groupId)
        ? params.groupId[0]
        : "";

  const group = useMemo(
    () => findUserGroup(groupId),
    [groupId],
  );

  const userId = user?.id;
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
    if (groupId) setMuralPosts(getGroupPosts(groupId));
  }, [groupId]);

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

  const handleCopyInviteLink = () => {
    if (!group) return;
    const invite = getOrCreateInvite(group.id);
    const url = buildInviteUrl(invite.code, group);
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  const handleShareInvite = async () => {
    if (!group) return;
    const invite = getOrCreateInvite(group.id);
    const url = buildInviteUrl(invite.code, group);
    const shareData = {
      title: `Convite: ${group.name}`,
      text: `Entra no ${group.name} no PeladaPro! ${group.dayOfWeek} às ${group.time}h — ${group.format}`,
      url,
    };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch { /* user cancelled or not supported */ }
    }
    setShowShareModal(true);
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
              {(() => { initGroupOwnerAsMember(groupId, group.owner); return getGroupMembers(groupId).length; })()}/{group.maxMembers} membros
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-brand-600 hover:text-brand-700 hover:bg-brand-50"
            onClick={handleShareInvite}
            aria-label="Convidar"
          >
            <Share2 className="h-4 w-4" />
          </Button>
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
                    <p className="text-2xl font-bold text-brand-600">{getGroupMembers(groupId).length}</p>
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

            {isProprietor && (
              <Card className="border-accent-200/50 bg-gradient-to-br from-accent-50/30 to-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-accent-100 flex items-center justify-center">
                      <Crown className="h-3.5 w-3.5 text-accent-600" />
                    </div>
                    Gestão do grupo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/groups/${groupId}/edit`}>
                    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3 transition-all hover:border-brand-300 hover:shadow-sm group cursor-pointer">
                      <div className="h-9 w-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 group-hover:bg-brand-200 transition-colors">
                        <Pencil className="h-4 w-4 text-brand-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">Editar informações</p>
                        <p className="text-[11px] text-muted">Nome, local, horário, formato</p>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-muted rotate-180 shrink-0" />
                    </div>
                  </Link>
                  <Link href={`/groups/${groupId}/members`}>
                    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3 transition-all hover:border-blue-300 hover:shadow-sm group cursor-pointer">
                      <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                        <UserCog className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">Gerenciar membros</p>
                        <p className="text-[11px] text-muted">Adicionar, remover jogadores</p>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-muted rotate-180 shrink-0" />
                    </div>
                  </Link>
                  <Link href={`/groups/${groupId}/matches`}>
                    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3 transition-all hover:border-green-300 hover:shadow-sm group cursor-pointer">
                      <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                        <CalendarPlus className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">Gerenciar jogos</p>
                        <p className="text-[11px] text-muted">Agendar, cancelar partidas</p>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-muted rotate-180 shrink-0" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

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
            <div className="lg:col-span-2 space-y-4">
              {(() => {
                const scheduledGames = getGroupGames(groupId).filter((g) => g.status === "scheduled");
                const matchHistory = getMatchHistory(groupId);
                const active = getActiveMatch(groupId);
                const hasContent = scheduledGames.length > 0 || matchHistory.length > 0 || !!active;

                if (!hasContent) {
                  return (
                    <Card className="border-border/50">
                      <CardContent className="py-12 text-center">
                        <Calendar className="h-10 w-10 text-muted-light mx-auto mb-3" />
                        <p className="font-display font-bold">Nenhuma partida ainda</p>
                        <p className="text-sm text-muted mt-1">
                          {isProprietor ? "Agende jogos ou inicie o Scout." : "Aguardando o organizador agendar jogos."}
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Link href={`/groups/${group.id}/matches`}>
                            <Button size="sm">
                              <ClipboardList className="h-4 w-4" />
                              Ver partidas
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <>
                    {active && (
                      <Link href={`/groups/${groupId}/match?id=${active.id}`}>
                        <Card className="overflow-hidden border-brand-300 bg-brand-50/30 cursor-pointer hover:shadow-md transition-all">
                          <CardContent className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-brand-500 flex items-center justify-center animate-pulse">
                                <ClipboardList className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-brand-700">Partida ao vivo</p>
                                <p className="text-xs text-brand-600/70">{active.scoreA} x {active.scoreB} · Toque para abrir o Scout</p>
                              </div>
                              <Badge variant="success" className="text-[10px] shrink-0 animate-pulse">Ao vivo</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )}

                    {scheduledGames.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-bold text-sm">Próximos jogos</h3>
                          <Link href={`/groups/${groupId}/matches`}>
                            <Button variant="ghost" size="sm" className="text-xs h-7">Ver todos</Button>
                          </Link>
                        </div>
                        {scheduledGames.slice(0, 2).map((game) => (
                          <Card key={game.id} className="border-brand-200/50 bg-brand-50/20">
                            <CardContent className="p-3.5 flex items-center gap-3">
                              <div className="rounded-xl bg-brand-100 border border-brand-200 p-2 text-center w-12 shrink-0">
                                <p className="text-sm font-bold text-brand-700 leading-tight">
                                  {(() => { try { return new Date(game.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit" }); } catch { return "—"; } })()}
                                </p>
                                <p className="text-[9px] font-medium text-brand-500 uppercase">
                                  {(() => { try { return new Date(game.date + "T00:00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""); } catch { return ""; } })()}
                                </p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{game.time}h · {game.format}</p>
                                <p className="text-xs text-muted truncate flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3 shrink-0" />{game.location}
                                </p>
                              </div>
                              <Badge variant="success" className="text-[10px] shrink-0">Agendado</Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {matchHistory.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-bold text-sm">Últimos resultados</h3>
                          <Link href={`/groups/${groupId}/matches`}>
                            <Button variant="ghost" size="sm" className="text-xs h-7">Ver todos</Button>
                          </Link>
                        </div>
                        {matchHistory.slice(0, 3).map((result) => (
                          <Link key={result.id} href={`/groups/${groupId}/match?id=${result.id}&view=true`}>
                            <Card className="border-border/50 cursor-pointer hover:shadow-md transition-all mb-3">
                              <CardContent className="p-3.5">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-muted">
                                    {result.endedAt ? new Date(result.endedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—"}
                                  </span>
                                  <Badge variant={result.scoreA !== result.scoreB ? "success" : "secondary"} className="text-[9px]">
                                    {result.scoreA > result.scoreB ? "Verde venceu" : result.scoreB > result.scoreA ? "Branco venceu" : "Empate"}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-center gap-4">
                                  <span className="flex-1 text-right text-xs font-medium text-muted">Verde</span>
                                  <span className="font-display text-2xl font-extrabold text-pitch">{result.scoreA}</span>
                                  <span className="font-bold text-muted-light">x</span>
                                  <span className="font-display text-2xl font-extrabold text-pitch">{result.scoreB}</span>
                                  <span className="flex-1 text-xs font-medium text-muted">Branco</span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
        </div>
      )}

      {/* Tab: Membros */}
      {activeTab === "membros" && (
        (() => {
          initGroupOwnerAsMember(groupId, group.owner);
          const realMembers = getGroupMembers(groupId);
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-dark">{realMembers.length} membro{realMembers.length !== 1 ? "s" : ""}</p>
                <Link href={`/groups/${groupId}/members`}>
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    <Users className="h-3.5 w-3.5" />
                    Ver todos
                  </Button>
                </Link>
              </div>
              <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                {realMembers.map((member) => (
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
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{member.position}</Badge>
                          <span>{member.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5">
                        <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                        <span className="text-xs font-bold text-accent-700">{member.overall.toFixed(1)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {realMembers.length <= 1 && (
                  <Card className="border-dashed border-border lg:col-span-2">
                    <CardContent className="py-8 text-center">
                      <Users className="h-8 w-8 text-muted-light mx-auto mb-2" />
                      <p className="text-sm text-muted">Convide jogadores para o grupo!</p>
                      <Link href={`/groups/${groupId}/members`}>
                        <Button size="sm" variant="outline" className="mt-3">
                          <UserCog className="h-3.5 w-3.5" />
                          {isProprietor ? "Gerenciar membros" : "Ver membros"}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          );
        })()
      )}

      {/* Tab: Ranking */}
      {activeTab === "ranking" && (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Trophy className="h-10 w-10 text-muted-light mx-auto mb-3" />
            <p className="font-display font-bold">Ranking em construção</p>
            <p className="text-sm text-muted mt-1">Jogue partidas para gerar o ranking do grupo.</p>
          </CardContent>
        </Card>
      )}

      {/* Tab: Mural */}
      {activeTab === "mural" && (
        <div className="space-y-4">
          {/* Compose */}
          <Card className="border-brand-200/50 shadow-sm">
            <CardContent className="p-3">
              <div className="flex gap-3">
                <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                  <AvatarFallback className="text-[10px] font-semibold bg-brand-100 text-brand-700">
                    {getInitials(user?.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <textarea
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Escreva algo para o grupo..."
                    maxLength={500}
                    rows={2}
                    className="w-full rounded-xl border-0 bg-surface-tertiary px-3.5 py-2.5 text-sm ring-0 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted">{newPostText.length}/500</p>
                    <Button
                      size="sm"
                      disabled={!newPostText.trim()}
                      className="h-8 shadow-sm"
                      onClick={() => {
                        if (!newPostText.trim() || !userId) return;
                        addPost({
                          id: `post-${Date.now()}`,
                          groupId,
                          authorId: userId,
                          authorName: user?.name ?? "Jogador",
                          authorNickname: user?.nickname ?? user?.name?.split(" ")[0] ?? "Eu",
                          content: newPostText.trim(),
                          pinned: false,
                          reactions: {},
                          createdAt: new Date().toISOString(),
                        });
                        setNewPostText("");
                        setMuralPosts(getGroupPosts(groupId));
                      }}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Publicar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {muralPosts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-surface-tertiary">
                  <MessageSquare className="h-8 w-8 text-muted-light" />
                </div>
                <p className="font-display font-bold">Mural vazio</p>
                <p className="text-sm text-muted mt-1 max-w-[240px] mx-auto">
                  Seja o primeiro a escrever algo para o grupo!
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* User posts from storage */}
              {muralPosts.map((post) => {
                const isAuthor = post.authorId === userId;
                const isGroupOwner = isProprietor;
                const reactionEmojis = ["👍", "😂", "🔥", "❤️", "⚽"];
                return (
                  <Card
                    key={post.id}
                    className={cn(
                      "transition-all overflow-hidden",
                      post.pinned
                        ? "border-accent-200 bg-gradient-to-br from-accent-50/40 to-transparent"
                        : "border-border/50",
                    )}
                  >
                    {post.pinned && (
                      <div className="flex items-center gap-1.5 bg-accent-100/60 px-4 py-1.5">
                        <Pin className="h-3 w-3 text-accent-600" />
                        <span className="text-[10px] font-semibold text-accent-700">Fixado</span>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="text-[10px] font-semibold">
                            {getInitials(post.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{post.authorNickname}</span>
                            {post.authorId === group?.owner.id && (
                              <Badge className="text-[8px] px-1 py-0 bg-accent-100 text-accent-700 border-accent-200">Admin</Badge>
                            )}
                            <span className="text-[11px] text-muted ml-auto shrink-0">{timeAgo(post.createdAt)}</span>
                            {(isAuthor || isGroupOwner) && (
                              <div className="relative">
                                <button
                                  onClick={() => setPostMenuOpen(postMenuOpen === post.id ? null : post.id)}
                                  className="h-6 w-6 rounded-md flex items-center justify-center text-muted hover:text-muted-dark hover:bg-surface-tertiary transition-colors"
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>
                                {postMenuOpen === post.id && (
                                  <div className="absolute right-0 top-7 z-10 w-36 rounded-xl border border-border bg-surface shadow-lg py-1 animate-fade-in">
                                    {isGroupOwner && (
                                      <button
                                        onClick={() => {
                                          togglePin(post.id);
                                          setMuralPosts(getGroupPosts(groupId));
                                          setPostMenuOpen(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-surface-tertiary transition-colors"
                                      >
                                        <Pin className="h-3.5 w-3.5" />
                                        {post.pinned ? "Desafixar" : "Fixar post"}
                                      </button>
                                    )}
                                    {(isAuthor || isGroupOwner) && (
                                      <button
                                        onClick={() => {
                                          removePost(post.id);
                                          setMuralPosts(getGroupPosts(groupId));
                                          setPostMenuOpen(null);
                                          setMuralToast("Post removido");
                                          setTimeout(() => setMuralToast(null), 2500);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Excluir
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-sm mt-1.5 whitespace-pre-wrap break-words">{post.content}</p>

                          {/* Reactions */}
                          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                            {Object.entries(post.reactions ?? {}).map(([emoji, users]) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  if (!userId) return;
                                  toggleReaction(post.id, emoji, userId);
                                  setMuralPosts(getGroupPosts(groupId));
                                }}
                                className={cn(
                                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all",
                                  users.includes(userId ?? "")
                                    ? "border-brand-300 bg-brand-50 text-brand-700"
                                    : "border-border bg-surface-secondary text-muted-dark hover:border-brand-200",
                                )}
                              >
                                <span>{emoji}</span>
                                <span className="font-semibold">{users.length}</span>
                              </button>
                            ))}
                            <div className="flex items-center gap-0.5 ml-1">
                              {reactionEmojis
                                .filter((e) => !post.reactions?.[e])
                                .slice(0, 3)
                                .map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      if (!userId) return;
                                      toggleReaction(post.id, emoji, userId);
                                      setMuralPosts(getGroupPosts(groupId));
                                    }}
                                    className="h-7 w-7 rounded-full flex items-center justify-center text-sm hover:bg-surface-tertiary transition-colors opacity-40 hover:opacity-100"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

            </>
          )}
        </div>
      )}

      {/* Mural Toast */}
      {muralToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2 rounded-xl bg-pitch px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            <Check className="h-4 w-4" />
            {muralToast}
          </div>
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

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm animate-fade-in">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Convidar para o grupo</h3>
                <button onClick={() => { setShowShareModal(false); setLinkCopied(false); }} className="text-muted hover:text-muted-dark">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-muted">
                Compartilhe o link abaixo para convidar jogadores para <strong>{group.name}</strong>.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-sm font-mono">
                  {buildInviteUrl(getOrCreateInvite(group.id).code, group)}
                </div>
                <Button
                  size="icon"
                  variant={linkCopied ? "default" : "outline"}
                  className={linkCopied ? "bg-brand-600 hover:bg-brand-700" : ""}
                  onClick={handleCopyInviteLink}
                >
                  {linkCopied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                </Button>
              </div>
              {linkCopied && (
                <p className="text-xs text-brand-600 font-medium text-center animate-fade-in">
                  Link copiado!
                </p>
              )}
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Entra no ${group.name} no PeladaPro! ${group.dayOfWeek} às ${group.time}h — ${group.format}\n\n${buildInviteUrl(getOrCreateInvite(group.id).code, group)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50" size="sm">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="flex-1"
                  size="sm"
                  onClick={handleCopyInviteLink}
                >
                  <Link2 className="h-4 w-4" />
                  Copiar link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
