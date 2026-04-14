"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Eye, FileText, Loader2 } from "lucide-react"
import { api, type ApiEnrollment } from "@/lib/api"
import { ContractViewDialog } from "@/components/contract-view-dialog"

function enrollmentStatus(en: ApiEnrollment): { label: string; color: string } {
  if (en.contract_signed) return { label: "Assinado", color: "bg-green-100 text-green-700" }
  if (en.status === "canceled") return { label: "Cancelado", color: "bg-red-100 text-red-700" }
  return { label: "Pendente", color: "bg-yellow-100 text-yellow-700" }
}

export default function ContratosPage() {
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null)

  const fetchEnrollments = useCallback((q?: string) => {
    return api.enrollments.list(q ? { student_name_or_course_title_cont: q } : undefined)
  }, [])

  useEffect(() => {
    fetchEnrollments()
      .then(setEnrollments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [fetchEnrollments])

  // Debounced server-side search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchEnrollments(search || undefined).then(setEnrollments).catch(console.error)
    }, 300)
    return () => clearTimeout(t)
  }, [search, fetchEnrollments])

  const filtered = enrollments

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
        <p className="mt-1 text-muted-foreground">Visualize e gerencie os contratos de matrículas</p>
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
            Lista de Contratos ({loading ? "..." : filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Aluno</th>
                    <th className="pb-3 font-medium">Curso</th>
                    <th className="pb-3 font-medium">Pagamento</th>
                    <th className="pb-3 font-medium">Data Matrícula</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((en) => {
                    const { label, color } = enrollmentStatus(en)
                    return (
                      <tr key={en.id} className="border-b last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {en.student?.name.charAt(0) ?? "?"}
                            </div>
                            <span className="font-medium text-foreground">{en.student?.name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {en.course?.title
                            ? en.course.title.length > 35
                              ? en.course.title.slice(0, 35) + "..."
                              : en.course.title
                            : "—"}
                        </td>
                        <td className="py-4 text-sm text-muted-foreground capitalize">
                          {en.payment_method?.replace(/_/g, " ") ?? "—"}
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {en.started_at ? new Date(en.started_at).toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td className="py-4">
                          <Badge className={color} variant="secondary">{label}</Badge>
                        </td>
                        <td className="py-4">
                          <Button variant="ghost" size="sm" onClick={() => setViewEnrollmentId(en.id)}>
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
                <p className="py-8 text-center text-muted-foreground">Nenhum contrato encontrado.</p>
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
