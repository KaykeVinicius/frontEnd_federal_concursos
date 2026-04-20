"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, X, Play } from "lucide-react"

const SHOW = process.env.NEXT_PUBLIC_SHOW_DEPOIMENTOS === "true"

const fotos: string[] = []

const PLACEHOLDER_FOTOS = [
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&h=500&q=80",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&h=500&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&h=500&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&h=500&q=80",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&h=500&q=80",
]

const instagramCodes = [
  "DInEqUXO6n9",
  "DIzhzkGuQUJ",
  "DQe7U3aEwe7",
  "DIsjD4CupHI",
  "DWntwueDi7E",
  "DWLEylQDgQy",
  "DVZA7uvDvCX",
  "DQkFcY-DpCp",
  "DMYRs2qOwfQ",
  "DIhaac2ur8l",
]

const CARD_W = 270
const CARD_H = 480
const CARD_GAP = 12

export default function DepoimentosPage() {
  if (!SHOW) notFound()

  const photoTrackRef = useRef<HTMLDivElement>(null)
  const videoScrollRef = useRef<HTMLDivElement>(null)
  const [openCode, setOpenCode] = useState<string | null>(null)

  const displayFotos = fotos.length > 0 ? fotos : PLACEHOLDER_FOTOS
  const loopFotos = [...displayFotos, ...displayFotos]

  useEffect(() => {
    const track = photoTrackRef.current
    if (!track) return
    let pos = 0
    const itemWidth = 400 + 16
    const total = displayFotos.length * itemWidth
    const tick = () => {
      pos += 0.6
      if (pos >= total) pos = 0
      track.style.transform = `translateX(-${pos}px)`
    }
    const id = setInterval(tick, 16)
    return () => clearInterval(id)
  }, [displayFotos.length])

  // Bloqueia scroll do body quando modal aberto
  useEffect(() => {
    document.body.style.overflow = openCode ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [openCode])

  const scrollVideos = (dir: "left" | "right") => {
    const el = videoScrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === "right" ? (CARD_W + CARD_GAP) * 2 : -(CARD_W + CARD_GAP) * 2, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Modal de vídeo em tela cheia */}
      {openCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setOpenCode(null)}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(420px, 95vw)" }}
          >
            <button
              onClick={() => setOpenCode(null)}
              className="absolute -top-10 right-0 flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" /> Fechar
            </button>
            <div className="overflow-hidden rounded-2xl bg-black" style={{ height: "min(745px, 90vh)" }}>
              <iframe
                src={`https://www.instagram.com/p/${openCode}/embed/`}
                width="420"
                height="745"
                style={{ border: "none", display: "block", width: "100%", height: "100%" }}
                allow="encrypted-media; autoplay; clipboard-write"
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <Image src="/images/tigre_sem_fundo.png" alt="Federal Cursos" width={44} height={44} style={{ height: "44px", width: "44px", objectFit: "contain" }} />
          <div className="w-16" />
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full border border-[#e84a20]/30 bg-[#e84a20]/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#e84a20]">
            Comunidade Federal Cursos
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Quem estuda aqui,{" "}
            <span className="text-[#e84a20]">aprova.</span>
          </h1>
          <p className="mt-4 text-lg text-white/50">
            Veja momentos das nossas turmas, eventos e a história de quem conquistou a aprovação.
          </p>
        </div>
      </section>

      {/* Carrossel automático de fotos */}
      <section className="overflow-hidden pb-16">
        <div className="overflow-hidden">
          <div ref={photoTrackRef} className="flex gap-4 will-change-transform" style={{ width: "max-content" }}>
            {loopFotos.map((src, i) => (
              <div key={i} className="relative h-64 w-[400px] shrink-0 overflow-hidden rounded-2xl sm:h-72">
                <Image src={src} alt={`Foto ${(i % displayFotos.length) + 1}`} fill className="object-cover" sizes="400px" unoptimized />
              </div>
            ))}
          </div>
        </div>
        {fotos.length === 0 && (
          <p className="mt-6 text-center text-xs text-white/20">Fotos de exemplo — as fotos reais serão adicionadas em breve.</p>
        )}
      </section>

      {/* Carrossel de vídeos */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">
            Cada aprovação é uma história de{" "}
            <span className="text-[#e84a20]">superação.</span>
          </h2>
          <p className="mb-10 text-center text-sm text-white/40">
            Por trás de cada gabarito, há noites de estudo, sacrifício e fé. Essas são as histórias dos nossos alunos.
          </p>
        </div>

        <div className="relative">
          {/* Fades laterais */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20" style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }} />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20" style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }} />

          {/* Setas */}
          <button onClick={() => scrollVideos("left")} aria-label="Anterior" className="absolute left-4 top-1/2 z-20 -translate-y-1/2 hidden items-center justify-center rounded-full bg-white/10 p-2 backdrop-blur transition hover:bg-white/25 sm:flex">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={() => scrollVideos("right")} aria-label="Próximo" className="absolute right-4 top-1/2 z-20 -translate-y-1/2 hidden items-center justify-center rounded-full bg-white/10 p-2 backdrop-blur transition hover:bg-white/25 sm:flex">
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Scroll */}
          <div
            ref={videoScrollRef}
            className="flex overflow-x-auto pb-4"
            style={{ gap: `${CARD_GAP}px`, paddingLeft: "80px", paddingRight: "80px", scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {instagramCodes.map((code) => (
              <div
                key={code}
                className="shrink-0 rounded-2xl bg-black"
                style={{ width: `${CARD_W}px`, height: `${CARD_H}px`, scrollSnapAlign: "start", position: "relative", overflow: "hidden", cursor: "pointer" }}
              >
                {/* iframe do vídeo */}
                <iframe
                  src={`https://www.instagram.com/p/${code}/embed/`}
                  width={CARD_W}
                  height={900}
                  style={{ border: "none", display: "block", marginTop: "-52px", pointerEvents: "none" }}
                  allowTransparency
                  allow="encrypted-media; autoplay; clipboard-write"
                  loading="lazy"
                />

                {/* Overlay inferior — cobre completamente o rodapé branco do Instagram */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "160px",
                    background: "linear-gradient(to bottom, transparent 0%, #000 45%)",
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                />

                {/* Overlay clicável — abre modal */}
                <div
                  onClick={() => setOpenCode(code)}
                  style={{ position: "absolute", inset: 0, zIndex: 6 }}
                  aria-label="Ver vídeo em tela cheia"
                />

                {/* Ícone de play */}
                <div
                  style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 7, pointerEvents: "none" }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8 text-center text-xs text-white/20">
        © {new Date().getFullYear()} Federal Cursos. Todos os direitos reservados.
      </footer>
    </div>
  )
}
