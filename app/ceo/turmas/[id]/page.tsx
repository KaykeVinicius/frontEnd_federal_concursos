"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { api, type ApiTurma, type ApiEnrollment, type ApiSubject, type ApiTurmaClassDay } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, FileSpreadsheet, Printer, Loader2, Users, AlertCircle,
  CalendarDays, Plus, Trash2, BookOpen, X, ChevronDown, ChevronRight,
} from "lucide-react"

// ─── helpers ──────────────────────────────────────────────
const statusLabel  = (s: string) => s === "aberta" ? "Aberta" : s === "em_andamento" ? "Em Andamento" : "Fechada"
const statusColor  = (s: string) => s === "aberta" ? "bg-green-100 text-green-800" : s === "em_andamento" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
const fmtDate      = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })

type Tab = "alunos" | "aulas"

export default function TurmaDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const turmaId  = Number(params.id)

  const [tab,         setTab        ] = useState<Tab>("alunos")
  const [turma,       setTurma      ] = useState<ApiTurma | null>(null)
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [classDays,   setClassDays  ] = useState<ApiTurmaClassDay[]>([])
  const [subjects,    setSubjects   ] = useState<ApiSubject[]>([])
  const [loading,     setLoading    ] = useState(true)
  const [error,       setError      ] = useState("")

  // form novo dia letivo
  const [showForm,        setShowForm       ] = useState(false)
  const [formDate,        setFormDate       ] = useState("")
  const [formSubject,     setFormSubject    ] = useState("")
  const [formProfessor,   setFormProfessor  ] = useState("")
  const [formStartTime,   setFormStartTime  ] = useState("")
  const [formEndTime,     setFormEndTime    ] = useState("")
  const [formTitle,       setFormTitle      ] = useState("")
  const [formDesc,        setFormDesc       ] = useState("")
  const [formSaving,      setFormSaving     ] = useState(false)
  const [formError,       setFormError      ] = useState("")
  const [professors,      setProfessors     ] = useState<{ id: number; name: string }[]>([])

  // agrupar dias por mês
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    try {
      const t = await api.turmas.get(turmaId)
      setTurma(t)
      const [all, days, subs, users] = await Promise.all([
        api.enrollments.list(),
        api.turmas.classDays.list(turmaId),
        t.course ? api.subjects.list(t.course.id) : Promise.resolve([]),
        api.users.list(),
      ])
      setEnrollments(all.filter((e) => Number(e.turma?.id) === turmaId))
      setClassDays(days)
      setSubjects(subs)
      setProfessors(users.filter((u) => u.role === "professor").map((u) => ({ id: u.id, name: u.name })))
      // expande mês atual por padrão
      const thisMonth = new Date().toISOString().slice(0, 7)
      setExpandedMonths(new Set([thisMonth]))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados da turma.")
    } finally {
      setLoading(false)
    }
  }, [turmaId])

  useEffect(() => { if (turmaId) load() }, [load, turmaId])

  // ── dias agrupados por mês ──────────────────────────────
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

  // ── adicionar dia letivo ────────────────────────────────
  async function handleAddDay(e: React.FormEvent) {
    e.preventDefault()
    if (!formDate || !formSubject) { setFormError("Preencha data e matéria."); return }
    setFormSaving(true); setFormError("")
    try {
      const day = await api.turmas.classDays.create(turmaId, {
        subject_id:   Number(formSubject),
        professor_id: formProfessor ? Number(formProfessor) : null,
        date:         formDate,
        start_time:   formStartTime || undefined,
        end_time:     formEndTime   || undefined,
        title:        formTitle.trim() || undefined,
        description:  formDesc.trim()  || undefined,
      })
      setClassDays((prev) => [...prev, day].sort((a, b) => a.date.localeCompare(b.date)))
      setExpandedMonths((prev) => new Set([...prev, day.date.slice(0, 7)]))
      setShowForm(false)
      setFormDate(""); setFormSubject(""); setFormProfessor(""); setFormStartTime(""); setFormEndTime(""); setFormTitle(""); setFormDesc("")
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erro ao adicionar aula.")
    } finally { setFormSaving(false) }
  }

  async function handleDeleteDay(id: number) {
    try {
      await api.turmas.classDays.delete(turmaId, id)
      setClassDays((prev) => prev.filter((d) => d.id !== id))
    } catch { /* silent */ }
  }

  // ── exportar Excel ─────────────────────────────────────
  function handleExcelCSV() {
    if (!turma) return
    const rows = [
      ["#", "Nome Completo", "E-mail", "Telefone / WhatsApp", "CPF", "Status"],
      ...enrollments.map((e, i) => [
        String(i + 1),
        e.student?.name ?? "—", e.student?.email ?? "—",
        e.student?.whatsapp ?? "—", e.student?.cpf ?? "—",
        e.status === "active" ? "Matriculado" : e.status === "canceled" || e.status === "cancelled" ? "Cancelado" : e.status,
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(";")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url
    a.download = `turma_${turma.name.replace(/\s+/g, "_")}_alunos.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  function handlePrint() {
    const token = localStorage.getItem("auth_token") ?? ""
    window.open(`/api/pdf/turmas/${turmaId}?token=${token}`, "_blank")
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (error)   return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="text-destructive font-medium">{error}</p>
      <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
    </div>
  )
  if (!turma) return null

  return (
    <>
      <style>{`@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: fixed; inset: 0; padding: 32px; } .no-print { display: none !important; } }`}</style>

      <div className="p-4 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Ações */}
          <div className="no-print flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExcelCSV} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" /> Excel
              </Button>
              <Button onClick={handlePrint} className="gap-2 bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                <Printer className="h-4 w-4" /> PDF
              </Button>
            </div>
          </div>

          {/* Header da turma */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{turma.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{turma.course?.title}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={statusColor(turma.status)}>{statusLabel(turma.status)}</Badge>
                {turma.modalidade && (
                  <Badge className={
                    turma.modalidade === "presencial" ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700"
                  }>
                    {turma.modalidade === "presencial" ? "Presencial" : "Híbrido"}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span><strong className="text-foreground">Alunos:</strong> {enrollments.length} / {turma.max_students}</span>
              {turma.start_date && <span><strong className="text-foreground">Início:</strong> {new Date(turma.start_date + "T00:00:00").toLocaleDateString("pt-BR")}</span>}
              {turma.end_date   && <span><strong className="text-foreground">Término:</strong> {new Date(turma.end_date + "T00:00:00").toLocaleDateString("pt-BR")}</span>}
              {turma.schedule   && <span><strong className="text-foreground">Horário:</strong> {turma.schedule}</span>}
              <span><strong className="text-foreground">Dias letivos:</strong> {classDays.length}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="no-print flex gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
            {(["alunos", "aulas"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "alunos" ? <><Users className="h-4 w-4" />Alunos ({enrollments.length})</> : <><CalendarDays className="h-4 w-4" />Dias Letivos ({classDays.length})</>}
              </button>
            ))}
          </div>

          {/* ── TAB: ALUNOS ──────────────────────────────────── */}
          {tab === "alunos" && (
            <div id="print-area" ref={printRef} className="rounded-xl border border-border bg-white text-black shadow-sm dark:bg-card dark:text-foreground">
              <div className="flex items-center justify-between border-b border-border px-8 py-6">
                <div className="flex items-center gap-4">
                  <Image src="/images/logofederalsemfundo.jpeg" alt="Federal Cursos" width={120} height={48} className="object-contain" style={{ height: 48, width: "auto" }} />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Instituição de Ensino</p>
                    <h1 className="text-xl font-extrabold text-foreground">Federal Cursos</h1>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Emitido em</p>
                  <p className="text-sm font-semibold text-foreground">{new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                </div>
              </div>

              <div className="px-8 py-6">
                {enrollments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Nenhum aluno matriculado nesta turma.</p>
                  </div>
                ) : (
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b-2 border-[#e8491d]">
                        <th className="py-3 text-left font-semibold text-muted-foreground w-8">#</th>
                        <th className="py-3 text-left font-semibold text-foreground">Nome</th>
                        <th className="py-3 text-left font-semibold text-foreground">E-mail</th>
                        <th className="py-3 text-left font-semibold text-foreground">WhatsApp</th>
                        <th className="py-3 text-left font-semibold text-foreground">Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment, i) => (
                        <tr key={enrollment.id} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                          <td className="py-3 pr-4 text-muted-foreground">{i + 1}</td>
                          <td className="py-3 pr-4 font-medium text-foreground">{enrollment.student?.name ?? "—"}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{enrollment.student?.email ?? "—"}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{enrollment.student?.whatsapp ?? "—"}</td>
                          <td className="py-3">
                            <Badge className={enrollment.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {enrollment.status === "active" ? "Matriculado" : "Cancelado"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border px-8 py-4 text-xs text-muted-foreground">
                <span>Federal Cursos — Documento gerado automaticamente pelo sistema.</span>
                <span>{enrollments.length} aluno(s)</span>
              </div>
            </div>
          )}

          {/* ── TAB: DIAS LETIVOS ─────────────────────────────── */}
          {tab === "aulas" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Organize as aulas por data e matéria para que os professores saibam quando enviar os materiais.
                </p>
                <Button
                  onClick={() => { setShowForm(true); setFormError("") }}
                  className="gap-2 bg-primary text-white hover:bg-primary/90 shrink-0"
                >
                  <Plus className="h-4 w-4" /> Novo Dia Letivo
                </Button>
              </div>

              {/* Formulário inline */}
              {showForm && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-foreground">Adicionar Dia Letivo</h3>
                    <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <form onSubmit={handleAddDay} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Data *</label>
                        <input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Matéria *</label>
                        <select
                          value={formSubject}
                          onChange={(e) => setFormSubject(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                          required
                        >
                          <option value="">Selecione a matéria</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={String(s.id)}>
                              {s.name}{s.professor ? ` — Prof. ${s.professor.name?.split(" ")[0]}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Professor da aula</label>
                        <select
                          value={formProfessor}
                          onChange={(e) => setFormProfessor(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                        >
                          <option value="">Usar professor da turma</option>
                          {professors.map((p) => (
                            <option key={p.id} value={String(p.id)}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Título / Assunto</label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="Ex: Interpretação de Texto — Módulo 1"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Horário início</label>
                        <input
                          type="time"
                          value={formStartTime}
                          onChange={(e) => setFormStartTime(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Horário término</label>
                        <input
                          type="time"
                          value={formEndTime}
                          onChange={(e) => setFormEndTime(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-foreground">Descrição (opcional)</label>
                        <input
                          type="text"
                          value={formDesc}
                          onChange={(e) => setFormDesc(e.target.value)}
                          placeholder="Observações sobre a aula"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    {formError && <p className="text-xs text-destructive">{formError}</p>}
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted">
                        Cancelar
                      </button>
                      <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                        {formSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Adicionar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {classDays.length === 0 && !showForm ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Nenhum dia letivo cadastrado</p>
                    <p className="text-sm text-muted-foreground">Adicione os dias de aula para organizar os materiais dos professores.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.keys(daysByMonth).sort().map((month) => {
                    const [year, m] = month.split("-")
                    const label = new Date(`${month}-01`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                    const isOpen = expandedMonths.has(month)
                    const days = daysByMonth[month]
                    return (
                      <div key={month} className="rounded-2xl border border-border overflow-hidden">
                        <button
                          onClick={() => toggleMonth(month)}
                          className="flex w-full items-center justify-between gap-3 px-5 py-3.5 bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                              {m}
                            </div>
                            <span className="text-sm font-semibold capitalize text-foreground">{label}</span>
                            <span className="text-xs text-muted-foreground">{days.length} aula{days.length !== 1 ? "s" : ""}</span>
                          </div>
                          {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </button>

                        {isOpen && (
                          <div className="divide-y divide-border">
                            {days.map((day) => (
                              <div key={day.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/10 transition-colors">
                                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                                  <span className="text-[10px] font-semibold leading-none">{new Date(day.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short" }).toUpperCase()}</span>
                                  <span className="text-base font-bold leading-none">{new Date(day.date + "T00:00:00").getDate()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                                      <BookOpen className="h-3 w-3" />{day.subject_name}
                                    </span>
                                    {day.professor_name && (
                                      <span className="text-xs text-muted-foreground">Prof. {day.professor_name.split(" ")[0]}</span>
                                    )}
                                    {day.start_time && (
                                      <span className="text-xs text-muted-foreground">
                                        {day.start_time}{day.end_time ? ` – ${day.end_time}` : ""}
                                      </span>
                                    )}
                                  </div>
                                  {day.title && <p className="text-sm font-medium text-foreground mt-0.5">{day.title}</p>}
                                  {day.description && <p className="text-xs text-muted-foreground">{day.description}</p>}
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">{fmtDate(day.date)}</span>
                                <button
                                  onClick={() => handleDeleteDay(day.id)}
                                  className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-400 hover:text-red-500 transition-colors"
                                  title="Remover dia letivo"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
