"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type ApiEvent } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Calendar, MapPin, Clock, Users, Tag, Layers } from "lucide-react"

const EVENT_TYPE_LABELS: Record<string, string> = { aulao: "Aulão", simulado: "Simulado" }
const STATUS_LABELS: Record<string, string> = { agendado: "Agendado", em_andamento: "Em Andamento", concluido: "Concluído", cancelado: "Cancelado" }
const STATUS_COLORS: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700", em_andamento: "bg-yellow-100 text-yellow-700",
  concluido: "bg-green-100 text-green-700", cancelado: "bg-red-100 text-red-700",
}

export default function PedagogicaEventosPage() {
  const router = useRouter()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    api.events.list().then(setEvents).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.location ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="mt-1 text-muted-foreground">Visualize aulões e simulados</p>
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
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ev) => (
            <Card key={ev.id} className="flex flex-col overflow-hidden border hover:shadow-md transition-shadow">
              <div className="h-2 bg-[#e8491d]" />
              <CardContent className="flex flex-col flex-1 p-5 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{EVENT_TYPE_LABELS[ev.event_type] ?? ev.event_type}</p>
                  <h2 className="text-base font-bold text-foreground leading-tight line-clamp-2">{ev.title}</h2>
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

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 shrink-0" /><span>{new Date(ev.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span></div>
                  <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 shrink-0" /><span>{ev.start_time} – {ev.end_time}</span></div>
                  {ev.location && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{ev.location}</span></div>}
                  <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 shrink-0" /><span>{ev.registered_count} / {ev.max_participants} inscritos</span></div>
                </div>

                <Button
                  variant="outline"
                  className="mt-auto w-full gap-2 border-[#e8491d] text-[#e8491d] hover:bg-[#e8491d] hover:text-white"
                  onClick={() => router.push(`/pedagogica/eventos/${ev.id}`)}
                >
                  <Users className="h-4 w-4" /> Inscritos & Presença
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
