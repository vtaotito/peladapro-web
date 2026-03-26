import Link from "next/link";
import { Goal } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-brand-50 via-surface to-accent-50">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
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
