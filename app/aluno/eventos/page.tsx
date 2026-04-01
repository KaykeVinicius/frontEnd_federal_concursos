"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, MapPin, Loader2, Mic, BookOpenCheck, FileQuestion, Presentation } from "lucide-react"
import { api, type ApiEvent } from "@/lib/api"

const eventTypeIcons: Record<string, React.ReactNode> = {
  aulao: <BookOpenCheck className="h-5 w-5" />,
  simulado: <FileQuestion className="h-5 w-5" />,
  workshop: <Presentation className="h-5 w-5" />,
  palestra: <Mic className="h-5 w-5" />,
}

const eventTypeColors: Record<string, string> = {
  aulao: "bg-blue-500/10 text-blue-600",
  simulado: "bg-purple-500/10 text-purple-600",
  workshop: "bg-green-500/10 text-green-600",
  palestra: "bg-orange-500/10 text-orange-600",
}

const statusColors: Record<string, string> = {
  agendado: "bg-yellow-500/10 text-yellow-600",
  em_andamento: "bg-blue-500/10 text-blue-600",
  concluido: "bg-gray-500/10 text-gray-600",
  cancelado: "bg-red-500/10 text-red-600",
}

const statusLabels: Record<string, string> = {
  agendado: "Agendado", em_andamento: "Em Andamento", concluido: "Concluído", cancelado: "Cancelado",
}

export default function AlunoEventosPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    api.events.list()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredEvents = filter === "all" ? events : events.filter((e) => e.event_type === filter)
  const upcomingEvents = filteredEvents.filter((e) => e.status === "agendado" || e.status === "em_andamento")
  const pastEvents = filteredEvents.filter((e) => e.status === "concluido" || e.status === "cancelado")

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Eventos</h1>
        <p className="text-muted-foreground">Aulões, simulados, workshops e palestras</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "all", label: "Todos" },
          { value: "aulao", label: "Aulões" },
          { value: "simulado", label: "Simulados" },
          { value: "workshop", label: "Workshops" },
          { value: "palestra", label: "Palestras" },
        ].map((f) => (
          <Button key={f.value} variant={filter === f.value ? "default" : "outline"} size="sm"
            onClick={() => setFilter(f.value)}
            className={filter === f.value ? "bg-primary" : ""}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <EventSection title={`Próximos Eventos (${upcomingEvents.length})`} events={upcomingEvents} emptyMsg="Nenhum evento agendado no momento." />
      {pastEvents.length > 0 && (
        <EventSection title={`Eventos Anteriores (${pastEvents.length})`} events={pastEvents} emptyMsg="" />
      )}
    </div>
  )
}

function EventSection({ title, events, emptyMsg }: { title: string; events: ApiEvent[]; emptyMsg: string }) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      {events.length === 0 ? (
        emptyMsg ? (
          <Card><CardContent className="flex flex-col items-center gap-2 py-8"><CalendarDays className="h-8 w-8 text-muted-foreground" /><p className="text-muted-foreground">{emptyMsg}</p></CardContent></Card>
        ) : null
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="h-1 bg-primary" />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${eventTypeColors[event.event_type] ?? "bg-gray-100 text-gray-600"}`}>
                    {eventTypeIcons[event.event_type] ?? <CalendarDays className="h-5 w-5" />}
                  </div>
                  <Badge className={statusColors[event.status] ?? "bg-gray-100 text-gray-600"} variant="secondary">
                    {statusLabels[event.status] ?? event.status}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-base text-foreground">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{event.start_time} às {event.end_time}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
