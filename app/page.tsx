"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  BookOpen,
  GraduationCap,
  Award,
  Users,
  PlayCircle,
  CheckCircle,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
  BarChart,
  ShieldCheck,
  Phone,
  Calculator,
} from "lucide-react"

const cursos = [
  {
    titulo: "Concurso IPERON 2026",
    categoria: "Previdenciário",
    nivel: "Médio e Superior",
    aulas: 180,
    duracao: "6 meses",
    vagas: "7.000 vagas",
    destaque: true,
    cor: "#e84a20",
  },
  {
    titulo: "OAB — 1ª e 2ª Fase",
    categoria: "OAB",
    nivel: "Superior",
    aulas: 220,
    duracao: "8 meses",
    vagas: "Próxima turma",
    destaque: false,
    cor: "#2563eb",
  },
  {
    titulo: "Seduc - AM",
    categoria: "ESTADUAL",
    nivel: "Ensino Médio",
    aulas: 90,
    duracao: "3 meses",
    vagas: "Turma aberta",
    destaque: false,
    cor: "#16a34a",
  },
  {
    titulo: "Banco do Brasil 2025",
    categoria: "Bancário",
    nivel: "Médio e Superior",
    aulas: 150,
    duracao: "5 meses",
    vagas: "4.000 vagas",
    destaque: true,
    cor: "#ca8a04",
  },
  {
    titulo: "Polícia Federal",
    categoria: "Federal",
    nivel: "Superior",
    aulas: 200,
    duracao: "7 meses",
    vagas: "Edital previsto",
    destaque: false,
    cor: "#7c3aed",
  },
  {
    titulo: "Prefeituras — Pacote Municipal",
    categoria: "Municipal",
    nivel: "Todos os níveis",
    aulas: 130,
    duracao: "4 meses",
    vagas: "Diversas vagas",
    destaque: false,
    cor: "#0891b2",
  },
]

export default function LandingPage() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const visibleCount = 3

  function scroll(direction: "prev" | "next") {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent((prev) => {
      if (direction === "next") return prev >= cursos.length - visibleCount ? 0 : prev + 1
      return prev <= 0 ? cursos.length - visibleCount : prev - 1
    })
    setTimeout(() => setIsAnimating(false), 400)
  }

  // Auto-play
  useEffect(() => {
    const id = setInterval(() => scroll("next"), 4000)
    return () => clearInterval(id)
  })

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d0d] text-[#f1f1f1]">
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-[#e84a20] via-[#ff6b3d] to-[#e84a20]" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#1e1e1e] bg-[#0d0d0d]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand */}
          <Image
            src="/images/tigre_sem_fundo.png"
            alt="Federal Cursos"
            width={160}
            height={52}
            className="rounded-md"
            style={{ width: "auto", height: "44px", objectFit: "contain" }}
            priority
          />

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#cursos" className="text-sm text-[#9ca3af] transition-colors hover:text-[#e84a20]">
              Cursos
            </a>
            <a href="#carreiras" className="text-sm text-[#9ca3af] transition-colors hover:text-[#e84a20]">
              Carreiras
            </a>
            <a href="#sobre" className="text-sm text-[#9ca3af] transition-colors hover:text-[#e84a20]">
              Sobre
            </a>
            <a href="#contato" className="text-sm text-[#9ca3af] transition-colors hover:text-[#e84a20]">
              Contato
            </a>
          </nav>

          <Link
            href="/login"
            className="rounded-md bg-[#e84a20] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#e84a20]/20 transition-all hover:bg-[#cc3f18] hover:shadow-[#e84a20]/30"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        {/* Background blobs */}
        <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#e84a20]/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[-5%] h-72 w-72 rounded-full bg-[#e84a20]/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#e84a20]/30 bg-[#e84a20]/10 px-4 py-1.5 text-sm font-medium text-[#e84a20]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e84a20] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e84a20]" />
              </span>
              Turmas abertas para 2026
            </span>

            {/* Logo em destaque */}
            <div className="mb-8 drop-shadow-2xl">
              <Image
                src="/images/federal_cursos_sem_fundo.png"
                alt="Federal Cursos"
                width={520}
                height={200}
                className="rounded-2xl"
                style={{ width: "auto", height: "auto", maxWidth: "min(520px, 85vw)" }}
                priority
              />
            </div>

            <p className="mb-2 text-xl font-bold text-[#d1d5db] sm:text-2xl">
              Sua Aprovação começa aqui e agora!
            </p>
            <p className="mx-auto mb-4 max-w-2xl text-base italic text-[#9ca3af]">
              "Você não é apenas mais um concorrente. Você nasceu para ser aprovado."
            </p>
            <p className="mx-auto max-w-xl text-sm text-[#6b7280] whitespace-nowrap">
              Método direto no alvo. Sem enrolação. Sem promessas vazias. Só o que realmente faz você passar.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-md bg-[#e84a20] px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#e84a20]/25 transition-all hover:bg-[#cc3f18] hover:shadow-[#e84a20]/40 hover:-translate-y-0.5"
              >
                Quero ser aprovado!
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#cursos"
                className="flex items-center gap-2 rounded-md border border-[#2a2a2a] px-8 py-4 text-sm font-semibold text-[#d1d5db] transition-all hover:border-[#e84a20]/40 hover:text-white"
              >
                <PlayCircle className="h-4 w-4 text-[#e84a20]" />
                Ver cursos disponíveis
              </a>
            </div>

            {/* Trust icons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6b7280]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#e84a20]" />
                Pagamento seguro
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#e84a20]" />
                Acesso imediato
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-[#e84a20]" />
                Satisfação garantida
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-[#e84a20]" />
                Suporte especializado
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "5.000+", label: "Alunos aprovados" },
              { value: "120+", label: "Cursos disponíveis" },
              { value: "98%", label: "Satisfação" },
              { value: "15 anos", label: "De experiência" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[#1e1e1e] bg-[#141414] p-6 text-center"
              >
                <div className="text-3xl font-black text-[#e84a20]">{stat.value}</div>
                <div className="mt-1 text-xs text-[#9ca3af]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Carousel */}
      <section id="cursos" className="border-t border-[#1e1e1e] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#e84a20]">
                Turmas abertas
              </span>
              <h2 className="text-3xl font-black text-white sm:text-4xl">
                Cursos disponíveis
              </h2>
              <p className="mt-2 text-[#6b7280]">
                Escolha sua área e comece hoje mesmo
              </p>
            </div>
            {/* Carousel controls */}
            <div className="flex gap-2">
              <button
                onClick={() => scroll("prev")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#141414] text-[#9ca3af] transition-all hover:border-[#e84a20] hover:text-[#e84a20]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll("next")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#141414] text-[#9ca3af] transition-all hover:border-[#e84a20] hover:text-[#e84a20]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Carousel track */}
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex gap-4 transition-transform duration-400 ease-in-out"
              style={{ transform: `translateX(calc(-${current} * (100% / ${visibleCount} + 5.5px)))` }}
            >
              {cursos.map((curso, i) => (
                <div
                  key={i}
                  className="min-w-[calc(33.333%-11px)] flex-shrink-0 overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#141414] transition-all hover:border-[#333] hover:-translate-y-1"
                  style={{ ["--curso-cor" as string]: curso.cor }}
                >
                  {/* Top color bar */}
                  <div className="h-1 w-full" style={{ background: curso.cor }} />

                  <div className="p-6">
                    {/* Category + destaque */}
                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                        style={{ background: `${curso.cor}20`, color: curso.cor }}
                      >
                        {curso.categoria}
                      </span>
                      {curso.destaque && (
                        <span className="flex items-center gap-1 rounded-full bg-[#e84a20]/10 px-2.5 py-1 text-xs font-bold text-[#e84a20]">
                          <Star className="h-3 w-3 fill-[#e84a20]" />
                          Destaque
                        </span>
                      )}
                    </div>

                    <h3 className="mb-1 text-lg font-bold text-white">{curso.titulo}</h3>
                    <p className="mb-4 text-sm text-[#6b7280]">{curso.nivel}</p>

                    <div className="mb-5 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                        <PlayCircle className="h-4 w-4" style={{ color: curso.cor }} />
                        {curso.aulas} videoaulas
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                        <Clock className="h-4 w-4" style={{ color: curso.cor }} />
                        {curso.duracao} de acesso
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                        <BarChart className="h-4 w-4" style={{ color: curso.cor }} />
                        {curso.vagas}
                      </div>
                    </div>

                    <a
                      href="https://wa.me/5569993697213"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white transition-all hover:brightness-110"
                      style={{ background: curso.cor }}
                    >
                      Quero me inscrever
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {cursos.slice(0, cursos.length - visibleCount + 1).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: current === i ? "24px" : "8px",
                  background: current === i ? "#e84a20" : "#2a2a2a",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="sobre" className="border-t border-[#1e1e1e] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#e84a20]">
              Diferenciais
            </span>
            <h2 className="text-3xl font-black text-white">Por que o Federal Cursos?</h2>
          </div>

          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: PlayCircle,
                title: "Videoaulas exclusivas",
                desc: "Aulas gravadas por professores especialistas, disponíveis 24h dentro da plataforma.",
              },
              {
                icon: BookOpen,
                title: "Material didático completo",
                desc: "Apostilas, resumos e exercícios comentados para reforçar seu aprendizado.",
              },
              {
                icon: GraduationCap,
                title: "Equipe pedagógica dedicada",
                desc: "Professores com experiência em aprovações e docência de referência nacional.",
              },
              {
                icon: Award,
                title: "Metodologia focada em resultados",
                desc: "Desenvolvida para maximizar seu desempenho nas provas com eficiência.",
              },
              {
                icon: Users,
                title: "Suporte personalizado",
                desc: "Acompanhamento da equipe pedagógica durante toda a sua preparação.",
                whatsapp: true,
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-[#1e1e1e] bg-[#141414] p-6 transition-all hover:border-[#e84a20]/30 hover:-translate-y-0.5 flex flex-col"
              >
                <f.icon className="mb-4 h-8 w-8 text-[#e84a20] transition-transform group-hover:scale-110" />
                <h3 className="mb-2 font-bold text-white">{f.title}</h3>
                <p className="text-sm text-[#6b7280] flex-1">{f.desc}</p>
                {"whatsapp" in f && f.whatsapp && (
                  <a
                    href="https://wa.me/5569993697213"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#e84a20]/40 py-2 text-xs font-bold text-[#e84a20] transition-all hover:bg-[#e84a20]/10"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Falar no WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <a
              href="https://wa.me/5569993697213"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#e84a20] px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#e84a20]/25 transition-all hover:bg-[#cc3f18] hover:-translate-y-0.5"
            >
              <Phone className="h-4 w-4" />
              Falar com um consultor
            </a>
          </div>
        </div>
      </section>

      {/* Areas */}
      <section id="carreiras" className="border-t border-[#1e1e1e] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#e84a20]">
              Áreas
            </span>
            <h2 className="text-3xl font-black text-white">Onde você quer se aprovar?</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Concursos Públicos", sub: "Federal, Estadual e Municipal", icon: Award },
              { label: "OAB", sub: "1ª e 2ª fases", icon: BookOpen },
              { label: "CFC", sub: "Conselho Federal de Contabilidade", icon: Calculator },
              { label: "Bancários", sub: "BB, Caixa e outros", icon: BarChart },
            ].map((area) => (
              <div
                key={area.label}
                className="group flex flex-col items-center rounded-xl border border-[#1e1e1e] bg-[#141414] p-6 text-center transition-all hover:border-[#e84a20]/40 hover:-translate-y-0.5"
              >
                <area.icon className="mb-3 h-7 w-7 text-[#e84a20] transition-transform group-hover:scale-110" />
                <h3 className="font-bold text-white">{area.label}</h3>
                <p className="mt-1 text-xs text-[#6b7280]">{area.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section id="contato" className="border-t border-[#1e1e1e] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl border border-[#e84a20]/20 bg-gradient-to-br from-[#1a0d09] via-[#141414] to-[#0d0d0d] p-12 text-center">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#e84a20]/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#e84a20]/5 blur-2xl" />

            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-[#e84a20]">
              Comece hoje
            </span>
            <h2 className="relative text-3xl font-black text-white sm:text-4xl">
              Sua aprovação é o nosso objetivo
            </h2>
            <p className="relative mt-4 text-[#9ca3af]">
              Junte-se a mais de 5.000 alunos aprovados. Acesse agora e comece sua preparação.
            </p>
            <Link
              href="/login"
              className="relative mt-8 inline-flex items-center gap-2 rounded-md bg-[#e84a20] px-10 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#e84a20]/25 transition-all hover:bg-[#cc3f18] hover:-translate-y-0.5"
            >
              Acessar minha conta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1e1e1e] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#6b7280]">
            <a href="https://wa.me/5569993697213" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-white">
              <Phone className="h-4 w-4 text-[#e84a20]" />
              (69) 99369-7213
            </a>
            <a href="mailto:federal@federalcursos.com" className="flex items-center gap-1.5 transition-colors hover:text-white">
              <svg className="h-4 w-4 text-[#e84a20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              federal@federalcursos.com
            </a>
            <a href="https://instagram.com/federalcursos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-white">
              <svg className="h-4 w-4 text-[#e84a20]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              @federalcursos
            </a>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 shrink-0 text-[#e84a20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              R. Getúlio Vargas, 2634 — São Cristóvão, Porto Velho – RO, 76804-060
            </span>
          </div>

          <p className="text-center text-xs text-[#3a3a3a]">
            © {new Date().getFullYear()} Federal Cursos. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <div className="h-1 w-full bg-gradient-to-r from-[#e84a20] via-[#ff6b3d] to-[#e84a20]" />
    </div>
  )
}
