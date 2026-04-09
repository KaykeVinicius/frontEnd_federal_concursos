"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type ApiEvent, type ApiEventLote, type ApiStudent, type ApiEventRegistration, type ApiSubject } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus, Search, Loader2, Calendar, MapPin, Clock, Users,
  Settings2, Pencil, Trash2, Eye, Tag, AlertTriangle, UserPlus,
  X, Layers, Printer, BookOpen,
} from "lucide-react"

const EVENT_TYPE_LABELS: Record<string, string> = { aulao: "Aulão", simulado: "Simulado" }
const STATUS_LABELS: Record<string, string> = { agendado: "Agendado", em_andamento: "Em Andamento", concluido: "Concluído", cancelado: "Cancelado" }
const STATUS_COLORS: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700", em_andamento: "bg-yellow-100 text-yellow-700",
  concluido: "bg-green-100 text-green-700", cancelado: "bg-red-100 text-red-700",
}
const EMPTY_FORM = { title: "", description: "", event_type: "aulao", date: "", start_time: "", end_time: "", location: "", status: "agendado", is_free: true, price: "", max_participants: "100" }

type FormLote = { id?: number; name: string; price: string; quantity: string }

export default function PedagogicaEventosPage() {
  const router = useRouter()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [students, setStudents] = useState<ApiStudent[]>([])
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Criar/editar evento
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ApiEvent | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLotes, setFormLotes] = useState<FormLote[]>([])
  const [formSubjectIds, setFormSubjectIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Cadastrar aluno em evento
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [isNewStudent, setIsNewStudent] = useState(true)
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedEventId, setSelectedEventId] = useState("")
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newCpf, setNewCpf] = useState("")
  const [newWhatsapp, setNewWhatsapp] = useState("")
  const [newInstagram, setNewInstagram] = useState("")
  const [enrollSaving, setEnrollSaving] = useState(false)
  const [enrollError, setEnrollError] = useState("")

  useEffect(() => {
    Promise.all([api.events.list(), api.students.list(), api.subjects.list()])
      .then(([evs, studs, subs]) => { setEvents(evs); setStudents(studs); setSubjects(subs) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditingEvent(null); setForm(EMPTY_FORM); setFormLotes([]); setFormSubjectIds([]); setFormError(""); setShowForm(true)
  }

  function openEdit(ev: ApiEvent) {
    setEditingEvent(ev)
    setForm({ title: ev.title, description: ev.description ?? "", event_type: ev.event_type, date: ev.date, start_time: ev.start_time, end_time: ev.end_time, location: ev.location ?? "", status: ev.status, is_free: ev.is_free, price: ev.price ? String(ev.price) : "", max_participants: String(ev.max_participants) })
    setFormLotes(ev.event_lotes?.map((l) => ({ id: l.id, name: l.name, price: String(l.price), quantity: String(l.quantity) })) ?? [])
    setFormSubjectIds(ev.event_subjects?.map((s) => s.subject_id) ?? [])
    setFormError(""); setShowForm(true)
  }

  function toggleSubject(subjectId: number) {
    setFormSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    )
  }

  function setField(key: string, value: string | boolean) { setForm((prev) => ({ ...prev, [key]: value })) }

  function addLote() {
    setFormLotes((prev) => [...prev, { name: `${prev.length + 1}º Lote`, price: "", quantity: "" }])
  }

  function updateLote(index: number, key: keyof FormLote, value: string) {
    setFormLotes((prev) => prev.map((l, i) => i === index ? { ...l, [key]: value } : l))
  }

  async function removeLote(index: number) {
    const lote = formLotes[index]
    if (lote.id && editingEvent) {
      await api.events.lotes.delete(editingEvent.id, lote.id)
    }
    setFormLotes((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.title || !form.date || !form.start_time || !form.end_time) { setFormError("Preencha os campos obrigatórios."); return }
    if (!form.is_free && formLotes.length > 0) {
      const invalid = formLotes.some((l) => !l.name || !l.price || !l.quantity)
      if (invalid) { setFormError("Preencha nome, valor e quantidade de todos os lotes."); return }
    }
    setSaving(true); setFormError("")
    const body = { title: form.title, description: form.description || undefined, event_type: form.event_type, date: form.date, start_time: form.start_time, end_time: form.end_time, location: form.location || undefined, status: form.status, is_free: form.is_free, price: form.is_free ? 0 : parseFloat(form.price) || 0, max_participants: parseInt(form.max_participants) || 100 }
    try {
      let savedEvent: ApiEvent
      if (editingEvent) {
        savedEvent = await api.events.update(editingEvent.id, body)
      } else {
        savedEvent = await api.events.create(body)
      }

      // Cria os lotes novos (sem id)
      const newLotes: ApiEventLote[] = []
      for (const [i, lote] of formLotes.entries()) {
        if (!lote.id) {
          const created = await api.events.lotes.create(savedEvent.id, {
            name: lote.name,
            price: parseFloat(lote.price),
            quantity: parseInt(lote.quantity),
            position: i + 1,
          })
          newLotes.push(created)
        }
      }

      const allLotes = [
        ...(editingEvent?.event_lotes?.filter((l) => formLotes.some((fl) => fl.id === l.id)) ?? []),
        ...newLotes,
      ]

      // Sincroniza matérias (apenas para aulão)
      let savedSubjects = savedEvent.event_subjects ?? []
      if (form.event_type === "aulao") {
        savedSubjects = await api.events.subjects.sync(savedEvent.id, formSubjectIds)
      }

      savedEvent = { ...savedEvent, event_lotes: allLotes, event_subjects: savedSubjects }

      if (editingEvent) {
        setEvents((prev) => prev.map((e) => e.id === savedEvent.id ? savedEvent : e))
      } else {
        setEvents((prev) => [savedEvent, ...prev])
      }
      setShowForm(false)
    } catch (err: unknown) { setFormError(err instanceof Error ? err.message : "Erro ao salvar evento.") }
    finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try { await api.events.delete(id); setEvents((prev) => prev.filter((e) => e.id !== id)); setConfirmDeleteId(null) }
    catch (err) { console.error(err) } finally { setDeleting(false) }
  }

  function handleExportPDF() {
    const token = localStorage.getItem("auth_token") ?? ""
    window.open(`/api/pdf/eventos-lista?token=${token}`, "_blank")
  }

  function resetEnrollForm() {
    setIsNewStudent(true); setSelectedStudentId(""); setSelectedEventId("")
    setNewName(""); setNewEmail(""); setNewCpf(""); setNewWhatsapp(""); setNewInstagram("")
    setEnrollError("")
  }

  const selectedEvent = events.find((ev) => ev.id === parseInt(selectedEventId))

  async function handleEnrollSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!selectedEventId) { setEnrollError("Selecione um evento."); return }
    if (selectedEvent?.is_full) { setEnrollError("Este evento está esgotado."); return }
    if (isNewStudent && (!newName || !newEmail || !newCpf)) {
      setEnrollError("Preencha nome, email e CPF do novo aluno."); return
    }
    if (!isNewStudent && !selectedStudentId) {
      setEnrollError("Selecione um aluno."); return
    }

    setEnrollSaving(true); setEnrollError("")
    const ingressoWin = window.open("", "_blank")

    try {
      let studentId: number
      if (isNewStudent) {
        const newStudent = await api.students.create({
          name: newName, email: newEmail, cpf: newCpf,
          whatsapp: newWhatsapp || undefined,
          instagram: newInstagram || undefined,
          active: true,
        })
        setStudents((prev) => [newStudent, ...prev])
        studentId = newStudent.id
      } else {
        studentId = parseInt(selectedStudentId)
      }

      const eventId = parseInt(selectedEventId)
      const reg: ApiEventRegistration = await api.events.registrations.create(eventId, studentId)

      setEvents((prev) => prev.map((ev) => ev.id === eventId
        ? { ...ev, registered_count: ev.registered_count + 1, is_full: ev.registered_count + 1 >= ev.max_participants }
        : ev
      ))

      setShowEnrollDialog(false)
      resetEnrollForm()

      if (selectedEvent && ingressoWin) {
        localStorage.setItem(`ingresso_${reg.ticket_token}`, JSON.stringify({ registration: reg, event: selectedEvent }))
        ingressoWin.location.href = `/imprimir/ingresso/${reg.ticket_token}`
      } else {
        ingressoWin?.close()
      }
    } catch (err: unknown) {
      ingressoWin?.close()
      setEnrollError(err instanceof Error ? err.message : "Erro ao inscrever aluno.")
    } finally { setEnrollSaving(false) }
  }

  const filtered = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()) || (e.location ?? "").toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="mt-1 text-muted-foreground">Gerencie eventos gratuitos e pagos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} className="gap-2 bg-[#e8491d] hover:bg-[#d13a0f] text-white">
            <Printer className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" onClick={() => { resetEnrollForm(); setShowEnrollDialog(true) }} className="gap-2">
            <UserPlus className="h-4 w-4" /> Cadastrar Aluno
          </Button>
          <Button onClick={openCreate} className="bg-primary text-white hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Novo Evento
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por título ou local..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhum evento encontrado.</p>
          <Button className="mt-4 bg-primary text-white" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Criar primeiro evento</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ev) => (
            <Card key={ev.id} className="flex flex-col overflow-hidden border hover:shadow-md transition-shadow">
              <div className="h-2 bg-[#e8491d]" />
              <CardContent className="flex flex-col flex-1 p-5 gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{EVENT_TYPE_LABELS[ev.event_type] ?? ev.event_type}</p>
                    <h2 className="text-base font-bold text-foreground leading-tight line-clamp-2">{ev.title}</h2>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0"><Settings2 className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push(`/pedagogica/eventos/${ev.id}`)}><Eye className="h-4 w-4" /> Ver inscritos</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(ev)}><Pencil className="h-4 w-4" /> Editar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {confirmDeleteId === ev.id ? (
                        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => handleDelete(ev.id)} disabled={deleting}>
                          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />} Confirmar exclusão
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => setConfirmDeleteId(ev.id)}><Trash2 className="h-4 w-4" /> Excluir</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={STATUS_COLORS[ev.status]}>{STATUS_LABELS[ev.status] ?? ev.status}</Badge>
                  {ev.is_full && <Badge className="bg-red-100 text-red-700">Esgotado</Badge>}
                  {ev.is_free ? (
                    <Badge className="bg-green-100 text-green-700"><Tag className="mr-1 h-3 w-3" />Gratuito</Badge>
                  ) : ev.event_lotes && ev.event_lotes.length > 0 ? (
                    <Badge className="bg-orange-100 text-orange-700">
                      <Layers className="mr-1 h-3 w-3" />
                      {ev.current_lote_price != null ? `R$ ${Number(ev.current_lote_price).toFixed(2)}` : "Lotes esgotados"}
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-700"><Tag className="mr-1 h-3 w-3" />R$ {Number(ev.price ?? 0).toFixed(2)}</Badge>
                  )}
                </div>

                {/* Lotes */}
                {!ev.is_free && ev.event_lotes && ev.event_lotes.length > 0 && (
                  <div className="rounded-md border bg-muted/20 p-2 space-y-1">
                    {ev.event_lotes.map((l) => (
                      <div key={l.id} className="flex items-center justify-between text-xs">
                        <span className={l.available ? "text-foreground" : "text-muted-foreground line-through"}>{l.name}</span>
                        <span className="text-muted-foreground">{l.sold_count}/{l.quantity} · R$ {Number(l.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 shrink-0" /><span>{new Date(ev.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span></div>
                  <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 shrink-0" /><span>{ev.start_time} – {ev.end_time}</span></div>
                  {ev.location && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{ev.location}</span></div>}
                  <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 shrink-0" /><span>{ev.registered_count} / {ev.max_participants} inscritos</span></div>
                </div>

                <Button variant="outline" className="mt-auto w-full gap-2 border-[#e8491d] text-[#e8491d] hover:bg-[#e8491d] hover:text-white" onClick={() => router.push(`/pedagogica/eventos/${ev.id}`)}>
                  <Users className="h-4 w-4" /> Inscritos & Check-in
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog criar/editar evento */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) setShowForm(false) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Editar Evento" : "Novo Evento"}</DialogTitle>
            <DialogDescription>Preencha os dados do evento.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Título *</Label><Input value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Ex: Aulão de Matemática" required /></div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={form.event_type} onValueChange={(v) => setField("event_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2"><Label>Data *</Label><Input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} required /></div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Início *</Label><Input type="time" value={form.start_time} onChange={(e) => setField("start_time", e.target.value)} required /></div>
              <div className="space-y-2"><Label>Término *</Label><Input type="time" value={form.end_time} onChange={(e) => setField("end_time", e.target.value)} required /></div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Local</Label><Input value={form.location} onChange={(e) => setField("location", e.target.value)} placeholder="Ex: Auditório Principal" /></div>
              <div className="space-y-2"><Label>Máx. participantes</Label><Input type="number" min="1" value={form.max_participants} onChange={(e) => setField("max_participants", e.target.value)} /></div>
            </div>

            {/* Matérias — somente para aulão */}
            {form.event_type === "aulao" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Matérias do aulão</Label>
                {subjects.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma matéria cadastrada.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 rounded-md border p-3">
                    {subjects.map((sub) => {
                      const selected = formSubjectIds.includes(sub.id)
                      return (
                        <button key={sub.id} type="button" onClick={() => toggleSubject(sub.id)}
                          className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-left transition-colors ${selected ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-transparent hover:border-primary/20"}`}>
                          <div className={`h-2 w-2 rounded-full shrink-0 ${selected ? "bg-primary" : "bg-muted-foreground/40"}`} />
                          <span className="truncate">{sub.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
                {formSubjectIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">{formSubjectIds.length} matéria(s) selecionada(s) — os professores poderão fazer upload dos PDFs</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Ingresso</Label>
              <div className="flex gap-2">
                {[{ val: true, label: "Gratuito" }, { val: false, label: "Pago" }].map(({ val, label }) => (
                  <button key={label} type="button" onClick={() => setField("is_free", val)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${form.is_free === val ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {!form.is_free && (
              <>
                <div className="space-y-2">
                  <Label>Valor padrão (R$)</Label>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={(e) => setField("price", e.target.value)} />
                  <p className="text-xs text-muted-foreground">Usado quando não há lotes configurados.</p>
                </div>

                {/* Lotes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Lotes de venda</Label>
                    <button type="button" onClick={addLote} className="flex items-center gap-1 rounded-md border border-dashed border-primary/50 px-2 py-1 text-xs text-primary hover:bg-primary/5 transition-colors">
                      <Plus className="h-3 w-3" /> Adicionar lote
                    </button>
                  </div>

                  {formLotes.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2 rounded-md border border-dashed">
                      Sem lotes — o valor padrão será usado.
                    </p>
                  )}

                  {formLotes.map((lote, i) => (
                    <div key={i} className="rounded-md border bg-muted/10 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lote {i + 1}</span>
                        <button type="button" onClick={() => removeLote(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="space-y-1 sm:col-span-1">
                          <Label className="text-xs">Nome *</Label>
                          <Input className="h-8 text-sm" placeholder="1º Lote" value={lote.name} onChange={(e) => updateLote(i, "name", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Valor (R$) *</Label>
                          <Input className="h-8 text-sm" type="number" step="0.01" min="0" placeholder="0.00" value={lote.price} onChange={(e) => updateLote(i, "price", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Vagas *</Label>
                          <Input className="h-8 text-sm" type="number" min="1" placeholder="50" value={lote.quantity} onChange={(e) => updateLote(i, "quantity", e.target.value)} />
                        </div>
                      </div>
                      {lote.id && (
                        <p className="text-xs text-muted-foreground">Lote já salvo — remova para excluir do banco.</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Descrição</Label>
              <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-none" placeholder="Detalhes sobre o evento..." value={form.description} onChange={(e) => setField("description", e.target.value)} />
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-primary text-white hover:bg-primary/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : editingEvent ? "Salvar" : "Criar Evento"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog cadastrar aluno em evento */}
      <Dialog open={showEnrollDialog} onOpenChange={(o) => { if (!o) { setShowEnrollDialog(false); resetEnrollForm() } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar Aluno em Evento</DialogTitle>
            <DialogDescription>O ingresso com QR Code será aberto em PDF para impressão.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnrollSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label>Evento *</Label>
              <Select value={selectedEventId} onValueChange={(v) => { setSelectedEventId(v); setEnrollError("") }}>
                <SelectTrigger>
                  <SelectValue placeholder={events.length === 0 ? "Nenhum evento disponível" : "Selecione o evento"} />
                </SelectTrigger>
                <SelectContent>
                  {events.map((ev) => (
                    <SelectItem key={ev.id} value={String(ev.id)} disabled={!!ev.is_full}>
                      {ev.title} — {new Date(ev.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      {ev.is_full ? " (Esgotado)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Info do lote atual */}
              {selectedEvent && !selectedEvent.is_free && selectedEvent.event_lotes && selectedEvent.event_lotes.length > 0 && (
                <div className="rounded-md border bg-orange-50 px-3 py-2 text-sm">
                  {selectedEvent.current_lote_price != null ? (
                    <p className="text-orange-800">
                      Lote atual: <strong>R$ {Number(selectedEvent.current_lote_price).toFixed(2)}</strong>
                    </p>
                  ) : (
                    <p className="text-red-700">Todos os lotes estão esgotados.</p>
                  )}
                </div>
              )}

              {selectedEvent?.is_full && (
                <p className="text-sm text-destructive">Este evento não tem mais vagas disponíveis.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Aluno *</Label>
              <div className="flex gap-2">
                {[{ val: true, label: "Aluno Novo" }, { val: false, label: "Aluno Existente" }].map(({ val, label }) => (
                  <button key={label} type="button"
                    onClick={() => { setIsNewStudent(val); setSelectedStudentId(""); setEnrollError("") }}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${isNewStudent === val ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isNewStudent ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Nome Completo *</Label><Input placeholder="Nome do aluno" value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
                  <div className="space-y-2"><Label>CPF *</Label><Input placeholder="000.000.000-00" value={newCpf} onChange={(e) => setNewCpf(e.target.value)} /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="email@exemplo.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
                  <div className="space-y-2"><Label>WhatsApp</Label><Input placeholder="(00) 00000-0000" value={newWhatsapp} onChange={(e) => setNewWhatsapp(e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Instagram</Label><Input placeholder="@usuario" value={newInstagram} onChange={(e) => setNewInstagram(e.target.value)} /></div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Aluno *</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger><SelectValue placeholder={students.length === 0 ? "Nenhum aluno cadastrado" : "Selecione o aluno"} /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name} — {s.cpf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {enrollError && <p className="text-sm text-destructive">{enrollError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowEnrollDialog(false); resetEnrollForm() }}>Cancelar</Button>
              <Button type="submit" disabled={enrollSaving || !!selectedEvent?.is_full} className="bg-primary text-white hover:bg-primary/90">
                {enrollSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inscrevendo...</> : "Inscrever & Gerar Ingresso"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
