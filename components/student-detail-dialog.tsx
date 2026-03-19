"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  type Student,
  mockEnrollments,
  getCourseById,
  getTurmaById,
} from "@/lib/mock-data"

interface StudentDetailDialogProps {
  student: Student | null
  onClose: () => void
}

export function StudentDetailDialog({ student, onClose }: StudentDetailDialogProps) {
  if (!student) return null

  const enrollments = mockEnrollments.filter((e) => e.student_id === student.id)

  const statusLabels: Record<string, string> = {
    active: "Ativa",
    canceled: "Cancelada",
    expired: "Expirada",
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    canceled: "bg-red-100 text-red-700",
    expired: "bg-gray-100 text-gray-700",
  }

  return (
    <Dialog open={!!student} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Detalhes do Aluno</DialogTitle>
          <DialogDescription>
            Visualize as informacoes e matriculas do aluno
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{student.name}</h3>
              <p className="text-sm text-muted-foreground">{student.email}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">CPF</span>
              <p className="font-medium text-foreground">{student.cpf}</p>
            </div>
            <div>
              <span className="text-muted-foreground">WhatsApp</span>
              <p className="font-medium text-foreground">{student.whatsapp}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Endereco</span>
              <p className="font-medium text-foreground">{student.address}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tipo</span>
              <p className="font-medium text-foreground">{student.internal ? "Interno" : "Externo"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <Badge className={student.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} variant="secondary">
                {student.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>

          {/* Enrollments */}
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Matriculas</h4>
            {enrollments.length > 0 ? (
              <div className="space-y-3">
                {enrollments.map((enrollment) => {
                  const course = getCourseById(enrollment.course_id)
                  const turma = getTurmaById(enrollment.turma_id)
                  return (
                    <div
                      key={enrollment.id}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{course?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {turma?.name} - {turma?.schedule}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {enrollment.payment_method} - R$ {enrollment.total_paid.toFixed(2)}
                          </p>
                        </div>
                        <Badge className={statusColors[enrollment.status]} variant="secondary">
                          {statusLabels[enrollment.status]}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma matricula encontrada.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
