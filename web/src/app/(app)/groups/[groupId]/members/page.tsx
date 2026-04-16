"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  Star,
  Users,
  Search,
  X,
  Check,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { findUserGroup } from "@/lib/group-storage";
import {
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  initGroupOwnerAsMember,
  type GroupMember,
} from "@/lib/member-storage";

const positions = ["GOL", "ZAG", "LE", "LD", "VOL", "MEI", "ATA", "PE", "PD"];

const positionColors: Record<string, string> = {
  GOL: "bg-amber-100 text-amber-700",
  ZAG: "bg-blue-100 text-blue-700",
  LE: "bg-cyan-100 text-cyan-700",
  LD: "bg-cyan-100 text-cyan-700",
  VOL: "bg-indigo-100 text-indigo-700",
  MEI: "bg-green-100 text-green-700",
  ATA: "bg-red-100 text-red-700",
  PE: "bg-orange-100 text-orange-700",
  PD: "bg-orange-100 text-orange-700",
};

export default function MembersPage() {
  const params = useParams();
  const { user } = useAuth();

  const groupId =
    typeof params.groupId === "string"
      ? params.groupId
      : Array.isArray(params.groupId)
        ? params.groupId[0]
        : "";

  const group = useMemo(
    () => findUserGroup(groupId),
    [groupId],
  );

  const isOwner =
    group && user && (group.owner.id === user.id || group.owner.name === user.name);

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [newPosition, setNewPosition] = useState("MEI");
  const [newOverall, setNewOverall] = useState("7.0");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!group) return;
    initGroupOwnerAsMember(groupId, group.owner);
    setMembers(getGroupMembers(groupId));
  }, [group, groupId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const sortedMembers = useMemo(() => {
    const sorted = [...members].sort((a, b) => {
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (b.role === "admin" && a.role !== "admin") return 1;
      if (a.role === "moderator" && b.role === "member") return -1;
      if (b.role === "moderator" && a.role === "member") return 1;
      return b.overall - a.overall;
    });
    if (!searchTerm) return sorted;
    const term = searchTerm.toLowerCase();
    return sorted.filter(
      (m) => m.name.toLowerCase().includes(term) || m.nickname.toLowerCase().includes(term),
    );
  }, [members, searchTerm]);

  const stats = useMemo(() => {
    const posCount: Record<string, number> = {};
    let totalOverall = 0;
    members.forEach((m) => {
      posCount[m.position] = (posCount[m.position] ?? 0) + 1;
      totalOverall += m.overall;
    });
    const topPos = Object.entries(posCount).sort((a, b) => b[1] - a[1])[0];
    return {
      total: members.length,
      avgOverall: members.length > 0 ? (totalOverall / members.length).toFixed(1) : "—",
      topPosition: topPos ? topPos[0] : "—",
    };
  }, [members]);

  if (!group) {
    return (
      <div className="space-y-4 animate-fade-in lg:max-w-2xl lg:mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-surface-tertiary animate-pulse" />
        ))}
      </div>
    );
  }

  const handleAddMember = () => {
    if (!newName.trim()) return;
    const member: GroupMember = {
      id: `member-${Date.now()}`,
      name: newName.trim(),
      nickname: newNickname.trim() || newName.trim().split(" ")[0],
      position: newPosition,
      overall: Math.min(10, Math.max(1, parseFloat(newOverall) || 7.0)),
      role: "member",
      joinedAt: new Date().toISOString(),
    };
    addGroupMember(groupId, member);
    setMembers(getGroupMembers(groupId));
    setNewName("");
    setNewNickname("");
    setNewPosition("MEI");
    setNewOverall("7.0");
    setShowAddModal(false);
    showToast(`${member.nickname} adicionado ao grupo!`);
  };

  const handleRemoveMember = (member: GroupMember) => {
    removeGroupMember(groupId, member.id);
    setMembers(getGroupMembers(groupId));
    setConfirmRemove(null);
    showToast(`${member.nickname} removido do grupo`);
  };

  return (
    <div className="space-y-5 animate-fade-in lg:max-w-2xl lg:mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-bold">Membros</h1>
          <p className="text-xs text-muted truncate">{group.name}</p>
        </div>
        {isOwner && (
          <Button size="sm" onClick={() => setShowAddModal(true)} className="shrink-0 shadow-sm">
            <UserPlus className="h-4 w-4" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-none shadow-sm bg-brand-50/50">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="h-3.5 w-3.5 text-brand-500" />
            </div>
            <p className="text-xl font-bold text-brand-700">{stats.total}</p>
            <p className="text-[10px] text-brand-600/70 font-medium">Membros</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-accent-50/50">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-accent-500" />
            </div>
            <p className="text-xl font-bold text-accent-700">{stats.avgOverall}</p>
            <p className="text-[10px] text-accent-600/70 font-medium">Overall médio</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Target className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-blue-700">{stats.topPosition}</p>
            <p className="text-[10px] text-blue-600/70 font-medium">Posição popular</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      {members.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou apelido..."
            className="pl-9"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-muted-dark"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {sortedMembers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-surface-tertiary">
                <Users className="h-8 w-8 text-muted-light" />
              </div>
              <p className="font-display font-bold">
                {searchTerm ? "Nenhum resultado" : "Grupo vazio"}
              </p>
              <p className="text-sm text-muted mt-1 max-w-[260px] mx-auto">
                {searchTerm
                  ? `Nenhum membro encontrado para "${searchTerm}".`
                  : "Adicione membros ao grupo para começar."}
              </p>
              {!searchTerm && isOwner && (
                <Button size="sm" className="mt-4" onClick={() => setShowAddModal(true)}>
                  <UserPlus className="h-4 w-4" />
                  Adicionar primeiro membro
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          sortedMembers.map((member, idx) => {
            const isAdmin = member.role === "admin";
            const isBeingRemoved = confirmRemove === member.id;
            return (
              <Card
                key={member.id}
                className={cn(
                  "transition-all border-border/50 overflow-hidden",
                  isBeingRemoved && "ring-1 ring-red-300 bg-red-50/30",
                  idx === 0 && isAdmin && "border-accent-200/50",
                )}
              >
                <CardContent className="flex items-center gap-3 p-0">
                  {/* Rank indicator */}
                  <div
                    className={cn(
                      "w-1 self-stretch shrink-0",
                      isAdmin
                        ? "bg-accent-400"
                        : member.role === "moderator"
                          ? "bg-blue-400"
                          : "bg-transparent",
                    )}
                  />
                  <div className="flex items-center gap-3 flex-1 min-w-0 py-3 pr-3">
                    <div className="relative">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="text-xs font-semibold bg-surface-tertiary">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      {isAdmin && (
                        <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent-400 flex items-center justify-center ring-2 ring-white">
                          <Crown className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                      {member.role === "moderator" && (
                        <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-white">
                          <Shield className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold">{member.nickname}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge className={cn("text-[9px] px-1.5 py-0 border-0", positionColors[member.position] ?? "bg-gray-100 text-gray-700")}>
                          {member.position}
                        </Badge>
                        <span className="text-[11px] text-muted truncate">{member.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 rounded-lg bg-accent-50 px-2.5 py-1">
                        <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                        <span className="text-xs font-bold text-accent-700">
                          {member.overall.toFixed(1)}
                        </span>
                      </div>
                      {isOwner && !isAdmin && !isBeingRemoved && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted hover:text-red-600 hover:bg-red-50"
                          onClick={() => setConfirmRemove(member.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Remove confirmation bar */}
                {isBeingRemoved && (
                  <div className="flex items-center gap-2 bg-red-50 border-t border-red-200 px-4 py-2.5 animate-slide-down">
                    <p className="text-xs text-red-700 flex-1">
                      Remover <strong>{member.nickname}</strong> do grupo?
                    </p>
                    <Button
                      size="sm"
                      variant="danger"
                      className="h-7 text-xs"
                      onClick={() => handleRemoveMember(member)}
                    >
                      Remover
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setConfirmRemove(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fade-in">
          <Card className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border-none shadow-2xl animate-slide-up">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-brand-100 flex items-center justify-center">
                    <UserPlus className="h-4.5 w-4.5 text-brand-600" />
                  </div>
                  Novo membro
                </CardTitle>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted hover:text-muted-dark hover:bg-surface-tertiary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 text-xs font-medium text-muted-dark block">
                    Nome completo *
                  </label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="João Silva"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1.5 text-xs font-medium text-muted-dark block">
                    Apelido
                  </label>
                  <Input
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    placeholder="Joãozinho"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 text-xs font-medium text-muted-dark block">
                  Posição
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {positions.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setNewPosition(pos)}
                      className={cn(
                        "rounded-lg border py-2 text-xs font-bold transition-all",
                        newPosition === pos
                          ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                          : "border-border text-muted-dark hover:border-brand-300 hover:bg-brand-50/50",
                      )}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-muted-dark block">
                  Overall
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={newOverall}
                    onChange={(e) => setNewOverall(e.target.value)}
                    className="flex-1 h-2 bg-surface-tertiary rounded-full appearance-none cursor-pointer accent-brand-500"
                  />
                  <div className="flex items-center gap-1 rounded-lg bg-accent-50 px-3 py-1.5 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                    <span className="text-sm font-bold text-accent-700 w-8 text-center">
                      {parseFloat(newOverall).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleAddMember}
                disabled={!newName.trim()}
                className="w-full shadow-sm"
                size="lg"
              >
                <UserPlus className="h-4 w-4" />
                Adicionar membro
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2 rounded-xl bg-pitch px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            <Check className="h-4 w-4" />
            {toast}
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
