"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, BookOpen, TrendingUp, Loader2, DollarSign } from "lucide-react"
import { api, type ApiCourse, type ApiEnrollment, type ApiTurma } from "@/lib/api"

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [turmas, setTurmas] = useState<ApiTurma[]>([])
  const [studentsTotal, setStudentsTotal] = useState(0)

  useEffect(() => {
    Promise.all([
      api.courses.list(),
      api.enrollments.list(),
      api.turmas.list(),
      api.users.list(),
    ])
      .then(([c, e, t, u]) => {
        setCourses(c)
        setEnrollments(e)
        setTurmas(t)
        setStudentsTotal(u.filter((u) => u.role === "aluno").length)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const enrollmentsByCourse = useMemo(() => {
    return courses
      .map((course) => {
        const list = enrollments.filter((e) => e.course?.id === course.id || (e as { course_id?: number }).course_id === course.id)
        const count = list.length
        const revenue = list.reduce((acc, e) => acc + (e.total_paid ?? 0), 0)
        return { course, count, revenue }
      })
      .sort((a, b) => b.count - a.count)
  }, [courses, enrollments])

  const enrollmentsByPayment = useMemo(() => {
    const methods = ["pix", "credito_vista", "credito_parcelado", "boleto", "dinheiro"]
    return methods.map((method) => ({
      method,
      count: enrollments.filter((e) => e.payment_method === method).length,
    }))
  }, [enrollments])

  const turmasOccupancy = useMemo(() => {
    return turmas
      .map((turma) => {
        const course = courses.find((c) => c.id === turma.course_id) ?? turma.course
        const occupancy = turma.max_students > 0 ? Math.round((turma.enrolled_count / turma.max_students) * 100) : 0
        return { turma, course, occupancy }
      })
      .sort((a, b) => b.occupancy - a.occupancy)
  }, [turmas, courses])

  const totalRevenue = useMemo(
    () => enrollments.reduce((acc, e) => acc + (e.total_paid ?? 0), 0),
    [enrollments]
  )

  const maxEnrollments = Math.max(...enrollmentsByCourse.map((e) => e.count), 1)
  const totalEnrollments = enrollments.length

  const paymentLabels: Record<string, string> = {
    pix: "PIX",
    credito_vista: "Crédito à Vista",
    credito_parcelado: "Crédito Parcelado",
    boleto: "Boleto",
    dinheiro: "Dinheiro",
  }

  const paymentColors: Record<string, string> = {
    pix: "bg-green-500",
    credito_vista: "bg-blue-500",
    credito_parcelado: "bg-purple-500",
    boleto: "bg-orange-500",
    dinheiro: "bg-emerald-500",
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Relatórios</h1>
          <p className="text-muted-foreground">Análise de dados e métricas do sistema</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Alunos</p>
                  <p className="text-xl font-bold text-foreground">{studentsTotal}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cursos</p>
                  <p className="text-xl font-bold text-foreground">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Matrículas</p>
                  <p className="text-xl font-bold text-foreground">{totalEnrollments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-xl font-bold text-foreground">
                    R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Matrículas por curso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Matrículas por Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollmentsByCourse.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma matrícula registrada.</p>
              ) : (
                enrollmentsByCourse.map(({ course, count, revenue }) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{course.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{count} matrículas</Badge>
                        <span className="text-xs text-muted-foreground">
                          R$ {revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <Progress value={(count / maxEnrollments) * 100} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Formas de pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Formas de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollmentsByPayment.every((m) => m.count === 0) ? (
                <p className="text-sm text-muted-foreground">Nenhuma matrícula com forma de pagamento registrada.</p>
              ) : (
                enrollmentsByPayment.map(({ method, count }) => {
                  const percentage = totalEnrollments > 0 ? Math.round((count / totalEnrollments) * 100) : 0
                  return (
                    <div key={method} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{paymentLabels[method]}</p>
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${paymentColors[method]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Ocupação das turmas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                <BarChart3 className="h-5 w-5" />
                Ocupação das Turmas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {turmasOccupancy.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma turma cadastrada.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {turmasOccupancy.map(({ turma, course, occupancy }) => (
                    <div key={turma.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium text-foreground">{turma.name}</p>
                        <Badge
                          className={
                            occupancy >= 80
                              ? "bg-red-100 text-red-700"
                              : occupancy >= 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }
                          variant="secondary"
                        >
                          {occupancy}%
                        </Badge>
                      </div>
                      <p className="mb-2 text-xs text-muted-foreground">{course?.title ?? "—"}</p>
                      <Progress value={occupancy} className="h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {turma.enrolled_count}/{turma.max_students} vagas
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
