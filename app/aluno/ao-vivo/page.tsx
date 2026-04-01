"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Radio,
  Users,
  Maximize2,
  Minimize2,
  MessageSquare,
  Send,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock: dados da aula ao vivo presencial
// O youtube_id aqui representa o ID de uma live do YouTube
// (substitua pelo ID real quando houver transmissão ativa)
const aulaAoVivo = {
  titulo: "Aula Presencial — Língua Portuguesa",
  professor: "Prof. Carlos Menezes",
  descricao: "Interpretação e Compreensão de Texto — Turma Concurso IPERON 2026",
  youtube_id: "Pwm3ZrrMhvs", // trocar pelo ID da live real
  espectadores: 47,
  inicio: "19:00",
}

// Mock mensagens do chat ao vivo
const mockMensagens = [
  { id: 1, nome: "Ana Lima", texto: "Boa noite professor!", tempo: "19:02" },
  { id: 2, nome: "Pedro Silva", texto: "Consegui entrar agora, perdeu muito?", tempo: "19:04" },
  { id: 3, nome: "Carla Souza", texto: "Excelente explicação! 👏", tempo: "19:07" },
  { id: 4, nome: "João Ferreira", texto: "Professor, pode repetir a parte da coerência?", tempo: "19:09" },
  { id: 5, nome: "Maria Santos", texto: "Obrigada! Ficou muito claro.", tempo: "19:11" },
]

// Watermark CPF
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

export default function AoVivoPage() {
  const [fullscreen, setFullscreen] = useState(false)
  const [cpf, setCpf] = useState("")
  const [chatAberto, setChatAberto] = useState(true)
  const [mensagem, setMensagem] = useState("")
  const [mensagens, setMensagens] = useState(mockMensagens)
  const [nomeUsuario, setNomeUsuario] = useState("Você")

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setCpf(user.cpf || user.email || "aluno@federal")
        setNomeUsuario(user.name?.split(" ")[0] || "Você")
      } catch {}
    }
  }, [])

  const embedSrc = `https://www.youtube.com/embed/${aulaAoVivo.youtube_id}?rel=0&modestbranding=1&iv_load_policy=3&color=white&showinfo=0&autoplay=1`

  function enviarMensagem() {
    if (!mensagem.trim()) return
    const agora = new Date()
    const tempo = `${agora.getHours().toString().padStart(2, "0")}:${agora.getMinutes().toString().padStart(2, "0")}`
    setMensagens((prev) => [
      ...prev,
      { id: Date.now(), nome: nomeUsuario, texto: mensagem.trim(), tempo },
    ])
    setMensagem("")
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">

      {/* ── Fullscreen ────────────────────────────────────── */}
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
              key="fs-live"
              className="h-full w-full"
              src={embedSrc}
              title={aulaAoVivo.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <CpfWatermark cpf={cpf} />
          </div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────── */}
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3">
        <Link
          href="/aluno"
          className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Painel do Aluno</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400 border border-red-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
            </span>
            AO VIVO
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Users className="h-3.5 w-3.5" />
            {aulaAoVivo.espectadores} assistindo
          </span>
        </div>

        <button
          onClick={() => setChatAberto((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all",
            chatAberto
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </button>
      </header>

      {/* ── Main ──────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: player */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Player */}
          <div className="w-full bg-black">
            <div className="relative mx-auto w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                key="live-player"
                className="absolute inset-0 h-full w-full"
                src={embedSrc}
                title={aulaAoVivo.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <CpfWatermark cpf={cpf} />
              <button
                onClick={() => setFullscreen(true)}
                className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-zinc-400 backdrop-blur-sm transition hover:bg-zinc-800 hover:text-white"
                title="Expandir para tela cheia"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Info da aula */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 lg:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Radio className="h-4 w-4 text-red-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                    Transmissão ao Vivo — Aula Presencial
                  </p>
                </div>
                <h1 className="text-lg font-bold text-zinc-100">{aulaAoVivo.titulo}</h1>
                <p className="text-sm text-zinc-400">{aulaAoVivo.descricao}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-500">
                    <Clock className="h-3 w-3" /> Iniciou às {aulaAoVivo.inicio}
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-500">
                    <Users className="h-3 w-3" /> {aulaAoVivo.espectadores} ao vivo
                  </span>
                  <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-500">
                    {aulaAoVivo.professor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: chat ao vivo */}
        {chatAberto && (
          <aside className="hidden w-72 shrink-0 flex-col overflow-hidden border-l border-zinc-800 lg:flex">

            {/* Chat header */}
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-zinc-400" />
                <p className="text-xs font-semibold text-zinc-300">Chat ao vivo</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                </span>
                {mensagens.length} mensagens
              </span>
            </div>

            {/* Mensagens */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {mensagens.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-primary">{msg.nome}</span>
                    <span className="text-[10px] text-zinc-700">{msg.tempo}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{msg.texto}</p>
                </div>
              ))}
            </div>

            {/* Input mensagem */}
            <div className="shrink-0 border-t border-zinc-800 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-700"
                />
                <button
                  onClick={enviarMensagem}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition hover:opacity-90"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
