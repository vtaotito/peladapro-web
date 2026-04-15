"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { findUserGroup } from "@/lib/group-storage";
import { myGroups } from "@/lib/mock-data";
import {
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  initGroupOwnerAsMember,
  type GroupMember,
} from "@/lib/member-storage";

const positions = ["GOL", "ZAG", "LE", "LD", "VOL", "MEI", "ATA", "PE", "PD"];

export default function MembersPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const groupId =
    typeof params.groupId === "string"
      ? params.groupId
      : Array.isArray(params.groupId)
        ? params.groupId[0]
        : "";

  const group = useMemo(
    () => myGroups.find((g) => g.id === groupId) ?? findUserGroup(groupId),
    [groupId],
  );

  const isOwner =
    group &&
    user &&
    (group.owner.id === user.id || group.owner.name === user.name);

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [newPosition, setNewPosition] = useState("MEI");
  const [newOverall, setNewOverall] = useState("7.0");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    if (!group) return;
    initGroupOwnerAsMember(groupId, group.owner);
    setMembers(getGroupMembers(groupId));
  }, [group, groupId]);

  useEffect(() => {
    if (group && !isOwner) {
      router.replace(`/groups/${groupId}`);
    }
  }, [group, isOwner, groupId, router]);

  if (!group) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Carregando…
      </div>
    );
  }

  const filteredMembers = searchTerm
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.nickname.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : members;

  const handleAddMember = () => {
    if (!newName.trim()) return;
    const member: GroupMember = {
      id: `member-${Date.now()}`,
      name: newName.trim(),
      nickname: newNickname.trim() || newName.trim().split(" ")[0],
      position: newPosition,
      overall: parseFloat(newOverall) || 7.0,
      role: "member",
      joinedAt: new Date().toISOString(),
    };
    addGroupMember(groupId, member);
    setMembers(getGroupMembers(groupId));
    setNewName("");
    setNewNickname("");
    setNewPosition("MEI");
    setNewOverall("7.0");
    setShowAddForm(false);
  };

  const handleRemoveMember = (memberId: string) => {
    removeGroupMember(groupId, memberId);
    setMembers(getGroupMembers(groupId));
    setConfirmRemove(null);
  };

  return (
    <div className="space-y-5 animate-fade-in lg:max-w-2xl lg:mx-auto">
      <div className="flex items-center gap-3">
        <Link href={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">Membros</h1>
          <p className="text-xs text-muted">{group.name} · {members.length} membro{members.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(true)}>
          <UserPlus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <Card className="border-brand-200 bg-brand-50/30 animate-fade-in">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-brand-600" />
                Novo membro
              </CardTitle>
              <button onClick={() => setShowAddForm(false)} className="text-muted hover:text-muted-dark">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 text-xs font-medium text-muted-dark block">
                  Nome completo *
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="João Silva"
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
              <label className="mb-1.5 text-xs font-medium text-muted-dark block">
                Posição
              </label>
              <div className="flex flex-wrap gap-1.5">
                {positions.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setNewPosition(pos)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      newPosition === pos
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-border text-muted-dark hover:border-brand-300",
                    )}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-muted-dark block">
                Overall (1.0 - 10.0)
              </label>
              <Input
                type="number"
                value={newOverall}
                onChange={(e) => setNewOverall(e.target.value)}
                min="1"
                max="10"
                step="0.1"
                className="w-24"
              />
            </div>
            <Button onClick={handleAddMember} disabled={!newName.trim()} className="w-full">
              <Check className="h-4 w-4" />
              Adicionar membro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      {members.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar membro..."
            className="pl-9"
          />
        </div>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Users className="h-10 w-10 text-muted-light mx-auto mb-3" />
              <p className="font-display font-bold">Nenhum membro encontrado</p>
              <p className="text-sm text-muted mt-1">
                {searchTerm ? "Tente outro termo de busca." : "Adicione o primeiro membro ao grupo."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMembers.map((member) => {
            const isAdmin = member.role === "admin";
            return (
              <Card key={member.id} className={cn("border-border/50 transition-all", confirmRemove === member.id && "ring-1 ring-red-300")}>
                <CardContent className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{member.nickname}</p>
                      {isAdmin && <Crown className="h-3.5 w-3.5 text-accent-500 shrink-0" />}
                      {member.role === "moderator" && <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                        {member.position}
                      </Badge>
                      <span>{member.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5">
                      <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                      <span className="text-xs font-bold text-accent-700">
                        {member.overall.toFixed(1)}
                      </span>
                    </div>
                    {!isAdmin && (
                      confirmRemove === member.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="danger"
                            className="h-7 w-7"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setConfirmRemove(null)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setConfirmRemove(member.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}
