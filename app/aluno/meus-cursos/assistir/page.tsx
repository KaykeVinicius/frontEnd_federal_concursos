"use client"

import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft, ChevronRight, PlayCircle, FileText, CheckCircle, Lock, Download, Search,
  Maximize2, Minimize2, X, PenLine, Clock, BookOpen, BarChart2, HelpCircle, Send,
  CheckCheck, AlertCircle, Loader2, Pause, Play, Volume2, VolumeX,
  SkipBack, SkipForward, Rewind, FastForward, Settings, Monitor,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type ApiSubject, type ApiTopic, type ApiLesson, type ApiQuestion, type ApiEnrollment } from "@/lib/api"

// ─── YouTube IFrame API types ──────────────────────────────
declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement | string, opts: object) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number; CUED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}
interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  setVolume(v: number): void
  mute(): void
  unMute(): void
  isMuted(): boolean
  getVolume(): number
  getCurrentTime(): number
  getDuration(): number
  getPlayerState(): number
  setPlaybackRate(rate: number): void
  getPlaybackRate(): number
  destroy(): void
}

// ─── YouTube Player customizado ───────────────────────────
function YoutubePlayer({
  videoId, cpf,
  isFullscreen, onFullscreen,
  isTheater, onTheater,
  onPrev, onNext, onEnded,
}: {
  videoId: string; cpf: string
  isFullscreen?: boolean; onFullscreen?: () => void
  isTheater?: boolean; onTheater?: () => void
  onPrev?: () => void; onNext?: () => void
  onEnded?: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const [showControls, setShowControls] = useState(true)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [speed, setSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const autoPlayRef = useRef(true)
  const onEndedRef = useRef(onEnded)
  useEffect(() => { onEndedRef.current = onEnded }, [onEnded])

  // Carrega IFrame API uma vez
  useEffect(() => {
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      if (window.YT?.Player) initPlayer()
      else window.onYouTubeIframeAPIReady = initPlayer
      return
    }
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(tag)
    window.onYouTubeIframeAPIReady = initPlayer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Troca vídeo sem recriar o player
  useEffect(() => {
    if (playerRef.current && ready) {
      // @ts-expect-error loadVideoById exists
      playerRef.current.loadVideoById(videoId)
    }
  }, [videoId, ready])

  function initPlayer() {
    if (!containerRef.current) return
    // Limpa qualquer conteúdo residual
    containerRef.current.innerHTML = ""
    // ID único garante que o YouTube encontra o elemento correto no DOM
    const playerId = `yt-${Date.now()}`
    const div = document.createElement("div")
    div.id = playerId
    div.style.width = "100%"
    div.style.height = "100%"
    containerRef.current.appendChild(div)

    playerRef.current = new window.YT.Player(playerId, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        controls: 0, fs: 0, rel: 0, modestbranding: 1,
        iv_load_policy: 3, disablekb: 1, playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (e: { target: YTPlayer }) => {
          e.target.setVolume(80)
          setReady(true)
          setDuration(e.target.getDuration())
        },
        onStateChange: (e: { data: number }) => {
          const YT = window.YT
          if (e.data === YT.PlayerState.PLAYING) {
            setPlaying(true)
            setHasStarted(true)
            intervalRef.current = setInterval(() => {
              if (playerRef.current) {
                setCurrent(playerRef.current.getCurrentTime())
                setDuration(playerRef.current.getDuration())
              }
            }, 500)
          } else {
            setPlaying(false)
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (e.data === YT.PlayerState.ENDED && autoPlayRef.current) {
              onEndedRef.current?.()
            }
          }
        },
      },
    })
  }

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    playerRef.current?.destroy()
  }, [])

  function togglePlay() {
    if (!playerRef.current) return
    if (playing) playerRef.current.pauseVideo()
    else playerRef.current.playVideo()
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = parseFloat(e.target.value)
    playerRef.current?.seekTo(t, true)
    setCurrent(t)
  }

  function toggleMute() {
    if (!playerRef.current) return
    if (muted) { playerRef.current.unMute(); playerRef.current.setVolume(volume) }
    else playerRef.current.mute()
    setMuted(!muted)
  }

  function changeVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value)
    setVolume(v)
    playerRef.current?.setVolume(v)
    if (v === 0) setMuted(true)
    else if (muted) { playerRef.current?.unMute(); setMuted(false) }
  }

  function fmt(s: number) {
    if (!s || isNaN(s)) return "0:00"
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  function handleMouseMove() {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 3000)
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div
      className="relative w-full bg-black select-none"
      style={{ paddingBottom: "56.25%", cursor: showControls ? "default" : "none" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* IFrame container */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden [&_div]:w-full [&_div]:h-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:w-full [&_iframe]:h-full" />

      {/* CPF watermark */}
      {cpf && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="absolute text-white/[0.07] text-sm font-bold tracking-widest"
              style={{ top: `${Math.floor(i / 3) * 33 + 12}%`, left: `${(i % 3) * 33 + 2}%`, transform: "rotate(-25deg)", whiteSpace: "nowrap" }}>
              {cpf}
            </span>
          ))}
        </div>
      )}

      {/* Clique play/pause — não cobre controles */}
      <div className="absolute inset-0 z-20 cursor-pointer" style={{ bottom: "52px" }} onClick={togglePlay} />

      {/* Loading */}
      {!ready && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      )}

      {/* Overlay preto antes do primeiro play — esconde UI do YouTube */}
      {ready && !hasStarted && (
        <div className="pointer-events-none absolute inset-0 z-25 flex items-center justify-center bg-black">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <Play className="h-7 w-7 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Ícone play quando pausado mid-vídeo */}
      {ready && hasStarted && !playing && (
        <div className="pointer-events-none absolute inset-0 z-25 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <Play className="h-6 w-6 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Barra de controles */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300",
        showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {/* Gradiente */}
        <div className="h-24 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 space-y-1.5">
          {/* Progress bar */}
          <div className="relative h-1.5 group cursor-pointer">
            <div className="absolute inset-0 rounded-full bg-white/20" />
            <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            <input
              type="range" min={0} max={duration || 100} step={0.5} value={current}
              onChange={seek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Botões */}
          <div className="flex items-center justify-between gap-2">
            {/* LEFT */}
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Aula anterior */}
              <button onClick={onPrev} disabled={!onPrev} title="Aula anterior"
                className="text-white hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <SkipBack className="h-4 w-4" />
              </button>
              {/* Voltar 10s */}
              <button onClick={() => { const t = Math.max(0, current - 10); playerRef.current?.seekTo(t, true); setCurrent(t) }} title="Voltar 10s"
                className="text-white hover:text-primary transition-colors">
                <Rewind className="h-4 w-4" />
              </button>
              {/* Play/Pause */}
              <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              {/* Avançar 10s */}
              <button onClick={() => { const t = Math.min(duration || 99999, current + 10); playerRef.current?.seekTo(t, true); setCurrent(t) }} title="Avançar 10s"
                className="text-white hover:text-primary transition-colors">
                <FastForward className="h-4 w-4" />
              </button>
              {/* Próxima aula */}
              <button onClick={onNext} disabled={!onNext} title="Próxima aula"
                className="text-white hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <SkipForward className="h-4 w-4" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1 group/vol">
                <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                  {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range" min={0} max={100} value={muted ? 0 : volume}
                  onChange={changeVolume}
                  className="w-0 group-hover/vol:w-14 transition-all duration-200 accent-primary cursor-pointer"
                />
              </div>

              {/* Tempo */}
              <span className="text-xs text-zinc-300 tabular-nums whitespace-nowrap">{fmt(current)} / {fmt(duration)}</span>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Engrenagem: velocidade + auto-play */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu((v) => !v)}
                  className="flex items-center gap-0.5 text-white hover:text-primary transition-colors"
                  title="Configurações"
                >
                  <span className="text-[11px] font-bold tabular-nums">{speed === 1 ? "1×" : `${speed}×`}</span>
                  <Settings className="h-3.5 w-3.5" />
                </button>

                {showSpeedMenu && (
                  <>
                    {/* overlay para fechar */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowSpeedMenu(false)} />
                    <div className="absolute bottom-9 right-0 z-50 min-w-[150px] rounded-xl border border-zinc-700 bg-zinc-900/95 p-2 shadow-xl backdrop-blur-sm">
                      <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Velocidade</p>
                      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                        <button key={s} onClick={() => { setSpeed(s); playerRef.current?.setPlaybackRate(s); setShowSpeedMenu(false) }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs transition-colors hover:bg-zinc-800",
                            speed === s ? "text-primary font-semibold" : "text-zinc-300"
                          )}>
                          <span>{s === 1 ? "Normal" : `${s}×`}</span>
                          {speed === s && <span className="text-[10px]">✓</span>}
                        </button>
                      ))}
                      <div className="my-1 border-t border-zinc-800" />
                      <button
                        onClick={() => { const next = !autoPlay; setAutoPlay(next); autoPlayRef.current = next }}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
                      >
                        <span>Auto-play</span>
                        <span className={cn("text-[10px] font-bold", autoPlay ? "text-primary" : "text-zinc-600")}>{autoPlay ? "ON" : "OFF"}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Modo teatro */}
              <button onClick={onTheater} title={isTheater ? "Modo normal" : "Modo teatro"}
                className={cn("transition-colors", isTheater ? "text-primary" : "text-white hover:text-primary")}>
                <Monitor className="h-4 w-4" />
              </button>

              {/* Tela cheia */}
              <button onClick={onFullscreen} title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                className="text-white hover:text-primary transition-colors">
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────
type Disciplina = ApiSubject & {
  topicos: (ApiTopic & { aulas: ApiLesson[] })[]
}

// ─── Sidebar ──────────────────────────────────────────────
type SidebarView = "disciplinas" | "topicos" | "aulas"

function CourseSidebar({
  disciplinas, aulaAtiva, concluidas, initialSubjectId, initialTopicId, onSelect,
}: {
  disciplinas: Disciplina[]
  aulaAtiva: ApiLesson | null
  concluidas: number[]
  initialSubjectId?: number | null
  initialTopicId?: number | null
  onSelect: (a: ApiLesson) => void
}) {
  const initialDisc = initialSubjectId
    ? (disciplinas.find((d) => d.id === initialSubjectId) ?? disciplinas[0] ?? null)
    : (disciplinas[0] ?? null)
  const initialTopico = initialTopicId
    ? (disciplinas.flatMap((d) => d.topicos).find((t) => t.id === initialTopicId) ?? initialDisc?.topicos[0] ?? null)
    : (initialDisc?.topicos[0] ?? null)
  const initialView: SidebarView = initialTopicId ? "aulas" : initialSubjectId ? "topicos" : "disciplinas"
  const [view, setView] = useState<SidebarView>(initialView)
  const [discAtiva, setDiscAtiva] = useState<Disciplina | null>(initialDisc)
  const [topicoAtivo, setTopicoAtivo] = useState<(ApiTopic & { aulas: ApiLesson[] }) | null>(initialTopico)
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
    <div className="flex h-full flex-col">
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

      <div className="flex-1 overflow-y-auto bg-zinc-900">
        {view === "disciplinas" && (
          <div className="divide-y divide-zinc-800/50">
            {filteredDisc.map((d) => {
              const totalAulas = d.topicos.flatMap((t) => t.aulas).length
              const concluídasDisc = d.topicos.flatMap((t) => t.aulas).filter((a) => concluidas.includes(a.id)).length
              const pct = totalAulas > 0 ? Math.round((concluídasDisc / totalAulas) * 100) : 0
              return (
                <button key={d.id} onClick={() => goToDisc(d)} className="cursor-pointer flex w-full flex-col gap-2 px-3 py-3 text-left transition-colors hover:bg-zinc-800/60">
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
              <button key={t.id} onClick={() => goToTopico(t)} className="cursor-pointer flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-zinc-800/60">
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
                    aula.available ? "cursor-pointer" : "cursor-not-allowed opacity-30"
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
type RightTab = "video" | "materiais" | "anotacoes" | "duvidas"

function AssistirInner() {
  const searchParams = useSearchParams()
  const enrollmentId = searchParams.get("enrollment_id")
  const initialSubjectId = searchParams.get("subject_id") ? Number(searchParams.get("subject_id")) : null
  const initialTopicId = searchParams.get("topic_id") ? Number(searchParams.get("topic_id")) : null

  const [loading, setLoading] = useState(true)
  const [enrollment, setEnrollment] = useState<ApiEnrollment | null>(null)
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [aulaAtiva, setAulaAtiva] = useState<ApiLesson | null>(null)
  const [concluidas, setConcluidas] = useState<number[]>([])
  const [completionIds, setCompletionIds] = useState<Record<number, number>>({}) // lesson_id → completion_id
  const [rightTab, setRightTab] = useState<RightTab>("video")
  const [fullscreen, setFullscreen] = useState(false)
  const [theaterMode, setTheaterMode] = useState(false)
  const [anotacao, setAnotacao] = useState("")
  const [cpf, setCpf] = useState("")
  const [_nomeAluno, setNomeAluno] = useState("Aluno")
  const [sidebarTab, setSidebarTab] = useState<"aulas" | "cronograma">("aulas")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const videoRef = useRef<HTMLDivElement>(null)

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
        console.log("[assistir] enrollment_id buscado:", enrollmentId)
        console.log("[assistir] enrollment encontrado:", activeEnrollment?.id, "curso:", activeEnrollment?.course?.id, activeEnrollment?.course?.title)
        const subjects = await api.subjects.list(activeEnrollment.course.id)
        console.log("[assistir] subjects carregados:", subjects.length, subjects.map(s => ({ id: s.id, name: s.name, course_id: s.course_id })))

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

        // Auto-seleciona primeira aula do tópico quando topic_id está presente
        if (initialTopicId) {
          const topico = disciplinasComConteudo
            .flatMap((d) => d.topicos)
            .find((t) => t.id === initialTopicId)
          if (topico?.aulas[0]) setAulaAtiva(topico.aulas[0])
        }
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
    { key: "materiais" as RightTab, label: "Materiais", icon: FileText },
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

  if (disciplinas.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-300">
        <BookOpen className="h-12 w-12 text-zinc-700" />
        <p className="text-sm">Nenhuma aula disponível para este curso.</p>
        <p className="text-xs text-zinc-600">As matérias ainda não foram vinculadas a este curso.</p>
        <Link href={enrollmentId ? `/aluno/meus-cursos/${enrollmentId}` : "/aluno/meus-cursos"} className="text-xs text-primary hover:underline">← Voltar para Disciplinas</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-zinc-950 text-zinc-100 min-h-screen">

      {/* Header */}
      <header className="sticky top-0 z-30 flex h-11 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3">
        <Link href={enrollmentId ? `/aluno/meus-cursos/${enrollmentId}` : "/aluno/meus-cursos"} className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-200">
          <ChevronLeft className="h-4 w-4" />
          <span>Disciplinas</span>
        </Link>
        <p className="hidden max-w-sm truncate text-center text-xs font-semibold text-zinc-400 sm:block">
          {aulaAtiva?.title ?? enrollment?.course?.title ?? "Selecione uma aula"}
        </p>
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
            <CourseSidebar disciplinas={disciplinas} aulaAtiva={aulaAtiva} concluidas={concluidas} initialSubjectId={initialSubjectId} initialTopicId={initialTopicId} onSelect={(a) => { setAulaAtiva(a); setRightTab("video"); setMobileSidebarOpen(false) }} />
          </aside>
        </div>
      )}

      {/* Main — duas colunas */}
      <div className="flex flex-1">

        {/* LEFT — vídeo, info e abas */}
        <div className="flex flex-1 flex-col min-w-0">

          {!aulaAtiva ? (
            <div className="flex flex-1 items-center justify-center gap-4 text-center px-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800">
                <PlayCircle className="h-10 w-10 text-zinc-700" />
              </div>
              <div>
                <p className="text-base font-bold text-zinc-300">{enrollment?.course?.title}</p>
                <p className="mt-1 text-sm text-zinc-500">Selecione uma disciplina na barra lateral para começar</p>
              </div>
            </div>
          ) : (
            <>
              {/* Vídeo — fullscreen via CSS (sem remount do player) */}
              <div ref={videoRef} className={cn(
                "shrink-0 bg-black w-full",
                fullscreen && "fixed inset-0 z-50 flex items-center justify-center"
              )}>
                <div
                  className="w-full"
                  style={fullscreen ? { width: "min(100vw, calc(100vh * 16 / 9))" } : {}}
                >
                  <YoutubePlayer
                    key={aulaAtiva.id}
                    videoId={aulaAtiva.youtube_id}
                    cpf={cpf}
                    isFullscreen={fullscreen}
                    onFullscreen={() => setFullscreen(!fullscreen)}
                    isTheater={theaterMode}
                    onTheater={() => setTheaterMode(!theaterMode)}
                    onPrev={anterior ? () => setAulaAtiva(anterior) : undefined}
                    onNext={proxima ? () => setAulaAtiva(proxima) : undefined}
                    onEnded={() => { if (proxima) { setAulaAtiva(proxima); setRightTab("video") } }}
                  />
                </div>
              </div>

              {/* Info da aula */}
              <div className="shrink-0 border-b border-zinc-800 px-4 py-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{enrollment?.course?.title}</p>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-sm font-bold text-zinc-100 truncate">{aulaAtiva.title}</h1>
                    <span className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" /> {aulaAtiva.duration}
                    </span>
                  </div>
                  <button onClick={toggleConcluida} className={cn(
                    "cursor-pointer flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    isConcluida ? "bg-green-500/15 text-green-400 ring-1 ring-green-500/30" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  )}>
                    <CheckCircle className="h-3.5 w-3.5" />
                    {isConcluida ? "Concluída ✓" : "Concluir"}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex shrink-0 items-center border-b border-zinc-800 bg-zinc-900 px-2">
                {rightTabs.map((tab) => (
                  <button key={tab.key} onClick={() => {
                    setRightTab(tab.key)
                    if (tab.key === "video") {
                      videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
                    }
                  }}
                    className={cn(
                      "cursor-pointer flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                      rightTab === tab.key ? "border-primary text-primary" : "border-transparent text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    <tab.icon className="h-3.5 w-3.5" />{tab.label}
                  </button>
                ))}
              </div>

              <div>

                {/* ABA: VÍDEO → navegação anterior/próxima */}
                {rightTab === "video" && (
                  <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <button disabled={!anterior} onClick={() => anterior && setAulaAtiva(anterior)}
                        className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-left transition-all hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4 shrink-0 text-zinc-600" />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Anterior</p>
                          <p className="truncate text-xs font-medium text-zinc-400">{anterior?.title ?? "—"}</p>
                        </div>
                      </button>
                      <button disabled={!proxima} onClick={() => proxima && setAulaAtiva(proxima)}
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
                )}

                {/* ABA: MATERIAIS */}
                {rightTab === "materiais" && (
                  <div className="flex-1 p-4 space-y-3">
                    <div>
                      <h2 className="text-sm font-bold text-zinc-200">Materiais — {aulaAtiva.title}</h2>
                      <p className="text-xs text-zinc-600">{aulaAtiva.lesson_pdfs?.length ?? 0} arquivo(s)</p>
                    </div>
                    {(aulaAtiva.lesson_pdfs?.length ?? 0) === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <FileText className="h-10 w-10 text-zinc-800" />
                        <p className="text-sm text-zinc-600">Nenhum material nesta aula</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {aulaAtiva.lesson_pdfs!.map((pdf) => (
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
                            {pdf.file_url ? (
                              <a href={pdf.file_url} target="_blank" rel="noopener noreferrer"
                                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 transition-all hover:border-primary hover:bg-primary/10 hover:text-primary">
                                <FileText className="h-3.5 w-3.5" /> Abrir
                              </a>
                            ) : (
                              <span className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-600 opacity-40 cursor-not-allowed">
                                <Download className="h-3.5 w-3.5" /> Indisponível
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
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
                  <div className="flex flex-1 flex-col gap-4 p-4">
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
            </>
          )}
        </div>

        {/* RIGHT — sidebar sticky */}
        <aside className={cn(
          "hidden w-72 shrink-0 flex-col border-l border-zinc-800 bg-zinc-900",
          !theaterMode && "lg:flex",
          "sticky top-11 h-[calc(100vh-44px)] overflow-hidden"
        )}>
          <div className="flex shrink-0 border-b border-zinc-800">
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
          <div className="flex-1 overflow-y-auto">
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
