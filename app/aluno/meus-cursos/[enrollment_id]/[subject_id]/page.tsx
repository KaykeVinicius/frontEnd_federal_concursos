"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, BookOpen, PlayCircle, ChevronRight, Loader2, Clock, FileText } from "lucide-react"
import { api, type ApiSubject, type ApiTopic, type ApiLesson, type ApiEnrollment } from "@/lib/api"

type TopicComAulas = ApiTopic & { aulas: ApiLesson[] }

export default function TopicosPage() {
  const params = useParams()
  const router = useRouter()
  const enrollmentId = params.enrollment_id as string
  const subjectId = Number(params.subject_id)

  const [loading, setLoading] = useState(true)
  const [enrollment, setEnrollment] = useState<ApiEnrollment | null>(null)
  const [subject, setSubject] = useState<ApiSubject | null>(null)
  const [topicos, setTopicos] = useState<TopicComAulas[]>([])

  useEffect(() => {
    async function load() {
      try {
        const dashboard = await api.aluno.dashboard()
        const found = (dashboard.enrollments ?? []).find((e) => String(e.id) === enrollmentId)
        if (!found?.course) { router.push(`/aluno/meus-cursos/${enrollmentId}`); return }
        setEnrollment(found)

        const subjects = await api.subjects.list(found.course.id)
        const foundSubject = subjects.find((s) => s.id === subjectId)
        if (!foundSubject) { router.push(`/aluno/meus-cursos/${enrollmentId}`); return }
        setSubject(foundSubject)

        const topics = await api.topics.list(subjectId)
        const topicsComAulas = await Promise.all(
          topics.map(async (t) => {
            const aulas = await api.aluno.lessons.list(t.id)
            return { ...t, aulas }
          })
        )
        setTopicos(topicsComAulas)
      } catch (err) {
        console.error(err)
        router.push(`/aluno/meus-cursos/${enrollmentId}`)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [enrollmentId, subjectId, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isPresencial = enrollment?.enrollment_type === "presencial" || enrollment?.enrollment_type === 0

  const totalAulas = topicos.reduce((acc, t) => acc + t.aulas.length, 0)

  return (
    <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
      {/* Breadcrumb */}
      <Link
        href={`/aluno/meus-cursos/${enrollmentId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Disciplinas
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{subject?.name ?? "Disciplina"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {topicos.length} tópico{topicos.length !== 1 ? "s" : ""} · {totalAulas} aula{totalAulas !== 1 ? "s" : ""}
          {isPresencial && " · somente materiais"}
        </p>
      </div>

      {topicos.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">Nenhum tópico disponível</p>
          <p className="text-sm text-muted-foreground">Os tópicos ainda não foram cadastrados para esta disciplina.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topicos.map((topico, idx) => {
            const primeiraAula = topico.aulas[0]
            const totalPdfs = topico.aulas.reduce((acc, a) => acc + (a.lesson_pdfs?.length ?? 0), 0)

            const href = primeiraAula
              ? `/aluno/meus-cursos/assistir?enrollment_id=${enrollmentId}&subject_id=${subjectId}&topic_id=${topico.id}`
              : "#"

            return (
              <Link
                key={topico.id}
                href={href}
                className={`group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg ${!primeiraAula ? "pointer-events-none opacity-50" : ""}`}
              >
                {/* Número */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                  {idx + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                    {topico.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {!isPresencial && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {topico.aulas.length} aula{topico.aulas.length !== 1 ? "s" : ""}
                        {topico.aulas[0]?.duration && ` · ${topico.aulas[0].duration}`}
                      </span>
                    )}
                    {totalPdfs > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        {totalPdfs} material{totalPdfs !== 1 ? "is" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ação */}
                {primeiraAula ? (
                  <span className="shrink-0 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary transition-all group-hover:bg-primary group-hover:text-white">
                    {isPresencial
                      ? <><FileText className="h-3.5 w-3.5" /> Materiais</>
                      : <><PlayCircle className="h-3.5 w-3.5" /> Assistir</>
                    }
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
                    Em breve
                  </span>
                )}

                <ChevronRight className="ml-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
