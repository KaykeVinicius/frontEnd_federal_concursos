"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, CalendarDays, Clock, Loader2 } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import {
  mockTurmas,
  mockCourses,
  mockEvents,
  mockStudents,
  getCourseById,
  type Turma,
} from "@/lib/mock-data"

export default function ProfessorDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      await fakeApiCall(null)
      setLoading(false)
    }
    loadData()
  }, [])

  const activeTurmas = mockTurmas.filter(
    (t) => t.status === "em_andamento" || t.status === "aberta"
  )
  const totalStudents = mockTurmas.reduce((acc, t) => acc + t.enrolled_count, 0)
  const upcomingEvents = mockEvents.filter((e) => e.status === "agendado")

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
            Painel do Professor
          </h1>
          <p className="text-muted-foreground">Gerencie suas turmas e acompanhe os alunos</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeTurmas.length}</p>
                <p className="text-sm text-muted-foreground">Turmas Ativas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockCourses.length}</p>
                <p className="text-sm text-muted-foreground">Cursos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                <CalendarDays className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{upcomingEvents.length}</p>
                <p className="text-sm text-muted-foreground">Proximos Eventos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Minhas Turmas */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Minhas Turmas</h2>
            <Link
              href="/professor/turmas"
              className="text-sm text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeTurmas.slice(0, 3).map((turma) => {
              const course = getCourseById(turma.course_id)
              return (
                <Card key={turma.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base text-foreground">
                        {turma.name}
                      </CardTitle>
                      <Badge
                        className={
                          turma.status === "em_andamento"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-green-500/10 text-green-600"
                        }
                      >
                        {turma.status === "em_andamento" ? "Em Andamento" : "Aberta"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{course?.title}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{turma.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>
                          {turma.enrolled_count}/{turma.max_students} alunos
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span>
                          {turma.start_date} a {turma.end_date}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Proximos Eventos */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Proximos Eventos</h2>
            <Link
              href="/professor/eventos"
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.slice(0, 3).map((event) => (
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
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>
                        {event.start_time} as {event.end_time}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
