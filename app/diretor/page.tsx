"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, DollarSign, TrendingUp, FileText, CalendarDays, Loader2 } from "lucide-react"
import { api, type ApiDashboard } from "@/lib/api"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts"

export default function DiretorDashboard() {
  const [data, setData] = useState<ApiDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartMetric, setChartMetric] = useState<"matriculas" | "receita">("matriculas")
  const [periodFilter, setPeriodFilter] = useState<"mes" | "trimestre" | "ano">("mes")

  useEffect(() => {
    api.dashboard.get()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Erro ao carregar dados do painel.
      </div>
    )
  }

  const revenueByPeriod = periodFilter === "mes"
    ? data.revenue.month
    : periodFilter === "trimestre"
      ? data.revenue.quarter
      : data.revenue.year

  const fmtBRL = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`

  const modalityStats = [
    { label: "Presencial", value: data.modality.presencial, bg: "bg-gradient-to-br from-blue-400 to-blue-600",   icon: "🏢", color: "text-blue-600"   },
    { label: "Online",     value: data.modality.online,     bg: "bg-gradient-to-br from-green-400 to-green-600", icon: "💻", color: "text-green-600" },
    { label: "Híbrido",    value: data.modality.hibrido,    bg: "bg-gradient-to-br from-orange-400 to-orange-600",icon: "🔄", color: "text-orange-600"},
  ]

  const statCards = [
    {
      title: "Receita",
      value: fmtBRL(revenueByPeriod),
      subtitle: periodFilter === "mes" ? "Mês atual" : periodFilter === "trimestre" ? "Trimestre atual" : "Ano atual",
      icon: DollarSign,
      bg: "bg-gradient-to-br from-green-400 to-green-600",
      filter: true,
    },
    {
      title: "Matrículas Ativas",
      value: data.enrollments.active,
      subtitle: `${data.enrollments.total} total`,
      icon: Users,
      bg: "bg-gradient-to-br from-primary/80 to-primary",
    },
    {
      title: "Alunos",
      value: data.students.total,
      subtitle: `${data.students.active} ativos`,
      icon: Users,
      bg: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    {
      title: "Cursos",
      value: data.courses,
      subtitle: `${data.turmas} turmas`,
      icon: BookOpen,
      bg: "bg-gradient-to-br from-purple-400 to-purple-600",
    },
    {
      title: "Eventos",
      value: data.upcoming_events,
      subtitle: `${data.events} total`,
      icon: CalendarDays,
      bg: "bg-gradient-to-br from-orange-400 to-orange-600",
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
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Painel do CEO</h1>
          <p className="text-muted-foreground">Visão geral completa do sistema</p>
        </div>

        {/* Modalidade */}
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

        {/* KPI Cards */}
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

        {/* Gráfico: Matrículas por mês (últimos 12 meses) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Evolução Mensal — últimos 12 meses</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {data.charts.monthly.every((m) => m.matriculas === 0) ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem dados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.monthly} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v, name) => name === "receita" ? fmtBRL(Number(v)) : v} />
                  <Legend />
                  <Line yAxisId="left"  type="monotone" dataKey="matriculas" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Matrículas" />
                  <Line yAxisId="right" type="monotone" dataKey="receita"    stroke="#22c55e" strokeWidth={2} dot={false} name="Receita (R$)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico: por Curso */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">Matrículas por Curso</CardTitle>
              <select
                value={chartMetric}
                onChange={(e) => setChartMetric(e.target.value as "matriculas" | "receita")}
                className="rounded border border-input bg-background px-2 py-1 text-sm"
              >
                <option value="matriculas">Matrículas</option>
                <option value="receita">Receita</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {data.charts.courses.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem dados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.courses} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={(v, name) => name === "receita" ? fmtBRL(Number(v)) : v} />
                  <Bar dataKey={chartMetric} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico: por Carreira */}
        {data.charts.careers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Matrículas por Carreira</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.careers} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="matriculas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions + Resumo Financeiro */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <a href="/ceo/financeiro" className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium text-foreground">Financeiro</span>
                </a>
                <a href="/ceo/relatorios" className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium text-foreground">Relatórios</span>
                </a>
                <a href="/ceo/alunos" className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-foreground">Gerenciar Alunos</span>
                </a>
                <a href="/ceo/contratos" className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <span className="text-sm font-medium text-foreground">Contratos</span>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border bg-green-50 dark:bg-green-950/20 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600">{fmtBRL(data.revenue.total)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-600/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Este Mês</p>
                  <p className="text-lg font-bold text-foreground">{fmtBRL(data.revenue.month)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Média por Matrícula</p>
                  <p className="text-lg font-bold text-foreground">{fmtBRL(data.revenue.avg_per_enrollment)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Trimestre</p>
                  <p className="text-lg font-bold text-foreground">{fmtBRL(data.revenue.quarter)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Este Ano</p>
                  <p className="text-lg font-bold text-foreground">{fmtBRL(data.revenue.year)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestão usuários */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">Gestão de Usuários</h3>
          <p className="text-sm text-muted-foreground">CEO pode cadastrar e atribuir perfis de acesso para Assistente Comercial, Equipe Pedagógica, Professor e Aluno.</p>
          <div className="mt-4">
            <a href="/ceo/configuracoes" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Ir para Configurações
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
