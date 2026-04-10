"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, PlayCircle, Loader2, GraduationCap, Clock, ChevronRight, Monitor, FileText } from "lucide-react"
import { api, type ApiEnrollment } from "@/lib/api"

function modalityLabel(type: string | number) {
  if (type === "online"   || type === 1) return { text: "Online",    color: "bg-blue-500/10 text-blue-500" }
  if (type === "hibrido"  || type === 2) return { text: "Híbrido",   color: "bg-violet-500/10 text-violet-500" }
  return { text: "Presencial", color: "bg-amber-500/10 text-amber-600" }
}

function ctaLabel(type: string | number) {
  if (type === "online"  || type === 1) return { text: "Assistir aulas",   icon: PlayCircle }
  if (type === "hibrido" || type === 2) return { text: "Ver conteúdo",     icon: Monitor }
  return { text: "Ver materiais", icon: FileText }
}

export default function MeusCursosPage() {
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])

  useEffect(() => {
    api.aluno.dashboard()
      .then((dashboard) => setEnrollments(dashboard.enrollments ?? []))
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
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            </section>
          )}
          {inativos.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Concluídos / Cancelados</h2>
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
  enrollment: ApiEnrollment
  inactive?: boolean
}) {
  const course = enrollment.course
  const turma = enrollment.turma

  return (
    <Link
      href={`/aluno/meus-cursos/${enrollment.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        inactive ? "opacity-60 hover:opacity-80" : "hover:border-primary/40"
      }`}
    >
      <div className={`h-1.5 w-full ${inactive ? "bg-muted-foreground/30" : "bg-primary"}`} />

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
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
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${modalityLabel(enrollment.enrollment_type).color}`}>
            {modalityLabel(enrollment.enrollment_type).text}
          </span>
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

      {!inactive && (() => {
        const cta = ctaLabel(enrollment.enrollment_type)
        return (
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <cta.icon className="h-4 w-4" />
              {cta.text}
            </span>
            <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
          </div>
        )
      })()}
    </Link>
  )
}
