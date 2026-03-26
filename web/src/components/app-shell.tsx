"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Goal,
  Bell,
  Home,
  Users,
  Trophy,
  BellRing,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/groups", label: "Grupos", icon: Users },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/notifications", label: "Alertas", icon: BellRing },
  { href: "/profile", label: "Perfil", icon: UserCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col bg-surface-secondary">
      <header className="glass sticky top-0 z-50 border-b border-border-light">
        <div className="container-app flex h-14 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Goal className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold">
              <span className="text-pitch">Pelada</span>
              <span className="text-brand-500">Pro</span>
            </span>
          </Link>

          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-surface-tertiary">
            <Bell className="h-5 w-5 text-muted" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <div className="container-app py-4">{children}</div>
      </main>

      <nav className="glass fixed bottom-0 left-0 right-0 z-50 border-t border-border-light">
        <div className="container-app flex items-center justify-around py-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-brand-600"
                    : "text-muted hover:text-muted-dark"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -top-0 h-0.5 w-6 rounded-full bg-brand-600" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
