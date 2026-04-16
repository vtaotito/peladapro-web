"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Shuffle,
  Star,
  Users,
  ArrowLeftRight,
  RotateCcw,
  Check,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Player } from "@/lib/mock-data";
import { getInitials, cn } from "@/lib/utils";
import { getGroupMembers, initGroupOwnerAsMember } from "@/lib/member-storage";
import { findUserGroup } from "@/lib/group-storage";

type ShufflePlayer = Player & { status?: string };

function balancedShuffle(players: ShufflePlayer[]): [ShufflePlayer[], ShufflePlayer[]] {
  const sorted = [...players].sort((a, b) => b.overall - a.overall);
  const teamA: ShufflePlayer[] = [];
  const teamB: ShufflePlayer[] = [];

  sorted.forEach((player) => {
    const sumA = teamA.reduce((s, p) => s + p.overall, 0);
    const sumB = teamB.reduce((s, p) => s + p.overall, 0);

    if (teamA.length < Math.ceil(players.length / 2)) {
      if (teamB.length < Math.floor(players.length / 2)) {
        if (sumA <= sumB) teamA.push(player);
        else teamB.push(player);
      } else {
        teamA.push(player);
      }
    } else {
      teamB.push(player);
    }
  });

  return [teamA, teamB];
}

function teamAvg(team: ShufflePlayer[]) {
  if (team.length === 0) return 0;
  return (team.reduce((s, p) => s + p.overall, 0) / team.length).toFixed(1);
}

function positionCount(team: ShufflePlayer[]) {
  const counts: Record<string, number> = {};
  team.forEach((p) => {
    counts[p.position] = (counts[p.position] || 0) + 1;
  });
  return counts;
}

export default function ShufflePage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const group = useMemo(() => findUserGroup(groupId), [groupId]);
  const groupName = group?.name ?? "Pelada";

  const allPlayers: ShufflePlayer[] = useMemo(() => {
    if (group) initGroupOwnerAsMember(groupId, group.owner);
    return getGroupMembers(groupId).map((m) => ({
      id: m.id,
      name: m.name,
      nickname: m.nickname,
      position: m.position,
      overall: m.overall,
      avatar: "",
    }));
  }, [groupId, group]);

  const [teamA, setTeamA] = useState<ShufflePlayer[]>([]);
  const [teamB, setTeamB] = useState<ShufflePlayer[]>([]);
  const [bench, setBench] = useState<ShufflePlayer[]>(allPlayers);
  const [shuffled, setShuffled] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);

  const handleShuffle = () => {
    const [a, b] = balancedShuffle(allPlayers);
    setTeamA(a);
    setTeamB(b);
    setBench([]);
    setShuffled(true);
    setSelectedPlayer(null);
  };

  const handleReset = () => {
    setTeamA([]);
    setTeamB([]);
    setBench(allPlayers);
    setShuffled(false);
    setSelectedPlayer(null);
  };

  const findPlayerTeam = useCallback((playerId: string): "A" | "B" | "bench" | null => {
    if (teamA.find((p) => p.id === playerId)) return "A";
    if (teamB.find((p) => p.id === playerId)) return "B";
    if (bench.find((p) => p.id === playerId)) return "bench";
    return null;
  }, [teamA, teamB, bench]);

  const removeFromCurrent = useCallback((playerId: string) => {
    const team = findPlayerTeam(playerId);
    if (team === "A") setTeamA((t) => t.filter((p) => p.id !== playerId));
    else if (team === "B") setTeamB((t) => t.filter((p) => p.id !== playerId));
    else if (team === "bench") setBench((t) => t.filter((p) => p.id !== playerId));
  }, [findPlayerTeam]);

  const getPlayer = useCallback((playerId: string): ShufflePlayer | undefined => {
    return (
      teamA.find((p) => p.id === playerId) ||
      teamB.find((p) => p.id === playerId) ||
      bench.find((p) => p.id === playerId)
    );
  }, [teamA, teamB, bench]);

  const moveToTeam = useCallback(
    (target: "A" | "B" | "bench") => {
      if (!selectedPlayer) return;
      const current = findPlayerTeam(selectedPlayer);
      if (current === target) {
        setSelectedPlayer(null);
        return;
      }
      const player = getPlayer(selectedPlayer);
      if (!player) return;

      removeFromCurrent(selectedPlayer);
      if (target === "A") setTeamA((t) => [...t, player]);
      else if (target === "B") setTeamB((t) => [...t, player]);
      else setBench((t) => [...t, player]);
      setSelectedPlayer(null);
    },
    [selectedPlayer, findPlayerTeam, getPlayer, removeFromCurrent],
  );

  const handleDrop = (target: "A" | "B" | "bench", playerId?: string) => {
    const pid = playerId || draggedPlayer;
    if (!pid) return;
    const current = findPlayerTeam(pid);
    if (current === target) return;
    const player = getPlayer(pid);
    if (!player) return;

    if (current === "A") setTeamA((t) => t.filter((p) => p.id !== pid));
    else if (current === "B") setTeamB((t) => t.filter((p) => p.id !== pid));
    else if (current === "bench") setBench((t) => t.filter((p) => p.id !== pid));

    if (target === "A") setTeamA((t) => [...t, player]);
    else if (target === "B") setTeamB((t) => [...t, player]);
    else setBench((t) => [...t, player]);
    setDraggedPlayer(null);
  };

  const PlayerCard = ({ player, team }: { player: ShufflePlayer; team: "A" | "B" | "bench" }) => {
    const isSelected = selectedPlayer === player.id;
    return (
      <div
        draggable
        onDragStart={() => setDraggedPlayer(player.id)}
        onDragEnd={() => setDraggedPlayer(null)}
        onClick={() => {
          if (selectedPlayer && selectedPlayer !== player.id) {
            moveToTeam(team);
          } else {
            setSelectedPlayer(isSelected ? null : player.id);
          }
        }}
        className={cn(
          "flex items-center gap-2 rounded-lg px-2.5 py-2 transition-all cursor-grab active:cursor-grabbing select-none",
          isSelected
            ? "bg-brand-100 ring-2 ring-brand-500 shadow-md scale-[1.02]"
            : "bg-surface-secondary hover:bg-surface-tertiary",
          draggedPlayer === player.id && "opacity-50"
        )}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-light shrink-0 hidden lg:block" />
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-[10px]">
            {getInitials(player.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold">{player.nickname}</p>
          <p className="text-[10px] text-muted">{player.position}</p>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-accent-50 px-1.5 py-0.5">
          <Star className="h-2.5 w-2.5 fill-accent-400 text-accent-400" />
          <span className="text-[10px] font-bold text-accent-700">
            {player.overall}
          </span>
        </div>
      </div>
    );
  };

  const TeamColumn = ({
    team,
    players,
    label,
    color,
  }: {
    team: "A" | "B";
    players: ShufflePlayer[];
    label: string;
    color: string;
  }) => {
    const positions = positionCount(players);
    return (
      <Card
        className={cn(
          "flex-1 transition-all",
          selectedPlayer && findPlayerTeam(selectedPlayer) !== team && "ring-2 ring-brand-300 ring-dashed"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(team)}
        onClick={() => {
          if (selectedPlayer && findPlayerTeam(selectedPlayer) !== team) {
            moveToTeam(team);
          }
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className={cn("h-3 w-3 rounded-full", color)} />
              {label}
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {players.length} jogadores
            </Badge>
          </div>
          {players.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                <span className="text-xs font-bold">{teamAvg(players)}</span>
              </div>
              <span className="text-[10px] text-muted">
                {Object.entries(positions)
                  .map(([pos, count]) => `${count}${pos}`)
                  .join(" · ")}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} team={team} />
            ))}
            {players.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-border py-8 text-center">
                <p className="text-xs text-muted">
                  {shuffled ? "Arraste jogadores aqui" : "Sortear para distribuir"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const diff = Math.abs(
    Number(teamAvg(teamA)) - Number(teamAvg(teamB))
  );

  if (allPlayers.length === 0) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link href={`/groups/${groupId}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-display text-xl font-bold">Sorteio de Times</h1>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 text-muted-light mx-auto mb-3" />
            <p className="font-display font-bold">Sem jogadores</p>
            <p className="text-sm text-muted mt-1">Adicione membros ao grupo para sortear times.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">Sorteio de Times</h1>
          <p className="text-xs text-muted">
            {groupName} · {allPlayers.length} jogadores
          </p>
        </div>
      </div>

      {selectedPlayer && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-700 animate-slide-down">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Toque no time destino para mover{" "}
          <strong>{getPlayer(selectedPlayer)?.nickname}</strong>
          <button
            onClick={() => setSelectedPlayer(null)}
            className="ml-auto text-brand-500 font-semibold"
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleShuffle}
          className="flex-1"
          size="lg"
          variant={shuffled ? "outline" : "default"}
        >
          <Shuffle className="h-4 w-4" />
          {shuffled ? "Re-sortear" : "Sortear times"}
        </Button>
        {shuffled && (
          <Button onClick={handleReset} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {shuffled && teamA.length > 0 && teamB.length > 0 && (
        <div className="flex items-center justify-center gap-4 text-center">
          <div>
            <p className="font-display text-2xl font-extrabold text-brand-600">
              {teamAvg(teamA)}
            </p>
            <p className="text-[10px] text-muted">Time Verde</p>
          </div>
          <div className="text-center">
            <Badge variant={diff <= 0.3 ? "success" : diff <= 0.5 ? "warning" : "danger"}>
              {diff <= 0.3 ? "Equilibrado" : diff <= 0.5 ? "Quase lá" : "Desequilibrado"}
            </Badge>
            <p className="mt-1 text-[10px] text-muted">Dif: {diff.toFixed(1)}</p>
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-blue-600">
              {teamAvg(teamB)}
            </p>
            <p className="text-[10px] text-muted">Time Branco</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TeamColumn team="A" players={teamA} label="Time Verde" color="bg-brand-500" />
        <TeamColumn team="B" players={teamB} label="Time Branco" color="bg-blue-500" />
      </div>

      {bench.length > 0 && (
        <Card
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop("bench")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted" />
              Jogadores disponíveis
              <Badge variant="secondary" className="text-[10px]">{bench.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {bench.map((p) => (
                <PlayerCard key={p.id} player={p} team="bench" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {shuffled && bench.length === 0 && (
        <Link href={`/groups/${groupId}/match`}>
          <Button className="w-full" size="lg" variant="pitch-gradient">
            <Check className="h-4 w-4" />
            Confirmar times e iniciar partida
          </Button>
        </Link>
      )}
    </div>
  );
}
