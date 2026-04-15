"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Moon,
  Globe,
  Shield,
  LogOut,
  Trash2,
  ChevronRight,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { readAccounts, writeAccounts, normalizeEmail } from "@/lib/account-storage";

const SETTINGS_KEY = "peladapro_settings";

interface AppSettings {
  notifications: { matches: boolean; payments: boolean; awards: boolean; groupUpdates: boolean };
  privacy: { showProfile: boolean; showStats: boolean };
}

const defaultSettings: AppSettings = {
  notifications: { matches: true, payments: true, awards: true, groupUpdates: false },
  privacy: { showProfile: true, showStats: true },
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return defaultSettings;
  }
}

function persistSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        enabled ? "bg-brand-600" : "bg-border-strong"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(defaultSettings.notifications);
  const [privacy, setPrivacy] = useState(defaultSettings.privacy);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const saved = loadSettings();
    setNotifications(saved.notifications);
    setPrivacy(saved.privacy);
  }, []);

  const updateNotifications = useCallback((updater: (prev: typeof notifications) => typeof notifications) => {
    setNotifications((prev) => {
      const next = updater(prev);
      persistSettings({ notifications: next, privacy });
      return next;
    });
  }, [privacy]);

  const updatePrivacy = useCallback((updater: (prev: typeof privacy) => typeof privacy) => {
    setPrivacy((prev) => {
      const next = updater(prev);
      persistSettings({ notifications, privacy: next });
      return next;
    });
  }, [notifications]);

  return (
    <div className="space-y-5 animate-fade-in lg:max-w-2xl lg:mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-display text-xl font-bold">Configurações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-muted" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                <Smartphone className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Peladas e jogos</p>
                <p className="text-xs text-muted">
                  Confirmações, lembretes, sorteios
                </p>
              </div>
            </div>
            <Toggle
              enabled={notifications.matches}
              onToggle={() =>
                updateNotifications((s) => ({ ...s, matches: !s.matches }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50">
                <Mail className="h-4 w-4 text-accent-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Pagamentos</p>
                <p className="text-xs text-muted">
                  Cobranças, recibos, vencimentos
                </p>
              </div>
            </div>
            <Toggle
              enabled={notifications.payments}
              onToggle={() =>
                updateNotifications((s) => ({ ...s, payments: !s.payments }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                <Bell className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Premiações</p>
                <p className="text-xs text-muted">MVP, artilheiro, conquistas</p>
              </div>
            </div>
            <Toggle
              enabled={notifications.awards}
              onToggle={() =>
                updateNotifications((s) => ({ ...s, awards: !s.awards }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Atualizações do grupo</p>
                <p className="text-xs text-muted">
                  Novos membros, mensagens do mural
                </p>
              </div>
            </div>
            <Toggle
              enabled={notifications.groupUpdates}
              onToggle={() =>
                updateNotifications((s) => ({
                  ...s,
                  groupUpdates: !s.groupUpdates,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-muted" />
            Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <Eye className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Perfil público</p>
                <p className="text-xs text-muted">
                  Outros jogadores podem ver seu perfil
                </p>
              </div>
            </div>
            <Toggle
              enabled={privacy.showProfile}
              onToggle={() =>
                updatePrivacy((s) => ({ ...s, showProfile: !s.showProfile }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-tertiary">
                {privacy.showStats ? (
                  <Eye className="h-4 w-4 text-muted-dark" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Mostrar estatísticas</p>
                <p className="text-xs text-muted">
                  Gols, assistências e overall visíveis
                </p>
              </div>
            </div>
            <Toggle
              enabled={privacy.showStats}
              onToggle={() =>
                updatePrivacy((s) => ({ ...s, showStats: !s.showStats }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {user && (
            <div className="rounded-lg bg-surface-secondary px-3 py-2.5">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full justify-between"
            size="lg"
            onClick={logout}
          >
            <span className="flex items-center gap-2 text-muted-dark">
              <LogOut className="h-4 w-4" />
              Sair da conta
            </span>
            <ChevronRight className="h-4 w-4 text-muted-light" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between border-red-200 hover:bg-red-50"
            size="lg"
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
          >
            <span className="flex items-center gap-2 text-danger">
              <Trash2 className="h-4 w-4" />
              Excluir conta
            </span>
            <ChevronRight className="h-4 w-4 text-red-300" />
          </Button>

          {showDeleteConfirm && (
            <Card className="border-danger/30 bg-danger-light animate-slide-down">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-semibold text-danger">
                  Tem certeza?
                </p>
                <p className="mt-1 text-xs text-muted">
                  Esta ação é irreversível. Todos os seus dados serão apagados.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (user?.email) {
                        const accounts = readAccounts();
                        delete accounts[normalizeEmail(user.email)];
                        writeAccounts(accounts);
                      }
                      localStorage.removeItem("peladapro_user");
                      localStorage.removeItem("peladapro_settings");
                      logout();
                    }}
                  >
                    Confirmar exclusão
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted pb-4">
        PeladaPro v1.0.0
      </p>
    </div>
  );
}
