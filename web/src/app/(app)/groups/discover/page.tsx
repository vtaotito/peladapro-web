"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  MapPin,
  Users,
  Calendar,
  Globe,
  Clock,
  DollarSign,
  Footprints,
  Filter,
  UserPlus,
  Check,
  X,
  Compass,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { publicGroups, myGroups, type Group } from "@/lib/mock-data";
import { getInitials, cn } from "@/lib/utils";
import { addUserGroup, readUserGroups } from "@/lib/group-storage";

export default function DiscoverGroupsPage() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [selectedFormat, setSelectedFormat] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const userGroupIds = readUserGroups().map((g) => g.id);
    const myGroupIds = myGroups.map((g) => g.id);
    setJoinedIds(new Set([...userGroupIds, ...myGroupIds]));
  }, []);

  const allPublicGroups = useMemo(() => {
    const userPublicGroups = readUserGroups().filter(
      (g) => g.visibility === "public",
    );
    const combined = [...publicGroups];
    userPublicGroups.forEach((ug) => {
      if (!combined.some((g) => g.id === ug.id)) {
        combined.push(ug);
      }
    });
    return combined;
  }, []);

  const cities = useMemo(() => {
    const set = new Set(allPublicGroups.map((g) => g.city));
    return ["Todas", ...Array.from(set).sort()];
  }, [allPublicGroups]);

  const formats = useMemo(() => {
    const set = new Set(allPublicGroups.map((g) => g.format));
    return ["Todos", ...Array.from(set).sort()];
  }, [allPublicGroups]);

  const filteredGroups = useMemo(() => {
    return allPublicGroups.filter((g) => {
      if (joinedIds.has(g.id)) return false;
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        g.name.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term) ||
        g.neighborhood.toLowerCase().includes(term) ||
        g.city.toLowerCase().includes(term);
      const matchesCity = selectedCity === "Todas" || g.city === selectedCity;
      const matchesFormat = selectedFormat === "Todos" || g.format === selectedFormat;
      return matchesSearch && matchesCity && matchesFormat;
    });
  }, [allPublicGroups, search, selectedCity, selectedFormat, joinedIds]);

  const activeFilters =
    (selectedCity !== "Todas" ? 1 : 0) + (selectedFormat !== "Todos" ? 1 : 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const requestJoin = (group: Group) => {
    setJoinedIds((prev) => new Set([...prev, group.id]));
    addUserGroup({ ...group, role: "member" });
    showToast(`Você entrou em ${group.name}!`);
  };

  const clearFilters = () => {
    setSelectedCity("Todas");
    setSelectedFormat("Todos");
    setSearch("");
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/groups">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-bold">Descobrir Grupos</h1>
          <p className="text-xs text-muted">Encontre peladas na sua região</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1">
          <Globe className="h-3.5 w-3.5 text-brand-500" />
          <span className="text-xs font-semibold text-brand-700">{allPublicGroups.length}</span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
          <Input
            placeholder="Buscar por nome, bairro, cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-muted-dark"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={cn("shrink-0 relative", activeFilters > 0 && !showFilters && "border-brand-300")}
        >
          <Filter className="h-4 w-4" />
          {activeFilters > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="animate-fade-in border-brand-200/50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-brand-500" />
                Filtros
              </p>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-xs text-brand-600 font-medium hover:underline">
                  Limpar filtros
                </button>
              )}
            </div>
            <div>
              <label className="mb-2 text-xs font-medium text-muted-dark block">Cidade</label>
              <div className="flex flex-wrap gap-2">
                {cities.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCity(c)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      selectedCity === c
                        ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                        : "border-border text-muted-dark hover:border-brand-300 hover:bg-brand-50/50",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 text-xs font-medium text-muted-dark block">Formato</label>
              <div className="flex flex-wrap gap-2">
                {formats.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFormat(f)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      selectedFormat === f
                        ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                        : "border-border text-muted-dark hover:border-brand-300 hover:bg-brand-50/50",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{filteredGroups.length}</span>{" "}
          grupo{filteredGroups.length !== 1 ? "s" : ""} disponíve{filteredGroups.length !== 1 ? "is" : "l"}
        </p>
        {activeFilters > 0 && (
          <div className="flex items-center gap-1.5">
            {selectedCity !== "Todas" && (
              <Badge variant="info" className="text-[10px] gap-1">
                {selectedCity}
                <button onClick={() => setSelectedCity("Todas")}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {selectedFormat !== "Todos" && (
              <Badge variant="info" className="text-[10px] gap-1">
                {selectedFormat}
                <button onClick={() => setSelectedFormat("Todos")}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Group Cards */}
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {filteredGroups.map((group) => {
          const spotsLeft = group.maxMembers - group.memberCount;
          const isJoined = joinedIds.has(group.id);
          const isUserCreated = group.id.startsWith("user-group-");
          return (
            <Card
              key={group.id}
              className="overflow-hidden transition-all hover:shadow-md border-border/50 group"
            >
              {/* Color header */}
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ backgroundColor: group.color }}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white font-bold text-lg backdrop-blur-sm">
                  {group.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 text-white">
                  <p className="font-display font-bold truncate text-sm">{group.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-[11px] text-white/80">
                      <Users className="h-3 w-3" />
                      {group.memberCount}/{group.maxMembers}
                    </span>
                    <span className="text-[11px] text-white/80">·</span>
                    <span className="text-[11px] text-white/80">{group.format}</span>
                    {isUserCreated && (
                      <Badge className="bg-white/20 text-white border-white/20 text-[9px] ml-auto">
                        <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                        Novo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-dark line-clamp-2 leading-relaxed">{group.description}</p>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 rounded-lg bg-surface-secondary px-2.5 py-2">
                    <MapPin className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    <span className="text-[11px] text-muted-dark truncate">{group.neighborhood}, {group.city}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-surface-secondary px-2.5 py-2">
                    <Calendar className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    <span className="text-[11px] text-muted-dark truncate">{group.dayOfWeek}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-surface-secondary px-2.5 py-2">
                    <Clock className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    <span className="text-[11px] text-muted-dark">{group.time}h</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-surface-secondary px-2.5 py-2">
                    <DollarSign className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    <span className="text-[11px] text-muted-dark">R$ {group.pricePerMatch.toFixed(2)}</span>
                  </div>
                </div>

                {/* Owner + Spots */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-[9px]">{getInitials(group.owner.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] text-muted truncate">
                      por <strong>{group.owner.nickname}</strong>
                    </span>
                  </div>
                  <Badge
                    variant={spotsLeft > 5 ? "success" : spotsLeft > 0 ? "warning" : "danger"}
                    className="text-[10px] px-2 py-0.5 shrink-0"
                  >
                    {spotsLeft > 0 ? `${spotsLeft} vaga${spotsLeft !== 1 ? "s" : ""}` : "Lotado"}
                  </Badge>
                </div>

                {/* Action */}
                <Button
                  className={cn("w-full shadow-sm", isJoined && "pointer-events-none")}
                  variant={isJoined ? "outline" : "default"}
                  size="sm"
                  onClick={() => !isJoined && spotsLeft > 0 && requestJoin(group)}
                  disabled={isJoined || spotsLeft <= 0}
                >
                  {isJoined ? (
                    <>
                      <Check className="h-4 w-4 text-brand-500" />
                      Você já participa
                    </>
                  ) : spotsLeft <= 0 ? (
                    "Grupo lotado"
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Entrar no grupo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredGroups.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-surface-tertiary">
              <Compass className="h-8 w-8 text-muted-light" />
            </div>
            <p className="font-display font-bold text-lg">Nenhum grupo encontrado</p>
            <p className="text-sm text-muted mt-1 max-w-[280px] mx-auto">
              {search || activeFilters > 0
                ? "Tente ajustar os filtros ou buscar por outro termo."
                : "Não há grupos públicos disponíveis no momento."}
            </p>
            {(search || activeFilters > 0) && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2 rounded-xl bg-pitch px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            <Check className="h-4 w-4" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
