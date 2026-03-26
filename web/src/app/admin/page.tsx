"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  listAppUsers,
  seedPlatformAdminIfNeeded,
  getAdminStats,
} from "@/lib/platform-admin";

export default function AdminDashboardPage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    seedPlatformAdminIfNeeded();
  }, []);

  const users = useMemo(() => {
    void tick;
    return listAppUsers();
  }, [tick]);

  const stats = useMemo(() => getAdminStats(), [tick]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "peladapro_accounts") setTick((t) => t + 1);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Visão geral</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Operacional do PeladaPro: contas do aplicativo (cadastro, bloqueio e papéis). Os dados
            abaixo refletem este navegador — em produção integração com API e banco centralizado.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 border-slate-600 text-slate-200">
          <Link href="/admin/users">
            Gerir usuários
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {stats.blocked > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-amber-100">{stats.blocked} conta(s) bloqueada(s)</p>
            <p className="mt-0.5 text-xs text-amber-200/80">
              Esses usuários não conseguem entrar no app até serem desbloqueados em Usuários.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-800 bg-[#151b24] text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total de contas</CardTitle>
            <Users className="h-4 w-4 text-brand-500" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-500">registradas neste armazenamento</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-[#151b24] text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Contas ativas</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-emerald-400">{stats.active}</p>
            <p className="text-xs text-slate-500">
              {stats.activePlayers} jogador(es) · {stats.activeAdmins} admin(s) com login liberado
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-[#151b24] text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Novos (7 dias)</CardTitle>
            <TrendingUp className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-sky-400">{stats.recentSignups7d}</p>
            <p className="text-xs text-slate-500">cadastros com data registrada</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-[#151b24] text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Bloqueados</CardTitle>
            <UserX className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-red-400">{stats.blocked}</p>
            <p className="text-xs text-slate-500">sem login no app</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-800 bg-[#151b24] text-slate-100 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-white">Cadastros recentes</CardTitle>
            <p className="text-xs text-slate-500">
              Ordenados pela data de criação. Ações em{" "}
              <Link href="/admin/users" className="text-brand-400 hover:underline">
                Usuários
              </Link>
              .
            </p>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-800">
              {users
                .filter((u) => u.createdAt)
                .slice(0, 8)
                .map((u) => (
                  <li key={u.email} className="flex items-center justify-between py-3 text-sm first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-200">{u.name}</p>
                      <p className="truncate text-xs text-slate-500">{u.email}</p>
                    </div>
                    <div className="ml-3 flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[10px] uppercase text-slate-600">
                        {u.createdAt?.slice(0, 10)}
                      </span>
                      {u.platformRole === "PLATFORM_ADMIN" && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-amber-950/60 px-1.5 py-0.5 text-[10px] text-amber-400">
                          <Shield className="h-3 w-3" />
                          ADM
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              {users.every((u) => !u.createdAt) && (
                <li className="py-6 text-center text-sm text-slate-500">
                  Nenhuma data de cadastro (contas antigas ou seed).
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-[#151b24] text-slate-100">
          <CardHeader>
            <CardTitle className="text-base text-white">Atalhos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/users"
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0c0f14] px-3 py-2.5 text-sm text-slate-300 transition-colors hover:border-brand-800 hover:text-white"
            >
              Usuários do app
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>
            <Link
              href="/admin/groups"
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0c0f14] px-3 py-2.5 text-sm text-slate-300 transition-colors hover:border-brand-800 hover:text-white"
            >
              Grupos (visão negócio)
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>
            <Link
              href="/admin/ambiente"
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0c0f14] px-3 py-2.5 text-sm text-slate-300 transition-colors hover:border-brand-800 hover:text-white"
            >
              Ambiente & acesso ADM
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
