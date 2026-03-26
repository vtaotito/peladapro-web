import Link from "next/link";
import {
  Goal,
  CheckCircle2,
  Shuffle,
  Radio,
  Trophy,
  Wallet,
  Gamepad2,
  ArrowRight,
  Star,
  Users,
  Zap,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  { value: "10k+", label: "Jogadores" },
  { value: "2k+", label: "Grupos" },
  { value: "50k+", label: "Partidas" },
  { value: "4.9", label: "Avaliação" },
];

const features = [
  {
    icon: CheckCircle2,
    title: "Confirmações",
    description:
      "Lista de presença automática com lembretes. Saiba quem vai e organize a lista de espera.",
    color: "text-brand-600",
    bg: "bg-brand-50",
  },
  {
    icon: Shuffle,
    title: "Sorteio de Times",
    description:
      "Sorteio inteligente baseado em overall e posição. Times equilibrados toda partida.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Radio,
    title: "Placar ao Vivo",
    description:
      "Registre gols, assistências e cartões em tempo real. Estatísticas completas.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: Trophy,
    title: "Rankings",
    description:
      "Rankings semanais e mensais. MVP, artilheiro, garçom e mais. Gamificação total.",
    color: "text-accent-600",
    bg: "bg-accent-50",
  },
  {
    icon: Wallet,
    title: "Financeiro",
    description:
      "Controle de mensalidades e pagamentos. Cobranças automáticas e histórico completo.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Gamepad2,
    title: "Gamificação",
    description:
      "Conquistas, badges e sequências de presença. Mantenha todos motivados e engajados.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const steps = [
  {
    number: "01",
    title: "Crie seu grupo",
    description: "Monte seu grupo de pelada e convide os boleiros.",
  },
  {
    number: "02",
    title: "Confirme presença",
    description: "Confirme sua presença e veja quem vai jogar.",
  },
  {
    number: "03",
    title: "Sorteie os times",
    description: "Deixe o algoritmo montar times equilibrados.",
  },
  {
    number: "04",
    title: "Jogue e registre",
    description: "Registre placar, gols e avaliações pós-jogo.",
  },
];

const testimonials = [
  {
    name: "Marcos Vinícius",
    role: "Organizador de pelada",
    text: "Acabou a dor de cabeça de organizar pelada pelo WhatsApp. Agora tá tudo no app, muito mais fácil!",
    rating: 5,
  },
  {
    name: "Thiago Souza",
    role: "Jogador amador",
    text: "O sorteio de times é sensacional! Nunca mais tivemos jogo desequilibrado. E o ranking motiva muito.",
    rating: 5,
  },
  {
    name: "André Lima",
    role: "Admin de 3 grupos",
    text: "O controle financeiro salvou minha vida. Chega de planilha e cobrança manual. Recomendo demais!",
    rating: 5,
  },
];

const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "para sempre",
    description: "Perfeito para começar",
    features: [
      "Até 1 grupo",
      "20 membros por grupo",
      "Confirmações de presença",
      "Sorteio básico de times",
      "Placar simples",
    ],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 29,90",
    period: "/mês",
    description: "Para organizadores dedicados",
    features: [
      "Até 5 grupos",
      "50 membros por grupo",
      "Tudo do Grátis",
      "Sorteio inteligente (overall)",
      "Rankings completos",
      "Controle financeiro",
      "Estatísticas detalhadas",
    ],
    cta: "Assinar Pro",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "R$ 59,90",
    period: "/mês",
    description: "Para ligas e torneios",
    features: [
      "Grupos ilimitados",
      "Membros ilimitados",
      "Tudo do Pro",
      "Torneios e campeonatos",
      "API personalizada",
      "Suporte prioritário",
      "Badge exclusiva",
    ],
    cta: "Assinar Premium",
    highlighted: false,
  },
];

const heroPlayers = [
  { initials: "VT", name: "Vitinho", pos: "MEI", ovr: 7.8 },
  { initials: "LK", name: "Lukinha", pos: "ATA", ovr: 8.2 },
  { initials: "RF", name: "Rafa", pos: "ZAG", ovr: 7.5 },
  { initials: "GB", name: "Gabigol", pos: "ATA", ovr: 8.5 },
  { initials: "DD", name: "Dedé", pos: "ZAG", ovr: 7.9 },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-surface">
      {/* Header */}
      <header className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-md">
              <Goal className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold">
              <span className="text-pitch">Pelada</span>
              <span className="text-brand-500">Pro</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Criar conta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-brand-100)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in">
              <Badge variant="pitch" className="mb-6 px-4 py-1.5 text-sm">
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                Novo: Sorteio inteligente com IA
              </Badge>
              <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Organize suas peladas{" "}
                <span className="text-gradient">como um profissional</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted sm:text-xl">
                Confirmações, sorteio de times equilibrados, placar ao vivo,
                rankings e financeiro. Tudo que sua pelada precisa em um só
                lugar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link href="/register">
                  <Button size="xl" className="w-full sm:w-auto">
                    Começar grátis
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    size="xl"
                    className="w-full sm:w-auto"
                  >
                    Ver funcionalidades
                  </Button>
                </Link>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                <Shield className="h-4 w-4 text-brand-500" />
                Grátis para sempre. Sem cartão de crédito.
              </p>
            </div>

            {/* Hero Card */}
            <div className="animate-slide-up hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-400/20 to-accent-400/20 blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
                  <div className="pitch-gradient px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/70">
                          Próxima pelada
                        </p>
                        <p className="font-display text-lg font-bold text-white">
                          Pelada do Parque
                        </p>
                      </div>
                      <Badge className="border-white/20 bg-white/15 text-white">
                        7x7
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-white/80">
                      <span>Sex, 28 Mar • 19h</span>
                      <span>•</span>
                      <span>14/14 confirmados</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-muted-dark">
                        Confirmados
                      </p>
                      <Badge variant="success">Lotado!</Badge>
                    </div>
                    <div className="space-y-2.5">
                      {heroPlayers.map((player) => (
                        <div
                          key={player.initials}
                          className="flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                              {player.initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {player.name}
                              </p>
                              <p className="text-xs text-muted">
                                {player.pos}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5">
                            <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                            <span className="text-xs font-bold text-brand-700">
                              {player.ovr}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-pitch sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-surface-secondary py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <Badge variant="pitch" className="mb-4">
              Funcionalidades
            </Badge>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Tudo que sua pelada precisa
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              Do convite ao apito final. Organize cada detalhe da sua pelada com
              ferramentas profissionais.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-surface p-6 transition-all hover:border-brand-200 hover:shadow-lg"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} transition-transform group-hover:scale-110`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="font-display text-lg font-bold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <Badge variant="pitch" className="mb-4">
              Como funciona
            </Badge>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Simples assim
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              Em 4 passos sua pelada está organizada. Sem complicação.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-brand-300 to-transparent lg:block" />
                )}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
                  <span className="font-display text-2xl font-extrabold text-brand-600">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-surface-secondary py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <Badge variant="pitch" className="mb-4">
              Depoimentos
            </Badge>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Quem usa, aprova
            </h2>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-accent-400 text-accent-400"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-dark">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <Badge variant="pitch" className="mb-4">
              Planos
            </Badge>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Escolha seu plano
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              Comece grátis e evolua conforme sua pelada crescer.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-6 transition-shadow hover:shadow-xl ${
                  plan.highlighted
                    ? "border-brand-500 bg-surface shadow-lg"
                    : "border-border bg-surface"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge variant="pitch" className="px-4 py-1 shadow-md">
                      Mais popular
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold text-pitch">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted">{plan.period}</span>
                  </div>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pitch-gradient py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Pronto para revolucionar sua pelada?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Junte-se a milhares de boleiros que já organizam suas peladas de
            forma profissional.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button
                size="xl"
                className="w-full bg-white text-pitch hover:bg-white/90 sm:w-auto"
              >
                Criar conta grátis
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <Goal className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">
                <span className="text-pitch">Pelada</span>
                <span className="text-brand-500">Pro</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted">
              <Link href="#" className="hover:text-pitch">
                Termos
              </Link>
              <Link href="#" className="hover:text-pitch">
                Privacidade
              </Link>
              <Link href="#" className="hover:text-pitch">
                Contato
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center">
            <p className="text-sm text-muted">
              &copy; {new Date().getFullYear()} Boleiros.app — Feito com ⚽ para
              boleiros
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
