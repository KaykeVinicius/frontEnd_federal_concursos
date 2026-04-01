"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Loader2, Clock, MapPin, CalendarDays } from "lucide-react"
import { api, type ApiEvent, type ApiCourse } from "@/lib/api"

const eventTypeLabels: Record<string, string> = { aulao: "Aulão", simulado: "Simulado", workshop: "Workshop", palestra: "Palestra" }
const eventTypeColors: Record<string, string> = {
  aulao: "bg-[#fff3ef] text-[#e8491d]", simulado: "bg-blue-100 text-blue-700",
  workshop: "bg-purple-100 text-purple-700", palestra: "bg-amber-100 text-amber-700",
}
const statusLabels: Record<string, string> = { agendado: "Agendado", em_andamento: "Em Andamento", concluido: "Concluído", cancelado: "Cancelado" }
const statusColors: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700", em_andamento: "bg-green-100 text-green-700",
  concluido: "bg-muted text-muted-foreground", cancelado: "bg-red-100 text-red-700",
}

export default function EventosPage() {
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null)

  // Form
  const [fTitle, setFTitle] = useState("")
  const [fDesc, setFDesc] = useState("")
  const [fType, setFType] = useState("")
  const [fCourseId, setFCourseId] = useState("")
  const [fDate, setFDate] = useState("")
  const [fStart, setFStart] = useState("")
  const [fEnd, setFEnd] = useState("")
  const [fLocation, setFLocation] = useState("")
  const [fStatus, setFStatus] = useState("agendado")
  const [formError, setFormError] = useState("")

  useEffect(() => {
    Promise.all([api.events.list(), api.courses.list()])
      .then(([evts, cs]) => { setEvents(evts); setCourses(cs) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleNewEvent(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!fTitle || !fType || !fDate || !fStart || !fEnd) { setFormError("Preencha os campos obrigatórios."); return }
    setSaving(true); setFormError("")
    try {
      const created = await api.events.create({
        title: fTitle,
        description: fDesc,
        event_type: fType,
        course_id: fCourseId ? parseInt(fCourseId) : null,
        date: fDate,
        start_time: fStart,
        end_time: fEnd,
        location: fLocation,
        status: fStatus,
      })
      setEvents((prev) => [created, ...prev])
      setShowNew(false)
      setFTitle(""); setFDesc(""); setFType(""); setFCourseId(""); setFDate(""); setFStart(""); setFEnd(""); setFLocation(""); setFStatus("agendado")
    } catch (err: unknown) { setFormError(err instanceof Error ? err.message : "Erro ao criar evento") }
    finally { setSaving(false) }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
  }

  const filtered = events.filter((evt) => {
    const matchesSearch = evt.title.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === "all" || evt.event_type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="mt-1 text-muted-foreground">Gerencie aulões, simulados, workshops e palestras</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar eventos..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filtrar por tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="aulao">Aulão</SelectItem>
            <SelectItem value="simulado">Simulado</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="palestra">Palestra</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((evt) => (
            <Card key={evt.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setSelectedEvent(evt)}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className={eventTypeColors[evt.event_type] ?? "bg-gray-100 text-gray-700"} variant="secondary">
                    {eventTypeLabels[evt.event_type] ?? evt.event_type}
                  </Badge>
                  <Badge className={statusColors[evt.status] ?? "bg-gray-100 text-gray-700"} variant="secondary">
                    {statusLabels[evt.status] ?? evt.status}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-lg leading-tight text-foreground">{evt.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">{evt.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" /><span>{formatDate(evt.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" /><span>{evt.start_time} às {evt.end_time}</span>
                </div>
                {evt.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" /><span className="truncate">{evt.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">Nenhum evento encontrado.</p>
          )}
        </div>
      )}

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedEvent?.title}</DialogTitle>
            <DialogDescription>Detalhes do evento</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={eventTypeColors[selectedEvent.event_type] ?? ""} variant="secondary">
                  {eventTypeLabels[selectedEvent.event_type] ?? selectedEvent.event_type}
                </Badge>
                <Badge className={statusColors[selectedEvent.status] ?? ""} variant="secondary">
                  {statusLabels[selectedEvent.status] ?? selectedEvent.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Data</p>
                  <p className="text-sm font-semibold text-foreground">{formatDate(selectedEvent.date)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Horário</p>
                  <p className="text-sm font-semibold text-foreground">{selectedEvent.start_time} às {selectedEvent.end_time}</p>
                </div>
              </div>
              {selectedEvent.location && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Local</p>
                  <p className="text-sm font-semibold text-foreground">{selectedEvent.location}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Event Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Novo Evento</DialogTitle>
            <DialogDescription>Preencha as informações do novo evento.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewEvent} className="space-y-4">
            <div className="space-y-2">
              <Label>Título do Evento *</Label>
              <Input placeholder="Ex: Aulão de Véspera - Concurso PM-RO" value={fTitle} onChange={(e) => setFTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea placeholder="Descreva o evento..." rows={3} value={fDesc} onChange={(e) => setFDesc(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={fType} onValueChange={setFType}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aulao">Aulão</SelectItem>
                    <SelectItem value="simulado">Simulado</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="palestra">Palestra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Curso Vinculado</Label>
                <Select value={fCourseId} onValueChange={setFCourseId}>
                  <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Início *</Label>
                <Input type="time" value={fStart} onChange={(e) => setFStart(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Término *</Label>
                <Input type="time" value={fEnd} onChange={(e) => setFEnd(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Local</Label>
                <Input placeholder="Ex: Auditório Principal" value={fLocation} onChange={(e) => setFLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={fStatus} onValueChange={setFStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Criar Evento"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
