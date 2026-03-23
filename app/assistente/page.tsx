"use client"

import Image from "next/image"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  Layers,
  CalendarDays,
  Plus,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShoppingBag,
  Ticket,
  ChevronRight,
  GraduationCap,
  MapPin,
  Clock,
  Monitor,
  Building,
  Laptop,
  Filter,
  Sun,
  Moon,
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
import React from "react"

// Mock data para cursos disponíveis
const availableCourses = [
  {
    id: 1,
    title: "Curso Preparatório para Auditor Fiscal",
    description: "Prepare-se para os principais concursos de auditor fiscal com conteúdo atualizado.",
    duration: "12 meses",
    modality: "online",
    modalityLabel: "Online",
    modalityIcon: Monitor,
    location: "Plataforma EAD",
    schedule: "",
    price: 297,
    totalSpots: 50,
    soldSpots: 28,
  },
  {
    id: 2,
    title: "Técnico Judiciário - Área Administrativa",
    description: "Curso completo para tribunais com foco em jurisprudência e legislação.",
    duration: "8 meses",
    modality: "presencial",
    modalityLabel: "Presencial",
    modalityIcon: Building,
    location: "Unidade Centro - Sala 302",
    schedule: "tarde",
    scheduleLabel: "Tarde (14h às 18h)",
    price: 197,
    totalSpots: 40,
    soldSpots: 32,
  },
  {
    id: 3,
    title: "Policial Federal - Curso Intensivo",
    description: "Preparação intensiva para o concurso da Polícia Federal.",
    duration: "6 meses",
    modality: "online",
    modalityLabel: "Online",
    modalityIcon: Monitor,
    location: "Plataforma EAD",
    schedule: "",
    price: 397,
    totalSpots: 60,
    soldSpots: 45,
  },
  {
    id: 4,
    title: "Controladoria e Auditoria Pública",
    description: "Curso especializado para carreiras de controle.",
    duration: "10 meses",
    modality: "hibrido",
    modalityLabel: "Híbrido",
    modalityIcon: Laptop,
    location: "Unidade Centro e Online",
    schedule: "",
    price: 347,
    totalSpots: 35,
    soldSpots: 22,
  },
  {
    id: 5,
    title: "Direito Constitucional Avançado",
    description: "Aprofundamento em direito constitucional para concursos de alto nível.",
    duration: "4 meses",
    modality: "online",
    modalityLabel: "Online",
    modalityIcon: Monitor,
    location: "Plataforma EAD",
    schedule: "",
    price: 247,
    totalSpots: 45,
    soldSpots: 18,
  },
  {
    id: 6,
    title: "Direito Administrativo - Turma Noturna",
    description: "Curso focado em direito administrativo para concursos de nível médio e superior.",
    duration: "6 meses",
    modality: "presencial",
    modalityLabel: "Presencial",
    modalityIcon: Building,
    location: "Unidade Sul - Sala 101",
    schedule: "noite",
    scheduleLabel: "Noite (19h às 23h)",
    price: 297,
    totalSpots: 35,
    soldSpots: 20,
  },
]

// Mock data para eventos disponíveis (apenas online e presencial)
const availableEvents = [
  {
    id: 1,
    title: "Workshop: Nova Lei de Licitações",
    description: "Aprenda todas as mudanças da nova lei de licitações e como se preparar para concursos.",
    date: "15/04/2026",
    time: "19:00 às 22:00",
    location: "Presencial - Auditório Principal",
    price: 297,
    availableTickets: 50,
    soldTickets: 23,
    eventType: "presencial",
  },
  {
    id: 2,
    title: "Palestra: Carreiras Públicas em Alta",
    description: "Descubra as carreiras públicas com maior projeção para os próximos anos.",
    date: "22/04/2026",
    time: "18:30 às 21:30",
    location: "Online - Plataforma Zoom",
    price: 197,
    availableTickets: 100,
    soldTickets: 45,
    eventType: "online",
  },
  {
    id: 3,
    title: "Simulado Nacional de Conhecimentos",
    description: "Participe do maior simulado do país e teste seus conhecimentos.",
    date: "30/04/2026",
    time: "09:00 às 17:00",
    location: "Online - Plataforma EAD",
    price: 97,
    availableTickets: 200,
    soldTickets: 89,
    eventType: "online",
  },
  {
    id: 4,
    title: "Mentoria: Como se preparar para concursos",
    description: "Mentoria exclusiva com estratégias de estudo e planejamento.",
    date: "05/05/2026",
    time: "19:30 às 21:30",
    location: "Presencial - Auditório Virtual",
    price: 149,
    availableTickets: 30,
    soldTickets: 12,
    eventType: "presencial",
  },
]

const getModalityColor = (modality: string) => {
  switch(modality) {
    case 'online':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'presencial':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'hibrido':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getEventTypeColor = (eventType: string) => {
  if (eventType === 'online') {
    return 'bg-blue-100 text-blue-700 border-blue-200'
  }
  return 'bg-green-100 text-green-700 border-green-200'
}

export default function AssistenteDashboardPage() {
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [showEventSaleModal, setShowEventSaleModal] = useState(false)
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [eventFilter, setEventFilter] = useState<string>("all")

  // Filtrando cursos por modalidade (separado dos eventos)
  const filteredCourses = courseFilter === "all" 
    ? availableCourses 
    : availableCourses.filter(course => course.modality === courseFilter)

  // Filtrando eventos (apenas online/presencial)
  const filteredEvents = eventFilter === "all" 
    ? availableEvents 
    : availableEvents.filter(event => event.eventType === eventFilter)

  // Combinando cursos e eventos para o carrossel
  const carouselItems = [
    ...filteredCourses.map(course => ({ type: 'course' as const, data: course })),
    ...filteredEvents.map(event => ({ type: 'event' as const, data: event }))
  ]

  const getModalityIcon = (modality: string) => {
    switch(modality) {
      case 'online':
        return Monitor
      case 'presencial':
        return Building
      case 'hibrido':
        return Laptop
      default:
        return Monitor
    }
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="relative p-4 lg:p-6 max-w-full h-full flex flex-col">
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

        <div className="relative z-10 flex-1 flex flex-col space-y-4 min-h-0">
          {/* CARROSSEL UNIFICADO COM FILTROS */}
          <Card className="h-96 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader className="border-b border-gray-100 pb-4 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-[#e8491d]" />
                    Oportunidades Disponíveis
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cursos e eventos disponíveis para matrícula e venda
                  </p>
                </div>
                <div className="flex gap-2">
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

              {/* Filtros apenas para Cursos */}
              <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 mr-2">Filtrar cursos:</span>
                <Badge 
                  variant={courseFilter === "all" ? "default" : "outline"}
                  className={`cursor-pointer transition-all text-xs ${courseFilter === "all" ? "bg-[#e8491d] hover:bg-[#d43d15]" : "hover:bg-gray-100"}`}
                  onClick={() => setCourseFilter("all")}
                >
                  Todos
                </Badge>
                <Badge 
                  variant={courseFilter === "online" ? "default" : "outline"}
                  className={`cursor-pointer transition-all text-xs ${courseFilter === "online" ? "bg-[#e8491d] hover:bg-[#d43d15]" : "hover:bg-gray-100"}`}
                  onClick={() => setCourseFilter("online")}
                >
                  <Monitor className="h-3 w-3 mr-1" />
                  Online
                </Badge>
                <Badge 
                  variant={courseFilter === "presencial" ? "default" : "outline"}
                  className={`cursor-pointer transition-all text-xs ${courseFilter === "presencial" ? "bg-[#e8491d] hover:bg-[#d43d15]" : "hover:bg-gray-100"}`}
                  onClick={() => setCourseFilter("presencial")}
                >
                  <Building className="h-3 w-3 mr-1" />
                  Presencial
                </Badge>
                <Badge 
                  variant={courseFilter === "hibrido" ? "default" : "outline"}
                  className={`cursor-pointer transition-all text-xs ${courseFilter === "hibrido" ? "bg-[#e8491d] hover:bg-[#d43d15]" : "hover:bg-gray-100"}`}
                  onClick={() => setCourseFilter("hibrido")}
                >
                  <Laptop className="h-3 w-3 mr-1" />
                  Híbrido
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto h-72 pt-4">
              {carouselItems.length > 0 ? (
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full max-w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {carouselItems.map((item, index) => (
                      <CarouselItem key={index} className="pl-2 md:pl-4 basis-[90%] sm:basis-[45%] md:basis-[32%] lg:basis-[24%] xl:basis-[19%]">
                        {item.type === 'course' ? (
                          // Card de Curso
                          <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4 transition-all duration-300 hover:border-[#e8491d] hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#e8491d]/5 to-[#e8491d]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative h-full flex flex-col">
                              <div className="flex items-start justify-between mb-2">
                                <div className="rounded-lg bg-orange-50 p-1.5">
                                  <GraduationCap className="h-4 w-4 text-[#e8491d]" />
                                </div>
                                <Badge className={`text-xs ${getModalityColor(item.data.modality)}`}>
                                  {React.createElement(getModalityIcon(item.data.modality), { className: "h-3 w-3 mr-1" })}
                                  {item.data.modalityLabel}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-2">{item.data.title}</h3>
                              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.data.duration}
                              </p>
                              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.data.location}
                              </p>
                              {item.data.modality === "presencial" && item.data.schedule && (
                                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                  {item.data.schedule === "tarde" ? (
                                    <Sun className="h-3 w-3 text-yellow-500" />
                                  ) : (
                                    <Moon className="h-3 w-3 text-blue-500" />
                                  )}
                                  {item.data.scheduleLabel}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mb-2 line-clamp-2">{item.data.description}</p>
                              <div className="mt-auto">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-500">
                                    Vagas: {item.data.totalSpots - item.data.soldSpots}
                                  </span>
                                  <span className="text-xs font-medium text-green-600">
                                    {item.data.soldSpots} vendidas
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
                                  <div className="flex h-full">
                                    <div 
                                      className="bg-green-500 h-full transition-all duration-500"
                                      style={{ width: `${(item.data.soldSpots / item.data.totalSpots) * 100}%` }}
                                    />
                                    <div 
                                      className="bg-[#e8491d] h-full transition-all duration-500"
                                      style={{ width: `${((item.data.totalSpots - item.data.soldSpots) / item.data.totalSpots) * 100}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div>
                                    <span className="text-xl font-bold text-[#e8491d]">
                                      R$ {item.data.price.toFixed(2)}
                                    </span>
                                    <p className="text-xs text-gray-500">à vista</p>
                                  </div>
                                  <Button 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setShowEnrollmentModal(true)
                                    }}
                                    className="bg-[#e8491d] hover:bg-[#d43d15] text-white cursor-pointer shadow-md hover:shadow-lg transition-all text-xs h-8"
                                  >
                                    Matricular
                                    <ChevronRight className="ml-1 h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Card de Evento
                          <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4 transition-all duration-300 hover:border-[#e8491d] hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#e8491d]/5 to-[#e8491d]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative h-full flex flex-col">
                              <div className="flex items-start justify-between mb-2">
                                <div className="rounded-lg bg-orange-50 p-1.5">
                                  <Ticket className="h-4 w-4 text-[#e8491d]" />
                                </div>
                                <Badge className={getEventTypeColor(item.data.eventType)}>
                                  {item.data.eventType === "online" ? (
                                    <Monitor className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Building className="h-3 w-3 mr-1" />
                                  )}
                                  {item.data.eventType === "online" ? "Online" : "Presencial"}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-2">{item.data.title}</h3>
                              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {item.data.date} • {item.data.time}
                              </p>
                              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.data.location}
                              </p>
                              <p className="text-xs text-gray-400 mb-2 line-clamp-2">{item.data.description}</p>
                              <div className="mt-auto">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-500">
                                    Ingressos: {item.data.availableTickets - item.data.soldTickets}
                                  </span>
                                  <span className="text-xs font-medium text-green-600">
                                    {item.data.soldTickets} vendidos
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
                                  <div className="flex h-full">
                                    <div 
                                      className="bg-green-500 h-full transition-all duration-500"
                                      style={{ width: `${(item.data.soldTickets / item.data.availableTickets) * 100}%` }}
                                    />
                                    <div 
                                      className="bg-[#e8491d] h-full transition-all duration-500"
                                      style={{ width: `${((item.data.availableTickets - item.data.soldTickets) / item.data.availableTickets) * 100}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div>
                                    <span className="text-xl font-bold text-[#e8491d]">
                                      R$ {item.data.price.toFixed(2)}
                                    </span>
                                    <p className="text-xs text-gray-500">por pessoa</p>
                                  </div>
                                  <Button 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setShowEventSaleModal(true)
                                    }}
                                    className="bg-[#e8491d] hover:bg-[#d43d15] text-white cursor-pointer shadow-md hover:shadow-lg transition-all text-xs h-8"
                                  >
                                    Vender
                                    <ChevronRight className="ml-1 h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-4 bg-white shadow-md hover:bg-[#e8491d] hover:text-white transition-all cursor-pointer h-8 w-8 z-10" />
                  <CarouselNext className="absolute right-4 bg-white shadow-md hover:bg-[#e8491d] hover:text-white transition-all cursor-pointer h-8 w-8 z-10" />
                </Carousel>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Nenhum item encontrado com o filtro selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GRÁFICOS DE VAGAS COM FILTROS - FORA DO SCROLL */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
              <CardHeader className="border-b border-gray-100 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="h-5 w-5 text-[#e8491d]" />
                    Vagas em Cursos
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3 text-gray-400" />
                    <select
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 cursor-pointer hover:border-[#e8491d] transition-colors"
                    >
                      <option value="all">Todos os cursos</option>
                      <option value="online">Apenas Online</option>
                      <option value="presencial">Apenas Presencial</option>
                      <option value="hibrido">Apenas Híbrido</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="space-y-3">
                  {filteredCourses.map((course) => {
                    const availableSpots = course.totalSpots - course.soldSpots
                    const soldPercentage = (course.soldSpots / course.totalSpots) * 100
                    const availablePercentage = (availableSpots / course.totalSpots) * 100
                    return (
                      <div key={course.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="font-medium text-gray-700 text-xs">{course.title}</span>
                              <Badge className={`text-xs ${getModalityColor(course.modality)}`}>
                                {course.modalityLabel}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{course.location}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-green-600">{course.soldSpots}</span>
                            <span className="text-xs text-gray-400"> / {course.totalSpots}</span>
                            <p className="text-xs text-gray-500">{availableSpots} vagas</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div className="flex h-full">
                            <div 
                              className="bg-green-500 h-full transition-all duration-500"
                              style={{ width: `${soldPercentage}%` }}
                            />
                            <div 
                              className="bg-[#e8491d] h-full transition-all duration-500"
                              style={{ width: `${availablePercentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">✓ {course.soldSpots} vendidas</span>
                          <span className="text-[#e8491d]">○ {availableSpots} disponíveis</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
              <CardHeader className="border-b border-gray-100 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Ticket className="h-5 w-5 text-[#e8491d]" />
                    Ingressos para Eventos
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3 text-gray-400" />
                    <select
                      value={eventFilter}
                      onChange={(e) => setEventFilter(e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 cursor-pointer hover:border-[#e8491d] transition-colors"
                    >
                      <option value="all">Todos os eventos</option>
                      <option value="online">Apenas Online</option>
                      <option value="presencial">Apenas Presencial</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="space-y-3">
                  {filteredEvents.map((event) => {
                    const availableTickets = event.availableTickets - event.soldTickets
                    const soldPercentage = (event.soldTickets / event.availableTickets) * 100
                    const availablePercentage = (availableTickets / event.availableTickets) * 100
                    return (
                      <div key={event.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="font-medium text-gray-700 text-xs">{event.title}</span>
                              <Badge className={getEventTypeColor(event.eventType)}>
                                {event.eventType === "online" ? "Online" : "Presencial"}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{event.date} • {event.location}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-green-600">{event.soldTickets}</span>
                            <span className="text-xs text-gray-400"> / {event.availableTickets}</span>
                            <p className="text-xs text-gray-500">{availableTickets} ingressos</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div className="flex h-full">
                            <div 
                              className="bg-green-500 h-full transition-all duration-500"
                              style={{ width: `${soldPercentage}%` }}
                            />
                            <div 
                              className="bg-[#e8491d] h-full transition-all duration-500"
                              style={{ width: `${availablePercentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">✓ {event.soldTickets} vendidos</span>
                          <span className="text-[#e8491d]">○ {availableTickets} disponíveis</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MINHAS MATRÍCULAS RECENTES */}
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
          events={availableEvents}
        />
      </div>
    </div>
  )
}