"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Users,
  BookOpen,
  CalendarDays,
  Clock,
  Loader2,
  HelpCircle,
  FolderOpen,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  api,
  type ApiTurma,
  type ApiQuestion,
  type ApiEvent,
} from "@/lib/api"

export default function ProfessorDashboard() {
  const [loading, setLoading] = useState(true)
  const [profNome, setProfNome] = useState("Professor")
  const [turmas, setTurmas] = useState<ApiTurma[]>([])
  const [questions, setQuestions] = useState<ApiQuestion[]>([])
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [stats, setStats] = useState({
    turmas_count: 0,
    active_turmas_count: 0,
    courses_count: 0,
    subjects_count: 0,
    pending_questions_count: 0,
    total_students: 0,
  })

  useEffect(() => {
    // Lê o nome do usuário do localStorage (salvo no login)
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setProfNome(user.name?.split(" ")[0] ?? "Professor")
      } catch {}
    }

    // Carrega dados da API em paralelo
    Promise.all([
      api.professor.dashboard(),
      api.professor.turmas(),
      api.professor.questions("pending"),
      api.events.list(),
    ])
      .then(([dashboard, turmasData, questionsData, eventsData]) => {
        setStats(dashboard)
        setTurmas(turmasData)
        setQuestions(questionsData)
        setEvents(eventsData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const activeTurmas = turmas.filter(
    (t) => t.status === "em_andamento" || t.status === "aberta"
  )

  const upcomingEvents = events.filter((e) => e.status === "agendado").slice(0, 4)

  const answeredCount = questions.filter((q) => q.status === "answered").length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Watermark */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-[0.03] select-none">
        <Image
          src="/images/tigre_sem_fundo.png"
          alt=""
          width={700}
          height={350}
          className="max-w-[80vw]"
          style={{ width: "auto", height: "auto" }}
        />
      </div>

      <div className="relative z-10 min-h-screen p-4 pt-16 lg:p-8 lg:pt-8 space-y-6">

        {/* ── HERO ────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-orange-600 p-6 shadow-xl shadow-primary/20">
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute right-32 -bottom-8 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white/70 mb-1">Bem-vindo(a) de volta 👋</p>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">{profNome}</h1>
              <p className="mt-1 text-sm text-white/70">
                {stats.active_turmas_count} turma(s) ativa(s) · {stats.pending_questions_count} dúvida(s) pendente(s)
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Link
                href="/professor/duvidas"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-white/90 hover:-translate-y-0.5 shadow-lg"
              >
                <HelpCircle className="h-4 w-4" />
                Ver dúvidas
                {stats.pending_questions_count > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {stats.pending_questions_count}
                  </span>
                )}
              </Link>
              <Link
                href="/professor/materiais"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm border border-white/20 transition-all hover:bg-white/25 hover:-translate-y-0.5 shadow-lg"
              >
                <FolderOpen className="h-4 w-4" />
                Materiais presenciais
              </Link>
            </div>
          </div>
        </div>

        {/* ── STATS ───────────────────────────────────────────── */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Minhas Turmas",     value: stats.active_turmas_count,       icon: Users,       color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/20" },
            { label: "Meus Cursos",       value: stats.courses_count,             icon: BookOpen,    color: "text-blue-500",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
            { label: "Matérias",          value: stats.subjects_count,            icon: TrendingUp,  color: "text-green-500",   bg: "bg-green-500/10",   border: "border-green-500/20" },
            { label: "Dúvidas Pendentes", value: stats.pending_questions_count,   icon: HelpCircle,  color: "text-yellow-500",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`flex items-center gap-4 rounded-2xl border ${stat.border} bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5`}
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

        {/* ── DÚVIDAS PENDENTES ────────────────────────────────── */}
        {questions.length > 0 && (
          <div className="rounded-2xl border border-yellow-500/20 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-yellow-500" />
                <p className="text-sm font-semibold text-foreground">Dúvidas Aguardando Resposta</p>
              </div>
              <Link href="/professor/duvidas" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
                Ver todas <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {questions.slice(0, 3).map((q) => (
                <div
                  key={q.id}
                  className="flex items-start gap-3 rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                    <HelpCircle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {q.student?.name ?? "Aluno"}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {q.lesson?.title ?? q.subject?.name ?? ""}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{q.text}</p>
                  </div>
                  <Link
                    href="/professor/duvidas"
                    className="shrink-0 flex items-center gap-1 rounded-lg bg-yellow-500/10 px-2.5 py-1.5 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-500/20"
                  >
                    Responder
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BOTTOM ROW: Turmas + Eventos ────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Minhas Turmas */}
          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Minhas Turmas</p>
              <Link href="/professor/turmas" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
                Ver todas <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {activeTurmas.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhuma turma ativa.</p>
                </div>
              ) : (
                activeTurmas.slice(0, 3).map((turma) => (
                  <div
                    key={turma.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-all hover:border-primary/30 hover:bg-muted/60"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{turma.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{turma.course?.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {turma.schedule}
                        <span>·</span>
                        <Users className="h-3 w-3" /> {turma.enrolled_count}/{turma.max_students}
                      </div>
                    </div>
                    <Badge
                      className={
                        turma.status === "em_andamento"
                          ? "bg-blue-500/10 text-blue-600 border-0"
                          : "bg-green-500/10 text-green-600 border-0"
                      }
                    >
                      {turma.status === "em_andamento" ? "Em Andamento" : "Aberta"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Próximos Eventos</p>
              <Link href="/professor/eventos" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
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
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {event.date} · {event.start_time}–{event.end_time}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Dúvidas respondidas */}
              {answeredCount > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {answeredCount} dúvida(s) respondida(s)
                    </p>
                    <p className="text-xs text-muted-foreground">Alunos notificados automaticamente.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
