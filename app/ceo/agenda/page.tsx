"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ChevronLeft, ChevronRight, CalendarRange, Loader2,
  MapPin, Clock, Users, BookOpen, GraduationCap, Plus, X, Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { api, getToken, type ApiTurma, type ApiSubject } from "@/lib/api"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1"

// ─── Types ────────────────────────────────────────────────
interface AgendaItem {
  id: string
  type: "event" | "class_day"
  event_type?: "aulao" | "simulado"
  title: string
  date: string
  start_time?: string
  end_time?: string
  location?: string
  status?: string
  course_name?: string
  turma_name?: string
  subject_name?: string
  professor_name?: string
  description?: string
  is_free?: boolean
  registered_count?: number
  max_participants?: number
}

// ─── Config visual ───────────────────────────────────────
const TYPE_CONFIG = {
  aulao:     { label: "Aulão",           color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  simulado:  { label: "Simulado",        color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  class_day: { label: "Aula presencial", color: "bg-green-500/20 text-green-300 border-green-500/30" },
}

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const DAY_NAMES   = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]

const EMPTY_FORM = { turma_id: "", subject_id: "", date: "", start_time: "", end_time: "", title: "", description: "" }

// ─── Page ─────────────────────────────────────────────────
export default function AgendaPage() {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [items, setItems] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [view, setView] = useState<"month" | "list">("month")

  // Modal state
  const [showModal, setShowModal]   = useState(false)
  const [turmasAll, setTurmasAll]   = useState<ApiTurma[]>([])
  const [subjectsAll, setSubjectsAll] = useState<ApiSubject[]>([])
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [formErr, setFormErr]       = useState("")

  const fetchAgenda = useCallback(async (y: number, m: number) => {
    setLoading(true)
    try {
      const start = `${y}-${String(m + 1).padStart(2, "0")}-01`
      const lastDay = new Date(y, m + 1, 0).getDate()
      const end = `${y}-${String(m + 1).padStart(2, "0")}-${lastDay}`
      const token = getToken()
      const res = await fetch(`${BASE_URL}/agenda?start=${start}&end=${end}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAgenda(year, month) }, [year, month, fetchAgenda])

  // Load turmas and subjects for the modal
  useEffect(() => {
    Promise.all([api.turmas.list(), api.subjects.list()])
      .then(([t, s]) => {
        setTurmasAll(t.filter((x) => x.modalidade === "presencial" || x.modalidade === "hibrido"))
        setSubjectsAll(s)
      })
      .catch(console.error)
  }, [])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelected(null)
  }
  function goToday() { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null) }

  function openModal() {
    setForm({ ...EMPTY_FORM, date: selected ?? "" })
    setFormErr("")
    setShowModal(true)
  }

  async function handleCreate() {
    if (!form.turma_id || !form.subject_id || !form.date) {
      setFormErr("Turma, matéria e data são obrigatórios.")
      return
    }
    setSaving(true)
    setFormErr("")
    try {
      await api.turmas.classDays.create(Number(form.turma_id), {
        subject_id: Number(form.subject_id),
        date: form.date,
        start_time: form.start_time || undefined,
        end_time: form.end_time || undefined,
        title: form.title || undefined,
        description: form.description || undefined,
      })
      setShowModal(false)
      fetchAgenda(year, month)
    } catch {
      setFormErr("Erro ao salvar. Verifique os dados.")
    } finally {
      setSaving(false)
    }
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  function itemsForDay(day: number) {
    return items.filter((i) => i.date === dateStr(day))
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  const selectedItems = selected ? items.filter((i) => i.date === selected) : []

  function getTypeConfig(item: AgendaItem) {
    if (item.type === "class_day") return TYPE_CONFIG.class_day
    return TYPE_CONFIG[item.event_type ?? "aulao"] ?? TYPE_CONFIG.aulao
  }

  function chipLabel(item: AgendaItem) {
    if (item.type === "class_day") {
      if (item.title && item.subject_name) return `${item.title} · ${item.subject_name}`
      return item.subject_name || item.title
    }
    return item.title
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarRange className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Agenda</h1>
            <p className="text-xs text-muted-foreground">Aulas presenciais, aulões e simulados</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={openModal} className="gap-1.5">
            <Plus className="h-4 w-4" /> Nova Aula
          </Button>
          <div className="flex rounded-md border border-border overflow-hidden">
            <button onClick={() => setView("month")}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", view === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
            >Mês</button>
            <button onClick={() => setView("list")}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors border-l border-border", view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
            >Lista</button>
          </div>
          <Button variant="outline" size="sm" onClick={goToday} className="text-xs">Hoje</Button>
          <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="min-w-[140px] text-center text-sm font-semibold">
            {MONTH_NAMES[month]} {year}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(TYPE_CONFIG).map(([k, v]) => (
          <span key={k} className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium", v.color)}>
            {v.label}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : view === "month" ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-border">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="min-h-[90px] bg-muted/20" />
              const ds = dateStr(day)
              const dayItems = itemsForDay(day)
              const isToday = ds === todayStr
              const isSelected = ds === selected
              return (
                <div key={ds}
                  onClick={() => setSelected(isSelected ? null : ds)}
                  className={cn(
                    "min-h-[90px] p-1.5 cursor-pointer transition-colors",
                    isSelected ? "bg-primary/10" : "hover:bg-muted/40",
                    isToday ? "ring-1 ring-inset ring-primary/60" : "",
                  )}
                >
                  <div className={cn(
                    "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                  )}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayItems.slice(0, 3).map((item) => {
                      const cfg = getTypeConfig(item)
                      return (
                        <div key={item.id} className={cn("rounded px-1 py-0.5 text-[10px] font-medium border truncate", cfg.color)}>
                          {chipLabel(item)}
                        </div>
                      )
                    })}
                    {dayItems.length > 3 && (
                      <div className="text-[10px] text-muted-foreground pl-1">+{dayItems.length - 3} mais</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
              Nenhum item neste mês.
            </div>
          ) : items.map((item) => {
            const cfg = getTypeConfig(item)
            return <AgendaItemCard key={item.id} item={item} cfg={cfg} />
          })}
        </div>
      )}

      {/* Detail panel for selected day */}
      {selected && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {new Date(selected + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </h3>
            <Button size="sm" variant="outline" onClick={openModal} className="gap-1 text-xs">
              <Plus className="h-3 w-3" /> Aula neste dia
            </Button>
          </div>
          {selectedItems.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma aula neste dia.</p>
          ) : selectedItems.map((item) => {
            const cfg = getTypeConfig(item)
            return <AgendaItemCard key={item.id} item={item} cfg={cfg} />
          })}
        </div>
      )}

      {/* Modal: Nova Aula */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Nova Aula</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {formErr && <p className="text-xs text-red-500">{formErr}</p>}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Turma *</label>
                <select
                  value={form.turma_id}
                  onChange={(e) => setForm((f) => ({ ...f, turma_id: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Selecione a turma</option>
                  {turmasAll.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}{t.course ? ` — ${t.course.title}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Matéria *</label>
                <select
                  value={form.subject_id}
                  onChange={(e) => setForm((f) => ({ ...f, subject_id: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Selecione a matéria</option>
                  {subjectsAll.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Data *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Início</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Fim</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Título (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Aula 01 — Direito Penal"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Descrição (opcional)</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleCreate} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AgendaItemCard({ item, cfg }: { item: AgendaItem; cfg: { label: string; color: string } }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={cn("text-[10px] py-0 border", cfg.color)}>{cfg.label}</Badge>
        <span className="text-sm font-semibold text-foreground">{item.title}</span>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarRange className="h-3 w-3" />
          {new Date(item.date + "T12:00:00").toLocaleDateString("pt-BR")}
        </span>
        {item.start_time && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {item.start_time?.slice(0, 5)}{item.end_time ? ` – ${item.end_time?.slice(0, 5)}` : ""}
          </span>
        )}
        {item.location && (
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>
        )}
        {item.course_name && (
          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{item.course_name}</span>
        )}
        {item.turma_name && (
          <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{item.turma_name}</span>
        )}
        {item.subject_name && (
          <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{item.subject_name}</span>
        )}
        {item.professor_name && (
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />Prof. {item.professor_name}</span>
        )}
        {item.registered_count !== undefined && item.max_participants !== undefined && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {item.registered_count}/{item.max_participants} inscritos
          </span>
        )}
      </div>
      {item.description && (
        <p className="text-xs text-muted-foreground/80 italic">{item.description}</p>
      )}
    </div>
  )
}
