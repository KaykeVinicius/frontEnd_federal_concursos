"use client"

import Link from "next/link"
import { ChevronLeft, Radio, Bell, Clock, Wifi } from "lucide-react"

export default function AoVivoPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 px-4">

      {/* Voltar */}
      <div className="absolute top-0 left-0 w-full">
        <header className="flex h-11 items-center border-b border-zinc-800 bg-zinc-900 px-4">
          <Link href="/aluno" className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-200">
            <ChevronLeft className="h-4 w-4" />
            Painel do Aluno
          </Link>
        </header>
      </div>

      {/* Conteúdo central */}
      <div className="flex flex-col items-center gap-6 text-center max-w-md">

        {/* Ícone animado */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
          <Radio className="h-10 w-10 text-red-400" />
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-40" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Transmissão ao Vivo</p>
          <h1 className="text-2xl font-black text-white">Em breve</h1>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            As aulas ao vivo presenciais serão transmitidas aqui.<br />
            Quando houver uma transmissão ativa, você será avisado e o acesso abrirá automaticamente nesta página.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left">
            <Bell className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs font-semibold text-zinc-300">Notificação</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Você será avisado no painel quando a aula começar</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left">
            <Wifi className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs font-semibold text-zinc-300">Transmissão</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">A aula será transmitida ao vivo direto desta página</p>
          </div>
        </div>

        <Link href="/aluno"
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
          <ChevronLeft className="h-4 w-4" /> Voltar ao painel
        </Link>
      </div>
    </div>
  )
}
