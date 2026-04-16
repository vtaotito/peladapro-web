"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Plus,
  Users,
  ChevronRight,
  Link2,
  CalendarCheck,
  Globe,
  Lock,
  Compass,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getHiddenGroupIds } from "@/lib/group-membership-storage";
import type { Group } from "@/lib/mock-data";
import { readUserGroups } from "@/lib/group-storage";

export default function GroupsPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const [userGroups, setUserGroups] = useState<Group[]>([]);

  useEffect(() => {
    setHiddenIds(getHiddenGroupIds());
    setUserGroups(readUserGroups());
  }, [pathname]);

  const allGroups = useMemo(
    () => [...userGroups],
    [userGroups],
  );

  const visibleGroups = useMemo(
    () => allGroups.filter((g) => !hiddenIds.has(g.id)),
    [allGroups, hiddenIds],
  );

  const filteredGroups = visibleGroups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Grupos</h1>
        <div className="flex gap-2">
          <Link href="/groups/discover">
            <Button size="sm" variant="outline">
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Descobrir</span>
            </Button>
          </Link>
          <Link href="/groups/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo grupo</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
        <Input
          placeholder="Buscar grupo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Group List */}
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {filteredGroups.map((group) => {
          const progress =
            (group.nextMatch.confirmedCount / group.nextMatch.totalSpots) * 100;
          return (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="transition-all active:scale-[0.99] hover:border-brand-200 hover:shadow-md cursor-pointer mb-3 lg:mb-0 h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white font-bold text-lg"
                      style={{ backgroundColor: group.color }}
                    >
                      {group.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="truncate font-display font-bold">
                          {group.name}
                        </p>
                        {group.role === "admin" && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            Admin
                          </Badge>
                        )}
                        <Badge
                          variant={group.visibility === "public" ? "info" : "secondary"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {group.visibility === "public" ? (
                            <><Globe className="h-2.5 w-2.5 mr-0.5" />Público</>
                          ) : (
                            <><Lock className="h-2.5 w-2.5 mr-0.5" />Privado</>
                          )}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.memberCount}/{group.maxMembers}
                        </span>
                        <span>{group.dayOfWeek} • {group.time}h</span>
                      </div>

                      {/* Next Match */}
                      <div className="mt-3 rounded-lg bg-surface-secondary p-2.5">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="flex items-center gap-1 text-muted">
                            <CalendarCheck className="h-3 w-3" />
                            Próxima pelada
                          </span>
                          <span className="font-semibold text-brand-600">
                            {group.nextMatch.confirmedCount}/
                            {group.nextMatch.totalSpots}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-[11px] text-muted">
                          {new Date(group.nextMatch.date).toLocaleDateString(
                            "pt-BR",
                            {
                              weekday: "long",
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-light" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Discover Public Groups CTA */}
      <Link href="/groups/discover">
        <Card className="border-dashed border-2 border-brand-200 bg-brand-50/30 transition-all hover:border-brand-400 hover:shadow-md cursor-pointer">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
              <Compass className="h-6 w-6 text-brand-600" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-sm">
                Encontrar grupos públicos
              </p>
              <p className="text-xs text-muted">
                Descubra peladas na sua região e peça para participar.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-brand-400" />
          </CardContent>
        </Card>
      </Link>

      {/* Join by Invite */}
      <Card className="border-dashed border-2 border-gray-200 bg-gray-50/30">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            <Link2 className="h-6 w-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-sm">
              Entrar por convite
            </p>
            <p className="text-xs text-muted">
              Tem um código de convite? Cole aqui para entrar no grupo.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Entrar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
