"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Goal as GoalIcon,
  Footprints,
  CornerDownRight,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Zap,
  Flame,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Trophy,
  BarChart3,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { upcomingMatch, type Player } from "@/lib/mock-data";
import { getInitials, cn } from "@/lib/utils";

type StatKey =
  | "goals"
  | "assists"
  | "isolou"
  | "pacocada"
  | "inacreditavel"
  | "faltaCometida"
  | "faltaSofrida"
  | "undaia"
  | "escanteio"
  | "defesaBonita";

type PlayerStats = Record<StatKey, number>;

const defaultStats = (): PlayerStats => ({
  goals: 0,
  assists: 0,
  isolou: 0,
  pacocada: 0,
  inacreditavel: 0,
  faltaCometida: 0,
  faltaSofrida: 0,
  undaia: 0,
  escanteio: 0,
  defesaBonita: 0,
});

const statConfig: {
  key: StatKey;
  label: string;
  short: string;
  icon: typeof GoalIcon;
  color: string;
  max?: number;
}[] = [
  { key: "goals", label: "Gol", short: "GOL", icon: GoalIcon, color: "text-brand-600" },
  { key: "assists", label: "Assistência", short: "ASS", icon: Footprints, color: "text-blue-600" },
  { key: "isolou", label: "Isolou", short: "ISO", icon: Zap, color: "text-amber-600" },
  { key: "pacocada", label: "Paçocada", short: "PAÇ", icon: Flame, color: "text-orange-600" },
  { key: "inacreditavel", label: "Inacreditável", short: "INA", icon: Sparkles, color: "text-violet-600" },
  { key: "faltaCometida", label: "Falta cometida", short: "FC", icon: ShieldAlert, color: "text-red-500" },
  { key: "faltaSofrida", label: "Falta sofrida", short: "FS", icon: AlertTriangle, color: "text-amber-700" },
  {
    key: "undaia",
    label: "Undaia (drible tomado)",
    short: "UDA",
    icon: RefreshCw,
    color: "text-slate-600",
  },
  { key: "escanteio", label: "Escanteio", short: "ESC", icon: CornerDownRight, color: "text-emerald-600" },
  { key: "defesaBonita", label: "Defesa bonita", short: "DB", icon: ShieldCheck, color: "text-cyan-600" },
];

type MatchTab = "scout" | "summary";

export default function MatchPage() {
  const params = useParams();
  const groupId =
    typeof params.groupId === "string"
      ? params.groupId
      : Array.isArray(params.groupId)
        ? params.groupId[0]
        : "group-1";

  const confirmed = upcomingMatch.confirmed;
  const half = Math.ceil(confirmed.length / 2);
  const teamAPlayers = confirmed.slice(0, half);
  const teamBPlayers = confirmed.slice(half);

  const [matchState, setMatchState] = useState<"idle" | "playing" | "paused" | "ended">("idle");
  const [timer, setTimer] = useState(0);
  const [timerRef, setTimerRef] = useState<NodeJS.Timeout | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [stats, setStats] = useState<Record<string, PlayerStats>>(() => {
    const init: Record<string, PlayerStats> = {};
    confirmed.forEach((p) => { init[p.id] = defaultStats(); });
    return init;
  });
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MatchTab>("scout");
  const [activeTeam, setActiveTeam] = useState<"A" | "B">("A");

  const startTimer = () => {
    setMatchState("playing");
    const ref = setInterval(() => setTimer((t) => t + 1), 1000);
    setTimerRef(ref);
  };

  const pauseTimer = () => {
    setMatchState("paused");
    if (timerRef) clearInterval(timerRef);
  };

  const endMatch = () => {
    setMatchState("ended");
    if (timerRef) clearInterval(timerRef);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const updateStat = useCallback(
    (playerId: string, stat: StatKey, delta: number) => {
      setStats((prev) => {
        const current = prev[playerId][stat];
        const config = statConfig.find((c) => c.key === stat);
        const newVal = Math.max(0, current + delta);
        if (config?.max && newVal > config.max) return prev;

        const updated = {
          ...prev,
          [playerId]: { ...prev[playerId], [stat]: newVal },
        };

        if (stat === "goals" && delta > 0) {
          const isTeamA = teamAPlayers.some((p) => p.id === playerId);
          if (isTeamA) setScoreA((s) => s + 1);
          else setScoreB((s) => s + 1);
        }
        if (stat === "goals" && delta < 0) {
          const isTeamA = teamAPlayers.some((p) => p.id === playerId);
          if (isTeamA) setScoreA((s) => Math.max(0, s - 1));
          else setScoreB((s) => Math.max(0, s - 1));
        }

        return updated;
      });
    },
    [teamAPlayers],
  );

  const teamTotalStats = (players: typeof confirmed) => {
    const totals = defaultStats();
    players.forEach((p) => {
      const s = stats[p.id];
      (Object.keys(totals) as StatKey[]).forEach((k) => {
        totals[k] += s[k];
      });
    });
    return totals;
  };

  const StatCounter = ({
    playerId,
    stat,
  }: {
    playerId: string;
    stat: (typeof statConfig)[0];
  }) => {
    const val = stats[playerId][stat.key];
    const Icon = stat.icon;
    return (
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-3.5 w-3.5", stat.color)} />
          <span className="text-xs">{stat.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => updateStat(playerId, stat.key, -1)}
            disabled={val === 0 || matchState === "idle"}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-tertiary text-sm font-bold transition-colors hover:bg-red-100 disabled:opacity-30"
          >
            -
          </button>
          <span className={cn("w-6 text-center text-sm font-bold", val > 0 ? "text-pitch" : "text-muted")}>
            {val}
          </span>
          <button
            onClick={() => updateStat(playerId, stat.key, 1)}
            disabled={matchState === "idle"}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-tertiary text-sm font-bold transition-colors hover:bg-brand-100 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  const PlayerRow = ({ player }: { player: (typeof confirmed)[0] }) => {
    const isExpanded = expandedPlayer === player.id;
    const s = stats[player.id];
    const hasStats = Object.values(s).some((v) => v > 0);

    return (
      <Card className={cn("transition-all", isExpanded && "ring-1 ring-brand-200")}>
        <CardContent className="p-0">
          <button
            onClick={() => setExpandedPlayer(isExpanded ? null : player.id)}
            className="flex w-full items-center gap-2.5 p-3"
          >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="text-[10px]">
                {getInitials(player.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="truncate text-sm font-semibold">{player.nickname}</p>
              <p className="text-[10px] text-muted">{player.position}</p>
            </div>
            {hasStats && (
              <div className="flex flex-wrap items-center justify-end gap-1.5 text-[10px] max-w-[42%]">
                {s.goals > 0 && (
                  <span className="flex items-center gap-0.5 text-brand-600 font-bold">
                    <GoalIcon className="h-3 w-3" />{s.goals}
                  </span>
                )}
                {s.assists > 0 && (
                  <span className="flex items-center gap-0.5 text-blue-600 font-bold">
                    <Footprints className="h-3 w-3" />{s.assists}
                  </span>
                )}
                {s.inacreditavel > 0 && (
                  <span className="flex items-center gap-0.5 text-violet-600 font-bold">
                    <Sparkles className="h-3 w-3" />{s.inacreditavel}
                  </span>
                )}
                {s.defesaBonita > 0 && (
                  <span className="flex items-center gap-0.5 text-cyan-600 font-bold">
                    <ShieldCheck className="h-3 w-3" />{s.defesaBonita}
                  </span>
                )}
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted shrink-0" />
            )}
          </button>

          {isExpanded && (
            <div className="border-t border-border px-3 pb-3 pt-1 animate-slide-down">
              {statConfig.map((stat) => (
                <StatCounter key={stat.key} playerId={player.id} stat={stat} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const totalsA = teamTotalStats(teamAPlayers);
  const totalsB = teamTotalStats(teamBPlayers);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold">Scout da Partida</h1>
          <p className="text-xs text-muted">{upcomingMatch.groupName}</p>
        </div>
        <Badge
          variant={
            matchState === "playing" ? "success" : matchState === "ended" ? "danger" : "secondary"
          }
        >
          {matchState === "idle" && "Aguardando"}
          {matchState === "playing" && "Ao vivo"}
          {matchState === "paused" && "Pausado"}
          {matchState === "ended" && "Encerrado"}
        </Badge>
      </div>

      {/* Scoreboard */}
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="pitch-gradient px-4 py-5">
          <div className="flex items-center justify-center gap-6">
            <div className="flex-1 text-center">
              <div className="mx-auto mb-1 h-3 w-3 rounded-full bg-brand-400" />
              <p className="text-xs font-medium text-white/70">Time Verde</p>
              <p className="font-display text-4xl font-extrabold text-white">
                {scoreA}
              </p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-white/40">x</p>
              <p className="mt-1 font-mono text-lg font-bold text-white/80">
                {formatTimer(timer)}
              </p>
            </div>
            <div className="flex-1 text-center">
              <div className="mx-auto mb-1 h-3 w-3 rounded-full bg-blue-400" />
              <p className="text-xs font-medium text-white/70">Time Branco</p>
              <p className="font-display text-4xl font-extrabold text-white">
                {scoreB}
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-3">
          <div className="flex gap-2">
            {matchState === "idle" && (
              <Button onClick={startTimer} className="flex-1" size="sm">
                <Play className="h-4 w-4" /> Iniciar partida
              </Button>
            )}
            {matchState === "playing" && (
              <>
                <Button onClick={pauseTimer} variant="outline" className="flex-1" size="sm">
                  <Pause className="h-4 w-4" /> Pausar
                </Button>
                <Button onClick={endMatch} variant="danger" size="sm">
                  <Square className="h-4 w-4" /> Encerrar
                </Button>
              </>
            )}
            {matchState === "paused" && (
              <>
                <Button onClick={startTimer} className="flex-1" size="sm">
                  <Play className="h-4 w-4" /> Retomar
                </Button>
                <Button onClick={endMatch} variant="danger" size="sm">
                  <Square className="h-4 w-4" /> Encerrar
                </Button>
              </>
            )}
            {matchState === "ended" && (
              <div className="w-full text-center py-1">
                <p className="text-sm font-semibold text-muted-dark">Partida encerrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-tertiary p-1">
        <button
          onClick={() => setActiveTab("scout")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
            activeTab === "scout" ? "bg-surface text-pitch shadow-sm" : "text-muted"
          )}
        >
          <Users className="h-3.5 w-3.5" /> Scout
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
            activeTab === "summary" ? "bg-surface text-pitch shadow-sm" : "text-muted"
          )}
        >
          <BarChart3 className="h-3.5 w-3.5" /> Resumo
        </button>
      </div>

      {activeTab === "scout" && (
        <>
          {/* Team selector */}
          <div className="flex gap-1 rounded-xl bg-surface-tertiary p-1">
            <button
              onClick={() => setActiveTeam("A")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                activeTeam === "A" ? "bg-brand-50 text-brand-700 shadow-sm" : "text-muted"
              )}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
              Time Verde ({teamAPlayers.length})
            </button>
            <button
              onClick={() => setActiveTeam("B")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                activeTeam === "B" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-muted"
              )}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Time Branco ({teamBPlayers.length})
            </button>
          </div>

          {/* Player list */}
          <div className="space-y-2">
            {(activeTeam === "A" ? teamAPlayers : teamBPlayers).map((p) => (
              <PlayerRow key={p.id} player={p} />
            ))}
          </div>
        </>
      )}

      {activeTab === "summary" && (
        <div className="space-y-4">
          {/* Team comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-muted" />
                Comparativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statConfig.map((stat) => {
                const valA = totalsA[stat.key];
                const valB = totalsB[stat.key];
                const total = valA + valB || 1;
                const Icon = stat.icon;
                return (
                  <div key={stat.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-brand-600">{valA}</span>
                      <div className="flex items-center gap-1">
                        <Icon className={cn("h-3 w-3", stat.color)} />
                        <span className="text-[10px] text-muted">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{valB}</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-surface-tertiary">
                      <div
                        className="bg-brand-500 transition-all"
                        style={{ width: `${(valA / total) * 100}%` }}
                      />
                      <div
                        className="bg-blue-500 transition-all"
                        style={{ width: `${(valB / total) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* MVP candidates */}
          {matchState === "ended" && (
            <Card className="border-accent-200 bg-accent-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4 text-accent-600" />
                  Destaques da Partida
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    title: "Artilheiro",
                    stat: "goals" as StatKey,
                    icon: GoalIcon,
                  },
                  {
                    title: "Garçom",
                    stat: "assists" as StatKey,
                    icon: Footprints,
                  },
                  {
                    title: "Defesa bonita",
                    stat: "defesaBonita" as StatKey,
                    icon: ShieldCheck,
                  },
                ].map(({ title, stat, icon: HIcon }) => {
                  const best = confirmed
                    .filter((p) => stats[p.id][stat] > 0)
                    .sort((a, b) => stats[b.id][stat] - stats[a.id][stat])[0];
                  if (!best) return null;
                  return (
                    <div key={title} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-100">
                        <HIcon className="h-4 w-4 text-accent-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted">{title}</p>
                        <p className="text-sm font-bold">{best.nickname}</p>
                      </div>
                      <span className="text-sm font-bold text-accent-700">
                        {stats[best.id][stat]}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
