"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Footprints,
  DollarSign,
  Trash2,
  X,
  Check,
  ClipboardList,
  Ban,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { findUserGroup } from "@/lib/group-storage";
import { myGroups } from "@/lib/mock-data";
import { getMatchResults, type MatchResult } from "@/lib/match-storage";
import {
  getGroupGames,
  addGame,
  updateGame,
  removeGame,
  type ScheduledGame,
} from "@/lib/game-storage";

function getCountdown(dateStr: string, time: string): string {
  try {
    const target = new Date(`${dateStr}T${time}:00`);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return "Agora!";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `em ${days}d ${hours}h`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `em ${hours}h ${minutes}min`;
    return `em ${minutes}min`;
  } catch {
    return "";
  }
}

export default function MatchesPage() {
  const params = useParams();
  const { user } = useAuth();

  const groupId =
    typeof params.groupId === "string"
      ? params.groupId
      : Array.isArray(params.groupId)
        ? params.groupId[0]
        : "";

  const group = useMemo(
    () => myGroups.find((g) => g.id === groupId) ?? findUserGroup(groupId),
    [groupId],
  );

  const isOwner =
    group && user && (group.owner.id === user.id || group.owner.name === user.name);

  const [games, setGames] = useState<ScheduledGame[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState(group?.time ?? "19:00");
  const [newLocation, setNewLocation] = useState(group?.address ?? "");
  const [newFormat, setNewFormat] = useState(group?.format ?? "7x7");
  const [newPrice, setNewPrice] = useState(String(group?.pricePerMatch ?? 25));

  useEffect(() => {
    if (!groupId) return;
    setGames(getGroupGames(groupId));
    setResults(getMatchResults(groupId));
  }, [groupId]);

  useEffect(() => {
    if (group) {
      setNewTime(group.time);
      setNewLocation(group.address);
      setNewFormat(group.format);
      setNewPrice(String(group.pricePerMatch));
    }
  }, [group]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  if (!group) {
    return (
      <div className="space-y-4 animate-fade-in lg:max-w-2xl lg:mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-surface-tertiary animate-pulse" />
        ))}
      </div>
    );
  }

  const upcomingGames = games
    .filter((g) => g.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastGames = games.filter((g) => g.status !== "scheduled");
  const nextGame = upcomingGames[0];

  const handleCreateGame = () => {
    if (!newDate) return;
    const game: ScheduledGame = {
      id: `game-${Date.now()}`,
      groupId,
      date: newDate,
      time: newTime,
      location: newLocation.trim() || group.address,
      format: newFormat,
      pricePerMatch: parseFloat(newPrice) || group.pricePerMatch,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    addGame(game);
    setGames(getGroupGames(groupId));
    setShowCreateForm(false);
    setNewDate("");
    showToast("Jogo agendado com sucesso!");
  };

  const handleCancelGame = (gameId: string) => {
    updateGame(gameId, { status: "cancelled" });
    setGames(getGroupGames(groupId));
    setConfirmDelete(null);
    showToast("Jogo cancelado");
  };

  const handleDeleteGame = (gameId: string) => {
    removeGame(gameId);
    setGames(getGroupGames(groupId));
    setConfirmDelete(null);
    showToast("Jogo removido");
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    } catch {
      return dateStr;
    }
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return { day: d.toLocaleDateString("pt-BR", { day: "2-digit" }), month: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), weekday: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "") };
    } catch {
      return { day: "—", month: "", weekday: "" };
    }
  };

  return (
    <div className="space-y-5 animate-fade-in lg:max-w-2xl lg:mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-bold">Jogos</h1>
          <p className="text-xs text-muted truncate">{group.name}</p>
        </div>
        {isOwner && (
          <Button size="sm" onClick={() => setShowCreateForm(true)} className="shrink-0 shadow-sm">
            <Plus className="h-4 w-4" />
            Novo jogo
          </Button>
        )}
      </div>

      {/* Next Game Highlight */}
      {nextGame && (
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="pitch-gradient px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/80">Próximo jogo</p>
                  <p className="text-sm font-bold text-white capitalize">{formatDate(nextGame.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                <Timer className="h-3.5 w-3.5 text-white/80" />
                <span className="text-sm font-bold text-white">{getCountdown(nextGame.date, nextGame.time)}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5 text-white/70 mx-auto mb-0.5" />
                <p className="text-sm font-bold text-white">{nextGame.time}h</p>
              </div>
              <div className="rounded-lg bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
                <Footprints className="h-3.5 w-3.5 text-white/70 mx-auto mb-0.5" />
                <p className="text-sm font-bold text-white">{nextGame.format}</p>
              </div>
              <div className="rounded-lg bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
                <DollarSign className="h-3.5 w-3.5 text-white/70 mx-auto mb-0.5" />
                <p className="text-sm font-bold text-white">R${nextGame.pricePerMatch}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-white/70">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{nextGame.location}</span>
            </div>
          </div>
          {isOwner && (
            <CardContent className="p-3 flex gap-2">
              <Link href={`/groups/${groupId}/match`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <ClipboardList className="h-3.5 w-3.5" />
                  Iniciar Scout
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setConfirmDelete(confirmDelete === nextGame.id ? null : nextGame.id)}
              >
                <Ban className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          )}
          {confirmDelete === nextGame.id && (
            <div className="flex items-center gap-2 bg-red-50 border-t border-red-200 px-4 py-2.5 animate-slide-down">
              <p className="text-xs text-red-700 flex-1">Cancelar este jogo?</p>
              <Button size="sm" variant="danger" className="h-7 text-xs" onClick={() => handleCancelGame(nextGame.id)}>
                Sim, cancelar
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmDelete(null)}>
                Não
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fade-in">
          <Card className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border-none shadow-2xl animate-slide-up">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-brand-100 flex items-center justify-center">
                    <Calendar className="h-4.5 w-4.5 text-brand-600" />
                  </div>
                  Agendar jogo
                </CardTitle>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted hover:text-muted-dark hover:bg-surface-tertiary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Data *
                  </label>
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Horário
                  </label>
                  <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Local
                </label>
                <Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder={group.address} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1">
                    <Footprints className="h-3.5 w-3.5" />
                    Formato
                  </label>
                  <Input value={newFormat} onChange={(e) => setNewFormat(e.target.value)} placeholder="7x7" />
                </div>
                <div>
                  <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    Valor (R$)
                  </label>
                  <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} min="0" step="5" />
                </div>
              </div>
              <Button onClick={handleCreateGame} disabled={!newDate} className="w-full shadow-sm" size="lg">
                <Check className="h-4 w-4" />
                Agendar jogo
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-tertiary p-1">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
            activeTab === "upcoming" ? "bg-surface text-pitch shadow-sm" : "text-muted hover:text-muted-dark",
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          Agendados ({upcomingGames.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
            activeTab === "history" ? "bg-surface text-pitch shadow-sm" : "text-muted hover:text-muted-dark",
          )}
        >
          <Trophy className="h-3.5 w-3.5" />
          Histórico ({pastGames.length + results.length})
        </button>
      </div>

      {/* Upcoming Games - Timeline */}
      {activeTab === "upcoming" && (
        <div className="space-y-0">
          {upcomingGames.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-surface-tertiary">
                  <Calendar className="h-8 w-8 text-muted-light" />
                </div>
                <p className="font-display font-bold">Nenhum jogo agendado</p>
                <p className="text-sm text-muted mt-1 max-w-[260px] mx-auto">
                  {isOwner ? "Agende o próximo jogo para o grupo." : "O organizador ainda não agendou jogos."}
                </p>
                {isOwner && (
                  <Button size="sm" className="mt-4" onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4" />
                    Agendar jogo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            upcomingGames.slice(nextGame ? 1 : 0).map((game) => {
              const sd = formatShortDate(game.date);
              return (
                <div key={game.id} className="flex gap-3 pb-4">
                  {/* Timeline Date */}
                  <div className="flex flex-col items-center shrink-0 w-12">
                    <div className="rounded-xl bg-brand-50 border border-brand-200 p-1.5 text-center w-full">
                      <p className="text-lg font-bold text-brand-700 leading-tight">{sd.day}</p>
                      <p className="text-[9px] font-medium text-brand-500 uppercase">{sd.month}</p>
                    </div>
                    <div className="w-px flex-1 bg-border mt-2" />
                  </div>
                  {/* Game Card */}
                  <Card className="flex-1 border-border/50">
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold capitalize">{sd.weekday}, {game.time}h</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                            <span className="flex items-center gap-1">
                              <Footprints className="h-3 w-3" />
                              {game.format}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              R${game.pricePerMatch}
                            </span>
                          </div>
                        </div>
                        <Badge variant="success" className="text-[10px] shrink-0">Agendado</Badge>
                      </div>
                      <p className="flex items-center gap-1 text-xs text-muted">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{game.location}</span>
                      </p>
                      {isOwner && (
                        <div className="flex gap-2 border-t border-border pt-2.5 mt-2.5">
                          <Link href={`/groups/${groupId}/match`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full text-xs h-8">
                              <ClipboardList className="h-3 w-3" />
                              Scout
                            </Button>
                          </Link>
                          {confirmDelete === game.id ? (
                            <div className="flex gap-1">
                              <Button size="sm" variant="danger" className="h-8 text-xs" onClick={() => handleCancelGame(game.id)}>
                                Cancelar jogo
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setConfirmDelete(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setConfirmDelete(game.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* History */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {pastGames.map((game) => {
            const sd = formatShortDate(game.date);
            return (
              <Card key={game.id} className={cn("border-border/50", game.status === "cancelled" && "opacity-60")}>
                <CardContent className="flex items-center gap-3 p-3.5">
                  <div className={cn(
                    "rounded-xl p-2 text-center w-12 shrink-0",
                    game.status === "cancelled" ? "bg-red-50 border border-red-200" : "bg-surface-tertiary",
                  )}>
                    <p className="text-sm font-bold leading-tight">{sd.day}</p>
                    <p className="text-[9px] font-medium text-muted uppercase">{sd.month}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold capitalize">{sd.weekday}, {game.time}h · {game.format}</p>
                    <p className="text-xs text-muted truncate mt-0.5">{game.location}</p>
                  </div>
                  <Badge
                    variant={game.status === "completed" ? "info" : "danger"}
                    className="text-[10px] shrink-0"
                  >
                    {game.status === "completed" ? "Finalizado" : "Cancelado"}
                  </Badge>
                </CardContent>
                {isOwner && game.status === "cancelled" && (
                  <div className="border-t border-border px-3.5 py-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteGame(game.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Remover
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}

          {results.length > 0 && (
            <>
              {pastGames.length > 0 && (
                <div className="flex items-center gap-3 py-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted font-medium">Resultados do Scout</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
              {results.map((result) => (
                <Card key={result.matchId} className="border-border/50 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-4">
                      <div className="rounded-xl bg-surface-tertiary p-2 text-center w-12 shrink-0">
                        <Trophy className="h-4 w-4 text-accent-500 mx-auto" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex-1 text-right">
                            <p className="text-xs text-muted mb-0.5">Time A</p>
                            <p className="font-display text-2xl font-extrabold text-pitch">{result.teamAScore}</p>
                          </div>
                          <span className="font-bold text-muted-light text-lg">x</span>
                          <div className="flex-1 text-left">
                            <p className="text-xs text-muted mb-0.5">Time B</p>
                            <p className="font-display text-2xl font-extrabold text-pitch">{result.teamBScore}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {result.events.filter((e) => e.type === "goal").length > 0 && (
                      <div className="bg-surface-secondary px-4 py-2.5 border-t border-border space-y-1">
                        {result.events
                          .filter((e) => e.type === "goal")
                          .map((event, i) => (
                            <p key={i} className="text-xs text-muted-dark flex items-center gap-1.5">
                              <span className="text-sm">⚽</span>
                              <span className="font-medium">{event.playerName}</span>
                              <Badge variant="secondary" className="text-[8px] px-1 py-0">Time {event.team}</Badge>
                            </p>
                          ))}
                      </div>
                    )}
                    <div className="px-4 py-2 border-t border-border">
                      <span className="text-[11px] text-muted">
                        {new Date(result.endedAt).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {pastGames.length === 0 && results.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-surface-tertiary">
                  <Trophy className="h-8 w-8 text-muted-light" />
                </div>
                <p className="font-display font-bold">Nenhum histórico</p>
                <p className="text-sm text-muted mt-1 max-w-[260px] mx-auto">
                  Os jogos finalizados e resultados do Scout aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2 rounded-xl bg-pitch px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            <Check className="h-4 w-4" />
            {toast}
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
