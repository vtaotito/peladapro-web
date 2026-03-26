"use client";

import { useState } from "react";
import {
  Check,
  X,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import type { MatchPlayer, MatchStatus } from "@/lib/mock-data";

const statusConfig: Record<
  MatchStatus,
  { label: string; color: string; bg: string; icon: typeof Check }
> = {
  confirmed: {
    label: "Confirmado",
    color: "text-brand-600",
    bg: "bg-brand-50",
    icon: Check,
  },
  maybe: {
    label: "Talvez",
    color: "text-accent-600",
    bg: "bg-accent-50",
    icon: HelpCircle,
  },
  waiting: {
    label: "Lista de espera",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: Clock,
  },
  declined: {
    label: "Fora",
    color: "text-red-500",
    bg: "bg-red-50",
    icon: X,
  },
};

interface ConfirmButtonsProps {
  currentStatus: MatchStatus | null;
  onConfirm: (status: MatchStatus) => void;
  compact?: boolean;
}

export function ConfirmButtons({
  currentStatus,
  onConfirm,
  compact = false,
}: ConfirmButtonsProps) {
  return (
    <div className={cn("flex gap-2", compact ? "flex-row" : "flex-col sm:flex-row")}>
      <Button
        size={compact ? "sm" : "md"}
        variant={currentStatus === "confirmed" ? "default" : "outline"}
        className={cn(
          compact ? "" : "flex-1",
          currentStatus === "confirmed" && "bg-brand-600 hover:bg-brand-700"
        )}
        onClick={() => onConfirm("confirmed")}
      >
        <Check className="h-4 w-4" />
        {compact ? "" : "Vou"}
      </Button>
      <Button
        size={compact ? "sm" : "md"}
        variant={currentStatus === "maybe" ? "default" : "outline"}
        className={cn(
          compact ? "" : "flex-1",
          currentStatus === "maybe" &&
            "bg-accent-500 hover:bg-accent-600 border-accent-500"
        )}
        onClick={() => onConfirm("maybe")}
      >
        <HelpCircle className="h-4 w-4" />
        {compact ? "" : "Talvez"}
      </Button>
      <Button
        size={compact ? "sm" : "md"}
        variant={currentStatus === "declined" ? "default" : "outline"}
        className={cn(
          compact ? "" : "flex-1",
          currentStatus === "declined" &&
            "bg-danger hover:bg-red-600 border-danger"
        )}
        onClick={() => onConfirm("declined")}
      >
        <X className="h-4 w-4" />
        {compact ? "" : "Não vou"}
      </Button>
    </div>
  );
}

interface PresenceListProps {
  confirmed: MatchPlayer[];
  maybe: MatchPlayer[];
  waiting: MatchPlayer[];
  declined?: MatchPlayer[];
  totalSpots: number;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function PresenceList({
  confirmed,
  maybe,
  waiting,
  declined = [],
  totalSpots,
  collapsible = false,
  defaultOpen = true,
}: PresenceListProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const sections: { status: MatchStatus; players: MatchPlayer[] }[] = [
    { status: "confirmed", players: confirmed },
    { status: "maybe", players: maybe },
    { status: "waiting", players: waiting },
    ...(declined.length > 0
      ? [{ status: "declined" as MatchStatus, players: declined }]
      : []),
  ];

  return (
    <div className="space-y-3">
      {collapsible && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between text-sm font-semibold text-muted-dark"
        >
          <span>
            Lista de presença ({confirmed.length}/{totalSpots})
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      )}

      {(!collapsible || isOpen) && (
        <div className="space-y-4">
          {sections.map(({ status, players }) => {
            if (players.length === 0) return null;
            const config = statusConfig[status];
            const Icon = config.icon;

            return (
              <div key={status}>
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full",
                      config.bg
                    )}
                  >
                    <Icon className={cn("h-3 w-3", config.color)} />
                  </div>
                  <span className="text-xs font-semibold text-muted-dark">
                    {config.label}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {players.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5",
                        config.bg + "/30"
                      )}
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {player.nickname}
                        </p>
                      </div>
                      <span className="text-[10px] font-medium text-muted">
                        {player.position}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
