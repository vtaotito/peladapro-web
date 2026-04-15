"use client";

import { useState } from "react";
import {
  Bell,
  CalendarCheck,
  Wallet,
  Award,
  Users,
  CheckCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notifications as mockNotifications } from "@/lib/mock-data";

const typeIcons: Record<string, typeof Bell> = {
  match: CalendarCheck,
  payment: Wallet,
  award: Award,
  group: Users,
};

const typeColors: Record<string, { icon: string; bg: string }> = {
  match: { icon: "text-brand-600", bg: "bg-brand-50" },
  payment: { icon: "text-accent-600", bg: "bg-accent-50" },
  award: { icon: "text-purple-600", bg: "bg-purple-50" },
  group: { icon: "text-blue-600", bg: "bg-blue-50" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(() =>
    mockNotifications.map((n) => ({ ...n })),
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Notificações</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted">
              {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead}>
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="space-y-2.5 lg:max-w-2xl">
        {notifications.map((notification) => {
          const Icon = typeIcons[notification.type] || Bell;
          const colors = typeColors[notification.type] || {
            icon: "text-muted",
            bg: "bg-surface-tertiary",
          };

          return (
            <Card
              key={notification.id}
              className={cn(
                "transition-all",
                !notification.read && "border-brand-200 bg-brand-50/20"
              )}
            >
              <CardContent className="flex gap-3.5 p-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    colors.bg
                  )}
                >
                  <Icon className={cn("h-5 w-5", colors.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        !notification.read && "text-pitch"
                      )}
                    >
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    {notification.message}
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted-light">
                    {notification.time}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-tertiary">
            <Bell className="h-8 w-8 text-muted-light" />
          </div>
          <p className="font-display font-bold text-muted-dark">
            Nenhuma notificação
          </p>
          <p className="mt-1 text-sm text-muted">
            Você será notificado sobre peladas, pagamentos e premiações.
          </p>
        </div>
      )}
    </div>
  );
}
