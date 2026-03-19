"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, Eye, Download, CheckCircle, Clock, XCircle } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import {
  mockStudents,
  mockContracts,
  mockEnrollments,
  getEnrollmentsByStudentId,
  getCourseById,
  getTurmaById,
  generateContractText,
  type SystemUser,
  type Student,
  type Contract,
} from "@/lib/mock-data"
import { ContractViewDialog } from "@/components/contract-view-dialog"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  signed: "bg-green-500/10 text-green-600",
  expired: "bg-red-500/10 text-red-600",
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  signed: "Assinado",
  expired: "Expirado",
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  signed: <CheckCircle className="h-4 w-4" />,
  expired: <XCircle className="h-4 w-4" />,
}

export default function AlunoContratosPage() {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [viewingContract, setViewingContract] = useState<number | null>(null)

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
            const enrollments = getEnrollmentsByStudentId(st.id)
            const studentContracts = mockContracts.filter((c) =>
              enrollments.some((e) => e.id === c.enrollment_id)
            )
            setContracts(studentContracts)
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

  const selectedContract = contracts.find((c) => c.id === viewingContract)
  const selectedEnrollment = selectedContract
    ? mockEnrollments.find((e) => e.id === selectedContract.enrollment_id)
    : null

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Meus Contratos</h1>
        <p className="text-muted-foreground">
          Visualize e acompanhe seus contratos de matricula
        </p>
      </div>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium text-foreground">Nenhum contrato encontrado</p>
              <p className="text-sm text-muted-foreground">
                Voce nao possui contratos no momento.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contracts.map((contract) => {
            const enrollment = mockEnrollments.find((e) => e.id === contract.enrollment_id)
            const course = enrollment ? getCourseById(enrollment.course_id) : null
            const turma = enrollment ? getTurmaById(enrollment.turma_id) : null

            return (
              <Card key={contract.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base text-foreground">
                        {course?.title}
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {turma?.name}
                      </p>
                    </div>
                    <Badge className={`${statusColors[contract.status]} flex items-center gap-1`}>
                      {statusIcons[contract.status]}
                      {statusLabels[contract.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted/30 p-3">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Versao:</span>
                        <span className="font-medium text-foreground">
                          {contract.version}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data Emissao:</span>
                        <span className="font-medium text-foreground">
                          {enrollment?.created_at}
                        </span>
                      </div>
                      {contract.signed_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Assinado em:</span>
                          <span className="font-medium text-foreground">
                            {contract.signed_at}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor:</span>
                        <span className="font-medium text-primary">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(enrollment?.total_paid || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewingContract(contract.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => {
                        // Para download, abre em nova aba para imprimir
                        setViewingContract(contract.id)
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar PDF
                    </Button>
                  </div>

                  {contract.status === "pending" && (
                    <p className="text-center text-xs text-yellow-600">
                      Este contrato aguarda sua assinatura
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Contract View Dialog */}
      <ContractViewDialog
        enrollmentId={selectedEnrollment?.id ?? null}
        onClose={() => setViewingContract(null)}
      />
    </div>
  )
}
