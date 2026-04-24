"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft, BookOpen, Users, Loader2, PlayCircle, ChevronRight,
  FileText, Monitor, Calendar, Clock, GraduationCap, ChevronDown,
  Download,
} from "lucide-react"
import { api, type ApiEnrollment, type ApiSubject, type ApiMaterial } from "@/lib/api"

async function openProtectedMaterial(materialId: number) {
  // Abre janela ANTES do await para não ser bloqueado pelo iOS Safari
  const win = window.open("", "_blank")
  try {
    const { token } = await api.aluno.materials.requestDownload(materialId)
    const url = `${process.env.NEXT_PUBLIC_API_URL}/aluno/materials/${materialId}/download?token=${token}`
    if (win) {
      win.location.href = url
    } else {
      // fallback: navega na mesma aba (mobile que bloqueou popup)
      window.location.href = url
    }
  } catch (err: unknown) {
    win?.close()
    const msg = (err as { error?: string })?.error ?? "Erro ao abrir o material."
    alert(msg)
  }
}

function modalityMeta(type: string | number) {
  if (type === "online"  || type === 1) return { text: "Online",    color: "bg-blue-500/10 text-blue-500",    ctaText: "Assistir aulas",  CtaIcon: PlayCircle }
  if (type === "hibrido" || type === 2) return { text: "Híbrido",   color: "bg-violet-500/10 text-violet-500", ctaText: "Ver conteúdo",   CtaIcon: Monitor }
  return                                       { text: "Presencial", color: "bg-amber-500/10 text-amber-600",  ctaText: "Ver materiais",  CtaIcon: FileText }
}

// ─── Tipos para presencial ────────────────────────────────
type SubjectWithMaterials = ApiSubject & { materials: ApiMaterial[] }

const tipoConfig: Record<string, { color: string; bg: string }> = {
  pdf:       { color: "text-red-500",    bg: "bg-red-500/10" },
  slide:     { color: "text-blue-500",   bg: "bg-blue-500/10" },
  exercicio: { color: "text-orange-500", bg: "bg-orange-500/10" },
  link:      { color: "text-purple-500", bg: "bg-purple-500/10" },
}

// ─── Matéria accordion com materiais do professor ─────────
function SubjectAccordion({ subject, idx }: { subject: SubjectWithMaterials; idx: number }) {
  const [open, setOpen] = useState(idx === 0)
  const total = subject.materials.length

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/20"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {idx + 1}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground truncate">{subject.name}</h3>
            <p className="text-xs text-muted-foreground">
              {total} material{total !== 1 ? "is" : ""}
              {(subject.professors ?? [])[0] && ` · Prof. ${(subject.professors ?? [])[0].name?.split(" ")[0]}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(subject.professors ?? [])[0] && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              {(subject.professors ?? [])[0].name?.split(" ")[0]}
            </span>
          )}
          {open ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-4">
          {subject.materials.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Nenhum material disponível ainda para esta matéria.</p>
          ) : (
            <div className="space-y-2">
              {subject.materials.map((mat) => {
                const cfg = tipoConfig[mat.material_type] ?? tipoConfig.pdf
                const isLink = mat.material_type === "link"
                return (
                  <div key={mat.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                        <FileText className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{mat.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold uppercase ${cfg.color}`}>{mat.material_type}</span>
                          {mat.file_size && <span className="text-[10px] text-muted-foreground">{mat.file_size}</span>}
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(mat.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {mat.file_url && (
                      isLink ? (
                        <a
                          href={mat.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Acessar
                        </a>
                      ) : mat.material_type === "pdf" ? (
                        <button
                          onClick={() => openProtectedMaterial(mat.id)}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Abrir
                        </button>
                      ) : (
                        <a
                          href={mat.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Abrir
                        </a>
                      )
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────
export default function DisciplinasPage() {
  const params = useParams()
  const router = useRouter()
  const enrollmentId = params.enrollment_id as string

  const [loading, setLoading] = useState(true)
  const [enrollment, setEnrollment] = useState<ApiEnrollment | null>(null)
  // Online / Híbrido
  const [disciplinas, setDisciplinas] = useState<ApiSubject[]>([])
  // Presencial
  const [presencialData, setPresencialData] = useState<SubjectWithMaterials[]>([])

  const load = useCallback(async () => {
    try {
      const dashboard = await api.aluno.dashboard()
      const found = (dashboard.enrollments ?? []).find((e) => String(e.id) === enrollmentId)
      if (!found?.course) { router.push("/aluno/meus-cursos"); return }
      setEnrollment(found)

      const isPresencial = found.enrollment_type === "presencial" || found.enrollment_type === 0

      if (!isPresencial) {
        const subjects = await api.subjects.list(found.course.id)
        setDisciplinas(subjects)
        return
      }

      // Presencial: busca matérias + materiais do professor agrupados por matéria
      const [subjects, allMaterials] = await Promise.all([
        api.subjects.list(found.course.id),
        api.aluno.materials.list(found.course.id),
      ])

      const data: SubjectWithMaterials[] = subjects.map((subject) => ({
        ...subject,
        materials: allMaterials.filter((m) => m.subject_id === subject.id),
      }))
      setPresencialData(data)
    } catch (err) {
      console.error(err)
      router.push("/aluno/meus-cursos")
    } finally {
      setLoading(false)
    }
  }, [enrollmentId, router])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const modality = modalityMeta(enrollment?.enrollment_type ?? "presencial")
  const turma = enrollment?.turma
  const isPresencial = enrollment?.enrollment_type === "presencial" || enrollment?.enrollment_type === 0
  const isHibrido   = enrollment?.enrollment_type === "hibrido"    || enrollment?.enrollment_type === 2

  return (
    <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
      {/* Breadcrumb */}
      <Link href="/aluno/meus-cursos" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Meus Cursos
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${modality.color}`}>
            {modality.text}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{enrollment?.course?.title ?? "Curso"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isPresencial
            ? "Acesse os materiais organizados por matéria e tópico."
            : isHibrido
            ? "Acesse as aulas online e o cronograma das aulas presenciais."
            : "Escolha uma disciplina para começar a assistir."}
        </p>
      </div>

      {/* Turma info — híbrido */}
      {isHibrido && turma && (
        <div className="mb-8 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-violet-500" />
            <p className="text-sm font-bold text-violet-600">Aulas Presenciais — {turma.name}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {turma.schedule && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-violet-400" /><span>{turma.schedule}</span>
              </div>
            )}
            {(turma.start_date || turma.end_date) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-violet-400" /><span>{turma.start_date} — {turma.end_date}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Turma info — presencial */}
      {isPresencial && turma && (
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-bold text-amber-700">Turma — {turma.name}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {turma.schedule && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-amber-500" /><span>{turma.schedule}</span>
              </div>
            )}
            {(turma.start_date || turma.end_date) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-amber-500" /><span>{turma.start_date} — {turma.end_date}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PRESENCIAL — accordion Matéria → Tópico → PDFs ── */}
      {isPresencial ? (
        presencialData.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Nenhum material disponível</p>
              <p className="text-sm text-muted-foreground">As disciplinas ainda não foram vinculadas a este curso.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {presencialData.map((subject, idx) => (
              <SubjectAccordion key={subject.id} subject={subject} idx={idx} />
            ))}
          </div>
        )
      ) : (
        /* ── ONLINE / HÍBRIDO — grid de disciplinas ── */
        <>
          {isHibrido && (
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Conteúdo Online</p>
          )}
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
                      <modality.CtaIcon className="h-3 w-3" />
                      {modality.ctaText}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
