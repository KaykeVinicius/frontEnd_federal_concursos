"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, BookOpen, Users, Loader2, PlayCircle, ChevronRight } from "lucide-react"
import { api, type ApiEnrollment, type ApiSubject } from "@/lib/api"

export default function DisciplinasPage() {
  const params = useParams()
  const router = useRouter()
  const enrollmentId = params.enrollment_id as string

  const [loading, setLoading] = useState(true)
  const [enrollment, setEnrollment] = useState<ApiEnrollment | null>(null)
  const [disciplinas, setDisciplinas] = useState<ApiSubject[]>([])

  useEffect(() => {
    async function load() {
      try {
        const dashboard = await api.aluno.dashboard()
        const enrollments = dashboard.enrollments ?? []
        const found = enrollments.find((e) => String(e.id) === enrollmentId)
        if (!found?.course) { router.push("/aluno/meus-cursos"); return }
        setEnrollment(found)
        const subjects = await api.subjects.list(found.course.id)
        setDisciplinas(subjects)
      } catch (err) {
        console.error(err)
        router.push("/aluno/meus-cursos")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [enrollmentId, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
      {/* Breadcrumb */}
      <Link
        href="/aluno/meus-cursos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Meus Cursos
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {enrollment?.course?.title ?? "Curso"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {enrollment?.turma?.name} · Escolha uma disciplina para começar
        </p>
      </div>

      {disciplinas.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhuma disciplina disponível</p>
            <p className="text-sm text-muted-foreground">As disciplinas ainda não foram vinculadas a este curso.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {disciplinas.map((disciplina, idx) => (
            <Link
              key={disciplina.id}
              href={`/aluno/meus-cursos/${enrollmentId}/${disciplina.id}`}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                  {idx + 1}
                </div>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {disciplina.name}
                </h3>
                {disciplina.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{disciplina.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {disciplina.professor && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    {disciplina.professor.name?.split(" ")[0]}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  <PlayCircle className="h-3 w-3" />
                  Assistir aulas
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
