"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Users, Search, Loader2, CalendarDays, Clock,
  ChevronRight, BookOpen, ChevronDown, ChevronUp, User,
} from "lucide-react"
import { api, type ApiTurma, type ApiEnrollment } from "@/lib/api"

const statusColors: Record<string, string> = {
  aberta:       "bg-green-500/10 text-green-600",
  fechada:      "bg-red-500/10 text-red-600",
  em_andamento: "bg-blue-500/10 text-blue-600",
}
const statusLabels: Record<string, string> = {
  aberta: "Aberta", fechada: "Fechada", em_andamento: "Em Andamento",
}

export default function ProfessorTurmasPage() {
  const router          = useRouter()
  const [loading,       setLoading      ] = useState(true)
  const [turmas,        setTurmas       ] = useState<ApiTurma[]>([])
  const [enrollments,   setEnrollments  ] = useState<ApiEnrollment[]>([])
  const [search,        setSearch       ] = useState("")
  const [expandedTurma, setExpandedTurma] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([api.professor.turmas(), api.enrollments.list()])
      .then(([allTurmas, allEnrollments]) => {
        // Filtra apenas turmas presenciais ou híbridas
        const presenciais = allTurmas.filter(
          (t) => t.modalidade === "presencial" || t.modalidade === "hibrido"
        )
        setTurmas(presenciais)
        setEnrollments(allEnrollments)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function getStudentsByTurma(turmaId: number) {
    return enrollments
      .filter((e) => e.turma?.id === turmaId && e.status === "active")
      .map((e) => e.student)
      .filter(Boolean)
  }

  const filtered = turmas.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.course?.title?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Minhas Turmas</h1>
        <p className="text-muted-foreground">Turmas presenciais — gerencie alunos e materiais por dia letivo</p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar turma..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhuma turma encontrada</p>
            <p className="text-sm text-muted-foreground">
              {turmas.length === 0
                ? "Você não está vinculado a nenhuma turma presencial."
                : "Nenhuma turma corresponde à busca."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((turma) => {
            const occupancy  = Math.round((turma.enrolled_count / turma.max_students) * 100)
            const isExpanded = expandedTurma === turma.id
            const students   = isExpanded ? getStudentsByTurma(turma.id) : []

            return (
              <Card key={turma.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base text-foreground">{turma.name}</CardTitle>
                    <Badge className={statusColors[turma.status] ?? "bg-gray-100 text-gray-600"} variant="secondary">
                      {statusLabels[turma.status] ?? turma.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{turma.course?.title}</p>
                  {turma.modalidade && (
                    <Badge
                      className={turma.modalidade === "presencial" ? "bg-amber-100 text-amber-700 w-fit" : "bg-violet-100 text-violet-700 w-fit"}
                      variant="secondary"
                    >
                      {turma.modalidade === "presencial" ? "Presencial" : "Híbrido"}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {turma.schedule && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{turma.schedule}</span>
                      </div>
                    )}
                    {(turma.start_date || turma.end_date) && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span>{turma.start_date} a {turma.end_date}</span>
                      </div>
                    )}
                  </div>

                  {/* Barra de ocupação */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" /> Ocupação
                      </span>
                      <span className="font-medium text-foreground">
                        {turma.enrolled_count}/{turma.max_students}
                      </span>
                    </div>
                    <Progress value={occupancy} className="h-2" />
                  </div>

                  {/* Alunos Matriculados (accordion) */}
                  <button
                    type="button"
                    onClick={() => setExpandedTurma(isExpanded ? null : turma.id)}
                    className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Alunos Matriculados
                    </span>
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    }
                  </button>

                  {isExpanded && (
                    <div className="rounded-lg border bg-background">
                      {students.length > 0 ? (
                        <ul className="divide-y">
                          {students.map((student, idx) => (
                            <li key={student!.id} className="flex items-center gap-3 px-3 py-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {idx + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">{student!.name}</p>
                                <p className="truncate text-xs text-muted-foreground">{student!.email}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-4">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Nenhum aluno matriculado</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botão materiais por dia letivo */}
                  <button
                    type="button"
                    onClick={() => router.push(`/professor/turmas/${turma.id}`)}
                    className="flex w-full items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    Materiais por dia letivo
                    <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
