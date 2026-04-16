"use client";

import Link from "next/link";
import { Building2, Globe, Lock, MapPin, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHiddenGroupIds } from "@/lib/group-membership-storage";
import { readUserGroups } from "@/lib/group-storage";
import { useMemo, useState, useEffect } from "react";

export default function AdminGroupsPage() {
  const [hiddenCount, setHiddenCount] = useState(0);
  const [userGroups, setUserGroups] = useState<ReturnType<typeof readUserGroups>>([]);

  useEffect(() => {
    setHiddenCount(getHiddenGroupIds().size);
    setUserGroups(readUserGroups());
  }, []);

  const publicGroups = useMemo(() => userGroups.filter((g) => g.visibility === "public"), [userGroups]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Grupos & peladas</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Visão de negócio: quantos grupos existem no ecossistema, visibilidade e lotação.
          Os dados abaixo são de grupos criados pelos usuários via localStorage.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-800 bg-[#151b24] text-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Grupos do usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-white">{userGroups.length}</p>
            <p className="text-xs text-slate-500">criados neste dispositivo</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-[#151b24] text-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Grupos públicos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-sky-400">{publicGroups.length}</p>
            <p className="text-xs text-slate-500">descoberta por região</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-[#151b24] text-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Ocultos (localStorage)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-amber-400">{hiddenCount}</p>
            <p className="text-xs text-slate-500">saídas/exclusões neste browser</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800 bg-[#151b24] text-slate-100">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-500" />
            <CardTitle className="text-lg text-white">Catálogo de grupos</CardTitle>
          </div>
          <Button asChild variant="outline" size="sm" className="border-slate-600 text-slate-200">
            <Link href="/groups" rel="noopener noreferrer">
              Abrir app — Grupos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {userGroups.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">Nenhum grupo criado ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3 font-medium">Grupo</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell">Local</th>
                    <th className="px-4 py-3 font-medium">Membros</th>
                    <th className="px-4 py-3 font-medium">Visibilidade</th>
                  </tr>
                </thead>
                <tbody>
                  {userGroups.map((g) => (
                    <tr key={g.id} className="border-b border-slate-800/80">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-200">{g.name}</p>
                        <p className="text-xs text-slate-500">ID {g.id}</p>
                      </td>
                      <td className="hidden max-w-[200px] px-4 py-3 text-xs text-slate-500 md:table-cell">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {g.city} — {g.neighborhood}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          {g.memberCount}/{g.maxMembers}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {g.visibility === "public" ? (
                          <Badge className="border-sky-800 bg-sky-950/50 text-sky-300">
                            <Globe className="mr-1 h-3 w-3" />
                            Público
                          </Badge>
                        ) : (
                          <Badge className="border-slate-600 bg-slate-800/80 text-slate-300">
                            <Lock className="mr-1 h-3 w-3" />
                            Privado
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
