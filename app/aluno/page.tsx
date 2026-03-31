"use client"

import { useEffect, useState } from "react"
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
import { fakeApiCall } from "@/lib/api"
import {
  mockStudents,
  mockEvents,
  getEnrollmentsByStudentId,
  getCourseById,
  getTurmaById,
  type SystemUser,
  type Student,
  type Enrollment,
} from "@/lib/mock-data"

// Mock weekly progress data (replace with API later)
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

const mockProgresso: Record<number, { concluidas: number; total: number }> = {
  1: { concluidas: 12, total: 48 },
  2: { concluidas: 3,  total: 36 },
}

export default function AlunoDashboard() {
  const [loading, setLoading]       = useState(true)
  const [student, setStudent]       = useState<Student | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      await fakeApiCall(null)
      const stored = localStorage.getItem("currentUser")
      if (stored) {
        const user: SystemUser = JSON.parse(stored)
        if (user.student_id) {
          const st = mockStudents.find((s) => s.id === user.student_id)
          if (st) {
            setStudent(st)
            setEnrollments(getEnrollmentsByStudentId(st.id))
          }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const activeEnrollments = enrollments.filter((e) => e.status === "active")
  const upcomingEvents = mockEvents.filter((e) => e.status === "agendado").slice(0, 2)

  // Overall progress
  const totalProgress = enrollments.reduce((acc, e) => {
    const p = mockProgresso[e.id] ?? { concluidas: 0, total: 0 }
    return { concluidas: acc.concluidas + p.concluidas, total: acc.total + p.total }
  }, { concluidas: 0, total: 0 })

  const overallPct = totalProgress.total > 0
    ? Math.round((totalProgress.concluidas / totalProgress.total) * 100)
    : 0

  const radialData = [{ name: "Progresso", value: overallPct, fill: "hsl(var(--primary))" }]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const firstName = student?.name.split(" ")[0] ?? "Aluno"

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image — watermark centralizado */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-[0.07] select-none">
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

      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Bem-vindo de volta 👋</p>
            <h1 className="text-3xl font-bold text-foreground">{firstName}</h1>
            <p className="text-sm text-muted-foreground">
              Você tem {activeEnrollments.length} curso(s) ativo(s) — continue estudando!
            </p>
          </div>
          <Link
            href="/aluno/meus-cursos"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 hover:-translate-y-0.5 sm:mt-0"
          >
            <PlayCircle className="h-4 w-4" />
            Continuar estudando
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Cursos Ativos",
              value: activeEnrollments.length,
              icon: BookOpen,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Aulas Assistidas",
              value: totalProgress.concluidas,
              icon: PlayCircle,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              label: "Próximos Eventos",
              value: upcomingEvents.length,
              icon: CalendarDays,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
            },
            {
              label: "Dias Seguidos",
              value: 5,
              icon: Flame,
              color: "text-rose-500",
              bg: "bg-rose-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="mb-6 grid gap-4 lg:grid-cols-3">

          {/* Weekly aulas chart */}
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
                    <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                  formatter={(v: number) => [`${v} aulas`, ""]}
                />
                <Area type="monotone" dataKey="aulas" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorAulas)" dot={{ r: 3, fill: "hsl(var(--primary))" }} />
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
                    background={{ fill: "hsl(var(--muted))" }}
                    dataKey="value"
                    cornerRadius={8}
                    angleAxisId={0}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{overallPct}%</span>
                <span className="text-xs text-muted-foreground">concluído</span>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Award className="h-3.5 w-3.5 text-primary" />
              {totalProgress.concluidas} de {totalProgress.total} aulas
            </div>
          </div>
        </div>

        {/* Monthly horas chart */}
        <div className="mb-6 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Evolução Mensal</p>
              <p className="text-xs text-muted-foreground">Horas de estudo nos últimos 6 meses</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={monthlyProgress} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                itemStyle={{ color: "#3b82f6" }}
                formatter={(v: number) => [`${v}h`, "Horas"]}
              />
              <Area type="monotone" dataKey="horas" stroke="#3b82f6" strokeWidth={2} fill="url(#colorHoras)" dot={{ r: 3, fill: "#3b82f6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom row: Meus cursos + Próximos eventos */}
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
              {activeEnrollments.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhum curso ativo no momento.</p>
                </div>
              ) : (
                activeEnrollments.slice(0, 3).map((enrollment) => {
                  const course   = getCourseById(enrollment.course_id)
                  const turma    = getTurmaById(enrollment.turma_id)
                  const prog     = mockProgresso[enrollment.id] ?? { concluidas: 0, total: 0 }
                  const pct      = prog.total > 0 ? Math.round((prog.concluidas / prog.total) * 100) : 0
                  return (
                    <Link
                      key={enrollment.id}
                      href="/aluno/meus-cursos/assistir"
                      className="group flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-all hover:border-primary/40 hover:bg-muted/60"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {course?.title ?? "Curso"}
                        </p>
                        <p className="text-xs text-muted-foreground">{turma?.name}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">{pct}%</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  )
                })
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

              {/* Streak card */}
              <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                  <Flame className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">5 dias seguidos!</p>
                  <p className="text-xs text-muted-foreground">Continue assim para manter sua sequência de estudos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
