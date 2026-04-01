"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import {
  BookOpen,
  CalendarDays,
  Clock,
  Loader2,
  TrendingUp,
  PlayCircle,
  Award,
  ChevronRight,
  Flame,
  Radio,
  Zap,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts"
import { api, type AlunoDashboardResponse } from "@/lib/api"

const weeklyProgress = [
  { day: "Seg", aulas: 3 },
  { day: "Ter", aulas: 5 },
  { day: "Qua", aulas: 2 },
  { day: "Qui", aulas: 7 },
  { day: "Sex", aulas: 4 },
  { day: "Sáb", aulas: 6 },
  { day: "Dom", aulas: 1 },
]

const monthlyProgress = [
  { mes: "Out", horas: 12 },
  { mes: "Nov", horas: 18 },
  { mes: "Dez", horas: 15 },
  { mes: "Jan", horas: 22 },
  { mes: "Fev", horas: 28 },
  { mes: "Mar", horas: 31 },
]

export default function AlunoDashboard() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const chartColors = {
    grid:       isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    axis:       isDark ? "#6b7280" : "#9ca3af",
    card:       isDark ? "#1a1a1a" : "#ffffff",
    border:     isDark ? "#2a2a2a" : "#e5e7eb",
    foreground: isDark ? "#f1f1f1" : "#1a1a1a",
    muted:      isDark ? "#252525" : "#f1f1f1",
    primary:    "#e8491d",
    blue:       "#3b82f6",
  }

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AlunoDashboardResponse | null>(null)

  useEffect(() => {
    api.aluno.dashboard()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Erro ao carregar dados"))
      .finally(() => setLoading(false))
  }, [])

  const student = data?.student ?? null
  const enrollments = data?.enrollments ?? []
  const upcomingEvents = (data?.upcoming_events ?? []).filter((e) => e.status === "agendado").slice(0, 2)
  const lessonsCompleted = data?.lessons_completed ?? 0
  const activeEnrollmentsCount = data?.active_enrollments ?? 0

  // Progresso geral: sem dados por matrícula por enquanto
  const radialData = [{ name: "Progresso", value: 0, fill: "hsl(var(--primary))" }]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  const firstName = student?.name.split(" ")[0] ?? "Aluno"

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Watermark */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-[0.035] select-none">
        <Image
          src="/images/tigre_sem_fundo.png"
          alt=""
          width={700}
          height={350}
          className="max-w-[80vw]"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </div>

      <div className="relative z-10 min-h-screen p-4 pt-16 lg:p-8 lg:pt-8 space-y-6">

        {/* ── HERO HEADER ─────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-orange-600 p-6 shadow-xl shadow-primary/20">
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -right-4 top-20 h-32 w-32 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute right-32 -bottom-8 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white/70 mb-1">Bem-vindo de volta 👋</p>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">{firstName}</h1>
              <p className="mt-1 text-sm text-white/70">
                {activeEnrollmentsCount} curso(s) ativo(s) — continue estudando!
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <Link
                href="/aluno/ao-vivo"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-white/90 hover:-translate-y-0.5 shadow-lg"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Assistir ao Vivo
              </Link>
              <Link
                href="/aluno/meus-cursos/assistir"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm border border-white/20 transition-all hover:bg-white/25 hover:-translate-y-0.5 shadow-lg"
              >
                <PlayCircle className="h-4 w-4" />
                Continuar estudando
              </Link>
            </div>
          </div>
        </div>

        {/* ── AO VIVO BANNER ──────────────────────────────────── */}
        <Link
          href="/aluno/ao-vivo"
          className="group flex items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 transition-all hover:border-red-500/50 hover:bg-red-500/10"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/15 ring-2 ring-red-500/20">
            <Radio className="h-6 w-6 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-foreground">Aula Presencial — Ao Vivo</span>
              <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Clique para assistir a transmissão ao vivo da aula presencial em tempo real
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-red-500 group-hover:gap-2 transition-all">
            Assistir <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        {/* ── STATS ROW ───────────────────────────────────────── */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Cursos Ativos",
              value: activeEnrollmentsCount,
              icon: BookOpen,
              color: "text-primary",
              bg: "bg-primary/10",
              border: "border-primary/20",
            },
            {
              label: "Aulas Assistidas",
              value: lessonsCompleted,
              icon: PlayCircle,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              label: "Próximos Eventos",
              value: upcomingEvents.length,
              icon: CalendarDays,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
              border: "border-orange-500/20",
            },
            {
              label: "Dias Seguidos",
              value: 5,
              icon: Flame,
              color: "text-rose-500",
              bg: "bg-rose-500/10",
              border: "border-rose-500/20",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`group flex items-center gap-4 rounded-2xl border ${stat.border} bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ──────────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Weekly chart */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Aulas esta semana</p>
                <p className="text-xs text-muted-foreground">Número de aulas assistidas por dia</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <TrendingUp className="h-3.5 w-3.5" />
                28 aulas
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyProgress} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAulas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: chartColors.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: chartColors.card, border: `1px solid ${chartColors.border}`, borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: chartColors.foreground }}
                  itemStyle={{ color: chartColors.primary }}
                  formatter={(v: number) => [`${v} aulas`, ""]}
                />
                <Area type="monotone" dataKey="aulas" stroke={chartColors.primary} strokeWidth={2} fill="url(#colorAulas)" dot={{ r: 3, fill: chartColors.primary }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radial progress */}
          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <p className="text-sm font-semibold text-foreground self-start">Progresso Geral</p>
            <p className="text-xs text-muted-foreground self-start mb-2">Todas as matrículas</p>
            <div className="relative">
              <ResponsiveContainer width={160} height={160}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    background={{ fill: chartColors.muted }}
                    dataKey="value"
                    cornerRadius={8}
                    angleAxisId={0}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-foreground">{lessonsCompleted}</span>
                <span className="text-xs text-muted-foreground">aulas</span>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Award className="h-3.5 w-3.5 text-primary" />
              {lessonsCompleted} aula(s) concluída(s)
            </div>
          </div>
        </div>

        {/* Monthly chart */}
        <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Evolução Mensal</p>
              <p className="text-xs text-muted-foreground">Horas de estudo nos últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-500">
              <Zap className="h-3.5 w-3.5" />
              +10% este mês
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={monthlyProgress} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: chartColors.axis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: chartColors.card, border: `1px solid ${chartColors.border}`, borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: chartColors.foreground }}
                itemStyle={{ color: chartColors.blue }}
                formatter={(v: number) => [`${v}h`, "Horas"]}
              />
              <Area type="monotone" dataKey="horas" stroke="#3b82f6" strokeWidth={2} fill="url(#colorHoras)" dot={{ r: 3, fill: "#3b82f6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── BOTTOM ROW ──────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Meus Cursos */}
          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Meus Cursos</p>
              <Link href="/aluno/meus-cursos" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
                Ver todos <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {enrollments.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhum curso ativo no momento.</p>
                </div>
              ) : (
                enrollments.slice(0, 3).map((enrollment) => (
                  <Link
                    key={enrollment.id}
                    href="/aluno/meus-cursos/assistir"
                    className="group flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-all hover:border-primary/40 hover:bg-muted/60 hover:-translate-y-0.5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {enrollment.course?.title ?? "Curso"}
                      </p>
                      <p className="text-xs text-muted-foreground">{enrollment.turma?.name}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Próximos Eventos</p>
              <Link href="/aluno/eventos" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
                Ver todos <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhum evento agendado.</p>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                      <CalendarDays className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{event.description}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {event.date} · {event.start_time}–{event.end_time}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Streak */}
              <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                  <Flame className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">5 dias seguidos!</p>
                  <p className="text-xs text-muted-foreground">Continue assim para manter sua sequência.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
