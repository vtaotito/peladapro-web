"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Globe,
  Lock,
  Calendar,
  Footprints,
  FileText,
  Palette,
  Save,
  Check,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { findUserGroup, updateUserGroup } from "@/lib/group-storage";
import { myGroups } from "@/lib/mock-data";

const daysOfWeek = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

const formats = ["5x5", "6x6", "7x7", "8x8", "11x11"];

const colors = [
  "#16a34a", "#2563eb", "#d97706", "#dc2626",
  "#7c3aed", "#059669", "#ea580c", "#0891b2",
  "#be185d", "#4f46e5",
];

export default function EditGroupPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const groupId =
    typeof params.groupId === "string"
      ? params.groupId
      : Array.isArray(params.groupId)
        ? params.groupId[0]
        : "";

  const group = myGroups.find((g) => g.id === groupId) ?? findUserGroup(groupId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Sexta-feira");
  const [time, setTime] = useState("19:00");
  const [format, setFormat] = useState("7x7");
  const [maxMembers, setMaxMembers] = useState("30");
  const [pricePerMatch, setPricePerMatch] = useState("25");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [color, setColor] = useState("#16a34a");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadFromGroup = () => {
    if (!group) return;
    setName(group.name);
    setDescription(group.description);
    setAddress(group.address);
    setCity(group.city);
    setNeighborhood(group.neighborhood);
    setDayOfWeek(group.dayOfWeek);
    setTime(group.time);
    setFormat(group.format);
    setMaxMembers(String(group.maxMembers));
    setPricePerMatch(String(group.pricePerMatch));
    setVisibility(group.visibility);
    setColor(group.color);
    setLoaded(true);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadFromGroup(); }, [group]);

  const isOwner =
    group && user && (group.owner.id === user.id || group.owner.name === user.name);

  useEffect(() => {
    if (loaded && !isOwner) router.replace(`/groups/${groupId}`);
  }, [loaded, isOwner, groupId, router]);

  const hasChanges = useMemo(() => {
    if (!group || !loaded) return false;
    return (
      name !== group.name ||
      description !== group.description ||
      address !== group.address ||
      city !== group.city ||
      neighborhood !== group.neighborhood ||
      dayOfWeek !== group.dayOfWeek ||
      time !== group.time ||
      format !== group.format ||
      maxMembers !== String(group.maxMembers) ||
      pricePerMatch !== String(group.pricePerMatch) ||
      visibility !== group.visibility ||
      color !== group.color
    );
  }, [group, loaded, name, description, address, city, neighborhood, dayOfWeek, time, format, maxMembers, pricePerMatch, visibility, color]);

  if (!group || !loaded) {
    return (
      <div className="space-y-5 animate-fade-in lg:max-w-2xl lg:mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-surface-tertiary animate-pulse" />
          <div className="h-6 w-40 rounded bg-surface-tertiary animate-pulse" />
        </div>
        <div className="h-24 rounded-2xl bg-surface-tertiary animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-surface-tertiary animate-pulse" />
        ))}
      </div>
    );
  }

  const canSave = name.trim() && address.trim() && city.trim() && neighborhood.trim();

  const handleSave = () => {
    const totalSpots = parseInt(format.split("x")[0], 10) * 2;
    const nextDate = new Date();
    const dayIndex = daysOfWeek.indexOf(dayOfWeek);
    const todayIndex = (nextDate.getDay() + 6) % 7;
    let daysUntil = dayIndex - todayIndex;
    if (daysUntil <= 0) daysUntil += 7;
    nextDate.setDate(nextDate.getDate() + daysUntil);
    const [h, m] = time.split(":");
    nextDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

    updateUserGroup(groupId, {
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      neighborhood: neighborhood.trim(),
      dayOfWeek,
      time,
      format,
      maxMembers: parseInt(maxMembers, 10) || 30,
      pricePerMatch: parseFloat(pricePerMatch) || 0,
      visibility,
      color,
      nextMatch: {
        date: nextDate.toISOString(),
        location: address.trim(),
        confirmedCount: group.nextMatch?.confirmedCount ?? 0,
        totalSpots,
      },
    });

    setSaved(true);
    setTimeout(() => router.push(`/groups/${groupId}`), 1200);
  };

  const handleDiscard = () => loadFromGroup();

  return (
    <div className="space-y-5 animate-fade-in lg:max-w-2xl lg:mx-auto pb-24">
      {/* Header with group color */}
      <div className="relative overflow-hidden rounded-2xl" style={{ backgroundColor: color }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
        <div className="relative px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <Link href={`/groups/${groupId}`}>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-display text-xl font-bold text-white">Editar Grupo</h1>
            {hasChanges && !saved && (
              <Badge className="bg-white/20 text-white border-white/20 text-[10px] ml-auto animate-fade-in">
                <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                Alterações pendentes
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-white font-bold text-2xl backdrop-blur-sm">
              {name.charAt(0) || "?"}
            </div>
            <div className="text-white min-w-0 flex-1">
              <p className="font-display text-lg font-bold truncate">{name || "Nome do grupo"}</p>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Badge className="bg-white/20 text-white border-white/20 text-[10px]">
                  {visibility === "public" ? <><Globe className="h-2.5 w-2.5 mr-0.5" />Público</> : <><Lock className="h-2.5 w-2.5 mr-0.5" />Privado</>}
                </Badge>
                <span>{format}</span>
                <span>·</span>
                <span>{dayOfWeek.slice(0, 3)} {time}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-500" />
            Informações básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 text-xs font-medium text-muted-dark block">
              Nome do grupo *
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Pelada do Parque" maxLength={40} />
            <p className="mt-1 text-[11px] text-muted text-right">{name.length}/40</p>
          </div>
          <div>
            <label className="mb-1.5 text-xs font-medium text-muted-dark block">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu grupo, regras, nível..."
              maxLength={200}
              rows={3}
              className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 resize-none"
            />
            <p className="mt-1 text-[11px] text-muted text-right">{description.length}/200</p>
          </div>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {visibility === "public" ? <Globe className="h-4 w-4 text-brand-500" /> : <Lock className="h-4 w-4 text-brand-500" />}
            Visibilidade
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {([
            { value: "public" as const, icon: Globe, label: "Público", desc: "Visível para todos" },
            { value: "private" as const, icon: Lock, label: "Privado", desc: "Apenas convidados" },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVisibility(opt.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                visibility === opt.value
                  ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                  : "border-border hover:border-brand-300",
              )}
            >
              <opt.icon className={cn("h-6 w-6", visibility === opt.value ? "text-brand-600" : "text-muted")} />
              <div>
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className="text-[11px] text-muted mt-0.5">{opt.desc}</p>
              </div>
              {visibility === opt.value && (
                <div className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-500" />
            Local
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 text-xs font-medium text-muted-dark block">Endereço *</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex: Quadra do Parque Municipal, Av. Brasil, 1200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 text-xs font-medium text-muted-dark block">Cidade *</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo" />
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-muted-dark block">Bairro *</label>
              <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Centro" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-500" />
            Horário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 text-xs font-medium text-muted-dark block">Dia da semana</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setDayOfWeek(day)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                    dayOfWeek === day
                      ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                      : "border-border text-muted-dark hover:border-brand-300 hover:bg-brand-50/50",
                  )}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Horário
            </label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Game Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Footprints className="h-4 w-4 text-brand-500" />
            Configurações do jogo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 text-xs font-medium text-muted-dark block">Formato</label>
            <div className="flex flex-wrap gap-2">
              {formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "rounded-lg border px-4 py-2.5 text-sm font-bold transition-all",
                    format === f
                      ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                      : "border-border text-muted-dark hover:border-brand-300 hover:bg-brand-50/50",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Máx. membros
              </label>
              <Input type="number" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} min="4" max="100" />
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-muted-dark flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Valor por partida (R$)
              </label>
              <Input type="number" value={pricePerMatch} onChange={(e) => setPricePerMatch(e.target.value)} min="0" step="5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-brand-500" />
            Cor do grupo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "h-11 w-11 rounded-xl transition-all relative",
                  color === c ? "ring-2 ring-offset-2 ring-brand-500 scale-110 shadow-lg" : "hover:scale-105",
                )}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check className="h-5 w-5 text-white mx-auto" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sticky Save Bar */}
      {(hasChanges || saved) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)] animate-slide-up">
          <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
            {saved ? (
              <div className="flex-1 flex items-center justify-center gap-2 text-brand-600 font-semibold text-sm">
                <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-brand-600" />
                </div>
                Alterações salvas com sucesso!
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Alterações não salvas</p>
                  <p className="text-[11px] text-muted">Salve para aplicar as mudanças</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDiscard}
                  className="shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Descartar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!canSave}
                  className="shrink-0 shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  Salvar
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
