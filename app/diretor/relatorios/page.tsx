"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, BookOpen, TrendingUp, Loader2 } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import {
  mockEnrollments,
  mockStudents,
  mockCourses,
  mockTurmas,
  getCourseById,
} from "@/lib/mock-data"

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      await fakeApiCall({})
      setLoading(false)
    }
    fetchData()
  }, [])

  // Calculos para relatorios
  const enrollmentsByCourse = mockCourses.map((course) => {
    const count = mockEnrollments.filter((e) => e.course_id === course.id).length
    const revenue = mockEnrollments
      .filter((e) => e.course_id === course.id)
      .reduce((acc, e) => acc + e.total_paid, 0)
    return { course, count, revenue }
  }).sort((a, b) => b.count - a.count)

  const enrollmentsByPayment = {
    pix: mockEnrollments.filter((e) => e.payment_method === "pix").length,
    credito_vista: mockEnrollments.filter((e) => e.payment_method === "credito_vista").length,
    credito_parcelado: mockEnrollments.filter((e) => e.payment_method === "credito_parcelado").length,
    boleto: mockEnrollments.filter((e) => e.payment_method === "boleto").length,
    dinheiro: mockEnrollments.filter((e) => e.payment_method === "dinheiro").length,
  }

  const turmasOccupancy = mockTurmas.map((turma) => {
    const course = getCourseById(turma.course_id)
    const occupancy = Math.round((turma.enrolled_count / turma.max_students) * 100)
    return { turma, course, occupancy }
  }).sort((a, b) => b.occupancy - a.occupancy)

  const totalEnrollments = mockEnrollments.length
  const maxEnrollments = Math.max(...enrollmentsByCourse.map((e) => e.count), 1)

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
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Relatorios</h1>
          <p className="text-muted-foreground">Analise de dados e metricas do sistema</p>
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
                  <p className="text-xl font-bold text-foreground">{mockStudents.length}</p>
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
                  <p className="text-xl font-bold text-foreground">{mockCourses.length}</p>
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
                  <p className="text-sm text-muted-foreground">Total Matriculas</p>
                  <p className="text-xl font-bold text-foreground">{mockEnrollments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Turmas</p>
                  <p className="text-xl font-bold text-foreground">{mockTurmas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Enrollments by Course */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Matriculas por Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollmentsByCourse.map(({ course, count, revenue }) => (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{course.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{count} matriculas</Badge>
                      <span className="text-xs text-muted-foreground">
                        R$ {revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <Progress value={(count / maxEnrollments) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Formas de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(enrollmentsByPayment).map(([method, count]) => {
                const labels: Record<string, string> = {
                  pix: "PIX",
                  credito_vista: "Credito a Vista",
                  credito_parcelado: "Credito Parcelado",
                  boleto: "Boleto",
                  dinheiro: "Dinheiro",
                }
                const colors: Record<string, string> = {
                  pix: "bg-green-500",
                  credito_vista: "bg-blue-500",
                  credito_parcelado: "bg-purple-500",
                  boleto: "bg-orange-500",
                  dinheiro: "bg-emerald-500",
                }
                const percentage = totalEnrollments > 0 ? Math.round((count / totalEnrollments) * 100) : 0
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{labels[method]}</p>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${colors[method]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Turmas Occupancy */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Ocupacao das Turmas</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <p className="mb-2 text-xs text-muted-foreground">{course?.title}</p>
                    <Progress value={occupancy} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {turma.enrolled_count}/{turma.max_students} vagas
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
