"use client"

import { useEffect, useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Printer, Download, Loader2 } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import {
  mockEnrollments,
  getStudentById,
  getCourseById,
  getTurmaById,
  getContractByEnrollmentId,
  generateContractText,
  type Contract,
  type Enrollment,
} from "@/lib/mock-data"

interface ContractViewDialogProps {
  enrollmentId: number | null
  onClose: () => void
}

export function ContractViewDialog({ enrollmentId, onClose }: ContractViewDialogProps) {
  const [contract, setContract] = useState<Contract | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [contractText, setContractText] = useState("")
  const [loading, setLoading] = useState(false)
  const contractRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (enrollmentId) {
      setLoading(true)
      fakeApiCall(getContractByEnrollmentId(enrollmentId)).then((data) => {
        setContract(data ?? null)
        const enroll = mockEnrollments.find((e) => e.id === enrollmentId)
        setEnrollment(enroll ?? null)
        if (enroll) {
          setContractText(generateContractText(enroll))
        }
        setLoading(false)
      })
    } else {
      setContract(null)
      setEnrollment(null)
      setContractText("")
    }
  }, [enrollmentId])

  const student = enrollment ? getStudentById(enrollment.student_id) : null
  const course = enrollment ? getCourseById(enrollment.course_id) : null
  const turma = enrollment ? getTurmaById(enrollment.turma_id) : null

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    signed: "Assinado",
    expired: "Expirado",
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    signed: "bg-green-100 text-green-700",
    expired: "bg-red-100 text-red-700",
  }

  const handlePrint = () => {
    const printContent = contractRef.current
    if (!printContent) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contrato - ${student?.name}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #1a1a1a; }
            h1 { text-align: center; font-size: 16px; margin-bottom: 4px; }
            h2 { text-align: center; font-size: 14px; font-weight: normal; margin-bottom: 24px; }
            .contract { white-space: pre-wrap; font-size: 13px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="contract">${contractText}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <Dialog open={enrollmentId !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Contrato de Prestacao de Servicos Educacionais
          </DialogTitle>
          <DialogDescription>
            Visualize o contrato de matricula do aluno
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : contractText ? (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border bg-accent/50 p-4">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">{student?.name}</p>
                <p className="text-sm text-muted-foreground">{course?.title}</p>
                <p className="text-sm text-muted-foreground">{turma?.name} - {turma?.schedule}</p>
                {contract?.signed_at && (
                  <p className="text-xs text-muted-foreground">
                    Assinado em: {contract.signed_at}
                  </p>
                )}
              </div>
              {contract && (
                <Badge className={statusColors[contract.status]} variant="secondary">
                  {statusLabels[contract.status]}
                </Badge>
              )}
            </div>

            {/* Contract document */}
            <div
              ref={contractRef}
              className="rounded-lg border bg-background p-6 shadow-sm sm:p-8"
            >
              {/* Federal Cursos Header */}
              <div className="mb-6 flex flex-col items-center gap-1 border-b pb-4">
                <p className="text-lg font-bold text-primary">FEDERAL CURSOS</p>
                <p className="text-xs text-muted-foreground">
                  Preparatorio Para Concursos e Selecoes Publicas LTDA
                </p>
                <p className="text-xs text-muted-foreground">
                  CNPJ: 55.703.401/0001-08 | Rua Getulio Vargas, 2634, Sao Cristovao, Porto Velho - RO
                </p>
              </div>

              <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground">
                {contractText}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handlePrint}
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            Contrato nao encontrado.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
