"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Ban,
  CheckCircle,
  KeyRound,
  Search,
  Shield,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  listAppUsers,
  createAppUser,
  updateAppUser,
  seedPlatformAdminIfNeeded,
  PLATFORM_ADMIN_EMAIL,
  usersToCsv,
  type AppUserRow,
} from "@/lib/platform-admin";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [newPassReset, setNewPassReset] = useState("");

  useEffect(() => {
    seedPlatformAdminIfNeeded();
  }, []);

  const rows = useMemo(() => {
    void refresh;
    return listAppUsers();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (u) =>
        u.email.includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q),
    );
  }, [rows, search]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const r = createAppUser(newEmail, newName, newPassword);
    if (!r.ok) {
      setFormError(r.error || "Erro");
      return;
    }
    setShowCreate(false);
    setNewEmail("");
    setNewName("");
    setNewPassword("");
    setRefresh((x) => x + 1);
  }

  function toggleDisabled(u: AppUserRow) {
    if (u.email === PLATFORM_ADMIN_EMAIL) return;
    updateAppUser(u.email, { disabled: !u.disabled });
    setRefresh((x) => x + 1);
  }

  function downloadCsv() {
    const csv = usersToCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `peladapro-usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function applyReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget || !newPassReset) return;
    const r = updateAppUser(resetTarget, { password: newPassReset });
    if (r.ok) {
      setResetTarget(null);
      setNewPassReset("");
      setRefresh((x) => x + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Usuários</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cadastro, bloqueio de acesso ao app e redefinição de senha (dados locais).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-slate-600 text-slate-200"
            onClick={downloadCsv}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={() => setShowCreate(true)} className="shrink-0">
            <Plus className="h-4 w-4" />
            Novo usuário
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por e-mail, nome ou ID…"
          className="border-slate-700 bg-[#151b24] pl-10 text-slate-100 placeholder:text-slate-600"
        />
      </div>

      <Card className="border-slate-800 bg-[#151b24] text-slate-100">
        <CardHeader className="flex flex-row items-center gap-2 border-b border-slate-800 pb-4">
          <Users className="h-5 w-5 text-brand-500" />
          <CardTitle className="text-lg text-white">Lista de contas</CardTitle>
          <Badge variant="secondary" className="ml-auto border-slate-700 bg-slate-800 text-slate-300">
            {filtered.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 font-medium">Usuário</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">ID</th>
                  <th className="px-4 py-3 font-medium">Papel</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Cadastro</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.email}
                    className={cn(
                      "border-b border-slate-800/80",
                      u.disabled && "opacity-60",
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-200">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="hidden max-w-[140px] truncate px-4 py-3 font-mono text-xs text-slate-500 md:table-cell">
                      {u.id}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">
                      {u.createdAt ? u.createdAt.slice(0, 10) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {u.platformRole === "PLATFORM_ADMIN" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/60 px-2 py-0.5 text-xs text-amber-400">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Jogador</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.disabled ? (
                        <Badge variant="danger" className="bg-red-950 text-red-300">
                          Bloqueado
                        </Badge>
                      ) : (
                        <Badge className="border-emerald-800 bg-emerald-950/50 text-emerald-400">
                          Ativo
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        {u.email !== PLATFORM_ADMIN_EMAIL && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                              onClick={() => toggleDisabled(u)}
                            >
                              {u.disabled ? (
                                <>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Desbloquear
                                </>
                              ) : (
                                <>
                                  <Ban className="h-3.5 w-3.5" />
                                  Bloquear
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-brand-400 hover:bg-slate-800"
                              onClick={() => setResetTarget(u.email)}
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              Senha
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-md border-slate-700 bg-[#151b24] text-slate-100">
            <CardHeader>
              <CardTitle className="text-white">Novo usuário</CardTitle>
              <p className="text-xs text-slate-500">
                Cria conta para acesso ao aplicativo (papel jogador).
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Nome</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border-slate-700 bg-[#0c0f14] text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">E-mail</label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="border-slate-700 bg-[#0c0f14] text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Senha inicial</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-slate-700 bg-[#0c0f14] text-slate-100"
                    required
                  />
                </div>
                {formError && <p className="text-sm text-red-400">{formError}</p>}
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1 border-slate-600" onClick={() => setShowCreate(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Criar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-md border-slate-700 bg-[#151b24] text-slate-100">
            <CardHeader>
              <CardTitle className="text-white">Nova senha</CardTitle>
              <p className="truncate text-xs text-slate-500">{resetTarget}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={applyReset} className="space-y-3">
                <Input
                  type="password"
                  value={newPassReset}
                  onChange={(e) => setNewPassReset(e.target.value)}
                  placeholder="Nova senha"
                  className="border-slate-700 bg-[#0c0f14] text-slate-100"
                  required
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1 border-slate-600" onClick={() => { setResetTarget(null); setNewPassReset(""); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Salvar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
