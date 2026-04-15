"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api, type ApiCourse, type ApiTurma } from "@/lib/api"
import {
  BookOpen, Search, Filter, Loader2, CalendarDays, Clock,
  GraduationCap, DollarSign, Users, MapPin, Monitor, Layers,
} from "lucide-react"

const accessLabel: Record<string, string> = {
  online:     "Online",
  presencial: "Presencial",
  hibrido:    "Híbrido",
}
const accessColor: Record<string, string> = {
  online:     "bg-sky-100 text-sky-700 border-sky-200",
  presencial: "bg-amber-100 text-amber-700 border-amber-200",
  hibrido:    "bg-violet-100 text-violet-700 border-violet-200",
}
const accessIcon: Record<string, typeof MapPin> = {
  presencial: MapPin,
  online:     Monitor,
  hibrido:    Layers,
}

export default function CursosDisponiveisPage() {
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [turmas,  setTurmas ] = useState<ApiTurma[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [modalFilter, setModalFilter] = useState("all")

  useEffect(() => {
    Promise.all([
      api.courses.list(),
      api.turmas.list(),
    ])
      .then(([c, t]) => { setCourses(c); setTurmas(t) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // turmas com vaga disponível agrupadas por course_id
  const turmasByCourse = useMemo(() => {
    const map = new Map<number, ApiTurma[]>()
    for (const t of turmas) {
      if (!t.course_id) continue
      if (!map.has(t.course_id)) map.set(t.course_id, [])
      map.get(t.course_id)!.push(t)
    }
    return map
  }, [turmas])

  const filtered = useMemo(() => {
    return courses
      .filter((c) => {
        // só publicados
        if (c.status !== "published") return false

        // filtro de modalidade
        if (modalFilter !== "all" && c.access_type !== modalFilter) return false

        // cursos presenciais/híbridos: só aparecer se tiver vaga em alguma turma
        if (c.access_type === "presencial" || c.access_type === "hibrido") {
          const turmasDoCurso = turmasByCourse.get(c.id) ?? []
          const temVaga = turmasDoCurso.some(
            (t) => (t.status === "aberta" || t.status === "em_andamento") &&
                   t.enrolled_count < t.max_students
          )
          if (!temVaga) return false
        }

        // busca
        const q = searchTerm.toLowerCase()
        return (
          c.title.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          (c.career?.name ?? "").toLowerCase().includes(q)
        )
      })
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [courses, turmasByCourse, searchTerm, modalFilter])

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
          <div className="relative z-10 flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Cursos Disponíveis</h1>
              <p className="text-orange-100">Cursos publicados com vagas abertas para matrícula</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
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
                { value: "all",       label: "Todos"      },
                { value: "presencial", label: "Presencial" },
                { value: "online",    label: "Online"     },
                { value: "hibrido",   label: "Híbrido"    },
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  size="sm"
                  variant={modalFilter === value ? "default" : "outline"}
                  onClick={() => setModalFilter(value)}
                  className={modalFilter === value ? "bg-[#e8491d] hover:bg-[#d13a0f]" : ""}
                >
                  {label}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setSearchTerm(""); setModalFilter("all") }}
              >
                <Filter className="h-4 w-4 mr-1" /> Limpar
              </Button>
            </div>
          </div>
        </Card>

        {/* Lista */}
        <Card className="overflow-hidden">
          <div className="border-b bg-gray-50/50 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cursos ({filtered.length})</h3>
            <span className="text-sm text-muted-foreground">Apenas publicados com vagas</span>
          </div>

          {filtered.length > 0 ? (
            <div className="divide-y">
              {filtered.map((course) => {
                const turmasDoCurso = turmasByCourse.get(course.id) ?? []
                const turmasComVaga = turmasDoCurso.filter(
                  (t) => (t.status === "aberta" || t.status === "em_andamento") &&
                         t.enrolled_count < t.max_students
                )
                const totalVagas = turmasComVaga.reduce(
                  (sum, t) => sum + (t.max_students - t.enrolled_count), 0
                )
                const Icon = accessIcon[course.access_type] ?? BookOpen

                return (
                  <div
                    key={course.id}
                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="rounded-lg bg-orange-100 p-2 flex-shrink-0">
                        <GraduationCap className="h-5 w-5 text-[#e8491d]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Título + badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{course.title}</h4>
                          <Badge className={`text-xs ${accessColor[course.access_type] ?? "bg-gray-100 text-gray-600"}`}>
                            <Icon className="mr-1 h-3 w-3" />
                            {accessLabel[course.access_type] ?? course.access_type}
                          </Badge>
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                            Publicado
                          </Badge>
                        </div>

                        {course.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{course.description}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {course.career?.name && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> {course.career.name}
                            </span>
                          )}
                          {course.duration_in_days > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {course.duration_in_days} dias
                            </span>
                          )}
                          {course.start_date && (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" /> {course.start_date}
                            </span>
                          )}
                        </div>

                        {/* Turmas com vaga (presencial/híbrido) */}
                        {turmasComVaga.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {turmasComVaga.map((t) => (
                              <span
                                key={t.id}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs text-foreground"
                              >
                                <Users className="h-3 w-3 text-primary" />
                                <span className="font-medium">{t.name}</span>
                                <span className="text-muted-foreground">
                                  · {t.max_students - t.enrolled_count} vaga{t.max_students - t.enrolled_count !== 1 ? "s" : ""}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right space-y-1">
                      <p className="flex items-center gap-1 text-xl font-bold text-[#e8491d] justify-end">
                        <DollarSign className="h-4 w-4" />
                        {Number(course.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">à vista</p>
                      {(course.access_type === "presencial" || course.access_type === "hibrido") && (
                        <p className="flex items-center gap-1 justify-end text-xs font-semibold text-green-600">
                          <Users className="h-3 w-3" />
                          {totalVagas} vaga{totalVagas !== 1 ? "s" : ""} disponív{totalVagas !== 1 ? "eis" : "el"}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum curso disponível</h3>
              <p className="text-muted-foreground">
                {searchTerm || modalFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Nenhum curso publicado com vagas abertas"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
