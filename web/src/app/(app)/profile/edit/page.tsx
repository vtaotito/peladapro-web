"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Save,
  User,
  Mail,
  AtSign,
  MapPin,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { currentUser } from "@/lib/mock-data";
import { getInitials, cn } from "@/lib/utils";

const positions = [
  { value: "GOL", label: "Goleiro" },
  { value: "ZAG", label: "Zagueiro" },
  { value: "LAT", label: "Lateral" },
  { value: "MEI", label: "Meia" },
  { value: "ATA", label: "Atacante" },
];

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>(["MEI"]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setNickname(user.nickname || currentUser.nickname);
      setEmail(user.email || "");
      setSelectedPositions(
        user.positions?.length
          ? user.positions
          : user.position
            ? [user.position]
            : currentUser.positions || [currentUser.position]
      );
    }
  }, [user]);

  const togglePosition = (pos: string) => {
    setSelectedPositions((prev) => {
      if (prev.includes(pos)) {
        if (prev.length === 1) return prev;
        return prev.filter((p) => p !== pos);
      }
      return [...prev, pos];
    });
  };

  const handleSave = () => {
    updateUser({
      name,
      nickname,
      email,
      position: selectedPositions[0],
      positions: selectedPositions,
    });
    setSaved(true);
    setTimeout(() => {
      router.push("/profile");
    }, 800);
  };

  return (
    <div className="space-y-5 animate-fade-in lg:max-w-2xl lg:mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-display text-xl font-bold">Editar Perfil</h1>
      </div>

      <Card className="overflow-hidden border-none shadow-lg">
        <div className="pitch-gradient px-4 py-8 flex flex-col items-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white/10">
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-white/20 text-2xl font-bold text-white">
                  {name ? getInitials(name) : "?"}
                </AvatarFallback>
              </Avatar>
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-110">
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-dark">
              <User className="h-3.5 w-3.5" />
              Nome completo
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-dark">
              <AtSign className="h-3.5 w-3.5" />
              Apelido
            </label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Seu apelido na pelada"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-dark">
              <Mail className="h-3.5 w-3.5" />
              E-mail
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-dark">
              <MapPin className="h-3.5 w-3.5" />
              Posições (selecione uma ou mais)
            </label>
            <div className="flex flex-wrap gap-2">
              {positions.map((pos) => {
                const isSelected = selectedPositions.includes(pos.value);
                const isPrimary = selectedPositions[0] === pos.value;
                return (
                  <button
                    key={pos.value}
                    onClick={() => togglePosition(pos.value)}
                    className={cn(
                      "relative rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                      isSelected
                        ? isPrimary
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-border bg-surface text-muted-dark hover:border-brand-300"
                    )}
                  >
                    {isSelected && (
                      <Check className="inline-block h-3.5 w-3.5 mr-1" />
                    )}
                    {pos.label}
                    {isPrimary && (
                      <span className="ml-1 text-[10px] opacity-80">
                        (principal)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-muted">
              A primeira posição selecionada é sua posição principal.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={handleSave}
        disabled={!name.trim() || saved}
      >
        {saved ? (
          <>Salvo!</>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Salvar alterações
          </>
        )}
      </Button>
    </div>
  );
}
