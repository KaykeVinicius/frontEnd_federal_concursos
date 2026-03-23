"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Eye, FileText } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import {
  mockContracts,
  getStudentById,
  getCourseById,
  type Contract,
} from "@/lib/mock-data"
import { ContractViewDialog } from "@/components/contract-view-dialog"

export default function ContratosPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchContracts() {
      const data = await fakeApiCall(mockContracts)
      setContracts(data)
      setLoading(false)
    }
    fetchContracts()
  }, [])

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

  const filtered = contracts.filter((c) => {
    const student = getStudentById(c.student_id)
    const course = getCourseById(c.course_id)
    const query = search.toLowerCase()
    return (
      student?.name.toLowerCase().includes(query) ||
      course?.title.toLowerCase().includes(query)
    )
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
        <p className="mt-1 text-muted-foreground">
          Visualize e gerencie os contratos de matriculas
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por aluno ou curso..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Lista de Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Aluno</th>
                    <th className="pb-3 font-medium">Curso</th>
                    <th className="pb-3 font-medium">Versao</th>
                    <th className="pb-3 font-medium">Data Assinatura</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((contract) => {
                    const student = getStudentById(contract.student_id)
                    const course = getCourseById(contract.course_id)
                    return (
                      <tr key={contract.id} className="border-b last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {student?.name.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">
                              {student?.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {course?.title && course.title.length > 35
                            ? course.title.slice(0, 35) + "..."
                            : course?.title}
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          v{contract.version}
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {contract.signed_at ?? "Nao assinado"}
                        </td>
                        <td className="py-4">
                          <Badge
                            className={statusColors[contract.status]}
                            variant="secondary"
                          >
                            {statusLabels[contract.status]}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewEnrollmentId(contract.enrollment_id)}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Ver
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  Nenhum contrato encontrado.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ContractViewDialog
        enrollmentId={viewEnrollmentId}
        onClose={() => setViewEnrollmentId(null)}
      />
    </div>
  )
}
