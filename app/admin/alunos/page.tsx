"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plus, Search, Eye, Loader2, Trash2, Pencil, User, Mail, CreditCard, Phone, AtSign, BookOpen, ShieldCheck, Settings2, FileSpreadsheet, Printer, Filter, Send, AlertTriangle, CalendarDays } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api, type ApiStudent } from "@/lib/api"
import { NewEnrollmentDialog } from "@/components/new-enrollment-dialog"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { isValidCpf } from "@/lib/cpf"

const applyCpfMask = (value: string) => {
  const n = value.replace(/\D/g, "").slice(0, 11)
  if (n.length <= 3) return n
  if (n.length <= 6) return n.replace(/(\d{3})(\d+)/, "$1.$2")
  if (n.length <= 9) return n.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3")
  return n.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4")
}

const applyPhoneMask = (value: string) => {
  const n = value.replace(/\D/g, "").slice(0, 11)
  if (n.length <= 2) return n
  if (n.length <= 7) return n.replace(/(\d{2})(\d+)/, "($1) $2")
  return n.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3")
}

function fieldClass(value: string, isValid: boolean | null): string {
  if (!value) return ""
  if (isValid === true) return "border-green-500 focus-visible:ring-green-500"
  if (isValid === false) return "border-red-500 focus-visible:ring-red-500"
  return ""
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string) {
  const d = phone.replace(/\D/g, "")
  return d.length === 10 || d.length === 11
}

const enrollmentStatusLabels: Record<string, string> = { active: "Ativa", canceled: "Cancelada", expired: "Expirada" }
const enrollmentStatusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  canceled: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-700",
}

export default function AlunosPage() {
  const [students, setStudents] = useState<ApiStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // New enrollment dialog
  const [showNewEnrollment, setShowNewEnrollment] = useState(false)

  // Student detail dialog
  const [selectedStudent, setSelectedStudent] = useState<ApiStudent | null>(null)
  const [deletingEnrollmentId, setDeletingEnrollmentId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  // Edit student dialog
  const [editStudent, setEditStudent] = useState<ApiStudent | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editCpf, setEditCpf] = useState("")
  const [editWhatsapp, setEditWhatsapp] = useState("")
  const [editInstagram, setEditInstagram] = useState("")
  const [editBirthDate, setEditBirthDate] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState("")

  // Delete student modal
  const [deleteStudentTarget, setDeleteStudentTarget] = useState<ApiStudent | null>(null)
  const [deletingStudent, setDeletingStudent] = useState(false)
  const [deleteStudentError, setDeleteStudentError] = useState<string | null>(null)

  // Resend enrollment email
  const [resendingEmailId, setResendingEmailId] = useState<number | null>(null)
  const [resendSuccess, setResendSuccess] = useState<number | null>(null)

  function openEditDialog(student: ApiStudent) {
    setEditStudent(student)
    setEditName(student.name)
    setEditEmail(student.email)
    setEditCpf(student.cpf ?? "")
    setEditWhatsapp(student.whatsapp ?? "")
    setEditInstagram(student.instagram ?? "")
    setEditBirthDate(student.birth_date ?? "")
    setEditError("")
  }

  async function handleEditSave(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!editStudent) return
    setEditError("")
    if (!isValidCpf(editCpf)) {
      setEditError("CPF inválido. Verifique os dígitos e tente novamente.")
      return
    }
    const phoneDigits = editWhatsapp.replace(/\D/g, "")
    if (phoneDigits.length > 0 && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      setEditError("WhatsApp inválido. Digite DDD + número (10 ou 11 dígitos).")
      return
    }
    setEditSaving(true)
    try {
      const updated = await api.students.update(editStudent.id, {
        name: editName,
        email: editEmail,
        cpf: editCpf.replace(/\D/g, ""),
        whatsapp: editWhatsapp.replace(/\D/g, "") || undefined,
        instagram: editInstagram || undefined,
        birth_date: editBirthDate || undefined,
      })
      setStudents((prev) => prev.map((s) => s.id === updated.id ? updated : s))
      setEditStudent(null)
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Erro ao salvar alterações.")
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDeleteStudent() {
    if (!deleteStudentTarget) return
    setDeletingStudent(true)
    setDeleteStudentError(null)
    try {
      await api.students.delete(deleteStudentTarget.id)
      setStudents((prev) => prev.filter((s) => s.id !== deleteStudentTarget.id))
      setDeleteStudentTarget(null)
    } catch (err) {
      setDeleteStudentError(err instanceof Error ? err.message : "Erro ao excluir aluno.")
    } finally {
      setDeletingStudent(false)
    }
  }

  async function handleResendEmail(enrollmentId: number) {
    setResendingEmailId(enrollmentId)
    setResendSuccess(null)
    try {
      await api.enrollments.resendEmail(enrollmentId)
      setResendSuccess(enrollmentId)
      setTimeout(() => setResendSuccess(null), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setResendingEmailId(null)
    }
  }

  async function handleDeleteEnrollment(enrollmentId: number) {
    setDeletingEnrollmentId(enrollmentId)
    try {
      await api.enrollments.update(enrollmentId, { status: "canceled" })
      setStudents((prev) => prev.map((s) => ({
        ...s,
        enrollments: s.enrollments?.map((e) => e.id === enrollmentId ? { ...e, status: "canceled" } : e),
      })))
      setConfirmDeleteId(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingEnrollmentId(null)
    }
  }

  const fetchStudents = useCallback((q?: string, status?: typeof filterStatus, p = 1) => {
    const ransackQ: Record<string, string> = {}
    if (q) ransackQ["name_or_email_or_cpf_cont"] = q
    if (status === "active") ransackQ["active_eq"] = "true"
    if (status === "inactive") ransackQ["active_eq"] = "false"
    return api.students.list(Object.keys(ransackQ).length ? ransackQ : undefined, p, 10)
  }, [])


  // Resetar para página 1 ao mudar busca ou filtro
  useEffect(() => {
    setPage(1)
  }, [search, filterStatus])

  // Debounced re-fetch em qualquer mudança de busca/filtro/página
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      fetchStudents(search || undefined, filterStatus, page)
        .then((res) => { setStudents(res.data); setTotalPages(res.totalPages); setTotalCount(res.total) })
        .catch(console.error)
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [search, filterStatus, page, fetchStudents])

  const filtered = students

  async function handleExportCSV() {
    const ransackQ: Record<string, string> = {}
    if (search) ransackQ["name_or_email_or_cpf_cont"] = search
    if (filterStatus === "active") ransackQ["active_eq"] = "true"
    if (filterStatus === "inactive") ransackQ["active_eq"] = "false"
    const { data: all } = await api.students.list(
      Object.keys(ransackQ).length ? ransackQ : undefined, 1, 2000
    )
    const rows = [
      ["#", "Nome", "Email", "CPF", "WhatsApp", "Instagram", "Status"],
      ...all.map((s, i) => [
        String(i + 1),
        s.name,
        s.email,
        s.cpf ?? "—",
        s.whatsapp ?? "—",
        s.instagram ? `@${s.instagram.replace(/^@/, "")}` : "—",
        s.active ? "Ativo" : "Inativo",
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `alunos_${filterStatus}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExportPDF() {
    const token = localStorage.getItem("auth_token") ?? ""
    const statusParam = filterStatus !== "all" ? `&status=${filterStatus}` : ""
    window.open(`/api/pdf/alunos?token=${token}${statusParam}`, "_blank")
  }

  function getActiveEnrollment(student: ApiStudent) {
    return student.enrollments?.find((e) => e.status === "active") ?? null
  }

  function getStudentEnrollments(student: ApiStudent) {
    return student.enrollments ?? []
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alunos</h1>
          <p className="mt-1 text-muted-foreground">Gerencie alunos e matrículas</p>
        </div>
        <Button onClick={() => setShowNewEnrollment(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nova Matrícula
        </Button>
      </div>

      {/* Busca + Filtros + Exportar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {(["all", "active", "inactive"] as const).map((val) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                filterStatus === val
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {val === "all" ? "Todos" : val === "active" ? "Ativos" : "Inativos"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button onClick={handleExportPDF} className="gap-2 bg-[#e8491d] hover:bg-[#d13a0f] text-white">
            <Printer className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <span>Lista de Alunos</span>
            <span className="text-sm font-normal text-muted-foreground">{totalCount} aluno(s)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium"><span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Nome</span></th>
                    <th className="pb-3 pr-4 font-medium"><span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Email</span></th>
                    <th className="pb-3 pr-4 font-medium whitespace-nowrap"><span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" />CPF</span></th>
                    <th className="pb-3 pr-4 font-medium whitespace-nowrap text-center"><span className="flex items-center justify-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Nascimento</span></th>
                    <th className="pb-3 pr-4 font-medium whitespace-nowrap"><span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />WhatsApp</span></th>
                    <th className="hidden 2xl:table-cell pb-3 pr-4 font-medium whitespace-nowrap"><span className="flex items-center gap-1.5"><AtSign className="h-3.5 w-3.5" />Instagram</span></th>
                    <th className="hidden pb-3 pr-4 font-medium"><span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />Curso</span></th>
                    <th className="pb-3 pr-4 font-medium text-center"><span className="flex items-center justify-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />Status</span></th>
                    <th className="pb-3 font-medium text-center"><span className="flex items-center justify-center gap-1.5"><Settings2 className="h-3.5 w-3.5" />Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => {
                    const enrollment = getActiveEnrollment(student)
                    const cpfFormatted = student.cpf
                      ? student.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
                      : "—"
                    return (
                      <tr key={student.id} className="border-b last:border-0">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">{student.email}</td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground whitespace-nowrap">{cpfFormatted}</td>
                        <td className="py-4 pr-4 text-sm whitespace-nowrap text-center">
                          {student.birth_date
                            ? <span className="text-muted-foreground">{new Date(student.birth_date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                            : <span className="inline-flex items-center gap-1 text-red-500/70"><span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />—</span>}
                        </td>
                        <td className="py-4 pr-4 text-sm whitespace-nowrap">
                          {student.whatsapp
                            ? <span className="text-muted-foreground">{student.whatsapp}</span>
                            : <span className="inline-flex items-center gap-1 text-red-500/70"><span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />—</span>}
                        </td>
                        <td className="hidden 2xl:table-cell py-4 pr-4 text-sm whitespace-nowrap">
                          {student.instagram
                            ? <span className="text-muted-foreground">@{student.instagram.replace(/^@/, "")}</span>
                            : <span className="inline-flex items-center gap-1 text-red-500/70"><span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />—</span>}
                        </td>
                        <td className="hidden py-4 pr-4 text-sm text-muted-foreground">
                          {enrollment ? (
                            <div>
                              <p className="text-foreground">{enrollment.course?.title?.slice(0, 30)}{(enrollment.course?.title?.length ?? 0) > 30 ? "..." : ""}</p>
                              {enrollment.turma && <p className="text-xs">{enrollment.turma.name}</p>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">Sem matrícula ativa</span>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-center">
                          <Badge
                            className={student.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                            variant="secondary"
                          >
                            {student.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="py-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mx-auto">
                                <Settings2 className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedStudent(student)} className="gap-2 cursor-pointer">
                                <Eye className="h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(student)} className="gap-2 cursor-pointer">
                                <Pencil className="h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => { setDeleteStudentTarget(student); setDeleteStudentError(null) }}
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">Nenhum aluno encontrado.</p>
              )}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <NewEnrollmentDialog
        open={showNewEnrollment}
        onOpenChange={setShowNewEnrollment}
        onSuccess={() => {
          // Recarrega a página atual para refletir nova matrícula
          fetchStudents(search || undefined, filterStatus, page)
            .then((res) => { setStudents(res.data); setTotalPages(res.totalPages); setTotalCount(res.total) })
            .catch(console.error)
        }}
      />

      {/* Edit Student Dialog */}
      <Dialog open={!!editStudent} onOpenChange={(open) => { if (!open) setEditStudent(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Aluno</DialogTitle>
            <DialogDescription>Altere os dados do aluno e salve.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  placeholder="000.000.000-00"
                  value={editCpf}
                  onChange={(e) => setEditCpf(applyCpfMask(e.target.value))}
                  inputMode="numeric"
                  maxLength={14}
                  className={fieldClass(editCpf, editCpf ? isValidCpf(editCpf) : null)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={fieldClass(editEmail, editEmail ? isValidEmail(editEmail) : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={editWhatsapp}
                  onChange={(e) => setEditWhatsapp(applyPhoneMask(e.target.value))}
                  inputMode="numeric"
                  maxLength={15}
                  className={fieldClass(editWhatsapp, editWhatsapp ? isValidPhone(editWhatsapp) : null)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input placeholder="@usuario" value={editInstagram} onChange={(e) => setEditInstagram(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                />
              </div>
            </div>
            {editError && <p className="text-sm text-destructive">{editError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditStudent(null)}>Cancelar</Button>
              <Button type="submit" disabled={editSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {editSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalhes do Aluno</DialogTitle>
            <DialogDescription>Informações e matrículas do aluno</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{selectedStudent.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                  <p className="text-sm text-muted-foreground">CPF: {selectedStudent.cpf}</p>
                  {selectedStudent.whatsapp && <p className="text-sm text-muted-foreground">WhatsApp: {selectedStudent.whatsapp}</p>}
                  {selectedStudent.instagram && <p className="text-sm text-muted-foreground">Instagram: @{selectedStudent.instagram.replace(/^@/, "")}</p>}
                </div>
              </div>
              <div>
                <p className="mb-3 font-medium text-foreground">Matrículas</p>
                {getStudentEnrollments(selectedStudent).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma matrícula encontrada.</p>
                ) : (
                  <div className="space-y-2">
                    {getStudentEnrollments(selectedStudent).map((enr) => (
                      <div key={enr.id} className="rounded-lg border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{enr.course?.title ?? "Curso não informado"}</p>
                            {enr.turma && <p className="text-sm text-muted-foreground">{enr.turma.name}</p>}
                            <p className="text-xs text-muted-foreground">Início: {enr.started_at}</p>
                            {enr.total_paid != null && (
                              <p className="text-xs text-muted-foreground">
                                Pago: R$ {Number(enr.total_paid).toFixed(2)} via {enr.payment_method ?? "—"}
                              </p>
                            )}
                          </div>
                          <Badge className={enrollmentStatusColors[enr.status] ?? "bg-gray-100 text-gray-700"} variant="secondary">
                            {enrollmentStatusLabels[enr.status] ?? enr.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          {resendSuccess === enr.id ? (
                            <span className="flex items-center gap-1.5 text-xs text-green-600">
                              <Send className="h-3.5 w-3.5" /> E-mail enviado!
                            </span>
                          ) : (
                            <button
                              onClick={() => handleResendEmail(enr.id)}
                              disabled={resendingEmailId === enr.id}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                            >
                              {resendingEmailId === enr.id
                                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando...</>
                                : <><Send className="h-3.5 w-3.5" /> Reenviar e-mail</>}
                            </button>
                          )}

                          {confirmDeleteId === enr.id ? (
                            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                              <p className="flex-1 text-xs text-destructive">Cancelar esta matrícula?</p>
                              <button
                                onClick={() => handleDeleteEnrollment(enr.id)}
                                disabled={deletingEnrollmentId === enr.id}
                                className="rounded px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                              >
                                {deletingEnrollmentId === enr.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Excluir"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(enr.id)}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Cancelar matrícula
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteStudentTarget}
        onOpenChange={(open) => { if (!open) setDeleteStudentTarget(null) }}
        title="Excluir aluno"
        description={`Tem certeza que deseja excluir o aluno "${deleteStudentTarget?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteStudent}
        loading={deletingStudent}
        error={deleteStudentError}
      />
    </div>
  )
}
