"use client"

import { useMemo, useState } from "react"
import { mockCourses, mockEnrollments, mockSystemUsers } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const periodOptions = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
  { value: "trimestre", label: "Trimestre" },
  { value: "semestre", label: "Semestre" },
]

const getStartDate = (period: "dia" | "semana" | "mes" | "trimestre" | "semestre") => {
  const now = new Date()
  switch (period) {
    case "dia":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case "semana": {
      const firstDay = new Date(now)
      firstDay.setDate(now.getDate() - now.getDay())
      firstDay.setHours(0, 0, 0, 0)
      return firstDay
    }
    case "mes":
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case "trimestre":
      return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    case "semestre":
      return new Date(now.getFullYear(), Math.floor(now.getMonth() / 6) * 6, 1)
  }
}

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const downloadCSV = (rows: Record<string, string | number>[]) => {
  const header = Object.keys(rows[0] || {}).join(";")
  const csv = [header, ...rows.map((row) => Object.values(row).join(";"))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `relatorio_financeiro_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const downloadPDF = (rows: Record<string, string | number>[]) => {
  const content = `
    <html><head><title>Relatório Financeiro</title></head><body>
      <h1>Relatório Financeiro</h1>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width:100%">
        <thead><tr>${Object.keys(rows[0] || {}).map((col) => `<th>${col}</th>`).join("")}</tr></thead>
        <tbody>${rows
          .map(
            (row) =>
              `<tr>${Object.values(row)
                .map((cell) => `<td>${cell}</td>`)
                .join("")}</tr>`
          )
          .join("")}</tbody>
      </table>
    </body></html>`

  const win = window.open("", "_blank")
  if (!win) return
  win.document.write(content)
  win.document.close()
  win.focus()
  win.print()
}


export default function CeoFinanceiroPage() {
  const [period, setPeriod] = useState<"dia" | "semana" | "mes" | "trimestre" | "semestre">("mes")

  const assistantUser = mockSystemUsers.find((u) => u.role === "assistente_comercial")
  const assistantCommission = assistantUser?.commission_percent ?? 10

  const filteredEnrollments = useMemo(() => {
    const start = getStartDate(period)
    return mockEnrollments.filter((en) => new Date(en.created_at) >= start)
  }, [period])

  const revenue = useMemo(
    () => filteredEnrollments.reduce((acc, en) => acc + en.total_paid, 0),
    [filteredEnrollments]
  )

  const professorPayout = useMemo(() => {
    return filteredEnrollments.reduce((acc, en) => {
      const course = mockCourses.find((c) => c.id === en.course_id)
      if (!course) return acc
      if (course.access_type === "interno") return acc + 80 * (course.duration_in_days || 1)
      return acc + 300
    }, 0)
  }, [filteredEnrollments])

  const assistantPayout = useMemo(() => {
    return filteredEnrollments.length * (50 + (assistantCommission / 100) * 500)
  }, [filteredEnrollments, assistantCommission])

  const expenses = professorPayout + assistantPayout

  const chartData = [
    { name: "Receita", value: revenue },
    { name: "Despesas", value: expenses },
  ]

  type ReportRow = { label: string; value: string | number }

  const reportRows: ReportRow[] = [
    { label: "Receita", value: formatCurrency(revenue) },
    { label: "Despesas", value: formatCurrency(expenses) },
    { label: "Lucro", value: formatCurrency(revenue - expenses) },
    { label: "Comissão Assistente", value: `${assistantCommission}%` },
    { label: "Total Matriculas", value: filteredEnrollments.length },
  ]

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Financeiro</h1>
          <p className="text-muted-foreground">Dashboard financeiro com exportação e filtro flexível</p>
        </div>

        <Card className="rounded-2xl border border-border bg-gradient-to-r from-slate-900/70 to-violet-950/70 p-5 text-white shadow-lg">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs uppercase text-white/70">Período</p>
              <div className="mt-1">
                <Select
                  value={period}
                  onValueChange={(value) =>
                    setPeriod(value as "dia" | "semana" | "mes" | "trimestre" | "semestre")
                  }
                >
                  <SelectTrigger>
                    <SelectValue>{periodOptions.find((o) => o.value === period)?.label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs uppercase text-white/70">Receita</p>
              <p className="text-2xl font-bold">{formatCurrency(revenue)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs uppercase text-white/70">Despesas</p>
              <p className="text-2xl font-bold">{formatCurrency(expenses)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs uppercase text-white/70">Lucro</p>
              <p className="text-2xl font-bold">{formatCurrency(revenue - expenses)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs uppercase text-white/70">Matriculas</p>
              <p className="text-2xl font-bold">{filteredEnrollments.length}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => downloadCSV(reportRows)}
              className="rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Baixar XLSX (CSV)
            </button>
            <button
              onClick={() => downloadPDF(reportRows)}
              className="rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Baixar PDF
            </button>
          </div>
        </Card>

        <Card>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                  <Bar dataKey="value" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}