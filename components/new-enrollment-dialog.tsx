"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"

import { api, type ApiStudent, type ApiCourse, type ApiCareer, type ApiTurma, type ApiEnrollment, type ApiCity } from "@/lib/api"
import { isValidCpf } from "@/lib/cpf"
import { CityCombobox } from "@/components/city-combobox"

// ─── ViaCEP ──────────────────────────────────────────────────
interface ViaCepResponse {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  ibge?: string
  erro?: boolean
}

import {
  Loader2,
  UserPlus,
  UserCheck,
  Search,
  ArrowLeft,
  Percent,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Instagram,
  CreditCard,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Briefcase,
  BookOpen,
  Users,
  Monitor,
  Building2,
  AlertCircle,
  FileText,
  Send,
  CalendarDays,
  Bell,
  CreditCard as CreditCardIcon,
  Timer,
} from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (enrollment: ApiEnrollment) => void
}

type Step =
  | "choose_type"
  | "select_existing"
  | "new_student_form"
  | "course_payment"
  | "payment_method"
  | "success"

type PaymentMethodType = "credit" | "debit" | "pix" | "boleto" | "prazo"

const EX_ALUNO_DISCOUNT = 0.15

// Mask functions
const applyCpfMask = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return numbers.replace(/(\d{3})(\d{1,3})/, '$1.$2')
  if (numbers.length <= 9) return numbers.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
}

const applyPhoneMask = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 7) return numbers.replace(/(\d{2})(\d{1,5})/, '($1) $2')
  return numbers.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3')
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string) {
  const d = phone.replace(/\D/g, '')
  return d.length === 10 || d.length === 11
}

function fieldCls(value: string, valid: boolean): string {
  if (!value) return "border-gray-200 dark:border-gray-600 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
  return valid
    ? "border-green-500 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
    : "border-red-500 focus:border-red-500 focus:ring-red-500 transition-all duration-300"
}

const applyCepMask = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 5) return numbers
  return numbers.replace(/(\d{5})(\d{1,3})/, '$1-$2')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função para simular envio de contrato por email
const sendContractByEmail = async (studentData: any, enrollmentData: any, paymentDeadline?: Date) => {
  // Simula o envio do contrato
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const deadlineText = paymentDeadline 
    ? format(paymentDeadline, "dd/MM/yyyy", { locale: ptBR })
    : "Pagamento à vista"
  
  console.log('📧 Contrato enviado para:', studentData.email)
  console.log('📄 Dados do contrato:', {
    aluno: studentData.name,
    curso: enrollmentData.course?.title,
    turma: enrollmentData.turma?.name,
    modalidade: enrollmentData.modality,
    valor: formatCurrency(enrollmentData.finalPrice),
    forma_pagamento: enrollmentData.paymentMethod === 'prazo' ? 'Pagamento a Prazo' : 
                     enrollmentData.paymentMethod === 'credit' ? 'Cartão de Crédito' :
                     enrollmentData.paymentMethod === 'debit' ? 'Cartão de Débito' :
                     enrollmentData.paymentMethod === 'pix' ? 'PIX' : 'Boleto',
    prazo_pagamento: deadlineText,
    data_matricula: new Date().toLocaleDateString('pt-BR'),
    contrato_url: 'https://seusistema.com.br/contratos/12345.pdf'
  })
  
  return true
}

// Função para criar notificação
const createNotification = async (studentData: any, enrollmentData: any, paymentDeadline?: Date) => {
  if (paymentDeadline) {
    // Notificação para o aluno
    console.log(`🔔 Notificação agendada para ${format(paymentDeadline, "dd/MM/yyyy HH:mm")}: 
      Lembrete de pagamento para ${studentData.name} - Curso: ${enrollmentData.course?.title}
      Valor: ${formatCurrency(enrollmentData.finalPrice)}`)
    
    // Notificação para o financeiro
    console.log(`💰 Notificação para o financeiro: 
      Pagamento pendente de ${studentData.name} - Vence em ${format(paymentDeadline, "dd/MM/yyyy")}
      Contato: ${studentData.email} | ${studentData.whatsapp}`)
  }
  return true
}

export function NewEnrollmentDialog({ open, onOpenChange, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("choose_type")
  const [studentType, setStudentType] = useState<"novato" | "ex_aluno" | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<ApiStudent | null>(null)
  const [studentSearch, setStudentSearch] = useState("")

  // Dados reais da API
  const [allStudents, setAllStudents] = useState<ApiStudent[]>([])
  const [allCourses, setAllCourses] = useState<ApiCourse[]>([])
  const [allCareers, setAllCareers] = useState<ApiCareer[]>([])
  const [allTurmas, setAllTurmas] = useState<ApiTurma[]>([])

  useEffect(() => {
    if (!open) return
    Promise.all([
      api.students.list(),
      api.courses.list(),
      api.careers.list(),
      api.turmas.list(),
    ]).then(([s, c, ca, t]) => {
      setAllStudents(s)
      setAllCourses(c)
      setAllCareers(ca)
      setAllTurmas(t)
    }).catch(console.error)
  }, [open])

  const [selectedCareerId, setSelectedCareerId] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [selectedModality, setSelectedModality] = useState("")
  const [selectedTurmaId, setSelectedTurmaId] = useState("")

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [newName, setNewName] = useState("")
  const [newCpf, setNewCpf] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newWhatsapp, setNewWhatsapp] = useState("")
  const [newInstagram, setNewInstagram] = useState("")

  const [rua, setRua] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cep, setCep] = useState("")
  const [selectedCity, setSelectedCity] = useState<ApiCity | null>(null)
  const [cepLoading, setCepLoading] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("pix")
  const [installments, setInstallments] = useState(1)
  const [paymentDeadline, setPaymentDeadline] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Filter courses by selected career
  const coursesByCareer = useMemo(() => {
    if (!selectedCareerId) return []
    return allCourses.filter((c) =>
      c.career_id === Number(selectedCareerId) && c.status === "published"
    )
  }, [selectedCareerId, allCourses])

  // Filter turmas based on modality and course
  const filteredTurmas = useMemo(() => {
    if (!selectedCourseId || selectedModality === "online") return []
    return allTurmas.filter(
      (t) => t.course_id === Number(selectedCourseId) && t.enrolled_count < t.max_students
    )
  }, [selectedCourseId, selectedModality, allTurmas])

  const selectedCourse = selectedCourseId ? allCourses.find((c) => c.id === Number(selectedCourseId)) ?? null : null
  const selectedTurma = selectedTurmaId ? filteredTurmas.find((t) => String(t.id) === selectedTurmaId) ?? null : null

  const originalPrice = selectedCourse?.price ?? 0
  const discount = studentType === "ex_aluno" ? originalPrice * EX_ALUNO_DISCOUNT : 0
  const finalPrice = originalPrice - discount

  const installmentPrice = finalPrice / installments

  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase()
    return allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.cpf.includes(q)
    )
  }, [studentSearch, allStudents])

  async function handleCepChange(value: string) {
    const masked = applyCepMask(value)
    setCep(masked)
    const digits = value.replace(/\D/g, "")
    if (digits.length === 8) {
      setCepLoading(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
        const data: ViaCepResponse = await res.json()
        if (!data.erro) {
          if (data.logradouro) setRua(data.logradouro)
          if (data.bairro) setBairro(data.bairro)
          // Busca a cidade no banco pelo nome + UF retornados pelo ViaCEP
          if (data.localidade && data.uf) {
            const cities = await api.cities.list({ q: data.localidade, state: data.uf })
            const found = cities.find(
              (c) => c.name.toLowerCase() === data.localidade!.toLowerCase() && c.state === data.uf
            )
            if (found) setSelectedCity(found)
          }
        }
      } catch { /* ignora erro de rede */ }
      finally { setCepLoading(false) }
    }
  }

  const handleModalityChange = (value: string) => {
    setSelectedModality(value)
    setSelectedTurmaId("")
  }

  const handleCareerChange = (value: string) => {
    setSelectedCareerId(value)
    setSelectedCourseId("")
    setSelectedModality("")
    setSelectedTurmaId("")
  }

  const handleCourseChange = (value: string) => {
    setSelectedCourseId(value)
    setSelectedTurmaId("")
    // Trava a modalidade automaticamente pelo access_type do curso
    const course = allCourses.find((c) => c.id === Number(value))
    if (course?.access_type) {
      setSelectedModality(course.access_type)
    } else {
      setSelectedModality("")
    }
  }

  function resetAll() {
    setStep("choose_type")
    setStudentType(null)
    setSelectedStudent(null)
    setStudentSearch("")
    setSelectedCareerId("")
    setSelectedCourseId("")
    setSelectedModality("")
    setSelectedTurmaId("")
    setNewName("")
    setNewCpf("")
    setNewEmail("")
    setNewWhatsapp("")
    setNewInstagram("")
    setRua("")
    setNumero("")
    setComplemento("")
    setBairro("")
    setCep("")
    setSelectedCity(null)
    setPaymentMethod("pix")
    setInstallments(1)
    setPaymentDeadline(undefined)
    setCalendarOpen(false)
  }

  function handleClose(val: boolean) {
    if (!val) { resetAll(); setFormError(null) }
    onOpenChange(val)
  }

  async function handleFinalize(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    // Validação frontend para aluno novo (dupla verificação antes de enviar)
    if (studentType === "novato") {
      if (!isValidCpf(newCpf)) {
        setFormError("CPF inválido. Verifique os dígitos e tente novamente.")
        return
      }
      const phoneDigits = newWhatsapp.replace(/\D/g, "")
      if (phoneDigits.length > 0 && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
        setFormError("WhatsApp inválido. Digite DDD + número (10 ou 11 dígitos).")
        return
      }
    }

    setSaving(true)

    const paymentMethodMap: Record<PaymentMethodType, string> = {
      credit: "credito_parcelado",
      debit: "credito_vista",
      pix: "pix",
      boleto: "boleto",
      prazo: "boleto",
    }

    try {
      let studentId: number

      if (studentType === "novato") {
        const newStudent = await api.students.create({
          name: newName,
          email: newEmail,
          cpf: newCpf.replace(/\D/g, ""),
          whatsapp: newWhatsapp.replace(/\D/g, "") || undefined,
          instagram: newInstagram || undefined,
          street: rua || undefined,
          address_number: numero || undefined,
          address_complement: complemento || undefined,
          neighborhood: bairro || undefined,
          cep: cep.replace(/\D/g, "") || undefined,
          city_id: selectedCity?.id ?? undefined,
          active: true,
        })
        studentId = newStudent.id
      } else {
        studentId = selectedStudent!.id
      }

      const enrollment = await api.enrollments.create({
        student_id: studentId,
        course_id: Number(selectedCourseId),
        turma_id: selectedTurmaId ? Number(selectedTurmaId) : undefined,
        status: "active",
        started_at: new Date().toISOString(),
        payment_method: paymentMethodMap[paymentMethod],
        total_paid: finalPrice,
        expires_at: paymentDeadline?.toISOString(),
        enrollment_type: selectedModality,
      })

      onSuccess?.(enrollment)
      setSaving(false)
      setStep("success")
    } catch (error) {
      console.error("Erro ao finalizar matrícula:", error)
      setSaving(false)
      setFormError(error instanceof Error ? error.message : "Erro ao processar matrícula. Tente novamente.")
    }
  }

  function handleNewStudentSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!isValidCpf(newCpf)) {
      setFormError("CPF inválido. Verifique os dígitos e tente novamente.")
      return
    }
    const phoneDigits = newWhatsapp.replace(/\D/g, "")
    if (phoneDigits.length > 0 && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      setFormError("WhatsApp inválido. Digite DDD + número (10 ou 11 dígitos).")
      return
    }
    setStep("course_payment")
  }

  function handleCourseSelection(e: React.FormEvent) {
    e.preventDefault()
    if (selectedCareerId && selectedCourseId && selectedModality) {
      if (selectedModality === "online") {
        setStep("payment_method")
      } else if (selectedModality !== "online" && selectedTurmaId) {
        setStep("payment_method")
      }
    }
  }

  const isCourseSelectionComplete = () => {
    if (!selectedCareerId || !selectedCourseId || !selectedModality) return false
    if (selectedModality === "online") return true
    return !!selectedTurmaId
  }

  const isPaymentMethodValid = () => {
    if (paymentMethod === "prazo") {
      return !!paymentDeadline
    }
    return true
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl p-0 gap-0">
        
        <div className="bg-gradient-to-r from-[#e8491d] to-[#f97316] p-6 rounded-t-lg sticky top-0 z-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Nova Matrícula
            </DialogTitle>
            <DialogDescription className="text-orange-100">
              Complete o processo de matrícula em poucos passos
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {/* STEP 1 - Choose Type */}
          {step === "choose_type" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => {
                    setStudentType("novato")
                    setStep("new_student_form")
                  }}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:bg-gray-800 p-6 transition-all duration-300 hover:border-[#e8491d] hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e8491d] to-[#f97316] opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3 text-[#e8491d] transition-all duration-300 group-hover:bg-[#e8491d] group-hover:text-white group-hover:scale-110">
                      <UserPlus className="h-8 w-8" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Aluno Novo</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cadastre um novo aluno</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setStudentType("ex_aluno")
                    setStep("select_existing")
                  }}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:bg-gray-800 p-6 transition-all duration-300 hover:border-[#e8491d] hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e8491d] to-[#f97316] opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3 text-[#e8491d] transition-all duration-300 group-hover:bg-[#e8491d] group-hover:text-white group-hover:scale-110">
                      <UserCheck className="h-8 w-8" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Ex-Aluno</span>
                    <Badge className="bg-orange-100 text-[#e8491d] border-orange-200">
                      <Percent className="h-3 w-3 mr-1" />
                      15% OFF
                    </Badge>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 - Select Existing Student */}
          {step === "select_existing" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10 border-gray-200 dark:border-gray-600 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  placeholder="Buscar por nome, email ou CPF..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedStudent(s)
                        setStep("course_payment")
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all duration-300 hover:border-[#e8491d] hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-md hover:-translate-y-0.5 text-left cursor-pointer group"
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#e8491d] to-[#f97316] flex items-center justify-center font-bold text-white">
                        {s.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{s.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{s.email}</p>
                        <p className="text-xs text-gray-400">{s.cpf}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#e8491d] transition-all duration-300" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Nenhum aluno encontrado
                  </div>
                )}
              </div>

              <Button 
                variant="ghost" 
                onClick={() => setStep("choose_type")} 
                className="hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-[#e8491d] transition-all duration-300 cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          )}

          {/* STEP 3 - New Student Form */}
          {step === "new_student_form" && (
            <form onSubmit={handleNewStudentSubmit} className="space-y-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 space-y-4 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-[#e8491d] to-[#f97316] rounded-full" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dados Pessoais</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Nome completo</Label>
                    <Input 
                      placeholder="Digite o nome completo" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">CPF *</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={newCpf}
                      onChange={(e) => { setNewCpf(applyCpfMask(e.target.value)); setFormError(null) }}
                      className={fieldCls(newCpf, isValidCpf(newCpf))}
                      inputMode="numeric"
                      maxLength={14}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Email *</Label>
                    <Input
                      placeholder="email@exemplo.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className={fieldCls(newEmail, isValidEmail(newEmail))}
                      required
                      type="email"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">WhatsApp</Label>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={newWhatsapp}
                      onChange={(e) => { setNewWhatsapp(applyPhoneMask(e.target.value)); setFormError(null) }}
                      className={fieldCls(newWhatsapp, isValidPhone(newWhatsapp))}
                      inputMode="numeric"
                      maxLength={15}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Instagram</Label>
                    <Input 
                      placeholder="@usuario" 
                      value={newInstagram} 
                      onChange={(e) => setNewInstagram(e.target.value)}
                      className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 space-y-4 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-[#e8491d] to-[#f97316] rounded-full" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Endereço</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* CEP — primeiro para preencher os demais automaticamente */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      CEP
                      {cepLoading && <Loader2 className="h-3 w-3 animate-spin text-[#e8491d]" />}
                    </Label>
                    <Input
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      maxLength={9}
                      className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                    />
                    {cep.replace(/\D/g, "").length === 8 && !cepLoading && !selectedCity && (
                      <p className="text-xs text-amber-600 mt-1">CEP não encontrado. Preencha manualmente.</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Rua</Label>
                    <Input
                      placeholder="Nome da rua"
                      value={rua}
                      onChange={(e) => setRua(e.target.value)}
                      className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Número</Label>
                    <Input
                      placeholder="Número"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Complemento</Label>
                    <Input
                      placeholder="Apto, bloco, etc."
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Bairro</Label>
                    <Input
                      placeholder="Bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium mb-2 block">Cidade</Label>
                    <CityCombobox
                      value={selectedCity?.id ?? null}
                      onChange={(city) => setSelectedCity(city)}
                      stateFilter={selectedCity?.state}
                      placeholder="Buscar cidade..."
                    />
                    {!selectedCity && cep.replace(/\D/g, "").length === 8 && !cepLoading && (
                      <p className="text-xs text-amber-600 mt-1">
                        Cidade não encontrada automaticamente. Busque manualmente.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep("choose_type")} 
                  className="hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-[#e8491d] transition-all duration-300 cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#e8491d] to-[#f97316] hover:from-[#d43d15] hover:to-[#e86a0f] text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  Continuar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              {formError && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {formError}
                </div>
              )}
            </form>
          )}

          {/* STEP 4 - Course Selection */}
          {step === "course_payment" && (
            <form onSubmit={handleCourseSelection} className="space-y-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 space-y-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-[#e8491d]" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seleção de Curso</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-[#e8491d]" />
                      Carreira
                    </Label>
                    <Select value={selectedCareerId} onValueChange={handleCareerChange}>
                      <SelectTrigger className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300 cursor-pointer">
                        <SelectValue placeholder="Selecione uma carreira" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCareers.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)} className="cursor-pointer">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#e8491d]" />
                      Curso
                    </Label>
                    <Select
                      value={selectedCourseId}
                      onValueChange={handleCourseChange}
                      disabled={!selectedCareerId}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300 cursor-pointer disabled:opacity-50">
                        <SelectValue placeholder={selectedCareerId ? "Selecione um curso" : "Selecione uma carreira primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {coursesByCareer.length > 0 ? (
                          coursesByCareer.map((c) => {
                            const modalityBadge: Record<string, { label: string; cls: string }> = {
                              presencial: { label: "Presencial", cls: "bg-amber-100 text-amber-700" },
                              online:     { label: "Online",    cls: "bg-blue-100 text-blue-700" },
                              hibrido:    { label: "Híbrido",   cls: "bg-violet-100 text-violet-700" },
                            }
                            const badge = modalityBadge[c.access_type]
                            return (
                              <SelectItem key={c.id} value={String(c.id)} className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <span>{c.title}</span>
                                  {badge && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badge.cls}`}>
                                      {badge.label}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            )
                          })
                        ) : (
                          <div className="p-2 text-center text-gray-500 text-sm">
                            Nenhum curso disponível
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-[#e8491d]" />
                      Modalidade
                    </Label>
                    {/* Travada — definida automaticamente pelo access_type do curso */}
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                      selectedModality
                        ? selectedModality === "presencial"
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : selectedModality === "online"
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-violet-300 bg-violet-50 text-violet-700"
                        : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                    }`}>
                      {selectedModality === "presencial" && <Building2 className="h-4 w-4 shrink-0" />}
                      {selectedModality === "online"     && <Monitor   className="h-4 w-4 shrink-0" />}
                      {selectedModality === "hibrido"    && <Users     className="h-4 w-4 shrink-0" />}
                      {!selectedModality                 && <Monitor   className="h-4 w-4 shrink-0 opacity-40" />}
                      <span className="font-medium">
                        {selectedModality === "presencial" ? "Presencial" :
                         selectedModality === "online"     ? "Online" :
                         selectedModality === "hibrido"    ? "Híbrido" :
                         "Definido pelo curso"}
                      </span>
                      {selectedModality && (
                        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide opacity-60">
                          automático
                        </span>
                      )}
                    </div>
                    {selectedModality === "online" && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Cursos online não possuem turmas
                      </p>
                    )}
                  </div>

                  {selectedModality && selectedModality !== "online" && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#e8491d]" />
                        Turma
                      </Label>
                      <Select 
                        value={selectedTurmaId} 
                        onValueChange={setSelectedTurmaId}
                        disabled={!selectedCourseId || !selectedModality}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300 cursor-pointer disabled:opacity-50">
                          <SelectValue placeholder={selectedCourseId ? "Selecione uma turma" : "Selecione um curso primeiro"} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredTurmas.length > 0 ? (
                            filteredTurmas.map((t) => (
                              <SelectItem key={t.id} value={String(t.id)} className="cursor-pointer">
                                <div className="flex justify-between items-center w-full">
                                  <span>{t.name}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {t.max_students - t.enrolled_count} vagas
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-gray-500 text-sm">
                              Nenhuma turma disponível
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {selectedCourse && isCourseSelectionComplete() && (
                <div className="rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 border border-orange-200 dark:border-orange-800 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#e8491d]" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Resumo da Matrícula</p>
                    </div>
                    {studentType === "ex_aluno" && (
                      <Badge className="bg-orange-200 text-[#e8491d] border-orange-300">
                        <Percent className="h-3 w-3 mr-1" />
                        15% OFF Ex-Aluno
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(finalPrice)}
                    </p>
                    {discount > 0 && (
                      <p className="text-sm text-gray-500 line-through">
                        De {formatCurrency(originalPrice)}
                      </p>
                    )}
                    <div className="text-sm text-gray-600 mt-2 pt-2 border-t border-orange-200 dark:border-orange-800 dark:border-orange-800 space-y-1">
                      <p className="flex items-center gap-2">
                        <Briefcase className="h-3 w-3" />
                        Carreira: {allCareers.find(c => String(c.id) === selectedCareerId)?.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <BookOpen className="h-3 w-3" />
                        Curso: {selectedCourse.title}
                      </p>
                      <p className="flex items-center gap-2">
                        <Monitor className="h-3 w-3" />
                        Modalidade: {selectedModality === 'presencial' ? 'Presencial' : selectedModality === 'online' ? 'Online' : 'Híbrido'}
                      </p>
                      {selectedModality !== "online" && selectedTurma && (
                        <p className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          Turma: {selectedTurma.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(studentType === "novato" ? "new_student_form" : "select_existing")} 
                  className="hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-[#e8491d] transition-all duration-300 cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isCourseSelectionComplete()}
                  className="bg-gradient-to-r from-[#e8491d] to-[#f97316] hover:from-[#d43d15] hover:to-[#e86a0f] text-white px-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  Avançar para Pagamento
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 5 - Payment Method */}
          {step === "payment_method" && (
            <form onSubmit={handleFinalize} className="space-y-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 space-y-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-[#e8491d]" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Forma de Pagamento</h3>
                </div>

                <div className="grid gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("pix")
                      setPaymentDeadline(undefined)
                    }}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "pix" 
                        ? "border-[#e8491d] bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-[#e8491d] hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <div className="text-2xl">💰</div>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">PIX</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pagamento instantâneo com desconto</p>
                    </div>
                    {paymentMethod === "pix" && (
                      <div className="h-5 w-5 rounded-full bg-[#e8491d] animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("credit")
                      setPaymentDeadline(undefined)
                    }}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "credit" 
                        ? "border-[#e8491d] bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-[#e8491d] hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <CreditCardIcon className="h-6 w-6 text-[#e8491d]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Cartão de Crédito</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Parcele em até 12x</p>
                    </div>
                    {paymentMethod === "credit" && (
                      <div className="h-5 w-5 rounded-full bg-[#e8491d] animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("debit")
                      setPaymentDeadline(undefined)
                    }}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "debit" 
                        ? "border-[#e8491d] bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-[#e8491d] hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <CreditCardIcon className="h-6 w-6 text-[#e8491d]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Cartão de Débito</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pagamento à vista</p>
                    </div>
                    {paymentMethod === "debit" && (
                      <div className="h-5 w-5 rounded-full bg-[#e8491d] animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("boleto")
                      setPaymentDeadline(undefined)
                    }}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "boleto" 
                        ? "border-[#e8491d] bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-[#e8491d] hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <div className="text-2xl">📄</div>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Boleto Bancário</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Vencimento em 3 dias úteis</p>
                    </div>
                    {paymentMethod === "boleto" && (
                      <div className="h-5 w-5 rounded-full bg-[#e8491d] animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("prazo")
                      if (!paymentDeadline) {
                        setPaymentDeadline(addDays(new Date(), 30))
                      }
                    }}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "prazo" 
                        ? "border-[#e8491d] bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-[#e8491d] hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Timer className="h-6 w-6 text-[#e8491d]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Pagamento a Prazo</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Selecione a data de vencimento</p>
                    </div>
                    {paymentMethod === "prazo" && (
                      <div className="h-5 w-5 rounded-full bg-[#e8491d] animate-pulse" />
                    )}
                  </button>
                </div>

                {paymentMethod === "credit" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Label className="text-sm font-medium mb-2 block">Número de Parcelas</Label>
                    <Select value={String(installments)} onValueChange={(v) => setInstallments(Number(v))}>
                      <SelectTrigger className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300 cursor-pointer">
                        <SelectValue placeholder="Selecione as parcelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                          <SelectItem key={num} value={String(num)} className="cursor-pointer">
                            {num}x de {formatCurrency(installmentPrice)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {paymentMethod === "prazo" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#e8491d]" />
                      Data de Vencimento
                    </Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-gray-200 hover:border-[#e8491d] transition-all duration-300 cursor-pointer"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {paymentDeadline ? (
                            format(paymentDeadline, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione a data de vencimento</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={paymentDeadline}
                          onSelect={(date) => {
                            setPaymentDeadline(date)
                            setCalendarOpen(false)
                          }}
                          disabled={(date) => date < new Date()}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {paymentDeadline && (
                      <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Bell className="h-4 w-4 text-[#e8491d]" />
                          <span>
                            Notificações serão enviadas para o aluno e financeiro 
                            {paymentDeadline && ` em ${format(paymentDeadline, "dd/MM/yyyy", { locale: ptBR })}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Valor total:</span>
                    <span className="text-2xl font-bold text-[#e8491d]">{formatCurrency(finalPrice)}</span>
                  </div>
                  {paymentMethod === "credit" && installments > 1 && (
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>{installments}x de {formatCurrency(installmentPrice)}</span>
                      <span>sem juros</span>
                    </div>
                  )}
                  {paymentMethod === "prazo" && paymentDeadline && (
                    <div className="flex justify-between items-center text-sm text-gray-500 mt-2 pt-2 border-t border-orange-200 dark:border-orange-800">
                      <span>Vencimento:</span>
                      <span className="font-medium text-[#e8491d]">
                        {format(paymentDeadline, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep("course_payment")} 
                  className="hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-[#e8491d] transition-all duration-300 cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !isPaymentMethodValid()}
                  className="bg-gradient-to-r from-[#e8491d] to-[#f97316] hover:from-[#d43d15] hover:to-[#e86a0f] text-white px-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                  {saving ? "Processando..." : "Confirmar e Enviar Contrato"}
                </Button>
              </div>
              {formError && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {formError}
                </div>
              )}
            </form>
          )}

          {/* STEP 6 - Success */}
          {step === "success" && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-6 animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-[#e8491d]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Matrícula realizada com sucesso!
              </h2>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-6 text-left space-y-2">
                <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Send className="h-4 w-4 text-[#e8491d]" />
                  Contrato enviado por e-mail
                </p>
                {paymentMethod === "prazo" && paymentDeadline && (
                  <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Bell className="h-4 w-4 text-[#e8491d]" />
                    Notificação agendada para {format(paymentDeadline, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Um contrato foi enviado para o e-mail do aluno com todos os detalhes da matrícula.
                  {paymentMethod === "prazo" && " O sistema enviará lembretes automáticos na data de vencimento."}
                  Por favor, verifique a caixa de entrada e o spam.
                </p>
              </div>
              <Button 
                onClick={() => handleClose(false)}
                className="bg-gradient-to-r from-[#e8491d] to-[#f97316] hover:from-[#d43d15] hover:to-[#e86a0f] text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}