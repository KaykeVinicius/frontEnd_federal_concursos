"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fakeApiCall } from "@/lib/api"
import {
  mockEnrollments,
  getStudentById,
  getCourseById,
  getTurmaById,
  type Enrollment,
} from "@/lib/mock-data"

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  canceled: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-700",
}

const statusLabels: Record<string, string> = {
  active: "Ativa",
  canceled: "Cancelada",
  expired: "Expirada",
}

export function RecentEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const data = await fakeApiCall(mockEnrollments.slice(0, 5))
      setEnrollments(data)
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Matriculas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              const student = getStudentById(enrollment.student_id)
              const course = getCourseById(enrollment.course_id)
              const turma = getTurmaById(enrollment.turma_id)
              return (
                <div key={enrollment.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {student?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {student?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {course?.title} - {turma?.name}
                    </p>
                  </div>
                  <Badge className={statusColors[enrollment.status]} variant="secondary">
                    {statusLabels[enrollment.status]}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
