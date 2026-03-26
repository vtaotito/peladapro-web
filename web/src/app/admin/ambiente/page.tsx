"use client";

import { Shield, Server, KeyRound, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM_ADMIN_EMAIL, getPlatformAdminInitialPassword } from "@/lib/platform-admin";

export default function AdminAmbientePage() {
  const hasCustomPassword =
    typeof process !== "undefined" &&
    Boolean(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_PASSWORD?.length);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Ambiente & acesso</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Configuração do administrador da plataforma e limitações do modo demonstração atual.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="font-medium text-slate-200">Dados por navegador</p>
          <p className="mt-1 text-xs text-slate-500">
            Usuários e sessão admin usam <code className="rounded bg-slate-800 px-1">localStorage</code>{" "}
            e cookies neste dispositivo. Outros operadores ou servidores não veem a mesma lista até
            você conectar o painel à API com banco de dados.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-800 bg-[#151b24] text-slate-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-brand-500" />
              <CardTitle className="text-base text-white">Conta administrador</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">E-mail (login do painel)</p>
              <p className="mt-1 font-mono text-sm text-brand-300">{PLATFORM_ADMIN_EMAIL}</p>
              <p className="mt-1 text-xs text-slate-500">
                Variável: <code className="rounded bg-slate-900 px-1">NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL</code>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Senha</p>
              <p className="mt-1 text-xs text-slate-400">
                {hasCustomPassword
                  ? "Definida em build via NEXT_PUBLIC_PLATFORM_ADMIN_PASSWORD."
                  : `Padrão de desenvolvimento: ${getPlatformAdminInitialPassword()}`}
              </p>
              {!hasCustomPassword && (
                <p className="mt-2 text-xs text-amber-400/90">
                  Em produção, defina senha forte nas variáveis de ambiente do deploy e não commite
                  segredos no repositório.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-[#151b24] text-slate-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-sky-500" />
              <CardTitle className="text-base text-white">Subdomínio</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-400">
            <p>
              URL recomendada:{" "}
              <strong className="text-slate-200">https://admin.peladapro.cloud</strong>
            </p>
            <p className="text-xs">
              O middleware do Next.js redireciona a raiz do host <code className="rounded bg-slate-900 px-1">admin.*</code>{" "}
              para <code className="rounded bg-slate-900 px-1">/admin</code>. Certificado SSL deve
              incluir <code className="rounded bg-slate-900 px-1">admin.peladapro.cloud</code> (já
              previsto no proxy Hostinger).
            </p>
            <p className="text-xs">
              Desenvolvimento local: use <code className="rounded bg-slate-900 px-1">admin.localhost:3000</code>{" "}
              (adicione no arquivo hosts se necessário).
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800 bg-[#151b24] text-slate-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base text-white">Próximos passos (produto)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm text-slate-400">
            <li>JWT + role PLATFORM_ADMIN validada no backend NestJS.</li>
            <li>Cookie de sessão admin <code className="rounded bg-slate-900 px-1">httpOnly</code> emitido pela API.</li>
            <li>Listagem de usuários com paginação e filtros no Postgres (Prisma).</li>
            <li>Auditoria: quem bloqueou/desbloqueou e quando.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
