"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, FileText } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import {
  mockStudents,
  mockEnrollments,
  getCourseById,
  getTurmaById,
  type Student,
} from "@/lib/mock-data"
import { NewEnrollmentDialog } from "@/components/new-enrollment-dialog"
import { StudentDetailDialog } from "@/components/student-detail-dialog"
import { ContractViewDialog } from "@/components/contract-view-dialog"

export default function AlunosPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showNewEnrollment, setShowNewEnrollment] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [contractEnrollmentId, setContractEnrollmentId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchStudents() {
      const data = await fakeApiCall(mockStudents)
      setStudents(data)
      setLoading(false)
    }
    fetchStudents()
  }, [])

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.cpf.includes(search)
  )

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alunos</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie alunos e matriculas
          </p>
        </div>
        <Button onClick={() => setShowNewEnrollment(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nova Matricula
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou CPF..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Nome</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">WhatsApp</th>
                    <th className="pb-3 font-medium">Curso</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => {
                    const enrollment = mockEnrollments.find(
                      (e) => e.student_id === student.id && e.status === "active"
                    )
                    const course = enrollment
                      ? getCourseById(enrollment.course_id)
                      : null
                    const turma = enrollment
                      ? getTurmaById(enrollment.turma_id)
                      : null

                    return (
                      <tr key={student.id} className="border-b last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {student.email}
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {student.whatsapp}
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {course ? (
                            <div>
                              <p className="text-foreground">{course.title.length > 30 ? course.title.slice(0, 30) + "..." : course.title}</p>
                              {turma && (
                                <p className="text-xs">{turma.name}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">
                              Sem matricula ativa
                            </span>
                          )}
                        </td>
                        <td className="py-4">
                          <Badge
                            className={
                              student.active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }
                            variant="secondary"
                          >
                            {student.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {enrollment && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setContractEnrollmentId(enrollment.id)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  Nenhum aluno encontrado.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <NewEnrollmentDialog
        open={showNewEnrollment}
        onOpenChange={setShowNewEnrollment}
      />
      <StudentDetailDialog
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
      <ContractViewDialog
        enrollmentId={contractEnrollmentId}
        onClose={() => setContractEnrollmentId(null)}
      />
    </div>
  )
}
