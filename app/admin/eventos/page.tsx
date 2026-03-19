"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  Loader2,
  Users,
  Clock,
  MapPin,
  CalendarDays,
} from "lucide-react"
import { fakeApiCall, fakeApiPost } from "@/lib/api"
import {
  mockEvents,
  mockCourses,
  getCourseById,
  type Event,
} from "@/lib/mock-data"
import { Progress } from "@/components/ui/progress"

const eventTypeLabels: Record<string, string> = {
  aulao: "Aulao",
  simulado: "Simulado",
  workshop: "Workshop",
  palestra: "Palestra",
}

const eventTypeColors: Record<string, string> = {
  aulao: "bg-[#fff3ef] text-[#e8491d]",
  simulado: "bg-blue-100 text-blue-700",
  workshop: "bg-purple-100 text-purple-700",
  palestra: "bg-amber-100 text-amber-700",
}

const statusLabels: Record<string, string> = {
  agendado: "Agendado",
  em_andamento: "Em Andamento",
  concluido: "Concluido",
  cancelado: "Cancelado",
}

const statusColors: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700",
  em_andamento: "bg-green-100 text-green-700",
  concluido: "bg-muted text-muted-foreground",
  cancelado: "bg-red-100 text-red-700",
}

export default function EventosPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      const data = await fakeApiCall(mockEvents)
      setEvents(data)
      setLoading(false)
    }
    fetchEvents()
  }, [])

  const filtered = events.filter((evt) => {
    const matchesSearch = evt.title
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesType = filterType === "all" || evt.event_type === filterType
    return matchesSearch && matchesType
  })

  async function handleNewEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    await fakeApiPost({}, 1000)
    setSaving(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setShowNew(false)
    }, 1500)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie auloes, simulados, workshops e palestras
          </p>
        </div>
        <Button
          onClick={() => setShowNew(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="aulao">Aulao</SelectItem>
            <SelectItem value="simulado">Simulado</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="palestra">Palestra</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((evt) => {
            const course = evt.course_id
              ? getCourseById(evt.course_id)
              : null
            const occupancy = Math.round(
              (evt.registered_count / evt.max_participants) * 100
            )
            return (
              <Card
                key={evt.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setSelectedEvent(evt)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={eventTypeColors[evt.event_type]}
                        variant="secondary"
                      >
                        {eventTypeLabels[evt.event_type]}
                      </Badge>
                      <Badge
                        className={statusColors[evt.status]}
                        variant="secondary"
                      >
                        {statusLabels[evt.status]}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="mt-2 text-lg leading-tight text-foreground">
                    {evt.title}
                  </CardTitle>
                  {course && (
                    <p className="text-sm text-primary">{course.title}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {evt.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    <span>{formatDate(evt.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>
                      {evt.start_time} as {evt.end_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Inscritos
                      </span>
                      <span className="font-medium text-foreground">
                        {evt.registered_count}/{evt.max_participants}
                      </span>
                    </div>
                    <Progress value={occupancy} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">
              Nenhum evento encontrado.
            </p>
          )}
        </div>
      )}

      {/* Event Detail Dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>Detalhes do evento</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={eventTypeColors[selectedEvent.event_type]}
                  variant="secondary"
                >
                  {eventTypeLabels[selectedEvent.event_type]}
                </Badge>
                <Badge
                  className={statusColors[selectedEvent.status]}
                  variant="secondary"
                >
                  {statusLabels[selectedEvent.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedEvent.description}
              </p>
              {selectedEvent.course_id && (
                <div className="rounded-lg border bg-accent/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Curso Vinculado
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {getCourseById(selectedEvent.course_id)?.title}
                  </p>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Data
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(selectedEvent.date)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Horario
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedEvent.start_time} as {selectedEvent.end_time}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Local
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedEvent.location}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Participantes
                </p>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {selectedEvent.registered_count} inscritos
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedEvent.max_participants} vagas
                  </span>
                </div>
                <Progress
                  value={Math.round(
                    (selectedEvent.registered_count /
                      selectedEvent.max_participants) *
                      100
                  )}
                  className="h-2"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Event Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Novo Evento</DialogTitle>
            <DialogDescription>
              Preencha as informacoes do novo evento.
            </DialogDescription>
          </DialogHeader>
          {success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-foreground">
                Evento criado com sucesso!
              </p>
            </div>
          ) : (
            <form onSubmit={handleNewEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Titulo do Evento</Label>
                <Input
                  id="event-title"
                  placeholder="Ex: Aulao de Vespera - Concurso PM-RO"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-desc">Descricao</Label>
                <Textarea
                  id="event-desc"
                  placeholder="Descreva o evento..."
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aulao">Aulao</SelectItem>
                      <SelectItem value="simulado">Simulado</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="palestra">Palestra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Curso Vinculado (Opcional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {mockCourses.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Data</Label>
                  <Input id="event-date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-start">Inicio</Label>
                  <Input id="event-start" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-end">Termino</Label>
                  <Input id="event-end" type="time" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event-location">Local</Label>
                  <Input
                    id="event-location"
                    placeholder="Ex: Auditorio Principal"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-max">Maximo de Participantes</Label>
                  <Input
                    id="event-max"
                    type="number"
                    placeholder="100"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNew(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Criar Evento"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
