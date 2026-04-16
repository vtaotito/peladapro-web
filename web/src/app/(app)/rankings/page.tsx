"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function RankingsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Rankings</h1>
        <p className="text-sm text-muted">
          Ranking geral de todos os seus grupos
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-tertiary">
            <Trophy className="h-8 w-8 text-muted-light" />
          </div>
          <p className="font-display text-lg font-bold text-muted-dark">
            Jogue partidas para gerar rankings
          </p>
          <p className="mt-2 text-sm text-muted max-w-xs mx-auto">
            Os rankings serão gerados automaticamente conforme você joga partidas e registra resultados nos seus grupos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
