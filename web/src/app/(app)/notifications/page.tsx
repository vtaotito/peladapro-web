"use client";

import {
  Bell,
} from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Notificações</h1>
      </div>

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
    </div>
  );
}
