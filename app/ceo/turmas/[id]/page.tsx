"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { api, type ApiTurma, type ApiEnrollment } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileSpreadsheet, Printer, Loader2, Users, AlertCircle } from "lucide-react"

export default function TurmaAlunosPage() {
  const params = useParams()
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
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
        const filtered = all.filter((e) => Number(e.turma?.id) === turmaId)
        setEnrollments(filtered)
      })
      .catch((err) => {
        setError(err?.message ?? "Erro ao carregar dados da turma.")
      })
      .finally(() => setLoading(false))
  }, [turmaId])

  function handlePrint() {
    const token = localStorage.getItem("auth_token") ?? ""
    window.open(`/api/pdf/turmas/${turmaId}?token=${token}`, "_blank")
  }

  function handleExcelCSV() {
    if (!turma) return
    const rows = [
      ["#", "Nome Completo", "E-mail", "Telefone / WhatsApp", "CPF", "Status"],
      ...enrollments.map((e, i) => [
        String(i + 1),
        e.student?.name ?? "—",
        e.student?.email ?? "—",
        e.student?.whatsapp ?? "—",
        e.student?.cpf ?? "—",
        e.status === "active" ? "Matriculado" : e.status === "inactive" ? "Inativo" : e.status === "canceled" || e.status === "cancelled" ? "Cancelado" : e.status,
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(";")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `turma_${turma.name.replace(/\s+/g, "_")}_alunos.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusLabel = (s: string) =>
    s === "aberta" ? "Aberta" : s === "em_andamento" ? "Em Andamento" : "Fechada"
  const statusColor = (s: string) =>
    s === "aberta" ? "bg-green-100 text-green-800" : s === "em_andamento" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive font-medium">{error}</p>
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>
    )
  }

  if (!turma) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Turma não encontrada.</p>
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; inset: 0; padding: 32px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="p-4 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Ações */}
          <div className="no-print flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExcelCSV} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
              </Button>
              <Button onClick={handlePrint} className="gap-2 bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                <Printer className="h-4 w-4" /> Emitir PDF
              </Button>
            </div>
          </div>

          {/* Área imprimível */}
          <div id="print-area" ref={printRef} className="rounded-xl border border-border bg-white text-black shadow-sm dark:bg-card dark:text-foreground">

            {/* Cabeçalho institucional */}
            <div className="flex items-center justify-between border-b border-border px-8 py-6">
              <div className="flex items-center gap-4">
                <Image
                  src="/images/logofederalsemfundo.jpeg"
                  alt="Federal Cursos"
                  width={120}
                  height={48}
                  className="object-contain"
                  style={{ height: 48, width: "auto" }}
                />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Instituição de Ensino</p>
                  <h1 className="text-xl font-extrabold tracking-tight text-foreground">Federal Cursos</h1>
                  <p className="text-xs text-muted-foreground">contato@federalconcursos.com.br</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Relatório emitido em</p>
                <p className="text-sm font-semibold text-foreground">
                  {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Título do relatório */}
            <div className="border-b border-border bg-muted/30 px-8 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Relatório de Alunos</p>
                  <h2 className="text-2xl font-bold text-foreground">{turma.name}</h2>
                  <p className="text-sm text-muted-foreground">{turma.course?.title ?? "—"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusColor(turma.status)}>{statusLabel(turma.status)}</Badge>
                  {turma.shift && <Badge variant="outline">{turma.shift}</Badge>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span><strong className="text-foreground">Total de alunos:</strong> {enrollments.length} / {turma.max_students}</span>
                {turma.start_date && <span><strong className="text-foreground">Início:</strong> {new Date(turma.start_date).toLocaleDateString("pt-BR")}</span>}
                {turma.end_date && <span><strong className="text-foreground">Término:</strong> {new Date(turma.end_date).toLocaleDateString("pt-BR")}</span>}
                {turma.schedule && <span><strong className="text-foreground">Horário:</strong> {turma.schedule}</span>}
              </div>
            </div>

            {/* Tabela */}
            <div className="px-8 py-6">
              {enrollments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Nenhum aluno matriculado nesta turma.</p>
                </div>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#e8491d]">
                      <th className="py-3 text-left font-semibold text-muted-foreground w-8">#</th>
                      <th className="py-3 text-left font-semibold text-foreground">Nome Completo</th>
                      <th className="py-3 text-left font-semibold text-foreground">E-mail</th>
                      <th className="py-3 text-left font-semibold text-foreground">Telefone / WhatsApp</th>
                      <th className="py-3 text-left font-semibold text-foreground">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment, index) => (
                      <tr key={enrollment.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                        <td className="py-3 pr-4 text-muted-foreground">{index + 1}</td>
                        <td className="py-3 pr-4 font-medium text-foreground">{enrollment.student?.name ?? "—"}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{enrollment.student?.email ?? "—"}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{enrollment.student?.whatsapp ?? "—"}</td>
                        <td className="py-3">
                          <Badge className={
                            enrollment.status === "active" ? "bg-green-100 text-green-800" :
                            enrollment.status === "inactive" ? "bg-red-100 text-red-800" :
                            enrollment.status === "canceled" || enrollment.status === "cancelled" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {enrollment.status === "active" ? "Matriculado" : enrollment.status === "inactive" ? "Inativo" : enrollment.status === "canceled" || enrollment.status === "cancelled" ? "Cancelado" : enrollment.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-between border-t border-border px-8 py-4 text-xs text-muted-foreground">
              <span>Federal Cursos — Documento gerado automaticamente pelo sistema.</span>
              <span>{enrollments.length} aluno(s) listado(s)</span>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
