"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, Eye, Download, CheckCircle, Clock, XCircle } from "lucide-react"
import { api, type ApiEnrollment } from "@/lib/api"
import { ContractViewDialog } from "@/components/contract-view-dialog"

const statusColors: Record<string, string> = {
  active: "bg-yellow-500/10 text-yellow-600",
  signed: "bg-green-500/10 text-green-600",
  canceled: "bg-red-500/10 text-red-600",
}

const statusLabels: Record<string, string> = {
  active: "Pendente",
  signed: "Assinado",
  canceled: "Cancelado",
}

const statusIcons: Record<string, React.ReactNode> = {
  active: <Clock className="h-4 w-4" />,
  signed: <CheckCircle className="h-4 w-4" />,
  canceled: <XCircle className="h-4 w-4" />,
}

export default function AlunoContratosPage() {
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null)

  useEffect(() => {
    api.aluno.dashboard()
      .then((data) => setEnrollments(data.enrollments ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Meus Contratos</h1>
        <p className="text-muted-foreground">Visualize e acompanhe seus contratos de matrícula</p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium text-foreground">Nenhum contrato encontrado</p>
              <p className="text-sm text-muted-foreground">Você não possui contratos no momento.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {enrollments.map((en) => {
            const statusKey = en.contract_signed ? "signed" : en.status === "canceled" ? "canceled" : "active"

            return (
              <Card key={en.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base text-foreground">
                        {en.course?.title ?? "—"}
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {en.turma?.name ?? "Sem turma"}
                      </p>
                    </div>
                    <Badge className={`${statusColors[statusKey]} flex items-center gap-1`}>
                      {statusIcons[statusKey]}
                      {statusLabels[statusKey]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted/30 p-3">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data Matrícula:</span>
                        <span className="font-medium text-foreground">
                          {en.started_at ? new Date(en.started_at).toLocaleDateString("pt-BR") : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pagamento:</span>
                        <span className="font-medium text-foreground capitalize">
                          {en.payment_method?.replace(/_/g, " ") ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor:</span>
                        <span className="font-medium text-primary">
                          {en.total_paid != null
                            ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(en.total_paid)
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewEnrollmentId(en.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => setViewEnrollmentId(en.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar PDF
                    </Button>
                  </div>

                  {statusKey === "active" && (
                    <p className="text-center text-xs text-yellow-600">
                      Este contrato aguarda assinatura
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ContractViewDialog
        enrollmentId={viewEnrollmentId}
        onClose={() => setViewEnrollmentId(null)}
      />
    </div>
  )
}
