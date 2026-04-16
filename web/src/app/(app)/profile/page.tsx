"use client";

import Link from "next/link";
import {
  Star,
  Trophy,
  Footprints,
  CalendarCheck,
  TrendingUp,
  Edit3,
  Settings,
  ChevronRight,
  Goal as GoalIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { getImage, userAvatarKey } from "@/lib/image-storage";

const positionLabels: Record<string, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  MEI: "Meia",
  ATA: "Atacante",
};

export default function ProfilePage() {
  const { user } = useAuth();

  const displayName = user?.name || "Jogador";
  const displayNickname = user?.nickname || user?.name?.split(" ")[0] || "jogador";
  const displayPosition = user?.position || "MEI";
  const avatarUrl = user?.id ? getImage(userAvatarKey(user.id)) : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile Header */}
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="pitch-gradient px-4 pb-12 pt-6 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-white/20 text-2xl font-bold text-white">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <h1 className="font-display text-xl font-bold text-white">
            {displayName}
          </h1>
          <p className="text-sm text-white/70">@{displayNickname}</p>
        </div>

        <div className="-mt-6 px-4 pb-4">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="pitch" className="px-3 py-1 text-sm">
                  {displayPosition}
                </Badge>
                <span className="text-sm text-muted">
                  {positionLabels[displayPosition] ?? displayPosition}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-1.5">
                <Star className="h-4 w-4 fill-accent-400 text-accent-400" />
                <span className="font-display text-lg font-extrabold text-accent-700">
                  —
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Partidas",
            value: 0,
            icon: CalendarCheck,
            color: "text-brand-600",
            bg: "bg-brand-50",
          },
          {
            label: "Gols",
            value: 0,
            icon: GoalIcon,
            color: "text-red-500",
            bg: "bg-red-50",
          },
          {
            label: "Assistências",
            value: 0,
            icon: Footprints,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Vitórias",
            value: "—",
            icon: Trophy,
            color: "text-accent-600",
            bg: "bg-accent-50",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-3.5 text-center">
              <div
                className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Record placeholder */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted" />
            Retrospecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg bg-brand-50 p-3 text-center">
              <p className="font-display text-xl font-bold text-brand-600">0</p>
              <p className="text-[10px] font-medium text-brand-600/70">V</p>
            </div>
            <div className="flex-1 rounded-lg bg-surface-tertiary p-3 text-center">
              <p className="font-display text-xl font-bold text-muted-dark">0</p>
              <p className="text-[10px] font-medium text-muted">E</p>
            </div>
            <div className="flex-1 rounded-lg bg-red-50 p-3 text-center">
              <p className="font-display text-xl font-bold text-red-500">0</p>
              <p className="text-[10px] font-medium text-red-400">D</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted text-center">
            Jogue partidas para acumular seu retrospecto.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2 lg:flex-row">
        <Link href="/profile/edit" className="flex-1 lg:flex-none">
          <Button variant="outline" className="w-full lg:w-auto justify-between lg:justify-center lg:gap-2" size="lg">
            <span className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Editar perfil
            </span>
            <ChevronRight className="h-4 w-4 text-muted-light lg:hidden" />
          </Button>
        </Link>
        <Link href="/profile/settings" className="flex-1 lg:flex-none">
          <Button variant="outline" className="w-full lg:w-auto justify-between lg:justify-center lg:gap-2" size="lg">
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </span>
            <ChevronRight className="h-4 w-4 text-muted-light lg:hidden" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
