"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  seedPlatformAdminIfNeeded,
  isPlatformAdminAccount,
  setAdminSessionCookie,
  PLATFORM_ADMIN_EMAIL,
} from "@/lib/platform-admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    seedPlatformAdminIfNeeded();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const em = email.trim().toLowerCase();
    if (!em) return setError("Informe o e-mail");
    if (!password) return setError("Informe a senha");

    setLoading(true);
    try {
      if (!isPlatformAdminAccount(em, password)) {
        setError("Apenas administradores da plataforma podem acessar este painel.");
        setLoading(false);
        return;
      }
      setAdminSessionCookie();
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0f1419] px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-900/40">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">PeladaPro</h1>
        <p className="mt-1 text-sm text-slate-500">Painel administrativo da plataforma</p>
      </div>

      <Card className="w-full max-w-md border-slate-800 bg-[#151b24] text-slate-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">Entrar como administrador</CardTitle>
          <CardDescription className="text-slate-500">
            Credenciais exclusivas do time de operação — não use a conta do app jogador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={PLATFORM_ADMIN_EMAIL}
                  className="border-slate-700 bg-[#0c0f14] pl-10 text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-700 bg-[#0c0f14] pl-10 pr-10 text-slate-100"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Acessar painel"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-slate-600">
        Conta padrão: <span className="text-slate-500">{PLATFORM_ADMIN_EMAIL}</span>
        <br />
        Altere a senha com variáveis de ambiente em produção.
      </p>
      <Link
        href="https://peladapro.cloud/login"
        className="mt-4 text-xs text-brand-500 hover:text-brand-400"
      >
        Ir para login do aplicativo (jogadores)
      </Link>
    </div>
  );
}
