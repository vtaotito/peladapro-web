"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { addUserGroup } from "@/lib/group-storage";
import { initGroupOwnerAsMember } from "@/lib/member-storage";
import type { Group } from "@/lib/mock-data";

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

export default function NewGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
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

  const canSave = name.trim() && address.trim() && city.trim() && neighborhood.trim();

  const handleCreate = () => {
    const totalSpots = parseInt(format.split("x")[0], 10) * 2;
    const nextDate = new Date();
    const dayIndex = daysOfWeek.indexOf(dayOfWeek);
    const todayIndex = (nextDate.getDay() + 6) % 7;
    let daysUntil = dayIndex - todayIndex;
    if (daysUntil <= 0) daysUntil += 7;
    nextDate.setDate(nextDate.getDate() + daysUntil);
    const [h, m] = time.split(":");
    nextDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

    const group: Group = {
      id: `user-group-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      memberCount: 1,
      maxMembers: parseInt(maxMembers, 10) || 30,
      role: "admin",
      color,
      visibility,
      owner: {
        id: user?.id ?? "unknown",
        name: user?.name ?? "Criador",
        nickname: user?.nickname ?? user?.name?.split(" ")[0] ?? "Eu",
        avatar: null,
      },
      address: address.trim(),
      city: city.trim(),
      neighborhood: neighborhood.trim(),
      dayOfWeek,
      time,
      format,
      pricePerMatch: parseFloat(pricePerMatch) || 0,
      nextMatch: {
        date: nextDate.toISOString(),
        location: address.trim(),
        confirmedCount: 0,
        totalSpots,
      },
    };

    addUserGroup(group);
    initGroupOwnerAsMember(group.id, group.owner);
    setSaved(true);
    setTimeout(() => {
      router.push("/groups");
    }, 1000);
  };

  return (
    <div className="space-y-5 animate-fade-in lg:max-w-2xl lg:mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/groups">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-display text-xl font-bold">Criar Novo Grupo</h1>
      </div>

      {/* Preview */}
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="px-4 py-6 flex items-center gap-4" style={{ backgroundColor: color }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-white font-bold text-2xl">
            {name.charAt(0) || "?"}
          </div>
          <div className="text-white">
            <p className="font-display text-lg font-bold">{name || "Nome do grupo"}</p>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Badge className="bg-white/20 text-white border-white/20 text-[10px]">
                {visibility === "public" ? <><Globe className="h-2.5 w-2.5 mr-0.5" />Público</> : <><Lock className="h-2.5 w-2.5 mr-0.5" />Privado</>}
              </Badge>
              <span>{format}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted" />
            Informações básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 text-xs font-medium text-muted-dark block">
              Nome do grupo *
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Pelada do Parque" maxLength={40} />
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
              className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            />
            <p className="mt-1 text-[11px] text-muted text-right">{description.length}/200</p>
          </div>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {visibility === "public" ? <Globe className="h-4 w-4 text-brand-500" /> : <Lock className="h-4 w-4 text-muted" />}
            Visibilidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            onClick={() => setVisibility("public")}
            className={cn(
              "w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
              visibility === "public" ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-border hover:border-brand-300"
            )}
          >
            <Globe className={cn("h-5 w-5 mt-0.5 shrink-0", visibility === "public" ? "text-brand-600" : "text-muted")} />
            <div>
              <p className="font-semibold text-sm">Público</p>
              <p className="text-xs text-muted mt-0.5">
                Qualquer pessoa pode encontrar e solicitar entrada. O proprietário ou moderador aprova a solicitação.
              </p>
            </div>
            {visibility === "public" && <Check className="h-5 w-5 text-brand-600 shrink-0 ml-auto" />}
          </button>
          <button
            onClick={() => setVisibility("private")}
            className={cn(
              "w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
              visibility === "private" ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-border hover:border-brand-300"
            )}
          >
            <Lock className={cn("h-5 w-5 mt-0.5 shrink-0", visibility === "private" ? "text-brand-600" : "text-muted")} />
            <div>
              <p className="font-semibold text-sm">Privado</p>
              <p className="text-xs text-muted mt-0.5">
                Apenas convidados podem entrar. O grupo não aparece nas buscas públicas.
              </p>
            </div>
            {visibility === "private" && <Check className="h-5 w-5 text-brand-600 shrink-0 ml-auto" />}
          </button>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted" />
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
            <Calendar className="h-4 w-4 text-muted" />
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
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    dayOfWeek === day ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border text-muted-dark hover:border-brand-300"
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
            <Footprints className="h-4 w-4 text-muted" />
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
                    "rounded-lg border px-4 py-2 text-sm font-bold transition-all",
                    format === f ? "border-brand-500 bg-brand-500 text-white" : "border-border text-muted-dark hover:border-brand-300"
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
            <Palette className="h-4 w-4 text-muted" />
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
                  "h-10 w-10 rounded-xl transition-all",
                  color === c ? "ring-2 ring-offset-2 ring-brand-500 scale-110" : "hover:scale-105"
                )}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check className="h-5 w-5 text-white mx-auto" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={handleCreate}
        disabled={!canSave || saved}
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" />
            Grupo criado!
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Criar grupo
          </>
        )}
      </Button>

      <div className="h-4" />
    </div>
  );
}
