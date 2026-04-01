"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Loader2 } from "lucide-react"
import { api, type ApiStudent, type ApiEnrollment, type ApiCourse, type ApiTurma } from "@/lib/api"

const enrollmentStatusLabels: Record<string, string> = { active: "Ativa", canceled: "Cancelada", expired: "Expirada" }
const enrollmentStatusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  canceled: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-700",
}

export default function AlunosPage() {
  const [students, setStudents] = useState<ApiStudent[]>([])
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // New enrollment dialog
  const [showNewEnrollment, setShowNewEnrollment] = useState(false)
  const [eStudentId, setEStudentId] = useState("")
  const [eCourseId, setECourseId] = useState("")
  const [eTurmaId, setETurmaId] = useState("")
  const [eStartedAt, setEStartedAt] = useState("")
  const [eExpiresAt, setEExpiresAt] = useState("")
  const [ePaymentMethod, setEPaymentMethod] = useState("")
  const [eTotalPaid, setETotalPaid] = useState("")
  const [turmasForCourse, setTurmasForCourse] = useState<ApiTurma[]>([])
  const [loadingTurmas, setLoadingTurmas] = useState(false)
  const [saving, setSaving] = useState(false)
  const [enrollError, setEnrollError] = useState("")

  // Student detail dialog
  const [selectedStudent, setSelectedStudent] = useState<ApiStudent | null>(null)

  useEffect(() => {
    Promise.all([api.students.list(), api.enrollments.list(), api.courses.list()])
      .then(([s, e, c]) => { setStudents(s); setEnrollments(e); setCourses(c) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleCourseChange(courseId: string) {
    setECourseId(courseId)
    setETurmaId("")
    if (!courseId) { setTurmasForCourse([]); return }
    setLoadingTurmas(true)
    try {
      const turmas = await api.turmas.list(parseInt(courseId))
      setTurmasForCourse(turmas)
    } catch { setTurmasForCourse([]) }
    finally { setLoadingTurmas(false) }
  }

  async function handleNewEnrollment(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!eStudentId || !eCourseId || !eTurmaId || !eStartedAt) {
      setEnrollError("Preencha os campos obrigatórios."); return
    }
    setSaving(true); setEnrollError("")
    try {
      const created = await api.enrollments.create({
        student_id: parseInt(eStudentId),
        course_id: parseInt(eCourseId),
        turma_id: parseInt(eTurmaId),
        status: "active",
        started_at: eStartedAt,
        expires_at: eExpiresAt || undefined,
        payment_method: ePaymentMethod || undefined,
        total_paid: eTotalPaid ? parseFloat(eTotalPaid) : undefined,
      })
      setEnrollments((prev) => [created, ...prev])
      setShowNewEnrollment(false)
      setEStudentId(""); setECourseId(""); setETurmaId(""); setEStartedAt(""); setEExpiresAt("")
      setEPaymentMethod(""); setETotalPaid(""); setTurmasForCourse([])
    } catch (err: unknown) { setEnrollError(err instanceof Error ? err.message : "Erro ao criar matrícula") }
    finally { setSaving(false) }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.cpf.includes(search)
  )

  function getActiveEnrollment(studentId: number) {
    return enrollments.find((e) => e.student?.id === studentId && e.status === "active")
  }

  function getStudentEnrollments(studentId: number) {
    return enrollments.filter((e) => e.student?.id === studentId)
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

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou CPF..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
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
                    <th className="pb-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => {
                    const enrollment = getActiveEnrollment(student.id)
                    return (
                      <tr key={student.id} className="border-b last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">{student.email}</td>
                        <td className="py-4 text-sm text-muted-foreground">{student.whatsapp ?? "—"}</td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {enrollment ? (
                            <div>
                              <p className="text-foreground">{enrollment.course?.title?.slice(0, 30)}{(enrollment.course?.title?.length ?? 0) > 30 ? "..." : ""}</p>
                              {enrollment.turma && <p className="text-xs">{enrollment.turma.name}</p>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">Sem matrícula ativa</span>
                          )}
                        </td>
                        <td className="py-4">
                          <Badge
                            className={student.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                            variant="secondary"
                          >
                            {student.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                            <Eye className="h-4 w-4" />
                          </Button>
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
        </CardContent>
      </Card>

      {/* Nova Matrícula Dialog */}
      <Dialog open={showNewEnrollment} onOpenChange={setShowNewEnrollment}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Matrícula</DialogTitle>
            <DialogDescription>Vincule um aluno a um curso e turma.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewEnrollment} className="space-y-4">
            <div className="space-y-2">
              <Label>Aluno *</Label>
              <Select value={eStudentId} onValueChange={setEStudentId}>
                <SelectTrigger><SelectValue placeholder="Selecione o aluno" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name} — {s.cpf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Curso *</Label>
              <Select value={eCourseId} onValueChange={handleCourseChange}>
                <SelectTrigger><SelectValue placeholder="Selecione o curso" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Turma *</Label>
              <Select value={eTurmaId} onValueChange={setETurmaId} disabled={!eCourseId || loadingTurmas}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTurmas ? "Carregando..." : "Selecione a turma"} />
                </SelectTrigger>
                <SelectContent>
                  {turmasForCourse.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Input type="date" value={eStartedAt} onChange={(e) => setEStartedAt(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Data de Término</Label>
                <Input type="date" value={eExpiresAt} onChange={(e) => setEExpiresAt(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={ePaymentMethod} onValueChange={setEPaymentMethod}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor Pago (R$)</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={eTotalPaid} onChange={(e) => setETotalPaid(e.target.value)} />
              </div>
            </div>
            {enrollError && <p className="text-sm text-destructive">{enrollError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowNewEnrollment(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Criar Matrícula"}
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
                </div>
              </div>
              <div>
                <p className="mb-3 font-medium text-foreground">Matrículas</p>
                {getStudentEnrollments(selectedStudent.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma matrícula encontrada.</p>
                ) : (
                  <div className="space-y-2">
                    {getStudentEnrollments(selectedStudent.id).map((enr) => (
                      <div key={enr.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{enr.course?.title ?? "Curso não informado"}</p>
                          <Badge className={enrollmentStatusColors[enr.status] ?? "bg-gray-100 text-gray-700"} variant="secondary">
                            {enrollmentStatusLabels[enr.status] ?? enr.status}
                          </Badge>
                        </div>
                        {enr.turma && <p className="text-sm text-muted-foreground">{enr.turma.name}</p>}
                        <p className="text-xs text-muted-foreground">Início: {enr.started_at}</p>
                        {enr.total_paid != null && (
                          <p className="text-xs text-muted-foreground">
                            Pago: R$ {Number(enr.total_paid).toFixed(2)} via {enr.payment_method ?? "—"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
