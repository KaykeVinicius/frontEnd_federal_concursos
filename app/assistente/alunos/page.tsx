"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, FileText, Loader2 } from "lucide-react"
import { api, type ApiStudent, type ApiEnrollment, type ApiCourse, type ApiTurma } from "@/lib/api"
import { ContractViewDialog } from "@/components/contract-view-dialog"

export default function AlunosPage() {
  const [students, setStudents] = useState<ApiStudent[]>([])
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Nova matrícula
  const [showNewEnrollment, setShowNewEnrollment] = useState(false)
  const [eStudentId, setEStudentId] = useState("")
  const [eCourseId, setECourseId] = useState("")
  const [eTurmaId, setETurmaId] = useState("")
  const [eEnrollmentType, setEEnrollmentType] = useState("interno")
  const [eStartedAt, setEStartedAt] = useState("")
  const [eExpiresAt, setEExpiresAt] = useState("")
  const [ePaymentMethod, setEPaymentMethod] = useState("")
  const [eTotalPaid, setETotalPaid] = useState("")
  const [eIsNewStudent, setEIsNewStudent] = useState(true)
  const [turmasForCourse, setTurmasForCourse] = useState<ApiTurma[]>([])
  const [loadingTurmas, setLoadingTurmas] = useState(false)
  const [saving, setSaving] = useState(false)
  const [enrollError, setEnrollError] = useState("")

  // Campos novo aluno
  const [eNewName, setENewName] = useState("")
  const [eNewEmail, setENewEmail] = useState("")
  const [eNewCpf, setENewCpf] = useState("")
  const [eNewWhatsapp, setENewWhatsapp] = useState("")

  const [contractEnrollmentId, setContractEnrollmentId] = useState<number | null>(null)

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
      setTurmasForCourse(turmas.filter((t) => t.status === "aberta"))
      const course = courses.find((c) => c.id === parseInt(courseId))
      if (course) {
        if (course.start_date) setEStartedAt(course.start_date.slice(0, 10))
        if (course.end_date) setEExpiresAt(course.end_date.slice(0, 10))
        setETotalPaid(String(course.price ?? ""))
      }
    } catch { setTurmasForCourse([]) }
    finally { setLoadingTurmas(false) }
  }

  function resetEnrollForm() {
    setEStudentId(""); setECourseId(""); setETurmaId(""); setEStartedAt(""); setEExpiresAt("")
    setEPaymentMethod(""); setETotalPaid(""); setTurmasForCourse([]); setEIsNewStudent(true); setEEnrollmentType("interno")
    setENewName(""); setENewEmail(""); setENewCpf(""); setENewWhatsapp("")
  }

  async function handleNewEnrollment(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!eCourseId || !eStartedAt) {
      setEnrollError("Preencha os campos obrigatórios."); return
    }
    setSaving(true); setEnrollError("")
    try {
      let studentId = parseInt(eStudentId)

      if (eIsNewStudent) {
        if (!eNewName || !eNewEmail || !eNewCpf) {
          setEnrollError("Preencha nome, email e CPF do novo aluno."); setSaving(false); return
        }
        const newStudent = await api.students.create({
          name: eNewName,
          email: eNewEmail,
          cpf: eNewCpf,
          whatsapp: eNewWhatsapp || undefined,
          active: true,
        })
        setStudents((prev) => [newStudent, ...prev])
        studentId = newStudent.id
      }

      const duplicate = enrollments.find(
        (en) => en.student?.id === studentId && en.course?.id === parseInt(eCourseId) && en.status === "active"
      )
      if (duplicate) {
        setEnrollError("Este aluno já possui uma matrícula ativa neste curso."); setSaving(false); return
      }

      const created = await api.enrollments.create({
        student_id: studentId,
        course_id: parseInt(eCourseId),
        turma_id: eTurmaId ? parseInt(eTurmaId) : undefined,
        enrollment_type: eEnrollmentType as "interno" | "externo",
        status: "active",
        started_at: eStartedAt,
        expires_at: eExpiresAt || undefined,
        payment_method: ePaymentMethod || undefined,
        total_paid: eTotalPaid ? parseFloat(eTotalPaid) : undefined,
      })
      setEnrollments((prev) => [created, ...prev])
      setShowNewEnrollment(false)
      resetEnrollForm()
    } catch (err: unknown) {
      setEnrollError(err instanceof Error ? err.message : "Erro ao criar matrícula")
    } finally { setSaving(false) }
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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alunos</h1>
          <p className="mt-1 text-muted-foreground">Gerencie alunos e matrículas</p>
        </div>
        <Button onClick={() => setShowNewEnrollment(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nova Matrícula
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
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                    <th className="pb-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => {
                    const enrollment = getActiveEnrollment(student.id)
                    const course = enrollment?.course ?? null
                    const turma = enrollment?.turma ?? null

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
                          {course ? (
                            <div>
                              <p className="text-foreground">
                                {course.title.length > 30 ? course.title.slice(0, 30) + "..." : course.title}
                              </p>
                              {turma && <p className="text-xs">{turma.name}</p>}
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
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" disabled>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {enrollment && (
                              <Button variant="ghost" size="sm" onClick={() => setContractEnrollmentId(enrollment.id)}>
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
                <p className="py-8 text-center text-muted-foreground">Nenhum aluno encontrado.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nova Matrícula Dialog */}
      <Dialog open={showNewEnrollment} onOpenChange={(open) => { if (!open) resetEnrollForm(); setShowNewEnrollment(open) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Matrícula</DialogTitle>
            <DialogDescription>Vincule um aluno a um curso e turma.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewEnrollment} className="space-y-4">

            {/* Tipo de aluno */}
            <div className="space-y-2">
              <Label>Tipo de Aluno *</Label>
              <div className="flex gap-2">
                {[{ val: true, label: "Aluno Novo" }, { val: false, label: "Ex-Aluno / Rematrícula" }].map(({ val, label }) => (
                  <button key={label} type="button"
                    onClick={() => setEIsNewStudent(val)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${eIsNewStudent === val ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {eIsNewStudent ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input placeholder="Nome do aluno" value={eNewName} onChange={(e) => setENewName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF *</Label>
                    <Input placeholder="000.000.000-00" value={eNewCpf} onChange={(e) => setENewCpf(e.target.value)} required />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" placeholder="email@exemplo.com" value={eNewEmail} onChange={(e) => setENewEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input placeholder="(00) 00000-0000" value={eNewWhatsapp} onChange={(e) => setENewWhatsapp(e.target.value)} />
                  </div>
                </div>
              </>
            ) : (
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
            )}

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
              <Label>Turma</Label>
              <Select value={eTurmaId} onValueChange={setETurmaId} disabled={!eCourseId || loadingTurmas}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTurmas ? "Carregando..." : !eCourseId ? "Selecione o curso primeiro" : turmasForCourse.length === 0 ? "Nenhuma turma aberta" : "Selecione a turma"} />
                </SelectTrigger>
                <SelectContent>
                  {turmasForCourse.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name} · {t.modalidade === "presencial" ? "Presencial" : "Híbrido"} · {t.enrolled_count}/{t.max_students} alunos
                    </SelectItem>
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
                    <SelectItem value="credito_vista">Cartão de Crédito à Vista</SelectItem>
                    <SelectItem value="credito_parcelado">Cartão de Crédito Parcelado</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={eTotalPaid} onChange={(e) => setETotalPaid(e.target.value)} />
              </div>
            </div>

            {enrollError && <p className="text-sm text-destructive">{enrollError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => { resetEnrollForm(); setShowNewEnrollment(false) }}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Criar Matrícula"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ContractViewDialog
        enrollmentId={contractEnrollmentId}
        onClose={() => setContractEnrollmentId(null)}
      />
    </div>
  )
}
