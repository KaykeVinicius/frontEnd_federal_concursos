"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { api, type ApiTurma, type ApiEnrollment } from "@/lib/api"
import { Loader2 } from "lucide-react"


// @react-pdf/renderer não funciona no SSR
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false }
)

const RelatorioTurmaPDF = dynamic(
  () => import("@/components/relatorio-turma-pdf"),
  { ssr: false }
)

export default function ImprimirTurmaPage() {
  const params = useParams()
  const [turma, setTurma] = useState<ApiTurma | null>(null)
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const turmaId = Number(params.id)

  useEffect(() => {
    if (!turmaId) return
    api.turmas.get(turmaId)
      .then((t) => {
        setTurma(t)
        return api.enrollments.list()
      })
      .then((all) => {
        setEnrollments(all.filter((e) => Number(e.turma?.id) === turmaId))
      })
      .catch((err) => setError(err?.message ?? "Erro ao carregar dados."))
      .finally(() => setLoading(false))
  }, [turmaId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-muted-foreground">Gerando relatório...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-destructive">{error}</div>
    )
  }

  if (!turma) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">Turma não encontrada.</div>
    )
  }

  return (
    <PDFViewer style={{ width: "100%", height: "100vh", border: "none" }}>
      <RelatorioTurmaPDF turma={turma} enrollments={enrollments} />
    </PDFViewer>
  )
}
