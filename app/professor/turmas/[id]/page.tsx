"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft, Loader2, BookOpen, CalendarDays, Upload, Trash2,
  FileText, CheckCircle2, AlertCircle, Users, Clock, ChevronDown, ChevronRight,
} from "lucide-react"
import { api, type ApiTurma, type ApiTurmaClassDay, type ApiMaterial } from "@/lib/api"

// ─── helpers ──────────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })

export default function ProfessorTurmaDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const turmaId = Number(params.id)

  const [loading,     setLoading    ] = useState(true)
  const [turma,       setTurma      ] = useState<ApiTurma | null>(null)
  const [classDays,   setClassDays  ] = useState<ApiTurmaClassDay[]>([])
  const [materials,   setMaterials  ] = useState<ApiMaterial[]>([])
  const [error,       setError      ] = useState("")

  // professor atual
  const [professorId, setProfessorId] = useState<number | null>(null)

  // upload state
  const [uploading, setUploading] = useState<string | null>(null) // "dayId_subjectId"
  const [feedback,  setFeedback ] = useState<{ key: string; ok: boolean; msg: string } | null>(null)
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const pendingUpload = useRef<{ dayId: number; subjectId: number; turmaId: number } | null>(null)

  // accordion por mês
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    try {
      const stored = localStorage.getItem("currentUser")
      const me = stored ? JSON.parse(stored) : null
      setProfessorId(me?.id ?? null)

      const [t, days, mats] = await Promise.all([
        api.turmas.get(turmaId),
        api.turmas.classDays.list(turmaId),
        api.professor.materials.list(),
      ])
      setTurma(t)

      // Filtra apenas dias das matérias do professor
      const mySubjectIds = days
        .filter((d) => d.professor_id === (me?.id ?? null))
        .map((d) => d.subject_id)

      const myDays = me?.id
        ? days.filter((d) => d.professor_id === me.id)
        : days

      setClassDays(myDays)
      setMaterials(mats.filter((m) => m.turma_id === turmaId))

      // expande mês atual
      const thisMonth = new Date().toISOString().slice(0, 7)
      setExpandedMonths(new Set([thisMonth]))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.")
    } finally { setLoading(false) }
  }, [turmaId])

  useEffect(() => { if (turmaId) load() }, [load, turmaId])

  // ── upload ─────────────────────────────────────────────
  function triggerUpload(dayId: number, subjectId: number) {
    pendingUpload.current = { dayId, subjectId, turmaId }
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingUpload.current) return
    const { dayId, subjectId, turmaId: tid } = pendingUpload.current
    const key = `${dayId}_${subjectId}`

    // Pega o dia letivo para montar o título automático
    const day = classDays.find((d) => d.id === dayId)
    const autoTitle = day ? `${day.subject_name} — ${fmtDate(day.date)}` : file.name

    setUploading(key); setFeedback(null)
    try {
      const mat = await api.professor.materials.create({
        title:         autoTitle,
        material_type: "pdf",
        subject_id:    subjectId,
        turma_id:      tid,
        file,
      })
      setMaterials((prev) => [mat, ...prev])
      setFeedback({ key, ok: true, msg: "Material enviado com sucesso!" })
    } catch (err) {
      setFeedback({ key, ok: false, msg: err instanceof Error ? err.message : "Erro ao enviar." })
    } finally {
      setUploading(null)
      e.target.value = ""
    }
  }

  async function handleDeleteMaterial(id: number) {
    try {
      await api.professor.materials.delete(id)
      setMaterials((prev) => prev.filter((m) => m.id !== id))
    } catch { /* silent */ }
  }

  // ── materiais de um dia/matéria específico ─────────────
  function getMaterialsForDay(day: ApiTurmaClassDay) {
    return materials.filter((m) => m.subject_id === day.subject_id)
  }

  // ── agrupamento por mês ────────────────────────────────
  const daysByMonth = classDays.reduce<Record<string, ApiTurmaClassDay[]>>((acc, d) => {
    const month = d.date.slice(0, 7)
    if (!acc[month]) acc[month] = []
    acc[month].push(d)
    return acc
  }, {})

  function toggleMonth(m: string) {
    setExpandedMonths((prev) => {
      const s = new Set(prev)
      s.has(m) ? s.delete(m) : s.add(m)
      return s
    })
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  if (error) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="text-destructive">{error}</p>
      <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">Voltar</button>
    </div>
  )

  return (
    <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
      {/* input oculto */}
      <input ref={fileInputRef} type="file" accept="application/pdf,.pdf,.ppt,.pptx,.doc,.docx" className="hidden" onChange={handleFileChange} />

      {/* Breadcrumb */}
      <Link href="/professor/turmas" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Minhas Turmas
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {turma?.modalidade && (
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              turma.modalidade === "presencial" ? "bg-amber-500/10 text-amber-600" : "bg-violet-500/10 text-violet-600"
            }`}>
              {turma.modalidade === "presencial" ? "Presencial" : "Híbrido"}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{turma?.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{turma?.course?.title}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {turma?.schedule && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" />{turma.schedule}</span>}
          {turma?.enrolled_count != null && (
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" />{turma.enrolled_count} alunos</span>
          )}
          <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-primary" />{classDays.length} dias letivos</span>
        </div>
      </div>

      {/* Conteúdo principal */}
      {classDays.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhum dia letivo cadastrado</p>
            <p className="text-sm text-muted-foreground">
              Os dias letivos desta turma ainda não foram definidos.<br />
              Solicite ao gestor que cadastre no painel administrativo.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(daysByMonth).sort().map((month) => {
            const label  = new Date(`${month}-01`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
            const mParts = month.split("-")
            const isOpen = expandedMonths.has(month)
            const days   = daysByMonth[month]

            return (
              <div key={month} className="rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => toggleMonth(month)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                      {mParts[1]}
                    </div>
                    <span className="text-sm font-bold capitalize text-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground">{days.length} aula{days.length !== 1 ? "s" : ""}</span>
                  </div>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="divide-y divide-border">
                    {days.map((day) => {
                      const key         = `${day.id}_${day.subject_id}`
                      const isUploading = uploading === key
                      const fb          = feedback?.key === key ? feedback : null
                      const dayMats     = getMaterialsForDay(day)
                      const weekday     = new Date(day.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short" }).toUpperCase()
                      const dayNum      = new Date(day.date + "T00:00:00").getDate()

                      return (
                        <div key={day.id} className="px-5 py-4">
                          <div className="flex items-start gap-4">
                            {/* Data */}
                            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <span className="text-[10px] font-semibold leading-none">{weekday}</span>
                              <span className="text-lg font-bold leading-none">{dayNum}</span>
                            </div>

                            {/* Info + upload */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                                  <BookOpen className="h-3.5 w-3.5" />{day.subject_name}
                                </span>
                              </div>
                              {day.title && <p className="text-sm font-medium text-foreground">{day.title}</p>}
                              {day.description && <p className="text-xs text-muted-foreground mb-2">{day.description}</p>}
                              <p className="text-xs text-muted-foreground mb-3">{fmtDate(day.date)}</p>

                              {/* Materiais já enviados */}
                              {dayMats.length > 0 && (
                                <div className="mb-3 space-y-1.5">
                                  {dayMats.map((mat) => (
                                    <div key={mat.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                                          <FileText className="h-3.5 w-3.5 text-red-500" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="truncate text-xs font-medium text-foreground">{mat.title}</p>
                                          {mat.file_size && <p className="text-[10px] text-muted-foreground">{mat.file_size}</p>}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {mat.file_url && (
                                          <a
                                            href={mat.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] font-medium text-primary hover:underline"
                                          >
                                            Abrir
                                          </a>
                                        )}
                                        <button
                                          onClick={() => handleDeleteMaterial(mat.id)}
                                          className="flex h-6 w-6 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-400 hover:text-red-500 transition-colors"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Botão upload */}
                              <button
                                type="button"
                                disabled={isUploading}
                                onClick={() => triggerUpload(day.id, day.subject_id)}
                                className="flex items-center gap-1.5 rounded-xl border border-dashed border-primary/50 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                              >
                                {isUploading
                                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Enviando...</>
                                  : <><Upload className="h-3.5 w-3.5" />Enviar material</>
                                }
                              </button>

                              {fb && (
                                <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${fb.ok ? "text-green-600" : "text-red-500"}`}>
                                  {fb.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                  {fb.msg}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
