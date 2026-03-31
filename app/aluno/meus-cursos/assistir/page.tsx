"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileText,
  CheckCircle,
  Lock,
  Download,
  Search,
  Maximize2,
  Minimize2,
  X,
  PenLine,
  Clock,
  BookOpen,
  BarChart2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Tipos ────────────────────────────────────────────────
type Aula = {
  id: number
  titulo: string
  duracao: string
  youtube_id: string
  pdfs: { nome: string; tamanho: string }[]
  liberada: boolean
}

type Topico = {
  id: number
  titulo: string
  aulas: Aula[]
}

type Disciplina = {
  id: number
  nome: string
  progresso: number
  topicos: Topico[]
}

// ─── Mock ─────────────────────────────────────────────────
const disciplinas: Disciplina[] = [
  {
    id: 1,
    nome: "Língua Portuguesa",
    progresso: 68,
    topicos: [
      {
        id: 1,
        titulo: "Interpretação e Compreensão de texto",
        aulas: [
          { id: 1, titulo: "Introdução ao Curso de Texto", duracao: "00:24:47", youtube_id: "Pwm3ZrrMhvs", pdfs: [{ nome: "Resumo — Interpretação.pdf", tamanho: "2.1 MB" }, { nome: "Exercícios Resolvidos.pdf", tamanho: "3.4 MB" }], liberada: true },
          { id: 2, titulo: "Compreensão e Interpretação", duracao: "00:33:01", youtube_id: "Pwm3ZrrMhvs", pdfs: [], liberada: true },
          { id: 3, titulo: "Coesão e Coerência Textual", duracao: "00:28:15", youtube_id: "Pwm3ZrrMhvs", pdfs: [{ nome: "Mapa Mental — Coesão.pdf", tamanho: "1.2 MB" }], liberada: true },
        ],
      },
      {
        id: 2,
        titulo: "Pontuação e sinais gráficos",
        aulas: [
          { id: 4, titulo: "Uso da Vírgula", duracao: "00:41:00", youtube_id: "Pwm3ZrrMhvs", pdfs: [], liberada: true },
          { id: 5, titulo: "Ponto, Ponto e Vírgula, Dois Pontos", duracao: "00:22:30", youtube_id: "Pwm3ZrrMhvs", pdfs: [], liberada: false },
        ],
      },
      {
        id: 3,
        titulo: "Ortografia",
        aulas: [
          { id: 6, titulo: "Acordo Ortográfico", duracao: "00:18:00", youtube_id: "Pwm3ZrrMhvs", pdfs: [{ nome: "Acordo Ortográfico — Resumo.pdf", tamanho: "0.9 MB" }], liberada: false },
        ],
      },
    ],
  },
  {
    id: 2,
    nome: "Raciocínio Lógico Matemático",
    progresso: 7,
    topicos: [
      {
        id: 4,
        titulo: "Lógica Proposicional",
        aulas: [
          { id: 7, titulo: "Proposições e Conectivos", duracao: "00:35:00", youtube_id: "Pwm3ZrrMhvs", pdfs: [], liberada: true },
          { id: 8, titulo: "Tabela Verdade", duracao: "00:29:00", youtube_id: "Pwm3ZrrMhvs", pdfs: [], liberada: false },
        ],
      },
    ],
  },
  {
    id: 3,
    nome: "Legislação Específica",
    progresso: 13,
    topicos: [
      {
        id: 5,
        titulo: "Lei Orgânica do IPERON",
        aulas: [
          { id: 9, titulo: "Estrutura e Competências", duracao: "00:44:00", youtube_id: "Pwm3ZrrMhvs", pdfs: [{ nome: "Lei Orgânica — Íntegra.pdf", tamanho: "4.2 MB" }], liberada: true },
        ],
      },
    ],
  },
  {
    id: 4,
    nome: "História e Geografia de Rondônia",
    progresso: 13,
    topicos: [
      {
        id: 6,
        titulo: "Formação Histórica de RO",
        aulas: [
          { id: 10, titulo: "Colonização e Ocupação do Território", duracao: "00:31:00", youtube_id: "Pwm3ZrrMhvs", pdfs: [], liberada: true },
        ],
      },
    ],
  },
]

const todasAulas: Aula[] = disciplinas.flatMap((d) => d.topicos).flatMap((t) => t.aulas)

// ─── Componente watermark CPF ──────────────────────────────
function CpfWatermark({ cpf }: { cpf: string }) {
  if (!cpf) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden select-none">
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="absolute text-white/[0.07] text-sm font-bold tracking-widest"
          style={{
            top: `${Math.floor(i / 3) * 33 + 12}%`,
            left: `${(i % 3) * 33 + 2}%`,
            transform: "rotate(-25deg)",
            whiteSpace: "nowrap",
          }}
        >
          {cpf}
        </span>
      ))}
    </div>
  )
}

// ─── Sidebar: seleção hierárquica ─────────────────────────
type SidebarView = "disciplinas" | "topicos" | "aulas"

function CourseSidebar({
  aulaAtiva,
  concluidas,
  onSelect,
}: {
  aulaAtiva: Aula
  concluidas: number[]
  onSelect: (a: Aula) => void
}) {
  const [view, setView] = useState<SidebarView>("disciplinas")
  const [discAtiva, setDiscAtiva] = useState<Disciplina>(disciplinas[0])
  const [topicoAtivo, setTopicoAtivo] = useState<Topico>(disciplinas[0].topicos[0])
  const [search, setSearch] = useState("")

  const filteredDisc = useMemo(
    () => disciplinas.filter((d) => d.nome.toLowerCase().includes(search.toLowerCase())),
    [search]
  )
  const filteredTopicos = useMemo(
    () => discAtiva.topicos.filter((t) => t.titulo.toLowerCase().includes(search.toLowerCase())),
    [discAtiva, search]
  )
  const filteredAulas = useMemo(
    () => topicoAtivo.aulas.filter((a) => a.titulo.toLowerCase().includes(search.toLowerCase())),
    [topicoAtivo, search]
  )

  function goToDisc(d: Disciplina) {
    setDiscAtiva(d)
    setSearch("")
    setView("topicos")
  }
  function goToTopico(t: Topico) {
    setTopicoAtivo(t)
    setSearch("")
    setView("aulas")
  }
  function goBack() {
    setSearch("")
    setView(view === "aulas" ? "topicos" : "disciplinas")
  }

  const title = view === "disciplinas" ? "Disciplinas" : view === "topicos" ? discAtiva.nome : topicoAtivo.titulo
  const placeholder =
    view === "disciplinas" ? "Pesquisar por disciplina" : view === "topicos" ? "Pesquisar por tópico" : "Pesquisar por aula"

  return (
    <div className="flex h-full flex-col bg-zinc-900">
      {/* Header do sidebar */}
      <div className="border-b border-zinc-800 p-3">
        {view !== "disciplinas" ? (
          <button
            onClick={goBack}
            className="mb-2 flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar
          </button>
        ) : null}
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{title}</p>
      </div>

      {/* Search */}
      <div className="border-b border-zinc-800 p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-8 pr-3 text-xs text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">

        {/* DISCIPLINAS */}
        {view === "disciplinas" && (
          <div className="divide-y divide-zinc-800/50">
            {filteredDisc.map((d) => (
              <button
                key={d.id}
                onClick={() => goToDisc(d)}
                className="flex w-full flex-col gap-2 px-3 py-3 text-left transition-colors hover:bg-zinc-800/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">{d.nome}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[10px] text-zinc-600">
                    <span>{d.progresso}% concluído</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${d.progresso}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* TÓPICOS */}
        {view === "topicos" && (
          <div className="divide-y divide-zinc-800/50">
            {filteredTopicos.map((t, i) => (
              <button
                key={t.id}
                onClick={() => goToTopico(t)}
                className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-zinc-800/60"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-snug text-zinc-300">{t.titulo}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-600">{t.aulas.length} aula(s)</p>
                </div>
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
              </button>
            ))}
          </div>
        )}

        {/* AULAS */}
        {view === "aulas" && (
          <div className="divide-y divide-zinc-800/50">
            {filteredAulas.map((aula, i) => {
              const ativa = aulaAtiva.id === aula.id
              const feita = concluidas.includes(aula.id)
              return (
                <button
                  key={aula.id}
                  disabled={!aula.liberada}
                  onClick={() => aula.liberada && onSelect(aula)}
                  className={cn(
                    "flex w-full items-start gap-3 px-3 py-3 text-left transition-all",
                    ativa ? "border-l-2 border-primary bg-primary/10" : "border-l-2 border-transparent hover:bg-zinc-800/60",
                    !aula.liberada && "cursor-not-allowed opacity-30"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {!aula.liberada ? (
                      <Lock className="h-3.5 w-3.5 text-zinc-600" />
                    ) : feita ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-xs leading-snug", ativa ? "font-semibold text-white" : "text-zinc-300")}>
                      {i + 1} - {aula.titulo}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-600">
                      <Clock className="h-3 w-3" /> {aula.duracao}
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

// ─── Painel direito: Vídeo | PDF | Anotações ──────────────
type RightTab = "video" | "pdf" | "anotacoes"

// ─── Página principal ──────────────────────────────────────
export default function AssistirPage() {
  const [aulaAtiva, setAulaAtiva] = useState<Aula>(todasAulas[0])
  const [concluidas, setConcluidas] = useState<number[]>([])
  const [rightTab, setRightTab] = useState<RightTab>("video")
  const [fullscreen, setFullscreen] = useState(false)
  const [anotacao, setAnotacao] = useState("")
  const [cpf, setCpf] = useState("")
  const [sidebarTab, setSidebarTab] = useState<"aulas" | "cronograma">("aulas")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      const user = JSON.parse(stored)
      setCpf(user.cpf || user.email || "aluno@federal")
    }
  }, [])

  const isConcluida = concluidas.includes(aulaAtiva.id)
  const aulaIdx = todasAulas.findIndex((a) => a.id === aulaAtiva.id)
  const proxima = todasAulas[aulaIdx + 1]
  const anterior = todasAulas[aulaIdx - 1]

  const embedSrc = `https://www.youtube.com/embed/${aulaAtiva.youtube_id}?rel=0&modestbranding=1&iv_load_policy=3&color=white&showinfo=0&autoplay=1`

  const rightTabs = [
    { key: "video" as RightTab, label: "Vídeo", icon: PlayCircle },
    { key: "pdf" as RightTab, label: "PDF", icon: FileText },
    { key: "anotacoes" as RightTab, label: "Anotações", icon: PenLine },
  ]

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">

      {/* ── Fullscreen ───────────────────────────────────── */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex bg-black">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-300 backdrop-blur-sm transition hover:bg-zinc-800 hover:text-white"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <div className="relative flex-1">
            <iframe
              key={`fs-${aulaAtiva.id}`}
              className="h-full w-full"
              src={embedSrc}
              title={aulaAtiva.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <CpfWatermark cpf={cpf} />
          </div>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────── */}
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3">
        <Link
          href="/aluno/meus-cursos"
          className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Meus Cursos</span>
        </Link>

        <p className="hidden max-w-sm truncate text-center text-xs font-semibold text-zinc-400 sm:block">
          {aulaAtiva.titulo}
        </p>

        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 lg:hidden"
        >
          <BookOpen className="h-3.5 w-3.5" /> Conteúdo
        </button>
        <div className="hidden lg:block w-32" />
      </header>

      {/* ── Mobile sidebar overlay ───────────────────────── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative z-50 flex w-80 flex-col bg-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
              <p className="text-xs font-bold text-zinc-300">Selecione o conteúdo</p>
              <button onClick={() => setMobileSidebarOpen(false)}>
                <X className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
            <CourseSidebar
              aulaAtiva={aulaAtiva}
              concluidas={concluidas}
              onSelect={(a) => { setAulaAtiva(a); setRightTab("video"); setMobileSidebarOpen(false) }}
            />
          </aside>
        </div>
      )}

      {/* ── Main ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — video / pdf / anotações */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Tabs do conteúdo: Vídeo | PDF | Anotações */}
          <div className="flex shrink-0 items-center border-b border-zinc-800 bg-zinc-900 px-4">
            {rightTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRightTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                  rightTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-zinc-600 hover:text-zinc-400"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conteúdo da aba */}
          <div className="flex flex-1 flex-col overflow-y-auto">

            {/* ── ABA: VÍDEO ─────────────────────────── */}
            {rightTab === "video" && (
              <>
                {/* Player */}
                <div className="w-full bg-black">
                  <div className="relative mx-auto w-full" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                      key={aulaAtiva.id}
                      className="absolute inset-0 h-full w-full"
                      src={embedSrc}
                      title={aulaAtiva.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <CpfWatermark cpf={cpf} />
                    {/* Expand */}
                    <button
                      onClick={() => setFullscreen(true)}
                      className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-zinc-400 backdrop-blur-sm transition hover:bg-zinc-800 hover:text-white"
                      title="Expandir para tela cheia"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4 p-4 lg:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                        Concurso IPERON 2026
                      </p>
                      <h1 className="mt-1 text-lg font-bold text-zinc-100">{aulaAtiva.titulo}</h1>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-500">
                          <Clock className="h-3 w-3" /> {aulaAtiva.duracao}
                        </span>
                        {aulaAtiva.pdfs.length > 0 && (
                          <span className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400">
                            <FileText className="h-3 w-3" /> {aulaAtiva.pdfs.length} material(is)
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setConcluidas((p) =>
                          p.includes(aulaAtiva.id) ? p.filter((x) => x !== aulaAtiva.id) : [...p, aulaAtiva.id]
                        )
                      }
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                        isConcluida
                          ? "bg-green-500/15 text-green-400 ring-1 ring-green-500/30 hover:bg-green-500/25"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      )}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {isConcluida ? "Concluída ✓" : "Marcar como concluída"}
                    </button>
                  </div>

                  {/* Navegação */}
                  <div className="flex gap-3 border-t border-zinc-800 pt-4">
                    <button
                      disabled={!anterior}
                      onClick={() => anterior && setAulaAtiva(anterior)}
                      className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-left transition-all hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4 shrink-0 text-zinc-600" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-600">Anterior</p>
                        <p className="truncate text-xs font-medium text-zinc-400">{anterior?.titulo ?? "—"}</p>
                      </div>
                    </button>
                    <button
                      disabled={!proxima || !proxima.liberada}
                      onClick={() => proxima?.liberada && setAulaAtiva(proxima)}
                      className="flex flex-1 items-center justify-end gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-right transition-all hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-600">Próxima</p>
                        <p className="truncate text-xs font-medium text-zinc-400">{proxima?.titulo ?? "—"}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── ABA: PDF ───────────────────────────── */}
            {rightTab === "pdf" && (
              <div className="flex-1 p-4 space-y-3">
                <div className="mb-2">
                  <h2 className="text-sm font-bold text-zinc-200">Materiais — {aulaAtiva.titulo}</h2>
                  <p className="text-xs text-zinc-600">{aulaAtiva.pdfs.length} arquivo(s) disponível(is)</p>
                </div>

                {aulaAtiva.pdfs.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <FileText className="h-10 w-10 text-zinc-800" />
                    <p className="text-sm text-zinc-600">Nenhum material nesta aula</p>
                  </div>
                ) : (
                  aulaAtiva.pdfs.map((pdf) => (
                    <div
                      key={pdf.nome}
                      className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                          <FileText className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-200">{pdf.nome}</p>
                          <p className="text-xs text-zinc-600">{pdf.tamanho}</p>
                        </div>
                      </div>
                      <button className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 transition-all hover:border-primary hover:bg-primary/10 hover:text-primary">
                        <Download className="h-3.5 w-3.5" />
                        Baixar
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── ABA: ANOTAÇÕES ─────────────────────── */}
            {rightTab === "anotacoes" && (
              <div className="flex flex-1 flex-col p-4 gap-3">
                <div>
                  <h2 className="text-sm font-bold text-zinc-200">Minhas Anotações</h2>
                  <p className="text-xs text-zinc-600">{aulaAtiva.titulo}</p>
                </div>
                <textarea
                  ref={textareaRef}
                  value={anotacao}
                  onChange={(e) => setAnotacao(e.target.value)}
                  placeholder="Digite suas anotações sobre esta aula..."
                  className="flex-1 min-h-64 resize-none rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-200 placeholder-zinc-700 outline-none focus:border-zinc-700 leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-700">{anotacao.length} caracteres</span>
                  <button
                    onClick={() => alert("Salvo!")}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    Salvar anotação
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT — árvore de aulas (desktop) */}
        <aside className="hidden w-72 shrink-0 flex-col overflow-hidden border-l border-zinc-800 lg:flex">

          {/* Tabs: Aulas Curso | Cronograma */}
          <div className="flex shrink-0 border-b border-zinc-800 bg-zinc-900">
            {(["aulas", "cronograma"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={cn(
                  "flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors",
                  sidebarTab === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                {tab === "aulas" ? "Aulas Curso" : "Cronograma"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {sidebarTab === "aulas" ? (
              <CourseSidebar
                aulaAtiva={aulaAtiva}
                concluidas={concluidas}
                onSelect={(a) => { setAulaAtiva(a); setRightTab("video") }}
              />
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
