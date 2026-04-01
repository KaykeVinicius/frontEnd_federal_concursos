"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, PlayCircle, Loader2, GraduationCap, Clock, ChevronRight, CheckCircle } from "lucide-react"
import { api, type ApiEnrollment } from "@/lib/api"

export default function MeusCursosPage() {
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [completedLessons, setCompletedLessons] = useState<number[]>([])

  useEffect(() => {
    Promise.all([api.aluno.dashboard(), api.aluno.completions.list()])
      .then(([dashboard, completions]) => {
        setEnrollments(dashboard.enrollments ?? [])
        setCompletedLessons(completions.map((c) => c.lesson_id))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const ativos = enrollments.filter((e) => e.status === "active")
  const inativos = enrollments.filter((e) => e.status !== "active")

  return (
    <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
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
          {ativos.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Em andamento</h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {ativos.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} completedLessons={completedLessons} />
                ))}
              </div>
            </section>
          )}
          {inativos.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Concluídos / Cancelados</h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {inativos.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} completedLessons={completedLessons} inactive />
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
  completedLessons,
  inactive = false,
}: {
  enrollment: ApiEnrollment
  completedLessons: number[]
  inactive?: boolean
}) {
  const course = enrollment.course
  const turma = enrollment.turma
  const pct = 0 // Progress calculated per-course would require extra API calls; shown when entering course

  return (
    <Link
      href={`/aluno/meus-cursos/assistir?enrollment_id=${enrollment.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        inactive ? "opacity-60 hover:opacity-80" : "hover:border-primary/40"
      }`}
    >
      <div className={`h-1.5 w-full ${inactive ? "bg-muted-foreground/30" : "bg-primary"}`} />

      <div className="flex flex-1 flex-col p-5">
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
            {enrollment.status === "active" ? "Ativo" : enrollment.status === "expired" ? "Expirado" : "Cancelado"}
          </span>
          {pct === 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
        </div>

        <h3 className="mb-1 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {course?.title ?? "Curso"}
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">{turma?.name}</p>

        <div className="mt-auto space-y-1.5">
          {turma?.schedule && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>{turma.schedule}</span>
            </div>
          )}
          {turma && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              <span>{turma.start_date} — {turma.end_date}</span>
            </div>
          )}
        </div>
      </div>

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
