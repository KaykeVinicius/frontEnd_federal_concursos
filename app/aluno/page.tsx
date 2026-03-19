"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, CalendarDays, Clock, Loader2 } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import {
  mockStudents,
  mockEnrollments,
  mockCourses,
  mockTurmas,
  mockEvents,
  mockContracts,
  getEnrollmentsByStudentId,
  getCourseById,
  getTurmaById,
  type SystemUser,
  type Student,
  type Enrollment,
} from "@/lib/mock-data"

export default function AlunoDashboard() {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

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

  const activeEnrollments = enrollments.filter((e) => e.status === "active")
  const pendingContracts = mockContracts.filter(
    (c) =>
      enrollments.some((e) => e.id === c.enrollment_id) && c.status === "pending"
  )
  const upcomingEvents = mockEvents.filter((e) => e.status === "agendado").slice(0, 3)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
      {/* Background logo watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
        <Image
          src="/images/logo.jpg"
          alt=""
          width={600}
          height={300}
          className="max-w-[70vw] select-none"
          style={{ width: "auto", height: "auto" }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Ola, {student?.name.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">Bem-vindo ao Portal do Aluno</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {activeEnrollments.length}
                </p>
                <p className="text-sm text-muted-foreground">Cursos Ativos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                <FileText className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {pendingContracts.length}
                </p>
                <p className="text-sm text-muted-foreground">Contratos Pendentes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <CalendarDays className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {upcomingEvents.length}
                </p>
                <p className="text-sm text-muted-foreground">Proximos Eventos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {enrollments.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Matriculas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meus Cursos */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Meus Cursos</h2>
            <Link
              href="/aluno/meus-cursos"
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeEnrollments.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center gap-2 py-8">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Voce nao possui cursos ativos no momento.
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeEnrollments.slice(0, 3).map((enrollment) => {
                const course = getCourseById(enrollment.course_id)
                const turma = getTurmaById(enrollment.turma_id)
                return (
                  <Card key={enrollment.id} className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base text-foreground">
                          {course?.title}
                        </CardTitle>
                        <Badge className="bg-green-500/10 text-green-600">Ativo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {turma?.name} - {turma?.schedule}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        <span>
                          {turma?.start_date} a {turma?.end_date}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* Proximos Eventos */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Proximos Eventos</h2>
            <Link
              href="/aluno/eventos"
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center gap-2 py-8">
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhum evento agendado no momento.
                  </p>
                </CardContent>
              </Card>
            ) : (
              upcomingEvents.map((event) => (
                <Card key={event.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base text-foreground">
                        {event.title}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0 capitalize">
                        {event.event_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      <span>
                        {event.date} - {event.start_time} as {event.end_time}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
