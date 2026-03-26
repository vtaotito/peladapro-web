"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  LogOut,
  ExternalLink,
  Building2,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAdminSessionCookie } from "@/lib/platform-admin";

const nav = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/groups", label: "Grupos", icon: Building2 },
  { href: "/admin/ambiente", label: "Ambiente", icon: Settings2 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearAdminSessionCookie();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-[#0f1419] text-slate-100">
      <div className="flex min-h-dvh">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-[#0c0f14] lg:flex">
          <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-white">PeladaPro</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Administração
              </p>
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 p-3">
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-600/20 text-brand-400"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-800 p-3 space-y-1">
            <a
              href="https://peladapro.cloud/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              App público
            </a>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-950/40"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair do painel
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-800 bg-[#0f1419] lg:hidden">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-500" />
                <span className="font-display text-sm font-bold">PeladaPro Admin</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex gap-1 overflow-x-auto border-t border-slate-800/80 px-2 pb-2 pt-1">
              {nav.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium",
                      active ? "bg-brand-600/25 text-brand-400" : "text-slate-500",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
