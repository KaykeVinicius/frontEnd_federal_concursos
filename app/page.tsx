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
  Monitor,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"


const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1"

interface ApiCareer { id: number; name: string; description: string }
interface ApiCourse {
  id: number; title: string; description: string
  price: number; duration_in_days: number
  start_date: string; end_date: string
  access_type: "online" | "presencial" | "hibrido"
  status: string; career_id?: number
}

const CAREER_COLORS = ["#e84a20","#16a34a","#2563eb","#ca8a04","#7c3aed","#0891b2","#be185d","#0e7490"]

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function validateCpf(digits: string): boolean {
  if (digits.length !== 11 || new Set(digits.split("")).size === 1) return false
  for (const pos of [9, 10]) {
    const sum = digits.slice(0, pos).split("").reduce((acc, d, i) => acc + parseInt(d) * (pos + 1 - i), 0)
    let rem = (sum * 10) % 11
    if (rem >= 10) rem = 0
    if (rem !== parseInt(digits[pos])) return false
  }
  return true
}

function maskCpf(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11)
  if (d.length > 9) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4")
  if (d.length > 6) return d.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3")
  if (d.length > 3) return d.replace(/(\d{3})(\d{1,3})/, "$1.$2")
  return d
}

function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11)
  if (d.length > 10) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  if (d.length > 6) return d.replace(/(\d{2})(\d{4,5})(\d{0,4})/, "($1) $2-$3")
  if (d.length > 2) return d.replace(/(\d{2})(\d{0,5})/, "($1) $2")
  return d
}

const emptyForm = {
  name: "", cpf: "", email: "", whatsapp: ""
}

function fieldCls(value: string, valid: boolean | null) {
  const base = "w-full rounded-lg border bg-[#0d0d0d] px-3 py-2.5 pr-9 text-sm text-white placeholder-[#4a4a4a] outline-none transition-colors"
  if (!value) return `${base} border-[#2a2a2a] focus:border-[#e84a20]`
  if (valid === true)  return `${base} border-green-500 focus:border-green-500`
  if (valid === false) return `${base} border-red-500 focus:border-red-500`
  return `${base} border-[#2a2a2a] focus:border-[#e84a20]`
}

function FieldIcon({ valid }: { valid: boolean | null }) {
  if (valid === null) return null
  if (valid) return <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
  return <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none" />
}

export default function LandingPage() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const [careers, setCareers] = useState<ApiCareer[]>([])
  const [coursesByCareer, setCoursesByCareer] = useState<Record<number, ApiCourse[]>>({})
  const [selectedCareer, setSelectedCareer] = useState<number | null>(null)

  const [enrollingCourse, setEnrollingCourse] = useState<ApiCourse | null>(null)
  const [enrollStep, setEnrollStep] = useState<"choose" | "lookup" | "form">("choose")
  const [isNewStudent, setIsNewStudent] = useState(true)
  const [lookupCpf, setLookupCpf] = useState("")
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [cpfTaken, setCpfTaken] = useState<boolean | null>(null)
  const [emailTaken, setEmailTaken] = useState<boolean | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [cRes, coRes] = await Promise.all([
          fetch(`${BASE_URL}/careers`),
          fetch(`${BASE_URL}/courses?q[access_type_eq]=1&q[status_eq]=1`),
        ])
        const cData: ApiCareer[] = cRes.ok ? await cRes.json() : []
        const coData: ApiCourse[] = coRes.ok ? await coRes.json() : []

        const grouped: Record<number, ApiCourse[]> = {}
        for (const course of coData) {
          if (!course.career_id) continue
          if (!grouped[course.career_id]) grouped[course.career_id] = []
          grouped[course.career_id].push(course)
        }

        const careersWithCourses = cData.filter(c => grouped[c.id]?.length > 0)
        setCareers(careersWithCourses)
        setCoursesByCareer(grouped)
      } catch {}
    }
    load()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setEnrollingCourse(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const allOnlineCourses = Object.values(coursesByCareer).flat()
  const visibleCount = Math.min(3, allOnlineCourses.length) || 1

  function scroll(direction: "prev" | "next") {
    if (isAnimating || allOnlineCourses.length === 0) return
    setIsAnimating(true)
    setCurrent((prev) => {
      if (direction === "next") return prev >= allOnlineCourses.length - visibleCount ? 0 : prev + 1
      return prev <= 0 ? allOnlineCourses.length - visibleCount : prev - 1
    })
    setTimeout(() => setIsAnimating(false), 400)
  }

  useEffect(() => {
    if (allOnlineCourses.length === 0) return
    const id = setInterval(() => scroll("next"), 4000)
    return () => clearInterval(id)
  })

  async function handleEnrollSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setFormError("")

    if (isNewStudent && cpfTaken) {
      setFormError("Este CPF já possui cadastro. Use a opção \"Já sou aluno\".")
      return
    }
    if (isNewStudent && emailTaken) {
      setFormError("Este e-mail já possui cadastro. Use a opção \"Já sou aluno\".")
      return
    }

    const cpfDigits = form.cpf.replace(/\D/g, "")
    if (!validateCpf(cpfDigits)) {
      setFormError("CPF inválido. Verifique os dígitos informados.")
      return
    }
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setFormError("E-mail inválido.")
      return
    }
    const phone = form.whatsapp.replace(/\D/g, "")
    if (phone.length < 10 || phone.length > 11) {
      setFormError("WhatsApp inválido. Digite DDD + número (ex: 69912345678).")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${BASE_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id:    enrollingCourse!.id,
          name:         form.name.trim(),
          cpf:      cpfDigits,
          email:    form.email.trim().toLowerCase(),
          whatsapp: phone,
        }),
      })
      const data = await res.json()
      if (res.ok && data.payment_url) {
        window.location.href = data.payment_url
      } else {
        setFormError(data.error || "Erro ao processar inscrição. Tente novamente.")
      }
    } catch {
      setFormError("Erro de conexão. Verifique sua internet e tente novamente.")
    }
    setSubmitting(false)
  }

  function openEnroll(course: ApiCourse) {
    setEnrollingCourse(course)
    setEnrollStep("choose")
    setIsNewStudent(true)
    setLookupCpf("")
    setLookupError("")
    setForm(emptyForm)
    setFormError("")
    setCpfTaken(null)
    setEmailTaken(null)
  }

  useEffect(() => {
    if (!isNewStudent || enrollStep !== "form") return
    if (cpfDigitsLive.length !== 11 || !validateCpf(cpfDigitsLive)) { setCpfTaken(null); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${BASE_URL}/checkout/check_availability?cpf=${cpfDigitsLive}`)
        const data = await res.json()
        setCpfTaken(data.cpf_taken)
      } catch {}
    }, 400)
    return () => clearTimeout(t)
  }, [form.cpf, enrollStep, isNewStudent])

  useEffect(() => {
    if (!isNewStudent || enrollStep !== "form") return
    if (!emailValid) { setEmailTaken(null); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${BASE_URL}/checkout/check_availability?email=${encodeURIComponent(form.email)}`)
        const data = await res.json()
        setEmailTaken(data.email_taken)
      } catch {}
    }, 600)
    return () => clearTimeout(t)
  }, [form.email, enrollStep, isNewStudent])

  async function handleLookup(e: { preventDefault(): void }) {
    e.preventDefault()
    setLookupError("")
    const digits = lookupCpf.replace(/\D/g, "")
    if (!validateCpf(digits)) {
      setLookupError("CPF inválido. Verifique os dígitos.")
      return
    }
    setLookupLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/checkout/student_lookup?cpf=${digits}`)
      const data = await res.json()
      if (data.found) {
        setForm({
          name:     data.name     ?? "",
          email:    data.email    ?? "",
          whatsapp: data.whatsapp ?? "",
          cpf:      maskCpf(digits),
        })
        setIsNewStudent(false)
        setCpfTaken(null)
        setEmailTaken(null)
        setEnrollStep("form")
      } else {
        setLookupError("CPF não encontrado. Faça sua primeira matrícula como novo aluno.")
      }
    } catch {
      setLookupError("Erro de conexão. Tente novamente.")
    }
    setLookupLoading(false)
  }

  const cpfDigitsLive   = form.cpf.replace(/\D/g, "")
  const cpfValid: boolean | null   = cpfDigitsLive.length === 0 ? null : cpfDigitsLive.length < 11 ? null : validateCpf(cpfDigitsLive)
  const emailValid: boolean | null = form.email.length === 0 ? null : /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)
  const phoneDigitsLive = form.whatsapp.replace(/\D/g, "")
  const phoneValid: boolean | null = phoneDigitsLive.length === 0 ? null : phoneDigitsLive.length < 10 ? null : phoneDigitsLive.length <= 11
  const nameValid: boolean | null  = form.name.trim().length === 0 ? null : true

  const labelCls = "mb-1 block text-xs font-semibold text-[#9ca3af]"

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d0d] text-[#f1f1f1]">
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-[#e84a20] via-[#ff6b3d] to-[#e84a20]" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#1e1e1e] bg-[#0d0d0d]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
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
            {[["cursos","Cursos"],["carreiras","Carreiras"],["sobre","Sobre"],["contato","Contato"]].map(([id,label]) => (
              <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm text-white/80 transition-colors hover:text-[#e84a20] cursor-pointer">
                {label}
              </button>
            ))}
            <Link href="/depoimentos" className="text-sm text-white/80 transition-colors hover:text-[#e84a20]">
              Depoimentos
            </Link>
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
        <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#e84a20]/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[-5%] h-72 w-72 rounded-full bg-[#e84a20]/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#e84a20]/30 bg-[#e84a20]/10 px-4 py-1.5 text-sm font-medium text-[#e84a20]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e84a20] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e84a20]" />
              </span>
              Turmas abertas para 2026
            </span>

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
              <button
                onClick={() => document.getElementById("cursos")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 rounded-md border border-[#2a2a2a] px-8 py-4 text-sm font-semibold text-[#d1d5db] transition-all hover:border-[#e84a20]/40 hover:text-white cursor-pointer"
              >
                <PlayCircle className="h-4 w-4 text-[#e84a20]" />
                Ver cursos disponíveis
              </button>
            </div>

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

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "5.000+", label: "Alunos aprovados" },
              { value: "120+", label: "Cursos disponíveis" },
              { value: "98%", label: "Satisfação" },
              { value: "15 anos", label: "De experiência" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-[#1e1e1e] bg-[#141414] p-6 text-center">
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
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#e84a20]">
                Turmas abertas
              </span>
              <h2 className="text-3xl font-black text-white sm:text-4xl">Cursos online disponíveis</h2>
              <p className="mt-2 text-[#6b7280]">Escolha sua área e comece hoje mesmo</p>
            </div>
            {allOnlineCourses.length > visibleCount && (
              <div className="flex gap-2">
                <button onClick={() => scroll("prev")} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#141414] text-[#9ca3af] transition-all hover:border-[#e84a20] hover:text-[#e84a20]">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => scroll("next")} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#141414] text-[#9ca3af] transition-all hover:border-[#e84a20] hover:text-[#e84a20]">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {allOnlineCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1e1e1e] bg-[#141414] py-20 text-center">
              <Monitor className="mb-4 h-10 w-10 text-[#3a3a3a]" />
              <p className="text-[#6b7280]">Nenhum curso online disponível no momento.</p>
              <p className="mt-1 text-sm text-[#3a3a3a]">Em breve novos cursos serão adicionados.</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden">
                <div
                  ref={trackRef}
                  className="flex gap-4 transition-transform duration-400 ease-in-out"
                  style={{ transform: `translateX(calc(-${current} * (100% / ${visibleCount} + 5.5px)))` }}
                >
                  {allOnlineCourses.map((curso, i) => {
                    const cor = CAREER_COLORS[i % CAREER_COLORS.length]
                    const career = careers.find(c => c.id === curso.career_id)
                    return (
                      <div
                        key={curso.id}
                        className="min-w-[calc(33.333%-11px)] flex-shrink-0 overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#141414] transition-all hover:border-[#333] hover:-translate-y-1"
                      >
                        <div className="h-1 w-full" style={{ background: cor }} />
                        <div className="p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ background: `${cor}20`, color: cor }}>
                              {career?.name ?? "Curso"}
                            </span>
                            <span className="flex items-center gap-1 rounded-full bg-[#1a1a1a] px-2.5 py-1 text-xs font-bold text-[#9ca3af]">
                              <Monitor className="h-3 w-3 text-[#e84a20]" />
                              Online
                            </span>
                          </div>
                          <h3 className="mb-1 text-lg font-bold text-white">{curso.title}</h3>
                          <p className="mb-4 line-clamp-2 text-sm text-[#6b7280]">{curso.description}</p>
                          <div className="mb-5 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                              <Clock className="h-4 w-4" style={{ color: cor }} />
                              {curso.duration_in_days} dias de acesso
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                              <BarChart className="h-4 w-4" style={{ color: cor }} />
                              {formatPrice(curso.price)}
                            </div>
                          </div>
                          <button
                            onClick={() => openEnroll(curso)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white transition-all hover:brightness-110 cursor-pointer"
                            style={{ background: cor }}
                          >
                            Quero me inscrever
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              {allOnlineCourses.length > visibleCount && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  {allOnlineCourses.slice(0, allOnlineCourses.length - visibleCount + 1).map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)} className="h-2 rounded-full transition-all"
                      style={{ width: current === i ? "24px" : "8px", background: current === i ? "#e84a20" : "#2a2a2a" }} />
                  ))}
                </div>
              )}
            </>
          )}
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
              { icon: PlayCircle, title: "Videoaulas exclusivas", desc: "Aulas gravadas por professores especialistas, disponíveis 24h dentro da plataforma." },
              { icon: BookOpen, title: "Material didático completo", desc: "Apostilas, resumos e exercícios comentados para reforçar seu aprendizado." },
              { icon: GraduationCap, title: "Equipe pedagógica dedicada", desc: "Professores com experiência em aprovações e docência de referência nacional." },
              { icon: Award, title: "Metodologia focada em resultados", desc: "Desenvolvida para maximizar seu desempenho nas provas com eficiência." },
              { icon: ShieldCheck, title: "Simulados e questões comentadas", desc: "Pratique com questões de provas anteriores e gabarito comentado para fixar o conteúdo." },
              { icon: Users, title: "Suporte personalizado", desc: "Acompanhamento da equipe pedagógica durante toda a sua preparação.", whatsapp: true },
            ].map((f) => (
              <div key={f.title} className="group rounded-xl border border-[#1e1e1e] bg-[#141414] p-6 transition-all hover:border-[#e84a20]/30 hover:-translate-y-0.5 flex flex-col">
                <f.icon className="mb-4 h-8 w-8 text-[#e84a20] transition-transform group-hover:scale-110" />
                <h3 className="mb-2 font-bold text-white">{f.title}</h3>
                <p className="text-sm text-[#6b7280] flex-1">{f.desc}</p>
                {"whatsapp" in f && f.whatsapp && (
                  <a href="https://wa.me/5569993697213" target="_blank" rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#e84a20]/40 py-2 text-xs font-bold text-[#e84a20] transition-all hover:bg-[#e84a20]/10">
                    <Phone className="h-3.5 w-3.5" />
                    Falar no WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="https://wa.me/5569993697213" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#e84a20] px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#e84a20]/25 transition-all hover:bg-[#cc3f18] hover:-translate-y-0.5">
              <Phone className="h-4 w-4" />
              Falar com um consultor
            </a>
          </div>
        </div>
      </section>

      {/* Carreiras + Cursos filtráveis */}
      <section id="carreiras" className="border-t border-[#1e1e1e] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#e84a20]">Carreiras</span>
            <h2 className="text-3xl font-black text-white">Onde você quer se aprovar?</h2>
            <p className="mt-2 text-[#6b7280]">Selecione uma carreira para filtrar os cursos online</p>
          </div>

          {careers.length > 0 && (
            <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => setSelectedCareer(null)}
                className="rounded-full border px-5 py-2 text-sm font-bold transition-all"
                style={selectedCareer === null
                  ? { background: "#e84a20", borderColor: "#e84a20", color: "#fff" }
                  : { background: "transparent", borderColor: "#2a2a2a", color: "#9ca3af" }}>
                Todos
              </button>
              {careers.map((career, ci) => {
                const cor = CAREER_COLORS[ci % CAREER_COLORS.length]
                const active = selectedCareer === career.id
                return (
                  <button key={career.id} onClick={() => setSelectedCareer(active ? null : career.id)}
                    className="rounded-full border px-5 py-2 text-sm font-bold transition-all"
                    style={active
                      ? { background: cor, borderColor: cor, color: "#fff" }
                      : { background: "transparent", borderColor: "#2a2a2a", color: "#9ca3af" }}>
                    {career.name}
                  </button>
                )
              })}
            </div>
          )}

          {allOnlineCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1e1e1e] bg-[#141414] py-20 text-center">
              <BookOpen className="mb-4 h-10 w-10 text-[#3a3a3a]" />
              <p className="text-[#6b7280]">Nenhum curso online disponível no momento.</p>
            </div>
          ) : (() => {
            const filtered = selectedCareer ? (coursesByCareer[selectedCareer] ?? []) : allOnlineCourses
            const careerMap = Object.fromEntries(careers.map((c, ci) => [c.id, { career: c, cor: CAREER_COLORS[ci % CAREER_COLORS.length] }]))

            if (filtered.length === 0) return (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1e1e1e] bg-[#141414] py-16 text-center">
                <Monitor className="mb-4 h-10 w-10 text-[#3a3a3a]" />
                <p className="text-[#6b7280]">Nenhum curso online nesta carreira ainda.</p>
              </div>
            )

            return (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((curso) => {
                  const meta = curso.career_id ? careerMap[curso.career_id] : null
                  const cor = meta?.cor ?? "#e84a20"
                  return (
                    <div key={curso.id} className="overflow-hidden rounded-xl border border-[#1e1e1e] bg-[#141414] transition-all hover:border-[#333] hover:-translate-y-0.5">
                      <div className="h-1 w-full" style={{ background: cor }} />
                      <div className="p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${cor}20`, color: cor }}>
                            {meta?.career.name ?? "Curso"}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[#9ca3af]">
                            <Monitor className="h-3.5 w-3.5 text-[#e84a20]" /> Online
                          </span>
                        </div>
                        <h4 className="mb-2 font-bold text-white">{curso.title}</h4>
                        <p className="mb-4 line-clamp-2 text-sm text-[#6b7280]">{curso.description}</p>
                        <div className="mb-4 flex items-center justify-between text-xs text-[#9ca3af]">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{curso.duration_in_days} dias</span>
                          <span className="font-bold text-white">{formatPrice(curso.price)}</span>
                        </div>
                        <button
                          onClick={() => openEnroll(curso)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 cursor-pointer"
                          style={{ background: cor }}>
                          Quero me inscrever <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      </section>

      {/* CTA Banner */}
      <section id="contato" className="border-t border-[#1e1e1e] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl border border-[#e84a20]/20 bg-gradient-to-br from-[#1a0d09] via-[#141414] to-[#0d0d0d] p-12 text-center">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#e84a20]/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#e84a20]/5 blur-2xl" />
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-[#e84a20]">Comece hoje</span>
            <h2 className="relative text-3xl font-black text-white sm:text-4xl">Sua aprovação é o nosso objetivo</h2>
            <p className="relative mt-4 text-[#9ca3af]">Junte-se a mais de 5.000 alunos aprovados. Acesse agora e comece sua preparação.</p>
            <Link href="/login"
              className="relative mt-8 inline-flex items-center gap-2 rounded-md bg-[#e84a20] px-10 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#e84a20]/25 transition-all hover:bg-[#cc3f18] hover:-translate-y-0.5">
              Acessar minha conta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1e1e1e] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="sm:hidden space-y-5">
            <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden divide-y divide-[#1e1e1e]">
              <a href="https://wa.me/5569993697213" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3.5 text-sm text-[#9ca3af] hover:bg-[#1a1a1a] hover:text-white transition-colors">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e84a20]/10 shrink-0">
                  <Phone className="h-4 w-4 text-[#e84a20]" />
                </span>
                (69) 99369-7213
              </a>
              <a href="https://instagram.com/federalcursos" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3.5 text-sm text-[#9ca3af] hover:bg-[#1a1a1a] hover:text-white transition-colors">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e84a20]/10 shrink-0">
                  <svg className="h-4 w-4 text-[#e84a20]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </span>
                @federalcursos
              </a>
              <a href="mailto:federal@federalcursos.com"
                className="flex items-center gap-3 px-5 py-3.5 text-sm text-[#9ca3af] hover:bg-[#1a1a1a] hover:text-white transition-colors">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e84a20]/10 shrink-0">
                  <svg className="h-4 w-4 text-[#e84a20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                federal@federalcursos.com
              </a>
              <div className="flex items-center gap-3 px-5 py-3.5 text-sm text-[#9ca3af]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e84a20]/10 shrink-0">
                  <svg className="h-4 w-4 text-[#e84a20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                R. Getúlio Vargas, 2634 — São Cristóvão, Porto Velho – RO
              </div>
            </div>
            <p className="text-center text-xs text-[#3a3a3a]">
              © {new Date().getFullYear()} Federal Cursos. Todos os direitos reservados.
            </p>
          </div>

          <div className="hidden sm:flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#6b7280]">
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
              R. Getúlio Vargas, 2634 — São Cristóvão, Porto Velho – RO
            </span>
          </div>

          <p className="hidden sm:block text-center text-xs text-[#3a3a3a]">
            © {new Date().getFullYear()} Federal Cursos. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <div className="h-1 w-full bg-gradient-to-r from-[#e84a20] via-[#ff6b3d] to-[#e84a20]" />

      {/* Enrollment Modal */}
      {enrollingCourse && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEnrollingCourse(null) }}
        >
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#2a2a2a] bg-[#141414] shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2a2a2a] bg-[#141414] px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#e84a20]">Inscrição</p>
                <h2 className="text-base font-black text-white leading-tight">{enrollingCourse.title}</h2>
                <p className="text-xs text-[#6b7280] mt-0.5">{formatPrice(enrollingCourse.price)}</p>
              </div>
              <button onClick={() => setEnrollingCourse(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2a2a2a] text-[#9ca3af] hover:border-[#e84a20] hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step: choose */}
            {enrollStep === "choose" && (
              <div className="p-6 space-y-4">
                <p className="text-sm text-[#9ca3af] text-center">Como você quer continuar?</p>
                <button
                  onClick={() => setEnrollStep("form")}
                  className="flex w-full items-start gap-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 text-left transition-all hover:border-[#e84a20]/60 hover:bg-[#1f1f1f] cursor-pointer group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e84a20]/10 group-hover:bg-[#e84a20]/20 transition-colors">
                    <Users className="h-5 w-5 text-[#e84a20]" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Primeira matrícula</p>
                    <p className="mt-0.5 text-xs text-[#6b7280]">Ainda não tenho cadastro no Federal Cursos</p>
                  </div>
                </button>
                <button
                  onClick={() => setEnrollStep("lookup")}
                  className="flex w-full items-start gap-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 text-left transition-all hover:border-green-500/60 hover:bg-[#1f1f1f] cursor-pointer group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Já sou aluno</p>
                    <p className="mt-0.5 text-xs text-[#6b7280]">Já estudei no Federal Cursos — preenche automático</p>
                  </div>
                </button>
              </div>
            )}

            {/* Step: lookup */}
            {enrollStep === "lookup" && (
              <form onSubmit={handleLookup} className="p-6 space-y-4">
                <p className="text-sm text-[#9ca3af]">Digite seu CPF para buscar seus dados cadastrados:</p>
                <div>
                  <label className={labelCls}>CPF *</label>
                  <div className="relative">
                    <input
                      required autoFocus
                      className={fieldCls(lookupCpf, lookupCpf.replace(/\D/g,"").length === 11 ? validateCpf(lookupCpf.replace(/\D/g,"")) : lookupCpf.length > 0 ? null : null)}
                      placeholder="000.000.000-00"
                      inputMode="numeric" maxLength={14}
                      value={lookupCpf}
                      onChange={e => { setLookupCpf(maskCpf(e.target.value)); setLookupError("") }}
                    />
                    <FieldIcon valid={lookupCpf.replace(/\D/g,"").length === 11 ? validateCpf(lookupCpf.replace(/\D/g,"")) : null} />
                  </div>
                  {lookupError && (
                    <p className="mt-1.5 text-xs text-red-400">{lookupError}</p>
                  )}
                </div>
                <button type="submit" disabled={lookupLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e84a20] py-3 text-sm font-bold text-white transition-all hover:bg-[#cc3f18] disabled:opacity-60 cursor-pointer">
                  {lookupLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Buscando...</> : "Buscar meus dados"}
                </button>
                <button type="button" onClick={() => setEnrollStep("choose")}
                  className="w-full text-center text-xs text-[#6b7280] hover:text-white transition-colors cursor-pointer">
                  ← Voltar
                </button>
              </form>
            )}

            {/* Step: form */}
            {enrollStep === "form" && <form onSubmit={handleEnrollSubmit} className="p-6 space-y-5">
              {/* Dados pessoais */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#6b7280]">Dados pessoais</p>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Nome completo *</label>
                    <div className="relative">
                      <input required className={fieldCls(form.name, nameValid)} placeholder="Seu nome completo"
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                      <FieldIcon valid={nameValid} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>CPF *</label>
                      <div className="relative">
                        <input required className={fieldCls(form.cpf, cpfValid)} placeholder="000.000.000-00"
                          inputMode="numeric" maxLength={14}
                          value={form.cpf}
                          onChange={e => setForm(f => ({ ...f, cpf: maskCpf(e.target.value) }))} />
                        <FieldIcon valid={cpfValid} />
                      </div>
                      {cpfValid === false && (
                        <p className="mt-1 text-xs text-red-400">CPF inválido. Verifique os dígitos.</p>
                      )}
                      {cpfTaken === true && (
                        <div className="mt-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                          Este CPF já possui cadastro.{" "}
                          <button type="button" onClick={() => setEnrollStep("lookup")}
                            className="font-bold underline hover:text-amber-300 cursor-pointer">
                            Usar &quot;Já sou aluno&quot;
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>WhatsApp *</label>
                      <div className="relative">
                        <input required className={fieldCls(form.whatsapp, phoneValid)} placeholder="(69) 99999-9999"
                          inputMode="numeric" maxLength={15}
                          value={form.whatsapp}
                          onChange={e => setForm(f => ({ ...f, whatsapp: maskPhone(e.target.value) }))} />
                        <FieldIcon valid={phoneValid} />
                      </div>
                      {phoneValid === false && (
                        <p className="mt-1 text-xs text-red-400">Digite DDD + número (10 ou 11 dígitos).</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>E-mail *</label>
                    <div className="relative">
                      <input required type="email" className={fieldCls(form.email, emailValid)} placeholder="seu@email.com"
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      <FieldIcon valid={emailValid} />
                    </div>
                    {emailValid === false && (
                      <p className="mt-1 text-xs text-red-400">E-mail inválido.</p>
                    )}
                    {emailTaken === true && (
                      <div className="mt-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                        Este e-mail já possui cadastro.{" "}
                        <button type="button" onClick={() => setEnrollStep("lookup")}
                          className="font-bold underline hover:text-amber-300 cursor-pointer">
                          Usar &quot;Já sou aluno&quot;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {formError}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#e84a20] shrink-0" />
                Pagamento processado com segurança via Stripe
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e84a20] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#cc3f18] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
                ) : (
                  <>Ir para pagamento <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>}
          </div>
        </div>
      )}
    </div>
  )
}
