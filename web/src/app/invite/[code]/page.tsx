"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Goal,
  Users,
  MapPin,
  Calendar,
  Clock,
  Footprints,
  DollarSign,
  Check,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { resolveGroupFromInvite } from "@/lib/invite-storage";
import { addUserGroup, readUserGroups } from "@/lib/group-storage";
import type { Group } from "@/lib/mock-data";
import { myGroups } from "@/lib/mock-data";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const code = typeof params.code === "string" ? params.code : "";

  const [group, setGroup] = useState<Group | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);
  const [joined, setJoined] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const resolved = resolveGroupFromInvite(code);
    if (!resolved) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setGroup(resolved);

    const isMock = myGroups.some((g) => g.id === resolved.id);
    const isUserGroup = readUserGroups().some((g) => g.id === resolved.id);
    if (isMock || isUserGroup) {
      setAlreadyMember(true);
    }

    setLoading(false);
  }, [code]);

  const handleJoin = () => {
    if (!group) return;
    const isUserGroup = readUserGroups().some((g) => g.id === group.id);
    if (!isUserGroup) {
      addUserGroup({ ...group, role: "member" });
    }
    setJoined(true);
    setTimeout(() => {
      router.push(`/groups/${group.id}`);
    }, 1200);
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-brand-50 via-surface to-accent-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-surface to-accent-50 px-4">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="font-display text-xl font-bold">Convite inválido</h1>
        <p className="mt-2 text-sm text-muted text-center max-w-xs">
          Este link de convite não existe ou expirou. Peça um novo convite ao organizador do grupo.
        </p>
        <Link href="/" className="mt-6">
          <Button>Ir para o início</Button>
        </Link>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-surface to-accent-50 px-4 py-8">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-lg">
          <Goal className="h-6 w-6 text-white" />
        </div>
        <span className="font-display text-2xl font-bold">
          <span className="text-pitch">Pelada</span>
          <span className="text-brand-500">Pro</span>
        </span>
      </Link>

      <p className="mb-4 text-sm text-muted">Você foi convidado para</p>

      <Card className="w-full max-w-sm overflow-hidden border-none shadow-xl animate-scale-in">
        <div className="h-2" style={{ backgroundColor: group.color }} />
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white font-bold text-xl"
              style={{ backgroundColor: group.color }}
            >
              {group.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-lg font-bold truncate">
                {group.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Users className="h-3 w-3" />
                  {group.memberCount}/{group.maxMembers}
                </span>
                <Badge
                  variant={
                    group.maxMembers - group.memberCount > 5
                      ? "success"
                      : group.maxMembers - group.memberCount > 0
                        ? "warning"
                        : "danger"
                  }
                  className="text-[10px] px-1.5 py-0"
                >
                  {group.maxMembers - group.memberCount > 0
                    ? `${group.maxMembers - group.memberCount} vagas`
                    : "Lotado"}
                </Badge>
              </div>
            </div>
          </div>

          {group.description && (
            <p className="text-xs text-muted-dark leading-relaxed">
              {group.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-dark">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted" />
              <span className="truncate">
                {group.neighborhood}, {group.city}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted" />
              <span>{group.dayOfWeek}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted" />
              <span>{group.time}h</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Footprints className="h-3.5 w-3.5 text-muted" />
              <span>{group.format}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-muted" />
              <span>R$ {group.pricePerMatch.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-border/50">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[9px]">
                {getInitials(group.owner.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted">
              Organizado por{" "}
              <strong>{group.owner.nickname}</strong>
            </span>
          </div>

          {joined ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-brand-50 py-3 text-sm font-semibold text-brand-700">
              <Check className="h-5 w-5" />
              Você entrou no grupo!
            </div>
          ) : alreadyMember && user ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 py-2.5 text-sm font-medium text-blue-700">
                <Check className="h-4 w-4" />
                Você já é membro deste grupo
              </div>
              <Link href={`/groups/${group.id}`} className="block">
                <Button className="w-full" size="lg">
                  Acessar grupo
                </Button>
              </Link>
            </div>
          ) : user ? (
            <Button className="w-full" size="lg" onClick={handleJoin}>
              <UserPlus className="h-4 w-4" />
              Entrar no grupo
            </Button>
          ) : (
            <div className="space-y-2">
              <Link
                href={`/login?invite=${code}`}
                className="block"
              >
                <Button className="w-full" size="lg">
                  <LogIn className="h-4 w-4" />
                  Entrar na conta
                </Button>
              </Link>
              <Link
                href={`/register?invite=${code}`}
                className="block"
              >
                <Button variant="outline" className="w-full" size="lg">
                  <UserPlus className="h-4 w-4" />
                  Criar conta
                </Button>
              </Link>
              <p className="text-center text-[10px] text-muted">
                Faça login ou crie uma conta para entrar no grupo
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} PeladaPro
      </p>
    </div>
  );
}
