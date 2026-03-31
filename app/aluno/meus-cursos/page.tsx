"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  PlayCircle,
  Loader2,
  GraduationCap,
  Clock,
  ChevronRight,
  CheckCircle,
} from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import {
  mockStudents,
  getEnrollmentsByStudentId,
  getCourseById,
  getTurmaById,
  type SystemUser,
  type Enrollment,
} from "@/lib/mock-data"

// Mock de progresso por matrícula (substituir pela API futuramente)
const mockProgresso: Record<number, { concluidas: number; total: number }> = {
  1: { concluidas: 12, total: 48 },
  2: { concluidas: 3,  total: 36 },
}

export default function MeusCursosPage() {
  const [loading, setLoading]       = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      await fakeApiCall(null)
      const stored = localStorage.getItem("currentUser")
      if (stored) {
        const user: SystemUser = JSON.parse(stored)
        if (user.student_id) {
          const st = mockStudents.find((s) => s.id === user.student_id)
          if (st) { setEnrollments(getEnrollmentsByStudentId(st.id)) }
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const ativos   = enrollments.filter((e) => e.status === "active")
  const inativos = enrollments.filter((e) => e.status !== "active")

  return (
    <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Meus Cursos</h1>
        <p className="text-sm text-muted-foreground">
          {ativos.length} curso(s) ativo(s) · clique para assistir as aulas
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhum curso encontrado</p>
            <p className="text-sm text-muted-foreground">Você ainda não possui matrículas.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Cursos ativos */}
          {ativos.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Em andamento
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {ativos.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            </section>
          )}

          {/* Cursos inativos */}
          {inativos.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Concluídos / Cancelados
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {inativos.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} inactive />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function CourseCard({
  enrollment,
  inactive = false,
}: {
  enrollment: Enrollment
  inactive?: boolean
}) {
  const course    = getCourseById(enrollment.course_id)
  const turma     = getTurmaById(enrollment.turma_id)
  const progresso = mockProgresso[enrollment.id] ?? { concluidas: 0, total: 0 }
  const pct       = progresso.total > 0
    ? Math.round((progresso.concluidas / progresso.total) * 100)
    : 0

  return (
    <Link
      href="/aluno/meus-cursos/assistir"
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        inactive ? "opacity-60 hover:opacity-80" : "hover:border-primary/40"
      }`}
    >
      {/* Top color strip */}
      <div className={`h-1.5 w-full ${inactive ? "bg-muted-foreground/30" : "bg-primary"}`} />

      <div className="flex flex-1 flex-col p-5">
        {/* Status badge */}
        <div className="mb-3 flex items-center justify-between">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              enrollment.status === "active"
                ? "bg-green-500/10 text-green-600"
                : enrollment.status === "expired"
                ? "bg-gray-500/10 text-gray-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {enrollment.status === "active" ? "Ativo"
              : enrollment.status === "expired" ? "Expirado"
              : "Cancelado"}
          </span>
          {pct === 100 && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>

        {/* Title */}
        <h3 className="mb-1 text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
          {course?.title ?? "Curso"}
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">{turma?.name}</p>

        {/* Progress */}
        {progresso.total > 0 && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>{progresso.concluidas} de {progresso.total} aulas</span>
              <span className="font-semibold text-foreground">{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{turma?.schedule ?? "Horário a definir"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span>{turma?.start_date} — {turma?.end_date}</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      {!inactive && (
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <PlayCircle className="h-4 w-4" />
            Continuar assistindo
          </span>
          <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </Link>
  )
}
