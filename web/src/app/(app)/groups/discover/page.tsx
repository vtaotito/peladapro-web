"use client";

import { useState } from "react";
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
  ChevronDown,
  ChevronUp,
  UserPlus,
  Check,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { publicGroups, type Group } from "@/lib/mock-data";
import { getInitials, cn } from "@/lib/utils";

const cities = ["Todas", "São Paulo", "São Bernardo do Campo"];
const neighborhoods = [
  "Todos",
  "Ibirapuera",
  "Vila Madalena",
  "Moema",
  "Pinheiros",
  "Centro",
];

export default function DiscoverGroupsPage() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [requestedGroups, setRequestedGroups] = useState<Set<string>>(new Set());

  const filteredGroups = publicGroups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase()) ||
      g.neighborhood.toLowerCase().includes(search.toLowerCase());
    const matchesCity = selectedCity === "Todas" || g.city === selectedCity;
    const matchesNeighborhood =
      selectedNeighborhood === "Todos" || g.neighborhood === selectedNeighborhood;
    return matchesSearch && matchesCity && matchesNeighborhood;
  });

  const requestJoin = (groupId: string) => {
    setRequestedGroups((prev) => new Set([...prev, groupId]));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/groups">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold">Descobrir Grupos</h1>
          <p className="text-xs text-muted">Encontre peladas na sua região</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
          <Input
            placeholder="Buscar por nome, bairro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="animate-fade-in">
          <CardContent className="p-4 space-y-3">
            <div>
              <label className="mb-1.5 text-xs font-medium text-muted-dark block">Cidade</label>
              <div className="flex flex-wrap gap-2">
                {cities.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCity(c);
                      setSelectedNeighborhood("Todos");
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      selectedCity === c ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border text-muted-dark hover:border-brand-300"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-muted-dark block">Bairro</label>
              <div className="flex flex-wrap gap-2">
                {neighborhoods.map((n) => (
                  <button
                    key={n}
                    onClick={() => setSelectedNeighborhood(n)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      selectedNeighborhood === n ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border text-muted-dark hover:border-brand-300"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{filteredGroups.length}</span> grupo{filteredGroups.length !== 1 ? "s" : ""} encontrado{filteredGroups.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {filteredGroups.map((group) => {
          const isRequested = requestedGroups.has(group.id);
          const spotsLeft = group.maxMembers - group.memberCount;
          return (
            <Card key={group.id} className="overflow-hidden transition-all hover:shadow-md">
              <div className="h-2" style={{ backgroundColor: group.color }} />
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white font-bold text-lg"
                    style={{ backgroundColor: group.color }}
                  >
                    {group.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold truncate">{group.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Users className="h-3 w-3" />
                        {group.memberCount}/{group.maxMembers}
                      </span>
                      <Badge variant={spotsLeft > 5 ? "success" : spotsLeft > 0 ? "warning" : "destructive"} className="text-[10px] px-1.5 py-0">
                        {spotsLeft > 0 ? `${spotsLeft} vagas` : "Lotado"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-dark line-clamp-2">{group.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-dark">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted" />
                    <span className="truncate">{group.neighborhood}, {group.city}</span>
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

                {/* Owner */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[9px]">{getInitials(group.owner.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted">Organizado por <strong>{group.owner.nickname}</strong></span>
                </div>

                {/* Action */}
                <Button
                  className="w-full"
                  variant={isRequested ? "outline" : "default"}
                  size="sm"
                  onClick={() => requestJoin(group.id)}
                  disabled={isRequested || spotsLeft <= 0}
                >
                  {isRequested ? (
                    <>
                      <Check className="h-4 w-4" />
                      Solicitação enviada
                    </>
                  ) : spotsLeft <= 0 ? (
                    "Grupo lotado"
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Solicitar entrada
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="py-12 text-center">
          <Globe className="h-12 w-12 text-muted-light mx-auto mb-3" />
          <p className="font-display font-bold text-lg">Nenhum grupo encontrado</p>
          <p className="text-sm text-muted mt-1">Tente ajustar os filtros ou busque por outro bairro.</p>
        </div>
      )}
    </div>
  );
}
