import Link from "next/link";
import { Goal } from "lucide-react";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-brand-50 via-surface to-accent-50 lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-pitch-dark lg:via-pitch lg:to-pitch-light lg:px-12">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-lg">
            <Goal className="h-10 w-10 text-white" />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-white">
            Organize suas peladas como um profissional
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Confirmações, sorteio de times, placar ao vivo, rankings e financeiro.
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-lg">
            <Goal className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-2xl font-bold">
            <span className="text-pitch">Pelada</span>
            <span className="text-brand-500">Pro</span>
          </span>
        </Link>

        <div className="w-full max-w-sm">{children}</div>

        <p className="mt-8 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Boleiros.app — Todos os direitos
          reservados
        </p>
      </div>
    </div>
  );
}
