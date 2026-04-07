"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, GraduationCap } from "lucide-react"
import { api, type ApiEnrollment } from "@/lib/api"

const statusColors: Record<string, string> = {
  active:   "bg-green-100 text-green-700",
  canceled: "bg-red-100 text-red-700",
  expired:  "bg-gray-100 text-gray-600",
  pending:  "bg-yellow-100 text-yellow-700",
}

const statusLabels: Record<string, string> = {
  active:   "Ativa",
  canceled: "Cancelada",
  expired:  "Expirada",
  pending:  "Pendente",
}

export function RecentEnrollments() {
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.enrollments.list()
      .then((data) => setEnrollments(data.slice(0, 8)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader className="border-b border-gray-100 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5 text-[#e8491d]" />
            Matrículas Recentes
          </CardTitle>
          <span className="text-xs text-muted-foreground">{enrollments.length} registro(s)</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-[#e8491d]" />
          </div>
        ) : enrollments.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-6">Nenhuma matrícula registrada</p>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => {
              const studentName = enrollment.student?.name ?? "—"
              const courseTitle = enrollment.course?.title ?? enrollment.turma?.course?.title ?? "—"
              const turmaName   = enrollment.turma?.name
              return (
                <div key={enrollment.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8491d] to-[#f97316] text-sm font-bold text-white shadow-sm">
                    {studentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{studentName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {courseTitle}{turmaName ? ` · ${turmaName}` : ""}
                    </p>
                  </div>
                  <Badge
                    className={`text-xs flex-shrink-0 ${statusColors[enrollment.status] ?? "bg-gray-100 text-gray-600"}`}
                    variant="secondary"
                  >
                    {statusLabels[enrollment.status] ?? enrollment.status}
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
