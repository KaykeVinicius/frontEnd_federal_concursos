"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Shield, GraduationCap, Scale, BookOpen, Briefcase, Building2,
  Landmark, Users, ChevronRight, ArrowRight, Search, Loader2,
  MapPin, Clock, DollarSign, Star,
} from "lucide-react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1"

interface ApiCareer { id: number; name: string; description: string }
interface ApiCourse {
  id: number; title: string; description: string; price: number
  access_type: string; status: string; career_id?: number
  cover_image_url?: string | null
}

// Ícone e cor por nome da carreira (extensível)
function careerMeta(name: string): { icon: React.ReactNode; color: string; bg: string } {
  const n = name.toLowerCase()
  if (n.includes("policia") || n.includes("militar") || n.includes("guarda") || n.includes("segur"))
    return { icon: <Shield className="h-8 w-8" />, color: "text-blue-600", bg: "bg-blue-50" }
  if (n.includes("fiscal") || n.includes("tribut") || n.includes("receita"))
    return { icon: <DollarSign className="h-8 w-8" />, color: "text-green-600", bg: "bg-green-50" }
  if (n.includes("juiz") || n.includes("juríd") || n.includes("oab") || n.includes("promotor") || n.includes("defensor"))
    return { icon: <Scale className="h-8 w-8" />, color: "text-purple-600", bg: "bg-purple-50" }
  if (n.includes("educa") || n.includes("professor") || n.includes("pedagog"))
    return { icon: <GraduationCap className="h-8 w-8" />, color: "text-yellow-600", bg: "bg-yellow-50" }
  if (n.includes("admin") || n.includes("gestão") || n.includes("gestao"))
    return { icon: <Briefcase className="h-8 w-8" />, color: "text-orange-600", bg: "bg-orange-50" }
  if (n.includes("banc") || n.includes("financ"))
    return { icon: <Landmark className="h-8 w-8" />, color: "text-teal-600", bg: "bg-teal-50" }
  if (n.includes("munici") || n.includes("estado") || n.includes("federal") || n.includes("public"))
    return { icon: <Building2 className="h-8 w-8" />, color: "text-indigo-600", bg: "bg-indigo-50" }
  return { icon: <Users className="h-8 w-8" />, color: "text-rose-600", bg: "bg-rose-50" }
}

export default function CarreirasPage() {
  const [careers, setCareers] = useState<ApiCareer[]>([])
  const [coursesByCareer, setCoursesByCareer] = useState<Record<number, ApiCourse[]>>({})
  const [selected, setSelected] = useState<ApiCareer | null>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/careers`).then(r => r.json()).catch(() => []),
      fetch(`${BASE_URL}/courses`).then(r => r.json()).catch(() => []),
    ]).then(([cData, courses]: [ApiCareer[], ApiCourse[]]) => {
      const grouped: Record<number, ApiCourse[]> = {}
      for (const c of courses) {
        if (!c.career_id || c.status !== "published") continue
        if (!grouped[c.career_id]) grouped[c.career_id] = []
        grouped[c.career_id].push(c)
      }
      setCareers(cData.filter(c => grouped[c.id]?.length > 0))
      setCoursesByCareer(grouped)
    }).finally(() => setLoading(false))
  }, [])

  const filteredCareers = search.trim()
    ? careers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : careers

  const courses = selected ? (coursesByCareer[selected.id] ?? []) : []

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1e1e1e] bg-[#0d0d0d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e84a20]">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-white">Federal Cursos</span>
          </Link>
          <nav className="hidden gap-6 sm:flex text-sm">
            {[["/#cursos","Cursos"],["/#carreiras","Início"],["/#contato","Contato"]].map(([href,label]) => (
              <Link key={href} href={href} className="text-[#9ca3af] transition hover:text-white">{label}</Link>
            ))}
          </nav>
          <Link href="/login" className="rounded-lg bg-[#e84a20] px-4 py-1.5 text-sm font-bold text-white transition hover:bg-[#d13a0f]">
            Acessar plataforma
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[#1e1e1e] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-[#6b7280] mb-4">
            <Link href="/" className="hover:text-white transition">Início</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Cursos por Carreira</span>
          </div>
          <h1 className="text-3xl font-black sm:text-4xl">Cursos por Carreira</h1>
          <p className="mt-2 text-[#9ca3af]">Selecione uma carreira para visualizar os cursos disponíveis</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-[#e84a20]" /></div>
        ) : selected ? (
          /* ── Cursos da carreira selecionada ── */
          <div>
            <button
              onClick={() => setSelected(null)}
              className="mb-6 flex items-center gap-2 text-sm text-[#9ca3af] hover:text-white transition"
            >
              <ChevronRight className="h-4 w-4 rotate-180" /> Voltar para todas as carreiras
            </button>

            {/* Header da carreira */}
            <div className="mb-8 flex items-center gap-4 rounded-2xl border border-[#1e1e1e] bg-[#141414] p-6">
              {(() => { const m = careerMeta(selected.name); return (
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${m.bg} ${m.color}`}>
                  {m.icon}
                </div>
              )})()}
              <div>
                <h2 className="text-2xl font-black">{selected.name}</h2>
                {selected.description && <p className="mt-1 text-sm text-[#9ca3af] max-w-2xl">{selected.description}</p>}
                <p className="mt-1 text-xs text-[#6b7280]">{courses.length} curso(s) disponível(is)</p>
              </div>
            </div>

            {/* Grid de cursos */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((curso) => (
                <div key={curso.id} className="group overflow-hidden rounded-xl border border-[#1e1e1e] bg-[#141414] transition-all hover:border-[#e84a20]/40 hover:-translate-y-0.5">
                  {curso.cover_image_url ? (
                    <div className="h-36 w-full overflow-hidden">
                      <img src={curso.cover_image_url} alt={curso.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#141414]">
                      <BookOpen className="h-10 w-10 text-[#3a3a3a]" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2 ${
                      curso.access_type === "online" ? "bg-blue-900/40 text-blue-400" :
                      curso.access_type === "presencial" ? "bg-orange-900/40 text-orange-400" :
                      "bg-purple-900/40 text-purple-400"
                    }`}>
                      {curso.access_type === "online" ? "Online" : curso.access_type === "presencial" ? "Presencial" : "Híbrido"}
                    </span>
                    <h3 className="font-bold text-white leading-snug">{curso.title}</h3>
                    {curso.description && (
                      <p className="mt-1 text-xs text-[#6b7280] line-clamp-2">{curso.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-black text-[#e84a20]">
                        {Number(curso.price) === 0 ? "Gratuito" : `R$ ${Number(curso.price).toFixed(2)}`}
                      </span>
                      <Link href="/login"
                        className="flex items-center gap-1 rounded-lg bg-[#e84a20] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#d13a0f]">
                        Matricular <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Grid de carreiras ── */
          <div>
            {/* Busca */}
            <div className="mb-8 relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="text"
                placeholder="Buscar carreira..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#1e1e1e] bg-[#141414] pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-[#e84a20]/50"
              />
            </div>

            {filteredCareers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-24 text-center">
                <BookOpen className="h-12 w-12 text-[#3a3a3a]" />
                <p className="text-[#6b7280]">Nenhuma carreira encontrada.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCareers.map((career) => {
                  const meta = careerMeta(career.name)
                  const count = coursesByCareer[career.id]?.length ?? 0
                  return (
                    <button
                      key={career.id}
                      onClick={() => setSelected(career)}
                      className="group text-left overflow-hidden rounded-xl border border-[#1e1e1e] bg-[#141414] p-6 transition-all hover:border-[#e84a20]/50 hover:bg-[#1a1a1a] hover:-translate-y-0.5"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color} transition group-hover:scale-110`}>
                          {meta.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-white leading-tight">{career.name}</h3>
                          {career.description && (
                            <p className="mt-1 text-xs text-[#6b7280] line-clamp-2 leading-relaxed">{career.description}</p>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-[#9ca3af]">
                              {count} curso{count !== 1 ? "s" : ""}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-[#e84a20] opacity-0 group-hover:opacity-100 transition">
                              Ver cursos <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer simples */}
      <footer className="border-t border-[#1e1e1e] px-4 py-8 mt-16 text-center">
        <p className="text-xs text-[#6b7280]">© {new Date().getFullYear()} Federal Cursos. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
