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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const [position, setPosition] = useState("MEI");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setNickname(user.nickname || currentUser.nickname);
      setEmail(user.email || "");
      setPosition(user.position || currentUser.position);
    }
  }, [user]);

  const handleSave = () => {
    updateUser({ name, nickname, email, position });
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
              Posição principal
            </label>
            <div className="flex flex-wrap gap-2">
              {positions.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setPosition(pos.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    position === pos.value
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-border bg-surface text-muted-dark hover:border-brand-300"
                  )}
                >
                  {pos.label}
                </button>
              ))}
            </div>
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
