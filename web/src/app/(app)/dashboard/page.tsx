"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  ChevronRight,
  Plus,
  Footprints,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getHiddenGroupIds } from "@/lib/group-membership-storage";
import { readUserGroups } from "@/lib/group-storage";
import { getGroupMembers, initGroupOwnerAsMember } from "@/lib/member-storage";
import type { Group } from "@/lib/mock-data";

export default function DashboardPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const displayName = user?.name?.split(" ")[0] || "Jogador";
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [userGroups, setUserGroups] = useState<Group[]>([]);

  useEffect(() => {
    setHiddenIds(getHiddenGroupIds());
    setUserGroups(readUserGroups());
  }, [pathname]);

  const visibleGroups = useMemo(
    () => userGroups.filter((g) => !hiddenIds.has(g.id)),
    [hiddenIds, userGroups],
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Greeting */}
      <div className="lg:flex lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold lg:text-3xl">
            Salve, {displayName}! 👋
          </h1>
          <p className="text-sm text-muted">Pronto pra mais uma pelada?</p>
        </div>
      </div>

      {/* My Groups */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Meus Grupos</h2>
          <Link href="/groups">
            <Button variant="ghost" size="sm" className="text-xs">
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {visibleGroups.length > 0 ? (
          <div className="space-y-3">
            {visibleGroups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card className="transition-all active:scale-[0.99] hover:border-brand-200 hover:shadow-md cursor-pointer mb-3">
                  <CardContent className="flex items-center gap-3.5 p-3.5">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm"
                      style={{ backgroundColor: group.color }}
                    >
                      {group.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-sm">
                          {group.name}
                        </p>
                        {group.role === "admin" && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {(() => { initGroupOwnerAsMember(group.id, group.owner); return getGroupMembers(group.id).length; })()}
                        </span>
                        <span className="text-xs text-muted">
                          {group.dayOfWeek} • {group.time}h
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-light" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-brand-200 bg-brand-50/30">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                <Footprints className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="font-display text-lg font-bold">
                Bem-vindo ao PeladaPro!
              </h3>
              <p className="mt-2 text-sm text-muted max-w-xs mx-auto">
                Você ainda não participa de nenhum grupo. Crie seu primeiro grupo ou entre em um existente para começar.
              </p>
              <div className="flex items-center justify-center gap-3 mt-5">
                <Link href="/groups/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Criar grupo
                  </Button>
                </Link>
                <Link href="/groups/discover">
                  <Button size="sm" variant="outline">
                    Descobrir grupos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
