"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users, BookOpen, Layers, FileText, TrendingUp, PlusCircle, Loader2, Briefcase, GraduationCap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api, type ApiDashboard } from "@/lib/api"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts"

export default function PedagogicaDashboard() {
  const [data,    setData   ] = useState<ApiDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartMetric, setChartMetric] = useState<"matriculas" | "receita">("matriculas")

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

  const stats = [
    {
      label: "Alunos Matriculados",
      value: data.enrollments.active,
      sub: `${data.enrollments.total} matrículas no total`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Cursos",
      value: data.courses,
      sub: `${data.turmas} turmas cadastradas`,
      icon: BookOpen,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Alunos Ativos",
      value: data.students.active,
      sub: `${data.students.total} alunos no total`,
      icon: GraduationCap,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "Presencial",
      value: data.modality.presencial,
      sub: `${data.modality.hibrido} híbrido · ${data.modality.online} online`,
      icon: Briefcase,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
  ]

  return (
    <div className="relative min-h-screen p-4 lg:p-8">
      <div className="relative z-10 mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Painel Pedagógico</h1>
            <p className="text-muted-foreground">Gerencie cursos, turmas e materiais dos alunos</p>
          </div>
          <Link
            href="/pedagogica/cursos"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-all hover:opacity-90 hover:-translate-y-0.5"
          >
            <PlusCircle className="h-4 w-4" /> Criar Curso
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className={`border ${s.border}`}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico: evolução mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Evolução de Matrículas — últimos 12 meses
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {data.charts.monthly.every((m) => m.matriculas === 0) ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem dados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.monthly} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="matriculas" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Matrículas" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráficos: por curso + por carreira */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Matrículas por Curso</CardTitle>
                <select
                  value={chartMetric}
                  onChange={(e) => setChartMetric(e.target.value as "matriculas" | "receita")}
                  className="rounded border border-input bg-background px-2 py-1 text-xs"
                >
                  <option value="matriculas">Matrículas</option>
                  <option value="receita">Receita</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="h-64">
              {data.charts.courses.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem dados</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.courses} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={chartMetric} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Matrículas por Carreira</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {data.charts.careers.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem dados</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.careers} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="matriculas" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Ações Rápidas — Siga a ordem</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { href: "/pedagogica/carreiras", icon: Briefcase, label: "1. Carreiras",  color: "text-orange-500" },
              { href: "/pedagogica/turmas",    icon: Layers,    label: "2. Turmas",     color: "text-blue-500"   },
              { href: "/pedagogica/materias",  icon: FileText,  label: "3. Matérias",   color: "text-purple-500" },
              { href: "/pedagogica/cursos",    icon: BookOpen,  label: "4. Cursos",     color: "text-green-500"  },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:border-primary hover:bg-accent"
              >
                <a.icon className={`h-5 w-5 ${a.color}`} />
                <span className="text-xs font-medium text-foreground">{a.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
