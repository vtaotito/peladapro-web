"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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

export default function MatchesPage() {
  const router = useRouter();
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
    group &&
    user &&
    (group.owner.id === user.id || group.owner.name === user.name);

  const [games, setGames] = useState<ScheduledGame[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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

  if (!group) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Carregando…
      </div>
    );
  }

  const upcomingGames = games.filter((g) => g.status === "scheduled");
  const pastGames = games.filter((g) => g.status !== "scheduled");

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
  };

  const handleCancelGame = (gameId: string) => {
    updateGame(gameId, { status: "cancelled" });
    setGames(getGroupGames(groupId));
    setConfirmDelete(null);
  };

  const handleDeleteGame = (gameId: string) => {
    removeGame(gameId);
    setGames(getGroupGames(groupId));
    setConfirmDelete(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
    } catch {
      return dateStr;
    }
  };

  const GameCard = ({ game }: { game: ScheduledGame }) => {
    const isCancelled = game.status === "cancelled";
    return (
      <Card className={cn("border-border/50 transition-all", isCancelled && "opacity-60")}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold capitalize">{formatDate(game.date)}</p>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {game.time}h
                </span>
                <span className="flex items-center gap-1">
                  <Footprints className="h-3 w-3" />
                  {game.format}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  R${game.pricePerMatch}
                </span>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted">
                <MapPin className="h-3 w-3 shrink-0" />
                {game.location}
              </p>
            </div>
            <Badge
              variant={
                game.status === "scheduled"
                  ? "success"
                  : game.status === "completed"
                    ? "info"
                    : "danger"
              }
              className="text-[10px] shrink-0"
            >
              {game.status === "scheduled" && "Agendado"}
              {game.status === "completed" && "Finalizado"}
              {game.status === "cancelled" && "Cancelado"}
            </Badge>
          </div>

          {isOwner && game.status === "scheduled" && (
            <div className="flex gap-2 border-t border-border pt-3">
              <Link href={`/groups/${groupId}/match`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <ClipboardList className="h-3.5 w-3.5" />
                  Iniciar Scout
                </Button>
              </Link>
              {confirmDelete === game.id ? (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleCancelGame(game.id)}
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Cancelar jogo
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setConfirmDelete(game.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}

          {isOwner && game.status === "cancelled" && (
            <div className="flex gap-2 border-t border-border pt-3">
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteGame(game.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in lg:max-w-2xl lg:mx-auto">
      <div className="flex items-center gap-3">
        <Link href={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">Jogos</h1>
          <p className="text-xs text-muted">{group.name}</p>
        </div>
        {isOwner && (
          <Button size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" />
            Novo jogo
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-brand-200 bg-brand-50/30 animate-fade-in">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-brand-600" />
                Agendar jogo
              </CardTitle>
              <button onClick={() => setShowCreateForm(false)} className="text-muted hover:text-muted-dark">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Data *
                </label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Horário
                </label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Local
              </label>
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder={group.address}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1">
                  <Footprints className="h-3.5 w-3.5" />
                  Formato
                </label>
                <Input
                  value={newFormat}
                  onChange={(e) => setNewFormat(e.target.value)}
                  placeholder="7x7"
                />
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  Valor (R$)
                </label>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  min="0"
                  step="5"
                />
              </div>
            </div>
            <Button onClick={handleCreateGame} disabled={!newDate} className="w-full">
              <Check className="h-4 w-4" />
              Agendar jogo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-tertiary p-1">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
            activeTab === "upcoming"
              ? "bg-surface text-pitch shadow-sm"
              : "text-muted hover:text-muted-dark",
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          Agendados ({upcomingGames.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
            activeTab === "history"
              ? "bg-surface text-pitch shadow-sm"
              : "text-muted hover:text-muted-dark",
          )}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Histórico ({pastGames.length + results.length})
        </button>
      </div>

      {/* Upcoming */}
      {activeTab === "upcoming" && (
        <div className="space-y-3">
          {upcomingGames.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Calendar className="h-10 w-10 text-muted-light mx-auto mb-3" />
                <p className="font-display font-bold">Nenhum jogo agendado</p>
                <p className="text-sm text-muted mt-1">
                  {isOwner
                    ? "Agende o próximo jogo do grupo."
                    : "O dono do grupo ainda não agendou jogos."}
                </p>
                {isOwner && (
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Agendar jogo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            upcomingGames.map((game) => <GameCard key={game.id} game={game} />)
          )}
        </div>
      )}

      {/* History */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {pastGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}

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
                <Card key={result.matchId} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted">
                        {new Date(result.endedAt).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <Badge variant="info" className="text-[10px]">Finalizado</Badge>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <span className="flex-1 text-right text-sm font-semibold">Time A</span>
                      <span className="font-display text-2xl font-extrabold text-pitch">
                        {result.teamAScore}
                      </span>
                      <span className="font-bold text-muted-light">x</span>
                      <span className="font-display text-2xl font-extrabold text-pitch">
                        {result.teamBScore}
                      </span>
                      <span className="flex-1 text-sm font-semibold">Time B</span>
                    </div>
                    {result.events.length > 0 && (
                      <div className="mt-3 border-t border-border pt-2 space-y-1">
                        {result.events
                          .filter((e) => e.type === "goal")
                          .map((event, i) => (
                            <p key={i} className="text-xs text-muted">
                              ⚽ {event.playerName} (Time {event.team})
                            </p>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {pastGames.length === 0 && results.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <ClipboardList className="h-10 w-10 text-muted-light mx-auto mb-3" />
                <p className="font-display font-bold">Nenhum histórico</p>
                <p className="text-sm text-muted mt-1">
                  Os jogos finalizados e resultados aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
