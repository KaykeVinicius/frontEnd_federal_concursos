"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, DollarSign, TrendingUp, FileText, CalendarDays } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import { mockStudents, mockCourses, mockTurmas, mockEnrollments, mockEvents, mockContracts, mockCareers } from "@/lib/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Stats {
  totalStudents: number
  activeStudents: number
  totalCourses: number
  totalTurmas: number
  totalEnrollments: number
  activeEnrollments: number
  totalRevenue: number
  monthlyRevenue: number
  totalEvents: number
  upcomingEvents: number
  pendingContracts: number
}

export default function DiretorDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartMetric, setChartMetric] = useState<"matriculas" | "receita">("matriculas")
  const [periodFilter, setPeriodFilter] = useState<"mes" | "trimestre" | "ano">("mes")

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      await fakeApiCall({
        totalStudents: mockStudents.length,
        activeStudents: mockStudents.filter((s) => s.active).length,
        totalCourses: mockCourses.length,
        totalTurmas: mockTurmas.length,
        totalEnrollments: mockEnrollments.length,
        activeEnrollments: mockEnrollments.filter((e) => e.status === "active").length,
        totalRevenue: mockEnrollments.reduce((acc, e) => acc + e.total_paid, 0),
        monthlyRevenue: mockEnrollments
          .filter((e) => e.created_at.startsWith("2026-01"))
          .reduce((acc, e) => acc + e.total_paid, 0),
        totalEvents: mockEvents.length,
        upcomingEvents: mockEvents.filter((e) => e.status === "agendado").length,
        pendingContracts: mockContracts.filter((c) => c.status === "pending").length,
      })
      setStats({
        totalStudents: mockStudents.length,
        activeStudents: mockStudents.filter((s) => s.active).length,
        totalCourses: mockCourses.length,
        totalTurmas: mockTurmas.length,
        totalEnrollments: mockEnrollments.length,
        activeEnrollments: mockEnrollments.filter((e) => e.status === "active").length,
        totalRevenue: mockEnrollments.reduce((acc, e) => acc + e.total_paid, 0),
        monthlyRevenue: mockEnrollments
          .filter((e) => e.created_at.startsWith("2026-01"))
          .reduce((acc, e) => acc + e.total_paid, 0),
        totalEvents: mockEvents.length,
        upcomingEvents: mockEvents.filter((e) => e.status === "agendado").length,
        pendingContracts: mockContracts.filter((c) => c.status === "pending").length,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const modalityStats = [
    {
      label: "Presencial",
      value: mockEnrollments.filter((e) => {
        const course = mockCourses.find((c) => c.id === e.course_id)
        return course?.access_type === "interno"
      }).length,
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-400 to-blue-600",
      icon: "🏢",
    },
    {
      label: "Online",
      value: mockEnrollments.filter((e) => {
        const course = mockCourses.find((c) => c.id === e.course_id)
        return course?.access_type === "externo"
      }).length,
      color: "text-green-600",
      bg: "bg-gradient-to-br from-green-400 to-green-600",
      icon: "💻",
    },
    {
      label: "Híbrido",
      value: mockEnrollments.filter((e) => {
        const course = mockCourses.find((c) => c.id === e.course_id)
        return course?.access_type === "ambos"
      }).length,
      color: "text-orange-600",
      bg: "bg-gradient-to-br from-orange-400 to-orange-600",
      icon: "🔄",
    },
  ]

  const getRevenueByPeriod = (period: "mes" | "trimestre" | "ano") => {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "mes":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "trimestre":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case "ano":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    return mockEnrollments
      .filter((e) => new Date(e.created_at) >= startDate)
      .reduce((acc, e) => acc + e.total_paid, 0)
  }

  const statCards = [
    {
      title: "Receita Total",
      value: stats ? `R$ ${getRevenueByPeriod(periodFilter).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-",
      subtitle: `Período: ${periodFilter === "mes" ? "Mês atual" : periodFilter === "trimestre" ? "Trimestre atual" : "Ano atual"}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-gradient-to-br from-green-400 to-green-600",
      filter: true,
    },
    {
      title: "Novos Alunos",
      value: stats?.activeStudents ?? 0,
      subtitle: `${stats?.totalStudents ?? 0} total cadastrados`,
      icon: Users,
      color: "text-primary",
      bg: "bg-gradient-to-br from-primary/80 to-primary",
    },
    {
      title: "TOTAL DE ALUNOS",
      value: stats?.totalStudents ?? 0,
      subtitle: `${stats?.activeStudents ?? 0} alunos ativos`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    {
      title: "Cursos",
      value: stats?.totalCourses ?? 0,
      subtitle: `${stats?.totalTurmas ?? 0} turmas`,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-gradient-to-br from-purple-400 to-purple-600",
    },
    {
      title: "Eventos",
      value: stats?.upcomingEvents ?? 0,
      subtitle: `${stats?.totalEvents ?? 0} total`,
      icon: CalendarDays,
      color: "text-orange-600",
      bg: "bg-gradient-to-br from-orange-400 to-orange-600",
    },
  ]

  const courseChartData = mockCourses.map((course) => {
    const enrollments = mockEnrollments.filter((e) => e.course_id === course.id).length
    const revenue = mockEnrollments
      .filter((e) => e.course_id === course.id)
      .reduce((acc, e) => acc + e.total_paid, 0)

    return {
      name: course.title,
      matriculas: enrollments,
      receita: revenue,
    }
  })

  const careerData = mockCareers.map((career) => {
    const count = mockEnrollments.filter((e) => e.career_id === career.id).length
    return {
      name: career.name,
      matriculas: count,
    }
  })

  return (
    <div className="relative min-h-screen p-4 lg:p-8">
      {/* Background watermark */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.03]">
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

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              Painel do CEO
            </h1>
            <p className="text-muted-foreground">
              Visao geral completa do sistema
            </p>
          </div>
        </div>

        {/* Modalidade de Alunos - No Topo */}
        <div className="grid gap-4 sm:grid-cols-3">
          {modalityStats.map((item) => (
            <Card key={item.label} className="group hover:scale-105 transition-all duration-300 hover:shadow-xl border-0 overflow-hidden">
              <CardContent className="p-6 relative">
                <div className={`absolute inset-0 ${item.bg} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">Alunos matriculados</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((card) => (
            <Card key={card.title} className="group hover:scale-105 transition-all duration-300 hover:shadow-lg border-0 overflow-hidden">
              <CardContent className="p-4 relative">
                <div className={`absolute inset-0 ${card.bg} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.bg} text-white`}>
                      <card.icon className="h-4 w-4" />
                    </div>
                    {card.filter && (
                      <select
                        value={periodFilter}
                        onChange={(e) => setPeriodFilter(e.target.value as "mes" | "trimestre" | "ano")}
                        className="text-xs bg-transparent border-0 p-0 text-muted-foreground focus:ring-0"
                      >
                        <option value="mes">Mês</option>
                        <option value="trimestre">Trimestre</option>
                        <option value="ano">Ano</option>
                      </select>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className="text-lg font-bold text-foreground">{card.value}</p>
                  <p className="truncate text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart de Cursos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">Matriculas por Curso</CardTitle>
              <select
                value={chartMetric}
                onChange={(e) => setChartMetric(e.target.value as "matriculas" | "receita")}
                className="rounded border border-input bg-background px-2 py-1 text-sm"
              >
                <option value="matriculas">Matriculas</option>
                <option value="receita">Receita</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={true} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={chartMetric} fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Carreiras */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Matriculas por Carreira</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={careerData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={true} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="matriculas" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Acoes Rapidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="/diretor/financeiro"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium text-foreground">Financeiro</span>
                </a>
                <a
                  href="/diretor/relatorios"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium text-foreground">Relatorios</span>
                </a>
                <a
                  href="/diretor/alunos"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-foreground">Gerenciar Alunos</span>
                </a>
                <a
                  href="/diretor/contratos"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <FileText className="h-6 w-6 text-purple-600" />
                  <span className="text-sm font-medium text-foreground">Contratos</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border bg-green-50 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {stats?.totalRevenue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-green-600/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Este Mes</p>
                  <p className="text-lg font-bold text-foreground">
                    R$ {stats?.monthlyRevenue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Media por Matricula</p>
                  <p className="text-lg font-bold text-foreground">
                    R$ {stats && stats.totalEnrollments > 0
                      ? (stats.totalRevenue / stats.totalEnrollments).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                      : "0,00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gerenciar usuários */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">Gestão de Usuários</h3>
          <p className="text-sm text-muted-foreground">CEO pode cadastrar e atribuir perfis de acesso para Assistente Comercial, Equipe Pedagógica, Professor e Aluno.</p>
          <div className="mt-4">
            <a
              href="/ceo/configuracoes"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Ir para Configurações
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
