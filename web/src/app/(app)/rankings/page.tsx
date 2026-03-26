"use client";

import { useState } from "react";
import {
  Trophy,
  Star,
  Target,
  Footprints,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { groupMembers } from "@/lib/mock-data";
import { getInitials, cn } from "@/lib/utils";

const categories = [
  { id: "overall", label: "Overall", icon: Star },
  { id: "goals", label: "Gols", icon: Target },
  { id: "matches", label: "Presença", icon: CalendarCheck },
];

export default function RankingsPage() {
  const [activeCategory, setActiveCategory] = useState("overall");

  const sortedMembers = [...groupMembers].sort((a, b) => {
    if (activeCategory === "overall") return b.overall - a.overall;
    if (activeCategory === "goals") return b.goals - a.goals;
    return b.matches - a.matches;
  });

  const getValue = (member: (typeof groupMembers)[0]) => {
    if (activeCategory === "overall") return member.overall.toFixed(1);
    if (activeCategory === "goals") return `${member.goals} gols`;
    return `${member.matches} jogos`;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Rankings</h1>
        <p className="text-sm text-muted">
          Ranking geral de todos os seus grupos
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 rounded-xl bg-surface-tertiary p-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
              activeCategory === cat.id
                ? "bg-surface text-pitch shadow-sm"
                : "text-muted hover:text-muted-dark"
            )}
          >
            <cat.icon className="h-3.5 w-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-3 py-4">
        {[sortedMembers[1], sortedMembers[0], sortedMembers[2]].map(
          (member, idx) => {
            if (!member) return null;
            const heights = ["h-20", "h-28", "h-16"];
            const bgColors = ["bg-gray-200", "bg-accent-100", "bg-amber-100"];
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
                  <p className="text-[10px] font-semibold text-brand-600">
                    {getValue(member)}
                  </p>
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

      {/* Full List */}
      <div className="space-y-1.5">
        {sortedMembers.map((member, idx) => (
          <Card
            key={member.id}
            className={cn(
              "border-border/50",
              idx < 3 && "border-accent-200 bg-accent-50/20"
            )}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <span
                className={cn(
                  "w-7 text-center text-sm font-bold",
                  idx === 0
                    ? "text-accent-600"
                    : idx < 3
                      ? "text-accent-500"
                      : "text-muted"
                )}
              >
                {idx + 1}º
              </span>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-[10px]">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold">
                  {member.nickname}
                </p>
                <p className="text-[10px] text-muted">
                  {member.position} • {member.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-pitch">
                  {getValue(member)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
