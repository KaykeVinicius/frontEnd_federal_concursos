"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, BookOpen, Loader2, Users } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import {
  mockStudents,
  mockEnrollments,
  getEnrollmentsByStudentId,
  getCourseById,
  getTurmaById,
  getSubjectsByCourseId,
  type SystemUser,
  type Student,
  type Enrollment,
} from "@/lib/mock-data"

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  canceled: "bg-red-500/10 text-red-600",
  expired: "bg-gray-500/10 text-gray-600",
}

const statusLabels: Record<string, string> = {
  active: "Ativo",
  canceled: "Cancelado",
  expired: "Expirado",
}

export default function MeusCursosPage() {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      await fakeApiCall(null)

      const stored = localStorage.getItem("currentUser")
      if (stored) {
        const user: SystemUser = JSON.parse(stored)
        if (user.student_id) {
          const st = mockStudents.find((s) => s.id === user.student_id)
          if (st) {
            setStudent(st)
            setEnrollments(getEnrollmentsByStudentId(st.id))
          }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

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
        <h1 className="text-2xl font-bold text-foreground">Meus Cursos</h1>
        <p className="text-muted-foreground">
          Acompanhe seus cursos e matriculas
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium text-foreground">Nenhum curso encontrado</p>
              <p className="text-sm text-muted-foreground">
                Voce nao possui matriculas no momento.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {enrollments.map((enrollment) => {
            const course = getCourseById(enrollment.course_id)
            const turma = getTurmaById(enrollment.turma_id)
            const subjects = getSubjectsByCourseId(enrollment.course_id)
            const isExpanded = expandedCourse === enrollment.id

            return (
              <Card key={enrollment.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg text-foreground">
                        {course?.title}
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {turma?.name}
                      </p>
                    </div>
                    <Badge className={statusColors[enrollment.status]}>
                      {statusLabels[enrollment.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>
                        {turma?.start_date} a {turma?.end_date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{turma?.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Presencial - Federal Cursos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>
                        {turma?.enrolled_count}/{turma?.max_students} alunos
                      </span>
                    </div>
                  </div>

                  {/* Materias Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCourse(isExpanded ? null : enrollment.id)
                    }
                    className="flex w-full items-center justify-between rounded-lg border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Materias do Curso ({subjects.length})
                    </span>
                    <span className="text-muted-foreground">
                      {isExpanded ? "Ocultar" : "Ver materias"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="rounded-lg border bg-background p-4">
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {subjects.map((subject, idx) => (
                          <li
                            key={subject.id}
                            className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {subject.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {subject.description}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Info Matricula */}
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/30 px-4 py-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Matricula em: </span>
                      <span className="font-medium text-foreground">
                        {enrollment.created_at}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Pagamento: </span>
                      <span className="font-medium text-foreground">
                        {enrollment.payment_method}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Valor: </span>
                      <span className="font-medium text-primary">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(enrollment.total_paid)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
