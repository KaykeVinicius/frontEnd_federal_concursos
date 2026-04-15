"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  ShoppingBag,
  ChevronRight,
  GraduationCap,
  MapPin,
  Clock,
  Monitor,
  Building,
  Laptop,
  Ticket,
  CalendarDays,
  Loader2,
  BookOpen,
  Filter,
  Users,
} from "lucide-react"

import { RecentEnrollments } from "@/components/recent-enrollments"
import { NewEnrollmentDialog } from "@/components/new-enrollment-dialog"
import { EventSaleDialog } from "@/components/event-sale-dialog"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { api, type ApiCourse, type ApiEvent, type ApiTurma } from "@/lib/api"

const accessColor: Record<string, string> = {
  online:    "bg-blue-100 text-blue-700 border-blue-200",
  presencial:"bg-green-100 text-green-700 border-green-200",
  hibrido:   "bg-purple-100 text-purple-700 border-purple-200",
}

const accessLabel: Record<string, string> = {
  online:    "Online",
  presencial:"Presencial",
  hibrido:   "Híbrido",
}

const AccessIcon: Record<string, React.ElementType> = {
  online:    Monitor,
  presencial:Building,
  hibrido:   Laptop,
}

const eventTypeColor: Record<string, string> = {
  online:    "bg-blue-100 text-blue-700 border-blue-200",
  presencial:"bg-green-100 text-green-700 border-green-200",
}

export default function AssistenteDashboardPage() {
  const [courses, setCourses]               = useState<ApiCourse[]>([])
  const [events, setEvents]                 = useState<ApiEvent[]>([])
  const [turmas, setTurmas]                 = useState<ApiTurma[]>([])
  const [loading, setLoading]               = useState(true)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [showEventSaleModal, setShowEventSaleModal]   = useState(false)
  const [courseFilter, setCourseFilter]     = useState("all")

  useEffect(() => {
    Promise.all([api.courses.list(), api.events.list(), api.turmas.list()])
      .then(([c, e, t]) => { setCourses(c); setEvents(e); setTurmas(t) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const MODALITIES = [
    { value: "all",        label: "Todos",      Icon: BookOpen  },
    { value: "online",     label: "Online",     Icon: Monitor   },
    { value: "presencial", label: "Presencial", Icon: Building  },
    { value: "hibrido",    label: "Híbrido",    Icon: Laptop    },
  ]

  // turmas com vaga por course_id
  const turmasByCourse = useMemo(() => {
    const map = new Map<number, ApiTurma[]>()
    for (const t of turmas) {
      if (!t.course_id) continue
      if (!map.has(t.course_id)) map.set(t.course_id, [])
      map.get(t.course_id)!.push(t)
    }
    return map
  }, [turmas])

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (c.status !== "published") return false
      if (courseFilter !== "all" && c.access_type !== courseFilter) return false
      if (c.access_type === "presencial" || c.access_type === "hibrido") {
        const temVaga = (turmasByCourse.get(c.id) ?? []).some(
          (t) => (t.status === "aberta" || t.status === "em_andamento") &&
                 t.enrolled_count < t.max_students
        )
        if (!temVaga) return false
      }
      return true
    })
  }, [courses, turmasByCourse, courseFilter])

  const activeEvents = useMemo(() => events, [events])

  const carouselItems = useMemo(() => [
    ...filteredCourses.map((c) => ({ type: "course" as const, data: c })),
    ...activeEvents.map((e) => ({ type: "event" as const, data: e })),
  ], [filteredCourses, activeEvents])

  // Adapter para o EventSaleDialog que ainda espera o shape antigo
  const eventsForDialog = useMemo(() =>
    activeEvents.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      time: e.start_time && e.end_time ? `${e.start_time} às ${e.end_time}` : e.start_time ?? "",
      location: e.location ?? "",
      price: 0,
      availableTickets: 0,
      soldTickets: 0,
      eventType: e.event_type,
    })),
  [activeEvents])

  return (
    <div>
      <div className="relative p-4 lg:p-6 max-w-full">
        {/* Background watermark */}
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.04]">
          <Image
            src="/images/logo.jpg"
            alt=""
            width={800}
            height={400}
            className="max-w-[60vw]"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </div>

        <div className="relative z-10 space-y-4">
          {/* CARROSSEL */}
          <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader className="border-b border-gray-100 pb-4 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-[#e8491d]" />
                    Oportunidades Disponíveis
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cursos e eventos ativos para matrícula e venda
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setShowEnrollmentModal(true)}
                    size="sm"
                    className="gap-2 bg-[#e8491d] hover:bg-[#d43d15] text-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Matricular em Curso
                  </Button>
                  <Button
                    onClick={() => setShowEventSaleModal(true)}
                    size="sm"
                    className="gap-2 bg-[#e8491d] hover:bg-[#d43d15] text-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Vender Ingresso
                  </Button>
                </div>
              </div>

              {/* Filtros de modalidade */}
              <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 items-center">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Modalidade:
                </span>
                {MODALITIES.map(({ value, label, Icon }) => (
                  <Badge
                    key={value}
                    variant={courseFilter === value ? "default" : "outline"}
                    className={`cursor-pointer transition-all text-xs gap-1 ${
                      courseFilter === value ? "bg-[#e8491d] hover:bg-[#d43d15]" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setCourseFilter(value)}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-[#e8491d]" />
                </div>
              ) : carouselItems.length > 0 ? (
                <Carousel opts={{ align: "start", loop: true }} className="w-full">
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {carouselItems.map((item, index) => (
                      <CarouselItem
                        key={index}
                        className="pl-2 md:pl-4 basis-[88%] sm:basis-[46%] md:basis-[32%] lg:basis-[24%] xl:basis-[20%]"
                      >
                        {item.type === "course" ? (
                          <CourseCard
                            course={item.data}
                            onEnroll={() => setShowEnrollmentModal(true)}
                          />
                        ) : (
                          <EventCard
                            event={item.data}
                            onSell={() => setShowEventSaleModal(true)}
                          />
                        )}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-2 bg-white shadow-md hover:bg-[#e8491d] hover:text-white transition-all cursor-pointer h-8 w-8 z-10" />
                  <CarouselNext className="absolute right-2 bg-white shadow-md hover:bg-[#e8491d] hover:text-white transition-all cursor-pointer h-8 w-8 z-10" />
                </Carousel>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Nenhum item encontrado com o filtro selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GRÁFICOS DE VAGAS */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Vagas por turma */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-gray-100 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5 text-[#e8491d]" />
                    Vagas por Turma
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">{turmas.length} turma(s)</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {loading ? (
                  <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-[#e8491d]" /></div>
                ) : turmas.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-6">Nenhuma turma cadastrada</p>
                ) : (
                  <div className="space-y-4">
                    {turmas.map((turma) => {
                      const available = turma.max_students - turma.enrolled_count
                      const soldPct = turma.max_students > 0 ? (turma.enrolled_count / turma.max_students) * 100 : 0
                      return (
                        <div key={turma.id} className="space-y-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-3">
                              <p className="text-xs font-semibold text-gray-700 line-clamp-1">{turma.name}</p>
                              <p className="text-[11px] text-muted-foreground">{turma.course?.title ?? `Curso #${turma.course_id}`}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xs font-bold text-green-600">{turma.enrolled_count}</span>
                              <span className="text-xs text-gray-400"> / {turma.max_students}</span>
                              <p className="text-[11px] text-muted-foreground">{available} disponíveis</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#e8491d] to-[#f97316] h-full rounded-full transition-all duration-500"
                              style={{ width: `${soldPct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-[#e8491d] font-medium">{Math.round(soldPct)}% ocupado</span>
                            <span className="text-gray-400">{available} vagas livres</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Eventos */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-gray-100 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Ticket className="h-5 w-5 text-violet-500" />
                    Eventos Disponíveis
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">{events.length} evento(s)</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {loading ? (
                  <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-violet-500" /></div>
                ) : events.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-6">Nenhum evento cadastrado</p>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => {
                      const TypeIcon = event.event_type === "online" ? Monitor : Building
                      return (
                        <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-violet-50 transition-colors">
                          <div className="rounded-lg bg-violet-100 p-2 flex-shrink-0">
                            <TypeIcon className="h-4 w-4 text-violet-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-1">{event.title}</p>
                            {event.date && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <CalendarDays className="h-3 w-3" />
                                {event.date}{event.start_time ? ` · ${event.start_time}` : ""}
                              </p>
                            )}
                            {event.location && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setShowEventSaleModal(true)}
                            className="bg-violet-500 hover:bg-violet-600 text-white text-xs h-7 rounded-lg flex-shrink-0"
                          >
                            Vender
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* MATRÍCULAS RECENTES */}
          <RecentEnrollments />
        </div>

        {/* Modals */}
        <NewEnrollmentDialog
          open={showEnrollmentModal}
          onOpenChange={setShowEnrollmentModal}
        />
        <EventSaleDialog
          open={showEventSaleModal}
          onOpenChange={setShowEventSaleModal}
          events={eventsForDialog}
        />
      </div>
    </div>
  )
}

// ─── Sub-componentes de card ───────────────────────────────

function CourseCard({ course, onEnroll }: { course: ApiCourse; onEnroll: () => void }) {
  const Icon = AccessIcon[course.access_type] ?? Monitor
  const color = accessColor[course.access_type] ?? "bg-gray-100 text-gray-600"
  const label = accessLabel[course.access_type] ?? course.access_type

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col">
      {/* Faixa superior colorida */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#e8491d] to-[#f97316] rounded-t-2xl" />

      <div className="flex flex-col flex-1 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-xl bg-gradient-to-br from-[#e8491d] to-[#f97316] p-2 flex-shrink-0 shadow-sm">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e8491d]">Curso</span>
          </div>
          <Badge className={`text-[10px] gap-1 flex-shrink-0 border font-medium ${color}`}>
            <Icon className="h-3 w-3" />
            {label}
          </Badge>
        </div>

        {/* Título */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">{course.title}</h3>

        {/* Carreira */}
        {course.career?.name && (
          <p className="text-[11px] font-medium text-[#e8491d]/80 mb-3 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.career.name}
          </p>
        )}

        {/* Separador */}
        <div className="border-t border-dashed border-gray-100 my-2" />

        {/* Detalhes */}
        <div className="space-y-1.5 mb-3">
          {course.duration_in_days > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Clock className="h-3 w-3 text-[#e8491d]" />
              </div>
              <span className="text-xs text-gray-600">{course.duration_in_days} dias de acesso</span>
            </div>
          )}
          {course.start_date && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-orange-50 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="h-3 w-3 text-[#e8491d]" />
              </div>
              <span className="text-xs text-gray-600">Início: {course.start_date}</span>
            </div>
          )}
        </div>

        {course.description && (
          <p className="text-[11px] text-gray-400 line-clamp-2 mb-3 leading-relaxed">{course.description}</p>
        )}

        {/* Rodapé */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Valor</p>
            <span className="text-xl font-extrabold text-gray-900 leading-none">
              R$ {Number(course.price).toFixed(2)}
            </span>
          </div>
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onEnroll() }}
            className="bg-gradient-to-r from-[#e8491d] to-[#f97316] hover:from-[#d43d15] hover:to-[#e8491d] text-white text-xs h-8 rounded-xl shadow hover:shadow-md transition-all font-semibold"
          >
            Matricular
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event, onSell }: { event: ApiEvent; onSell: () => void }) {
  const color = eventTypeColor[event.event_type] ?? "bg-gray-100 text-gray-600"
  const typeLabel = event.event_type === "online" ? "Online" : "Presencial"
  const TypeIcon = event.event_type === "online" ? Monitor : Building

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col">
      {/* Faixa superior — roxo para eventos */}
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-t-2xl" />

      <div className="flex flex-col flex-1 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 p-2 flex-shrink-0 shadow-sm">
              <Ticket className="h-4 w-4 text-white" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">Evento</span>
          </div>
          <Badge className={`text-[10px] gap-1 flex-shrink-0 border font-medium ${color}`}>
            <TypeIcon className="h-3 w-3" />
            {typeLabel}
          </Badge>
        </div>

        {/* Título */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-3">{event.title}</h3>

        {/* Separador */}
        <div className="border-t border-dashed border-gray-100 my-2" />

        {/* Detalhes */}
        <div className="space-y-1.5 mb-3">
          {event.date && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-violet-50 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="h-3 w-3 text-violet-500" />
              </div>
              <span className="text-xs text-gray-600">
                {event.date}
                {event.start_time && ` · ${event.start_time}`}
                {event.end_time && ` às ${event.end_time}`}
              </span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-violet-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-3 w-3 text-violet-500" />
              </div>
              <span className="text-xs text-gray-600 line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-[11px] text-gray-400 line-clamp-2 mb-3 leading-relaxed">{event.description}</p>
        )}

        {/* Rodapé */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-end">
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onSell() }}
            className="bg-gradient-to-r from-violet-500 to-purple-400 hover:from-violet-600 hover:to-purple-500 text-white text-xs h-8 rounded-xl shadow hover:shadow-md transition-all font-semibold"
          >
            Vender ingresso
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
