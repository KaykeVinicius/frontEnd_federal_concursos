"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Layers, FileText, CalendarDays } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import { mockStudents, mockCourses, mockTurmas, mockEnrollments, mockEvents } from "@/lib/mock-data"

interface StatsData {
  totalStudents: number
  activeStudents: number
  totalCourses: number
  publishedCourses: number
  totalTurmas: number
  openTurmas: number
  totalEnrollments: number
  activeEnrollments: number
  totalEvents: number
  upcomingEvents: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const data = await fakeApiCall<StatsData>({
        totalStudents: mockStudents.length,
        activeStudents: mockStudents.filter((s) => s.active).length,
        totalCourses: mockCourses.length,
        publishedCourses: mockCourses.filter((c) => c.status === "published").length,
        totalTurmas: mockTurmas.length,
        openTurmas: mockTurmas.filter((t) => t.status === "aberta").length,
        totalEnrollments: mockEnrollments.length,
        activeEnrollments: mockEnrollments.filter((e) => e.status === "active").length,
        totalEvents: mockEvents.length,
        upcomingEvents: mockEvents.filter((e) => e.status === "agendado").length,
      })
      setStats(data)
      setLoading(false)
    }
    fetchStats()
  }, [])

  const cards = [
    {
      title: "Alunos",
      value: stats?.activeStudents ?? 0,
      subtitle: `${stats?.totalStudents ?? 0} total`,
      icon: Users,
    },
    {
      title: "Cursos",
      value: stats?.publishedCourses ?? 0,
      subtitle: `${stats?.totalCourses ?? 0} total`,
      icon: BookOpen,
    },
    {
      title: "Turmas",
      value: stats?.openTurmas ?? 0,
      subtitle: `${stats?.totalTurmas ?? 0} total`,
      icon: Layers,
    },
    {
      title: "Matriculas",
      value: stats?.activeEnrollments ?? 0,
      subtitle: `${stats?.totalEnrollments ?? 0} total`,
      icon: FileText,
    },
    {
      title: "Eventos",
      value: stats?.upcomingEvents ?? 0,
      subtitle: `${stats?.totalEvents ?? 0} total`,
      icon: CalendarDays,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
