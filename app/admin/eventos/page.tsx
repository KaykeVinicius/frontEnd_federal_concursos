"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type ApiEvent } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Loader2, Calendar, MapPin, Clock, Users, Settings2, Pencil, Trash2, Eye, Tag, AlertTriangle } from "lucide-react"

const EVENT_TYPE_LABELS: Record<string, string> = { aulao: "Aulão", simulado: "Simulado" }
const STATUS_LABELS: Record<string, string> = { agendado: "Agendado", em_andamento: "Em Andamento", concluido: "Concluído", cancelado: "Cancelado" }
const STATUS_COLORS: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700", em_andamento: "bg-yellow-100 text-yellow-700",
  concluido: "bg-green-100 text-green-700", cancelado: "bg-red-100 text-red-700",
}
const EMPTY_FORM = { title: "", description: "", event_type: "aulao", date: "", start_time: "", end_time: "", location: "", status: "agendado", is_free: true, price: "", max_participants: "100" }

export default function EventosPage() {
  const router = useRouter()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ApiEvent | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.events.list().then(setEvents).catch(console.error).finally(() => setLoading(false))
  }, [])

  function openCreate() { setEditingEvent(null); setForm(EMPTY_FORM); setFormError(""); setShowForm(true) }

  function openEdit(ev: ApiEvent) {
    setEditingEvent(ev)
    setForm({ title: ev.title, description: ev.description ?? "", event_type: ev.event_type, date: ev.date, start_time: ev.start_time, end_time: ev.end_time, location: ev.location ?? "", status: ev.status, is_free: ev.is_free, price: ev.price ? String(ev.price) : "", max_participants: String(ev.max_participants) })
    setFormError(""); setShowForm(true)
  }

  function setField(key: string, value: string | boolean) { setForm((prev) => ({ ...prev, [key]: value })) }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.title || !form.date || !form.start_time || !form.end_time) { setFormError("Preencha os campos obrigatórios."); return }
    setSaving(true); setFormError("")
    const body = { title: form.title, description: form.description || undefined, event_type: form.event_type, date: form.date, start_time: form.start_time, end_time: form.end_time, location: form.location || undefined, status: form.status, is_free: form.is_free, price: form.is_free ? 0 : parseFloat(form.price) || 0, max_participants: parseInt(form.max_participants) || 100 }
    try {
      if (editingEvent) {
        const updated = await api.events.update(editingEvent.id, body)
        setEvents((prev) => prev.map((e) => e.id === updated.id ? updated : e))
      } else {
        const created = await api.events.create(body)
        setEvents((prev) => [created, ...prev])
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

  const filtered = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()) || (e.location ?? "").toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="mt-1 text-muted-foreground">Gerencie eventos gratuitos e pagos</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-white hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" /> Novo Evento</Button>
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
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push(`/ceo/eventos/${ev.id}`)}><Eye className="h-4 w-4" /> Ver inscritos</DropdownMenuItem>
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
                  <Badge className={ev.is_free ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                    <Tag className="mr-1 h-3 w-3" />{ev.is_free ? "Gratuito" : `R$ ${Number(ev.price ?? 0).toFixed(2)}`}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 shrink-0" /><span>{new Date(ev.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span></div>
                  <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 shrink-0" /><span>{ev.start_time} – {ev.end_time}</span></div>
                  {ev.location && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{ev.location}</span></div>}
                  <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 shrink-0" /><span>{ev.registered_count} / {ev.max_participants} inscritos</span></div>
                </div>

                <Button variant="outline" className="mt-auto w-full gap-2 border-[#e8491d] text-[#e8491d] hover:bg-[#e8491d] hover:text-white" onClick={() => router.push(`/ceo/eventos/${ev.id}`)}>
                  <Users className="h-4 w-4" /> Inscritos & Check-in
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

            {!form.is_free && <div className="space-y-2"><Label>Valor (R$) *</Label><Input type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={(e) => setField("price", e.target.value)} /></div>}

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
    </div>
  )
}
