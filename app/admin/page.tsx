"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Layers, CalendarDays, Plus, TrendingUp, Sparkles, ShoppingBag, ChevronRight } from "lucide-react"
import Link from "next/link"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { api, type ApiTurma, type ApiEnrollment, type ApiEvent, type ApiCourse } from "@/lib/api"

export default function AdminDashboardPage() {
  const [filter, setFilter] = useState<"turmas" | "turnos">("turmas")
  const [turmas, setTurmas] = useState<ApiTurma[]>([])
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [courses, setCourses] = useState<ApiCourse[]>([])

  useEffect(() => {
    Promise.all([api.turmas.list(), api.enrollments.list(), api.events.list(), api.courses.list()])
      .then(([t, e, ev, c]) => { setTurmas(t); setEnrollments(e); setEvents(ev); setCourses(c) })
      .catch(console.error)
  }, [])

  const turmasChart = [
    { name: "Abertas", value: turmas.filter((t) => t.status === "aberta").length },
    { name: "Em Andamento", value: turmas.filter((t) => t.status === "em_andamento").length },
    { name: "Fechadas", value: turmas.filter((t) => t.status === "fechada").length },
  ]

  const turnosChart = [
    { name: "Manhã", value: turmas.filter((t) => t.shift?.toLowerCase().includes("manh")).length },
    { name: "Tarde", value: turmas.filter((t) => t.shift?.toLowerCase().includes("tarde")).length },
    { name: "Noite", value: turmas.filter((t) => t.shift?.toLowerCase().includes("noite")).length },
  ]

  const data = filter === "turmas" ? turmasChart : turnosChart

  const statsData = [
    { title: "Alunos", value: enrollments.filter((e) => e.status === "active").length, icon: Users, description: "Matrículas ativas" },
    { title: "Cursos", value: courses.length, icon: BookOpen, description: "Cursos disponíveis" },
    { title: "Turmas", value: turmas.length, icon: Layers, description: "Total de turmas" },
    { title: "Eventos", value: events.length, icon: CalendarDays, description: "Eventos cadastrados" },
  ]

  const upcomingEvents = events.filter((e) => e.status === "agendado").slice(0, 3)

  return (
    <div className="relative min-h-screen p-4 lg:p-8">
      <div className="relative z-10 space-y-6">

        {/* Eventos */}
        {upcomingEvents.length > 0 && (
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#e8491d]" />
                  Próximos Eventos
                </CardTitle>
                <Button asChild className="gap-2 bg-[#e8491d] hover:bg-[#d43d15] text-white">
                  <Link href="/admin/eventos"><Plus className="h-4 w-4" /> Novo evento</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-5 transition-all duration-300 hover:border-[#e8491d] hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="rounded-lg bg-orange-50 p-2">
                        <CalendarDays className="h-5 w-5 text-[#e8491d]" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">Agendado</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{event.date} • {event.start_time} às {event.end_time}</p>
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{event.description}</p>
                    {event.location && (
                      <p className="text-xs text-gray-500">{event.location}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl text-gray-900">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">Controle geral do sistema</p>
          </div>
          <Button asChild className="flex items-center gap-2 bg-[#e8491d] hover:bg-[#d43d15]">
            <Link href="/admin/alunos"><Plus className="h-4 w-4" /> Nova matrícula</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <Card key={stat.title} className="group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl border cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-xl bg-orange-50 p-3 transition-all duration-300 group-hover:scale-110">
                    <stat.icon className="h-6 w-6 text-[#e8491d]" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#e8491d]" />
                {filter === "turmas" ? "Turmas por Status" : "Distribuição por Turnos"}
              </CardTitle>
              <select value={filter} onChange={(e) => setFilter(e.target.value as "turmas" | "turnos")}
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
                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <Bar dataKey="value" fill="#e8491d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/admin/alunos", label: "Gerenciar Alunos", icon: Users },
            { href: "/admin/turmas", label: "Gerenciar Turmas", icon: Layers },
            { href: "/admin/cursos", label: "Ver Cursos", icon: BookOpen },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-[#e8491d]/40 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-50 p-2"><Icon className="h-5 w-5 text-[#e8491d]" /></div>
                <span className="font-medium text-foreground">{label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
