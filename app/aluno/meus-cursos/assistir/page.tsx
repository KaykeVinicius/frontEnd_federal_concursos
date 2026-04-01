"use client"

import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft, ChevronRight, PlayCircle, FileText, CheckCircle, Lock, Download, Search,
  Maximize2, Minimize2, X, PenLine, Clock, BookOpen, BarChart2, HelpCircle, Send,
  CheckCheck, AlertCircle, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type ApiSubject, type ApiTopic, type ApiLesson, type ApiQuestion, type ApiEnrollment } from "@/lib/api"

// ─── Types ────────────────────────────────────────────────
type Disciplina = ApiSubject & {
  topicos: (ApiTopic & { aulas: ApiLesson[] })[]
}

// ─── Watermark CPF ────────────────────────────────────────
function CpfWatermark({ cpf }: { cpf: string }) {
  if (!cpf) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden select-none">
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="absolute text-white/[0.07] text-sm font-bold tracking-widest"
          style={{ top: `${Math.floor(i / 3) * 33 + 12}%`, left: `${(i % 3) * 33 + 2}%`, transform: "rotate(-25deg)", whiteSpace: "nowrap" }}
        >
          {cpf}
        </span>
      ))}
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────
type SidebarView = "disciplinas" | "topicos" | "aulas"

function CourseSidebar({
  disciplinas, aulaAtiva, concluidas, onSelect,
}: {
  disciplinas: Disciplina[]
  aulaAtiva: ApiLesson | null
  concluidas: number[]
  onSelect: (a: ApiLesson) => void
}) {
  const [view, setView] = useState<SidebarView>("disciplinas")
  const [discAtiva, setDiscAtiva] = useState<Disciplina | null>(disciplinas[0] ?? null)
  const [topicoAtivo, setTopicoAtivo] = useState<(ApiTopic & { aulas: ApiLesson[] }) | null>(disciplinas[0]?.topicos[0] ?? null)
  const [search, setSearch] = useState("")

  const filteredDisc = useMemo(
    () => disciplinas.filter((d) => d.name.toLowerCase().includes(search.toLowerCase())), [disciplinas, search]
  )
  const filteredTopicos = useMemo(
    () => (discAtiva?.topicos ?? []).filter((t) => t.title.toLowerCase().includes(search.toLowerCase())), [discAtiva, search]
  )
  const filteredAulas = useMemo(
    () => (topicoAtivo?.aulas ?? []).filter((a) => a.title.toLowerCase().includes(search.toLowerCase())), [topicoAtivo, search]
  )

  function goToDisc(d: Disciplina) { setDiscAtiva(d); setSearch(""); setView("topicos") }
  function goToTopico(t: ApiTopic & { aulas: ApiLesson[] }) { setTopicoAtivo(t); setSearch(""); setView("aulas") }
  function goBack() { setSearch(""); setView(view === "aulas" ? "topicos" : "disciplinas") }

  const title = view === "disciplinas" ? "Disciplinas" : view === "topicos" ? (discAtiva?.name ?? "") : (topicoAtivo?.title ?? "")
  const placeholder = view === "disciplinas" ? "Pesquisar por disciplina" : view === "topicos" ? "Pesquisar por tópico" : "Pesquisar por aula"

  return (
    <div className="flex h-full flex-col bg-zinc-900">
      <div className="border-b border-zinc-800 p-3">
        {view !== "disciplinas" && (
          <button onClick={goBack} className="mb-2 flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-200">
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar
          </button>
        )}
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{title}</p>
      </div>

      <div className="border-b border-zinc-800 p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-8 pr-3 text-xs text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === "disciplinas" && (
          <div className="divide-y divide-zinc-800/50">
            {filteredDisc.map((d) => {
              const totalAulas = d.topicos.flatMap((t) => t.aulas).length
              const concluídasDisc = d.topicos.flatMap((t) => t.aulas).filter((a) => concluidas.includes(a.id)).length
              const pct = totalAulas > 0 ? Math.round((concluídasDisc / totalAulas) * 100) : 0
              return (
                <button key={d.id} onClick={() => goToDisc(d)} className="flex w-full flex-col gap-2 px-3 py-3 text-left transition-colors hover:bg-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">{d.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-[10px] text-zinc-600">
                      <span>{pct}% concluído</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </button>
              )
            })}
            {filteredDisc.length === 0 && <p className="px-3 py-8 text-center text-xs text-zinc-600">Nenhuma disciplina encontrada</p>}
          </div>
        )}

        {view === "topicos" && (
          <div className="divide-y divide-zinc-800/50">
            {filteredTopicos.map((t, i) => (
              <button key={t.id} onClick={() => goToTopico(t)} className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-zinc-800/60">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-snug text-zinc-300">{t.title}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-600">{t.aulas.length} aula(s)</p>
                </div>
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
              </button>
            ))}
          </div>
        )}

        {view === "aulas" && (
          <div className="divide-y divide-zinc-800/50">
            {filteredAulas.map((aula, i) => {
              const ativa = aulaAtiva?.id === aula.id
              const feita = concluidas.includes(aula.id)
              return (
                <button
                  key={aula.id} disabled={!aula.available} onClick={() => aula.available && onSelect(aula)}
                  className={cn(
                    "flex w-full items-start gap-3 px-3 py-3 text-left transition-all",
                    ativa ? "border-l-2 border-primary bg-primary/10" : "border-l-2 border-transparent hover:bg-zinc-800/60",
                    !aula.available && "cursor-not-allowed opacity-30"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {!aula.available ? <Lock className="h-3.5 w-3.5 text-zinc-600" /> :
                      feita ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> :
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">{i + 1}</span>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-xs leading-snug", ativa ? "font-semibold text-white" : "text-zinc-300")}>
                      {i + 1} - {aula.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-600">
                      <Clock className="h-3 w-3" /> {aula.duration}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Página principal ──────────────────────────────────────
type RightTab = "video" | "pdf" | "anotacoes" | "duvidas"

function AssistirInner() {
  const searchParams = useSearchParams()
  const enrollmentId = searchParams.get("enrollment_id")

  const [loading, setLoading] = useState(true)
  const [enrollment, setEnrollment] = useState<ApiEnrollment | null>(null)
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [aulaAtiva, setAulaAtiva] = useState<ApiLesson | null>(null)
  const [concluidas, setConcluidas] = useState<number[]>([])
  const [completionIds, setCompletionIds] = useState<Record<number, number>>({}) // lesson_id → completion_id
  const [rightTab, setRightTab] = useState<RightTab>("video")
  const [fullscreen, setFullscreen] = useState(false)
  const [anotacao, setAnotacao] = useState("")
  const [cpf, setCpf] = useState("")
  const [nomeAluno, setNomeAluno] = useState("Aluno")
  const [sidebarTab, setSidebarTab] = useState<"aulas" | "cronograma">("aulas")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Dúvidas
  const [textoDuvida, setTextoDuvida] = useState("")
  const [momentoDuvida, setMomentoDuvida] = useState("")
  const [duvidaEnviada, setDuvidaEnviada] = useState(false)
  const [minhasDuvidas, setMinhasDuvidas] = useState<ApiQuestion[]>([])
  const [sendingDuvida, setSendingDuvida] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      const user = JSON.parse(stored)
      setCpf(user.cpf || user.email || "")
      setNomeAluno(user.name || "Aluno")
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        // Get enrollments from dashboard
        const [dashboard, completions] = await Promise.all([
          api.aluno.dashboard(),
          api.aluno.completions.list(),
        ])

        const enrollments = dashboard.enrollments ?? []
        let activeEnrollment = enrollments.find((e) => e.status === "active")
        if (enrollmentId) {
          activeEnrollment = enrollments.find((e) => String(e.id) === enrollmentId) ?? activeEnrollment
        }

        if (!activeEnrollment?.course) { setLoading(false); return }
        setEnrollment(activeEnrollment)

        // Build completion maps
        const completedIds = completions.map((c) => c.lesson_id)
        const completionMap: Record<number, number> = {}
        completions.forEach((c) => { completionMap[c.lesson_id] = c.id })
        setConcluidas(completedIds)
        setCompletionIds(completionMap)

        // Load subjects for course
        const subjects = await api.subjects.list(activeEnrollment.course.id)

        // Load topics + lessons for all subjects in parallel
        const disciplinasComConteudo = await Promise.all(
          subjects.map(async (subject) => {
            const topics = await api.topics.list(subject.id)
            const topicsComAulas = await Promise.all(
              topics.map(async (topic) => {
                const aulas = await api.lessons.list(topic.id)
                return { ...topic, aulas }
              })
            )
            return { ...subject, topicos: topicsComAulas }
          })
        )

        setDisciplinas(disciplinasComConteudo)

        // Set first available lesson
        const primeiraAula = disciplinasComConteudo
          .flatMap((d) => d.topicos)
          .flatMap((t) => t.aulas)
          .find((a) => a.available)
        if (primeiraAula) setAulaAtiva(primeiraAula)
      } catch (err) {
        console.error("Erro ao carregar curso:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [enrollmentId])

  const loadDuvidas = useCallback(async () => {
    try {
      const questions = await api.aluno.questions()
      setMinhasDuvidas(questions)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (rightTab === "duvidas") loadDuvidas()
  }, [rightTab, loadDuvidas])

  const todasAulas = useMemo(
    () => disciplinas.flatMap((d) => d.topicos).flatMap((t) => t.aulas),
    [disciplinas]
  )

  const isConcluida = aulaAtiva ? concluidas.includes(aulaAtiva.id) : false
  const aulaIdx = aulaAtiva ? todasAulas.findIndex((a) => a.id === aulaAtiva.id) : -1
  const proxima = aulaIdx >= 0 ? todasAulas[aulaIdx + 1] : null
  const anterior = aulaIdx > 0 ? todasAulas[aulaIdx - 1] : null

  const embedSrc = aulaAtiva
    ? `https://www.youtube.com/embed/${aulaAtiva.youtube_id}?rel=0&modestbranding=1&iv_load_policy=3&color=white&showinfo=0&autoplay=1`
    : ""

  async function toggleConcluida() {
    if (!aulaAtiva) return
    if (isConcluida) {
      const completionId = completionIds[aulaAtiva.id]
      if (completionId) {
        await api.aluno.completions.delete(completionId)
        setConcluidas((p) => p.filter((x) => x !== aulaAtiva.id))
        setCompletionIds((p) => { const n = { ...p }; delete n[aulaAtiva.id]; return n })
      }
    } else {
      const created = await api.aluno.completions.create(aulaAtiva.id)
      setConcluidas((p) => [...p, aulaAtiva.id])
      setCompletionIds((p) => ({ ...p, [aulaAtiva.id]: created.id }))
    }
  }

  function getDisciplinaFromAula(aulaId: number) {
    return disciplinas.find((d) => d.topicos.some((t) => t.aulas.some((a) => a.id === aulaId)))
  }

  async function enviarDuvida() {
    if (!textoDuvida.trim() || !aulaAtiva) return
    const disc = getDisciplinaFromAula(aulaAtiva.id)
    if (!disc?.professor_id) return
    setSendingDuvida(true)
    try {
      await api.aluno.createQuestion({
        professor_id: disc.professor_id,
        lesson_id: aulaAtiva.id,
        subject_id: disc.id,
        text: textoDuvida.trim(),
        video_moment: momentoDuvida.trim() || undefined,
      })
      setTextoDuvida("")
      setMomentoDuvida("")
      setDuvidaEnviada(true)
      await loadDuvidas()
      setTimeout(() => setDuvidaEnviada(false), 4000)
    } catch (err) {
      console.error("Erro ao enviar dúvida:", err)
    } finally {
      setSendingDuvida(false)
    }
  }

  const rightTabs = [
    { key: "video" as RightTab, label: "Vídeo", icon: PlayCircle },
    { key: "pdf" as RightTab, label: "PDF", icon: FileText },
    { key: "anotacoes" as RightTab, label: "Anotações", icon: PenLine },
    { key: "duvidas" as RightTab, label: "Dúvidas", icon: HelpCircle },
  ]

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!aulaAtiva || disciplinas.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-300">
        <BookOpen className="h-12 w-12 text-zinc-700" />
        <p className="text-sm">Nenhuma aula disponível para este curso.</p>
        <Link href="/aluno/meus-cursos" className="text-xs text-primary hover:underline">← Voltar para Meus Cursos</Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">

      {/* Fullscreen */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex bg-black">
          <button onClick={() => setFullscreen(false)} className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-300 backdrop-blur-sm transition hover:bg-zinc-800 hover:text-white">
            <Minimize2 className="h-4 w-4" />
          </button>
          <div className="relative flex-1">
            <iframe key={`fs-${aulaAtiva.id}`} className="h-full w-full" src={embedSrc} title={aulaAtiva.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            <CpfWatermark cpf={cpf} />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3">
        <Link href="/aluno/meus-cursos" className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-200">
          <ChevronLeft className="h-4 w-4" />
          <span>Meus Cursos</span>
        </Link>
        <p className="hidden max-w-sm truncate text-center text-xs font-semibold text-zinc-400 sm:block">{aulaAtiva.title}</p>
        <button onClick={() => setMobileSidebarOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 lg:hidden">
          <BookOpen className="h-3.5 w-3.5" /> Conteúdo
        </button>
        <div className="hidden lg:block w-32" />
      </header>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative z-50 flex w-80 flex-col bg-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
              <p className="text-xs font-bold text-zinc-300">Selecione o conteúdo</p>
              <button onClick={() => setMobileSidebarOpen(false)}><X className="h-4 w-4 text-zinc-500" /></button>
            </div>
            <CourseSidebar disciplinas={disciplinas} aulaAtiva={aulaAtiva} concluidas={concluidas} onSelect={(a) => { setAulaAtiva(a); setRightTab("video"); setMobileSidebarOpen(false) }} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — conteúdo */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Tabs */}
          <div className="flex shrink-0 items-center border-b border-zinc-800 bg-zinc-900 px-4">
            {rightTabs.map((tab) => (
              <button key={tab.key} onClick={() => setRightTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                  rightTab === tab.key ? "border-primary text-primary" : "border-transparent text-zinc-600 hover:text-zinc-400"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />{tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto">

            {/* ABA: VÍDEO */}
            {rightTab === "video" && (
              <>
                <div className="w-full bg-black">
                  <div className="relative mx-auto w-full" style={{ paddingBottom: "56.25%" }}>
                    <iframe key={aulaAtiva.id} className="absolute inset-0 h-full w-full" src={embedSrc} title={aulaAtiva.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    <CpfWatermark cpf={cpf} />
                    <button onClick={() => setFullscreen(true)} className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-zinc-400 backdrop-blur-sm transition hover:bg-zinc-800 hover:text-white" title="Expandir">
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-4 p-4 lg:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                        {enrollment?.course?.title}
                      </p>
                      <h1 className="mt-1 text-lg font-bold text-zinc-100">{aulaAtiva.title}</h1>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-500">
                          <Clock className="h-3 w-3" /> {aulaAtiva.duration}
                        </span>
                        {(aulaAtiva.lesson_pdfs?.length ?? 0) > 0 && (
                          <span className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400">
                            <FileText className="h-3 w-3" /> {aulaAtiva.lesson_pdfs!.length} material(is)
                          </span>
                        )}
                      </div>
                    </div>

                    <button onClick={toggleConcluida}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                        isConcluida ? "bg-green-500/15 text-green-400 ring-1 ring-green-500/30 hover:bg-green-500/25" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      )}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {isConcluida ? "Concluída ✓" : "Marcar como concluída"}
                    </button>
                  </div>

                  <div className="flex gap-3 border-t border-zinc-800 pt-4">
                    <button disabled={!anterior} onClick={() => anterior && setAulaAtiva(anterior)}
                      className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-left transition-all hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4 shrink-0 text-zinc-600" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-600">Anterior</p>
                        <p className="truncate text-xs font-medium text-zinc-400">{anterior?.title ?? "—"}</p>
                      </div>
                    </button>
                    <button disabled={!proxima || !proxima.available} onClick={() => proxima?.available && setAulaAtiva(proxima)}
                      className="flex flex-1 items-center justify-end gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-right transition-all hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-600">Próxima</p>
                        <p className="truncate text-xs font-medium text-zinc-400">{proxima?.title ?? "—"}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ABA: PDF */}
            {rightTab === "pdf" && (
              <div className="flex-1 p-4 space-y-3">
                <div className="mb-2">
                  <h2 className="text-sm font-bold text-zinc-200">Materiais — {aulaAtiva.title}</h2>
                  <p className="text-xs text-zinc-600">{aulaAtiva.lesson_pdfs?.length ?? 0} arquivo(s)</p>
                </div>
                {(aulaAtiva.lesson_pdfs?.length ?? 0) === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <FileText className="h-10 w-10 text-zinc-800" />
                    <p className="text-sm text-zinc-600">Nenhum material nesta aula</p>
                  </div>
                ) : (
                  aulaAtiva.lesson_pdfs!.map((pdf) => (
                    <div key={pdf.id} className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                          <FileText className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-200">{pdf.name}</p>
                          <p className="text-xs text-zinc-600">{pdf.file_size}</p>
                        </div>
                      </div>
                      <button className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 transition-all hover:border-primary hover:bg-primary/10 hover:text-primary">
                        <Download className="h-3.5 w-3.5" /> Baixar
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ABA: ANOTAÇÕES */}
            {rightTab === "anotacoes" && (
              <div className="flex flex-1 flex-col p-4 gap-3">
                <div>
                  <h2 className="text-sm font-bold text-zinc-200">Minhas Anotações</h2>
                  <p className="text-xs text-zinc-600">{aulaAtiva.title}</p>
                </div>
                <textarea
                  ref={textareaRef} value={anotacao} onChange={(e) => setAnotacao(e.target.value)}
                  placeholder="Digite suas anotações sobre esta aula..."
                  className="flex-1 min-h-64 resize-none rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-200 placeholder-zinc-700 outline-none focus:border-zinc-700 leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-700">{anotacao.length} caracteres</span>
                  <button onClick={() => alert("Salvo!")} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
                    Salvar anotação
                  </button>
                </div>
              </div>
            )}

            {/* ABA: DÚVIDAS */}
            {rightTab === "duvidas" && (
              <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-200">Enviar Dúvida ao Professor</h2>
                    <p className="text-xs text-zinc-600 mt-0.5">Sua dúvida será enviada ao professor responsável.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-600">Aula</p>
                      <p className="text-xs text-zinc-300 truncate">{aulaAtiva.title}</p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-600">Professor</p>
                      <p className="text-xs text-zinc-300 truncate">
                        {getDisciplinaFromAula(aulaAtiva.id)?.professor?.name ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] text-zinc-500">Momento do vídeo (opcional, ex: 12:30)</label>
                    <input value={momentoDuvida} onChange={(e) => setMomentoDuvida(e.target.value)} placeholder="ex: 12:30"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] text-zinc-500">Sua dúvida *</label>
                    <textarea value={textoDuvida} onChange={(e) => setTextoDuvida(e.target.value)} placeholder="Descreva sua dúvida com detalhes..." rows={4}
                      className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-700 leading-relaxed"
                    />
                  </div>

                  <button onClick={enviarDuvida} disabled={!textoDuvida.trim() || sendingDuvida}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sendingDuvida ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Enviar dúvida ao professor
                  </button>

                  {duvidaEnviada && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2">
                      <CheckCheck className="h-4 w-4 text-green-400 shrink-0" />
                      <p className="text-xs text-green-400">Dúvida enviada! O professor foi notificado.</p>
                    </div>
                  )}
                </div>

                {minhasDuvidas.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                      Minhas dúvidas ({minhasDuvidas.length})
                    </p>
                    {minhasDuvidas.map((d) => (
                      <div key={d.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-zinc-300 leading-relaxed flex-1">{d.text}</p>
                          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                            d.status === "answered" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                          )}>
                            {d.status === "answered" ? "Respondida" : "Pendente"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                          <span>{d.lesson?.title}</span>
                          {d.video_moment && <span>· {d.video_moment}</span>}
                        </div>
                        {d.answer && (
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Resposta do Professor</p>
                            <p className="text-xs text-zinc-300 leading-relaxed">{d.answer}</p>
                          </div>
                        )}
                        {d.status !== "answered" && (
                          <div className="flex items-center gap-1.5 text-[10px] text-yellow-600">
                            <AlertCircle className="h-3 w-3" /> Aguardando resposta do professor
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT — sidebar desktop */}
        <aside className="hidden w-72 shrink-0 flex-col overflow-hidden border-l border-zinc-800 lg:flex">
          <div className="flex shrink-0 border-b border-zinc-800 bg-zinc-900">
            {(["aulas", "cronograma"] as const).map((tab) => (
              <button key={tab} onClick={() => setSidebarTab(tab)}
                className={cn("flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors",
                  sidebarTab === tab ? "border-b-2 border-primary text-primary" : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                {tab === "aulas" ? "Aulas Curso" : "Cronograma"}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {sidebarTab === "aulas" ? (
              <CourseSidebar disciplinas={disciplinas} aulaAtiva={aulaAtiva} concluidas={concluidas} onSelect={(a) => { setAulaAtiva(a); setRightTab("video") }} />
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
                <BarChart2 className="h-8 w-8 text-zinc-700" />
                <p className="text-xs text-zinc-600">Cronograma em breve</p>
              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  )
}

export default function AssistirPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-zinc-950"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AssistirInner />
    </Suspense>
  )
}
