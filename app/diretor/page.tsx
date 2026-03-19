"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, DollarSign, TrendingUp, FileText, CalendarDays } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import { mockStudents, mockCourses, mockTurmas, mockEnrollments, mockEvents, mockContracts } from "@/lib/mock-data"

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
        pendingContracts: mockContracts.filter((c) => c.status === "pendente").length,
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
        pendingContracts: mockContracts.filter((c) => c.status === "pendente").length,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Receita Total",
      value: stats ? `R$ ${stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-",
      subtitle: `R$ ${stats?.monthlyRevenue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"} este mes`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Alunos",
      value: stats?.activeStudents ?? 0,
      subtitle: `${stats?.totalStudents ?? 0} cadastrados`,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Matriculas Ativas",
      value: stats?.activeEnrollments ?? 0,
      subtitle: `${stats?.totalEnrollments ?? 0} total`,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Cursos",
      value: stats?.totalCourses ?? 0,
      subtitle: `${stats?.totalTurmas ?? 0} turmas`,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Eventos",
      value: stats?.upcomingEvents ?? 0,
      subtitle: `${stats?.totalEvents ?? 0} total`,
      icon: CalendarDays,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Contratos Pendentes",
      value: stats?.pendingContracts ?? 0,
      subtitle: "aguardando assinatura",
      icon: TrendingUp,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
  ]

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
              Painel do Diretor
            </h1>
            <p className="text-muted-foreground">
              Visao geral completa do sistema
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary">Acesso Total</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card) => (
            <Card key={card.title} className={loading ? "animate-pulse" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", card.bg)}>
                    <card.icon className={cn("h-5 w-5", card.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{card.title}</p>
                    <p className="text-lg font-bold text-foreground">{card.value}</p>
                    <p className="truncate text-xs text-muted-foreground">{card.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
