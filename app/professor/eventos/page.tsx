"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, MapPin, Loader2, BookOpenCheck, FileQuestion } from "lucide-react"
import { api, type ApiEvent } from "@/lib/api"

const eventTypeIcons: Record<string, React.ReactNode> = {
  aulao: <BookOpenCheck className="h-5 w-5" />,
  simulado: <FileQuestion className="h-5 w-5" />,
}

const eventTypeColors: Record<string, string> = {
  aulao: "bg-blue-500/10 text-blue-600",
  simulado: "bg-purple-500/10 text-purple-600",
}

const statusColors: Record<string, string> = {
  agendado: "bg-yellow-500/10 text-yellow-600",
  em_andamento: "bg-blue-500/10 text-blue-600",
  concluido: "bg-gray-500/10 text-gray-600",
  cancelado: "bg-red-500/10 text-red-600",
}

const statusLabels: Record<string, string> = {
  agendado: "Agendado",
  em_andamento: "Em Andamento",
  concluido: "Concluido",
  cancelado: "Cancelado",
}

export default function ProfessorEventosPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      await api.events.list().then(setEvents).catch(console.error)
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.event_type === filter)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Eventos</h1>
        <p className="text-muted-foreground">Aulões e simulados</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "all", label: "Todos" },
          { value: "aulao", label: "Aulões" },
          { value: "simulado", label: "Simulados" },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={filter === f.value ? "bg-primary" : ""}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="h-1 bg-primary" />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${eventTypeColors[event.event_type] ?? "bg-gray-100 text-gray-600"}`}>
                    {eventTypeIcons[event.event_type]}
                  </div>
                  <Badge className={statusColors[event.status] ?? "bg-gray-100 text-gray-600"}>
                    {statusLabels[event.status] ?? event.status}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-base text-foreground">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" /><span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /><span>{event.start_time} às {event.end_time}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /><span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        {filteredEvents.length === 0 && (
          <p className="col-span-full py-8 text-center text-muted-foreground">
            Nenhum evento encontrado.
          </p>
        )}
      </div>
    </div>
  )
}
