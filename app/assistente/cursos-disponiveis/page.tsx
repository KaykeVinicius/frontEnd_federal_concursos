"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api, type ApiCourse } from "@/lib/api"
import {
  BookOpen,
  Search,
  Filter,
  Loader2,
  CalendarDays,
  Clock,
  GraduationCap,
  DollarSign,
} from "lucide-react"

const statusLabel: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  draft: "Rascunho",
}

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
  draft: "bg-yellow-100 text-yellow-700 border-yellow-200",
}

const accessLabel: Record<string, string> = {
  online: "Online",
  presencial: "Presencial",
  hibrido: "Híbrido",
}

const accessColor: Record<string, string> = {
  online: "bg-blue-100 text-blue-700 border-blue-200",
  presencial: "bg-green-100 text-green-700 border-green-200",
  hibrido: "bg-purple-100 text-purple-700 border-purple-200",
}

export default function CursosDisponiveisPage() {
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    api.courses.list()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return courses
      .filter((c) => {
        const matchSearch =
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.career?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
        const matchStatus = statusFilter === "all" || c.status === statusFilter
        return matchSearch && matchStatus
      })
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [courses, searchTerm, statusFilter])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#e8491d] to-[#f97316] p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-white/20 p-3">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Cursos Disponíveis</h1>
                <p className="text-orange-100">Consulte os cursos cadastrados para realizar matrículas</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-blue-500/40 bg-gradient-to-b from-blue-700/30 to-slate-900/50 p-6 text-white">
            <p className="text-sm uppercase tracking-wide text-white/70 mb-1">Total de Cursos</p>
            <p className="text-4xl font-bold">{courses.length}</p>
          </Card>
          <Card className="border-green-500/40 bg-gradient-to-b from-green-700/30 to-slate-900/50 p-6 text-white">
            <p className="text-sm uppercase tracking-wide text-white/70 mb-1">Ativos</p>
            <p className="text-4xl font-bold">{courses.filter((c) => c.status === "active").length}</p>
          </Card>
          <Card className="border-orange-500/40 bg-gradient-to-b from-orange-700/30 to-slate-900/50 p-6 text-white">
            <p className="text-sm uppercase tracking-wide text-white/70 mb-1">Mostrando</p>
            <p className="text-4xl font-bold">{filtered.length}</p>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">Buscar</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Título, descrição ou carreira..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "Todos" },
                { value: "active", label: "Ativos" },
                { value: "inactive", label: "Inativos" },
                { value: "draft", label: "Rascunho" },
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  size="sm"
                  variant={statusFilter === value ? "default" : "outline"}
                  onClick={() => setStatusFilter(value)}
                  className={statusFilter === value ? "bg-[#e8491d] hover:bg-[#d13a0f]" : ""}
                >
                  {label}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setSearchTerm(""); setStatusFilter("all") }}
              >
                <Filter className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
        </Card>

        {/* Lista */}
        <Card className="overflow-hidden">
          <div className="border-b bg-gray-50/50 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lista de Cursos ({filtered.length})</h3>
            <span className="text-sm text-muted-foreground">Ordenado alfabeticamente</span>
          </div>

          {filtered.length > 0 ? (
            <div className="divide-y">
              {filtered.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="rounded-lg bg-orange-100 p-2 flex-shrink-0">
                      <GraduationCap className="h-5 w-5 text-[#e8491d]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{course.title}</h4>
                        <Badge className={`text-xs ${statusColor[course.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {statusLabel[course.status] ?? course.status}
                        </Badge>
                        {course.access_type && (
                          <Badge className={`text-xs ${accessColor[course.access_type] ?? "bg-gray-100 text-gray-600"}`}>
                            {accessLabel[course.access_type] ?? course.access_type}
                          </Badge>
                        )}
                      </div>
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{course.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {course.career?.name && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {course.career.name}
                          </span>
                        )}
                        {course.duration_in_days > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration_in_days} dias
                          </span>
                        )}
                        {course.start_date && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {course.start_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="flex items-center gap-1 text-xl font-bold text-[#e8491d] justify-end">
                      <DollarSign className="h-4 w-4" />
                      {Number(course.price).toFixed(2)}
                    </span>
                    <p className="text-xs text-muted-foreground">à vista</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Nenhum curso cadastrado ainda"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
