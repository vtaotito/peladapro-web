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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/groups", label: "Grupos", icon: Users },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/notifications", label: "Alertas", icon: BellRing },
  { href: "/profile", label: "Perfil", icon: UserCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-dvh bg-surface-secondary">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 lg:border-r lg:border-border-light lg:bg-surface">
        <div className="flex h-16 items-center gap-2.5 px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-md">
              <Goal className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold">
              <span className="text-pitch">Pelada</span>
              <span className="text-brand-500">Pro</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-muted-dark hover:bg-surface-tertiary hover:text-pitch"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", isActive && "text-brand-600")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.label}
                {item.href === "/notifications" && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-danger" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-light px-3 py-4">
          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-dark transition-colors hover:bg-red-50 hover:text-danger"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile Header */}
        <header className="glass sticky top-0 z-50 border-b border-border-light lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <Goal className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">
                <span className="text-pitch">Pelada</span>
                <span className="text-brand-500">Pro</span>
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-surface-tertiary"
              >
                <Bell className="h-5 w-5 text-muted" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
              </Link>
              <button
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-surface-tertiary"
                title="Sair"
              >
                <LogOut className="h-4 w-4 text-muted" />
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex lg:sticky lg:top-0 lg:z-30 lg:h-16 lg:items-center lg:justify-between lg:border-b lg:border-border-light lg:bg-surface/80 lg:backdrop-blur-md lg:px-8">
          <div>
            <h2 className="font-display text-lg font-bold text-pitch">
              {navItems.find(
                (i) =>
                  pathname === i.href || pathname.startsWith(i.href + "/")
              )?.label || ""}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-surface-tertiary"
            >
              <Bell className="h-5 w-5 text-muted" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            </Link>
            {user && (
              <div className="flex items-center gap-2.5 rounded-xl bg-surface-tertiary px-3 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="container-app py-4 lg:py-6">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-50 border-t border-border-light lg:hidden">
        <div className="flex items-center justify-around py-1 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors",
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
