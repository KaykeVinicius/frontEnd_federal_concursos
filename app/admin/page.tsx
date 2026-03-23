"use client"

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
} from "lucide-react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import {
  mockTurmas,
  mockEnrollments,
} from "@/lib/mock-data"

import { NewEnrollmentDialog } from "@/components/new-enrollment-dialog"
import { EventSaleDialog } from "@/components/event-sale-dialog"

export default function AdminDashboardPage() {
  const [filter, setFilter] = useState<"turmas" | "turnos">("turmas")
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [showEventSaleModal, setShowEventSaleModal] = useState(false)

  const turmasChart = [
    {
      name: "Abertas",
      value: mockTurmas.filter((t) => t.status === "aberta").length,
    },
    {
      name: "Fechadas",
      value: mockTurmas.filter((t) => t.status === "fechada").length,
    },
  ]

  const turnosChart = [
    {
      name: "Manhã",
      value: mockTurmas.filter((t) => t.turno === "manha").length,
    },
    {
      name: "Tarde",
      value: mockTurmas.filter((t) => t.turno === "tarde").length,
    },
    {
      name: "Noite",
      value: mockTurmas.filter((t) => t.turno === "noite").length,
    },
  ]

  const data = filter === "turmas" ? turmasChart : turnosChart

  const statsData = [
    {
      title: "Alunos",
      value: mockEnrollments.length,
      icon: Users,
      bgColor: "bg-orange-50",
      iconColor: "text-[#e8491d]",
      trend: "+12%",
      trendUp: true,
      description: "Total de alunos matriculados",
    },
    {
      title: "Cursos",
      value: 12,
      icon: BookOpen,
      bgColor: "bg-orange-50",
      iconColor: "text-[#e8491d]",
      trend: "+2",
      trendUp: true,
      description: "Cursos disponíveis",
    },
    {
      title: "Turmas",
      value: mockTurmas.length,
      icon: Layers,
      bgColor: "bg-orange-50",
      iconColor: "text-[#e8491d]",
      trend: "+3",
      trendUp: true,
      description: "Turmas em andamento",
    },
    {
      title: "Vendas de Eventos",
      value: 156,
      icon: ShoppingBag,
      bgColor: "bg-orange-50",
      iconColor: "text-[#e8491d]",
      trend: "+23",
      trendUp: true,
      description: "Ingressos vendidos este mês",
    },
  ]

  const availableEvents = [
    {
      id: 1,
      title: "Workshop: Nova Lei de Licitações",
      description: "Aprenda todas as mudanças da nova lei de licitações e como se preparar para concursos.",
      date: "15/04/2026",
      time: "19:00 às 22:00",
      location: "Auditório Principal",
      price: 297,
      availableTickets: 50,
      soldTickets: 23,
    },
    {
      id: 2,
      title: "Palestra: Carreiras Públicas em Alta",
      description: "Descubra as carreiras públicas com maior projeção para os próximos anos.",
      date: "22/04/2026",
      time: "18:30 às 21:30",
      location: "Centro de Convenções",
      price: 197,
      availableTickets: 100,
      soldTickets: 45,
    },
    {
      id: 3,
      title: "Simulado Nacional de Conhecimentos",
      description: "Participe do maior simulado do país e teste seus conhecimentos.",
      date: "30/04/2026",
      time: "09:00 às 17:00",
      location: "Online",
      price: 97,
      availableTickets: 200,
      soldTickets: 89,
    },
  ]

  return (
    <div className="relative min-h-screen p-4 lg:p-8">
      <div className="relative z-10 space-y-6">

        {/* EVENTOS DISPONÍVEIS - PRIMEIRO NA PÁGINA */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-[#e8491d]" />
                Eventos Disponíveis
              </CardTitle>
              <Button 
                onClick={() => setShowEventSaleModal(true)}
                className="gap-2 bg-[#e8491d] hover:bg-[#d43d15] text-white transition-all duration-300 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                Nova venda
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setShowEventSaleModal(true)}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-5 transition-all duration-300 hover:border-[#e8491d] hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e8491d]/5 to-[#e8491d]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="rounded-lg bg-orange-50 p-2">
                        <CalendarDays className="h-5 w-5 text-[#e8491d]" />
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          {event.availableTickets - event.soldTickets} ingressos
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{event.date} • {event.time}</p>
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-2xl font-bold text-[#e8491d]">
                          R$ {event.price.toFixed(2)}
                        </span>
                        <p className="text-xs text-gray-500">por pessoa</p>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-[#e8491d] hover:bg-[#d43d15] text-white cursor-pointer"
                      >
                        Comprar ingresso
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl text-gray-900">
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground">
              Controle geral do sistema
            </p>
          </div>

          <Button 
            onClick={() => setShowEnrollmentModal(true)}
            className="flex items-center gap-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer bg-[#e8491d] hover:bg-[#d43d15]"
          >
            <Plus className="h-4 w-4" />
            Nova matrícula
          </Button>
        </div>

        {/* STATS CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <Card 
              key={stat.title}
              className="group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl border cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`rounded-xl ${stat.bgColor} p-3 transition-all duration-300 group-hover:scale-110`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'} bg-gray-100 rounded-full px-2 py-1`}>
                    {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.trend}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* GRÁFICO */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#e8491d]" />
                {filter === "turmas"
                  ? "Turmas (Abertas x Fechadas)"
                  : "Distribuição por Turnos"}
              </CardTitle>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "turmas" | "turnos")}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm cursor-pointer hover:border-[#e8491d] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#e8491d]"
              >
                <option value="turmas">Turmas</option>
                <option value="turnos">Turnos</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="h-72 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#e8491d" 
                  radius={[8, 8, 0, 0]}
                  className="cursor-pointer transition-all duration-300 hover:opacity-80"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
  )
}