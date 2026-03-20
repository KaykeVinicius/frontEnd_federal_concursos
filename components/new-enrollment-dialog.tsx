"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  mockCourses,
  mockStudents,
  getTurmasByCourseId,
  getCourseById,
  mockCareers,
  type Student,
} from "@/lib/mock-data"
import { fakeApiPost } from "@/lib/api"
import { Loader2, UserPlus, UserCheck, Search, ArrowLeft, Percent } from "lucide-react"

interface NewEnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "choose_type" | "select_existing" | "new_student_form" | "course_payment" | "success"

const EX_ALUNO_DISCOUNT = 0.15 // 15% de desconto para ex-alunos

export function NewEnrollmentDialog({ open, onOpenChange }: NewEnrollmentDialogProps) {
  const [step, setStep] = useState<Step>("choose_type")
  const [studentType, setStudentType] = useState<"novato" | "ex_aluno" | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentSearch, setStudentSearch] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("")
  const [selectedCareerId, setSelectedCareerId] = useState<string>("")
  const [saving, setSaving] = useState(false)

  // Form fields for new student
  const [newName, setNewName] = useState("")
  const [newCpf, setNewCpf] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newWhatsapp, setNewWhatsapp] = useState("")
  const [newAddress, setNewAddress] = useState("")

  const publishedCourses = mockCourses.filter((c) => c.status === "published")
  const turmas = selectedCourseId ? getTurmasByCourseId(Number(selectedCourseId)) : []
  const selectedCourse = selectedCourseId ? getCourseById(Number(selectedCourseId)) : null

  const originalPrice = selectedCourse?.price ?? 0
  const discount = studentType === "ex_aluno" ? originalPrice * EX_ALUNO_DISCOUNT : 0
  const finalPrice = originalPrice - discount

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return mockStudents
    const q = studentSearch.toLowerCase()
    return mockStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.cpf.includes(q)
    )
  }, [studentSearch])

  function resetAll() {
    setStep("choose_type")
    setStudentType(null)
    setSelectedStudent(null)
    setStudentSearch("")
    setSelectedCourseId("")
    setSelectedTurmaId("")
    setNewName("")
    setNewCpf("")
    setNewEmail("")
    setNewWhatsapp("")
    setNewAddress("")
    setSaving(false)
  }

  function handleClose(val: boolean) {
    if (!val) resetAll()
    onOpenChange(val)
  }

  function handleChooseType(type: "novato" | "ex_aluno") {
    setStudentType(type)
    if (type === "ex_aluno") {
      setStep("select_existing")
    } else {
      setStep("new_student_form")
    }
  }

  function handleSelectStudent(student: Student) {
    setSelectedStudent(student)
    setStep("course_payment")
  }

  function handleNewStudentNext(e: React.FormEvent) {
    e.preventDefault()
    setStep("course_payment")
  }

  async function handleFinalize(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fakeApiPost({}, 1500)
    setSaving(false)
    setStep("success")
    setTimeout(() => {
      handleClose(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Matricula</DialogTitle>
          <DialogDescription>
            {step === "choose_type" && "Selecione o tipo de aluno para iniciar a matricula."}
            {step === "select_existing" && "Busque e selecione o aluno ja cadastrado."}
            {step === "new_student_form" && "Preencha os dados do novo aluno."}
            {step === "course_payment" && "Selecione o curso, turma e forma de pagamento."}
            {step === "success" && "Matricula realizada com sucesso!"}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: Choose Type */}
        {step === "choose_type" && (
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleChooseType("novato")}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-background p-6 transition-all hover:border-primary hover:bg-accent"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-7 w-7 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">Aluno Novato</span>
              <span className="text-center text-sm text-muted-foreground">
                Primeiro cadastro no sistema. Preencher todos os dados pessoais.
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleChooseType("ex_aluno")}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-background p-6 transition-all hover:border-primary hover:bg-accent"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <UserCheck className="h-7 w-7 text-green-600" />
              </div>
              <span className="text-lg font-semibold text-foreground">Ex-Aluno</span>
              <span className="text-center text-sm text-muted-foreground">
                Ja possui cadastro. Preco diferenciado com 15% de desconto.
              </span>
              <Badge className="bg-green-100 text-green-700">
                <Percent className="mr-1 h-3 w-3" />
                15% OFF
              </Badge>
            </button>
          </div>
        )}

        {/* STEP 2a: Select Existing Student */}
        {step === "select_existing" && (
          <div className="space-y-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStep("choose_type"); setStudentType(null) }}
              className="mb-2 text-muted-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                className="pl-10"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border p-1">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleSelectStudent(student)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{student.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {student.cpf} - {student.email}
                      </p>
                    </div>
                    <Badge
                      className={student.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                      variant="secondary"
                    >
                      {student.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </button>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum aluno encontrado com essa busca.
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2b: New Student Form */}
        {step === "new_student_form" && (
          <form onSubmit={handleNewStudentNext} className="space-y-4 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setStep("choose_type"); setStudentType(null) }}
              className="mb-2 text-muted-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-name">Nome Completo</Label>
                <Input
                  id="new-name"
                  placeholder="Nome do aluno"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-cpf">CPF</Label>
                <Input
                  id="new-cpf"
                  placeholder="000.000.000-00"
                  value={newCpf}
                  onChange={(e) => setNewCpf(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-email">E-mail</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-whatsapp">WhatsApp</Label>
                <Input
                  id="new-whatsapp"
                  placeholder="(00) 00000-0000"
                  value={newWhatsapp}
                  onChange={(e) => setNewWhatsapp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-address">Endereco</Label>
              <Input
                id="new-address"
                placeholder="Rua, numero, bairro, CEP"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Proximo: Selecionar Curso
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: Course & Payment */}
        {step === "course_payment" && (
          <form onSubmit={handleFinalize} className="space-y-4 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCourseId("")
                setSelectedTurmaId("")
                if (studentType === "ex_aluno") {
                  setStep("select_existing")
                  setSelectedStudent(null)
                } else {
                  setStep("new_student_form")
                }
              }}
              className="mb-2 text-muted-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>

            {/* Selected Student Summary */}
            {studentType === "ex_aluno" && selectedStudent && (
              <div className="flex items-center gap-3 rounded-lg border bg-accent/50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{selectedStudent.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedStudent.cpf} - {selectedStudent.email}</p>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  <Percent className="mr-1 h-3 w-3" />
                  Ex-Aluno
                </Badge>
              </div>
            )}

            {studentType === "novato" && (
              <div className="flex items-center gap-3 rounded-lg border bg-accent/50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {newName.charAt(0) || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{newName || "Novo Aluno"}</p>
                  <p className="text-xs text-muted-foreground">{newCpf} - {newEmail}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">Novato</Badge>
              </div>
            )}

            {/* Course Selection */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Curso</Label>
                <Select
                  value={selectedCourseId}
                  onValueChange={(val) => {
                    setSelectedCourseId(val)
                    setSelectedTurmaId("")
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {publishedCourses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Turma</Label>
                <Select
                  value={selectedTurmaId}
                  onValueChange={setSelectedTurmaId}
                  required
                  disabled={!selectedCourseId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedCourseId
                          ? "Selecione a turma"
                          : "Selecione um curso primeiro"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {turmas.map((turma) => (
                      <SelectItem key={turma.id} value={String(turma.id)}>
                        {turma.name} ({turma.shift})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Display */}
            {selectedCourse && (
              <div className="rounded-lg border bg-background p-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Valor do Curso</p>
                <div className="flex items-center gap-3">
                  {studentType === "ex_aluno" ? (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        R$ {originalPrice.toFixed(2)}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        R$ {finalPrice.toFixed(2)}
                      </span>
                      <Badge className="bg-green-100 text-green-700">-15%</Badge>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-foreground">
                      R$ {originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {studentType === "ex_aluno" && (
                  <p className="mt-1 text-xs text-green-600">
                    Economia de R$ {discount.toFixed(2)} por ser ex-aluno
                  </p>
                )}
              </div>
            )}

            {/* Payment & Type */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de Matricula</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interno">Interno</SelectItem>
                    <SelectItem value="externo">Externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="credito_vista">Credito a Vista</SelectItem>
                    <SelectItem value="credito_parcelado">Credito Parcelado</SelectItem>
                    <SelectItem value="boleto">Boleto Bancario</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Realizar Matricula"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-foreground">Matricula realizada com sucesso!</p>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
              <p className="text-sm font-medium text-green-800">Contrato gerado automaticamente</p>
              <p className="text-xs text-green-600">
                O contrato foi criado com os dados da matricula e pode ser visualizado na secao de Contratos.
              </p>
            </div>
            {studentType === "ex_aluno" && selectedStudent && (
              <p className="text-sm text-muted-foreground">
                {selectedStudent.name} - com desconto de ex-aluno aplicado.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
