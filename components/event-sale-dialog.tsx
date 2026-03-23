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
  Ticket,
  User,
  Mail,
  Phone,
  CreditCard,
  Loader2,
  CheckCircle2,
  Send,
  Search,
  Users as UsersIcon,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
} from "lucide-react"

import { mockStudents, type Student } from "@/lib/mock-data"

interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  price: number
  availableTickets: number
  soldTickets: number
  description: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  events: Event[]
}

const soldTicketsByEvent: Record<number, string[]> = {
  1: ["123.456.789-00", "987.654.321-00"],
  2: ["111.222.333-44"],
  3: [],
}

const applyPhoneMask = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 7) return numbers.replace(/(\d{2})(\d{1,5})/, '($1) $2')
  return numbers.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3')
}

const applyCpfMask = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return numbers.replace(/(\d{3})(\d{1,3})/, '$1.$2')
  if (numbers.length <= 9) return numbers.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function EventSaleDialog({ open, onOpenChange, events }: Props) {
  const [step, setStep] = useState<"select_event" | "select_student" | "new_student" | "payment" | "success">("select_event")
  const [selectedEventId, setSelectedEventId] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentSearch, setStudentSearch] = useState("")
  const [customerType, setCustomerType] = useState<"existing" | "new">("existing")
  
  const [newName, setNewName] = useState("")
  const [newCpf, setNewCpf] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")
  
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit" | "boleto">("pix")
  const [saving, setSaving] = useState(false)
  const [cpfError, setCpfError] = useState("")

  const selectedEvent = events.find(e => String(e.id) === selectedEventId)
  const totalPrice = selectedEvent?.price || 0
  
  const hasCpfPurchased = (cpf: string) => {
    if (!selectedEventId) return false
    const purchasedCpfs = soldTicketsByEvent[Number(selectedEventId)] || []
    return purchasedCpfs.includes(cpf)
  }

  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase()
    return mockStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.cpf.includes(q)
    )
  }, [studentSearch])

  const handleSelectStudent = (student: Student) => {
    if (hasCpfPurchased(student.cpf)) {
      setCpfError(`O CPF ${student.cpf} já possui ingresso para este evento. Cada CPF pode comprar apenas 1 ingresso.`)
      return
    }
    setCpfError("")
    setSelectedStudent(student)
    setStep("payment")
  }

  const handleNewStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (hasCpfPurchased(newCpf)) {
      setCpfError(`O CPF ${newCpf} já possui ingresso para este evento. Cada CPF pode comprar apenas 1 ingresso.`)
      return
    }
    setCpfError("")
    setStep("payment")
  }

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSaving(false)
    setStep("success")
  }

  const resetForm = () => {
    setStep("select_event")
    setSelectedEventId("")
    setSelectedStudent(null)
    setStudentSearch("")
    setCustomerType("existing")
    setNewName("")
    setNewCpf("")
    setNewEmail("")
    setNewPhone("")
    setPaymentMethod("pix")
    setCpfError("")
  }

  const handleClose = (val: boolean) => {
    if (!val) resetForm()
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl p-0 gap-0">
        
        {/* Header */}
        <div className="bg-[#e8491d] p-6 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Venda de Ingresso para Evento
            </DialogTitle>
            <DialogDescription className="text-orange-100">
              Venda ingressos para eventos e workshops
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {/* Step 1: Selecionar Evento */}
          {step === "select_event" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Ticket className="h-5 w-5 text-[#e8491d]" />
                  <h3 className="text-lg font-semibold text-gray-900">Selecione o Evento</h3>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Evento</Label>
                  <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger className="border-gray-200 focus:border-[#e8491d] cursor-pointer">
                      <SelectValue placeholder="Selecione um evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={String(event.id)} className="cursor-pointer">
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <span className="font-medium">{event.title}</span>
                              <p className="text-xs text-gray-500">{event.date} • {event.time}</p>
                            </div>
                            <span className="text-sm font-bold text-[#e8491d]">
                              {formatCurrency(event.price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEvent && (
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Ingressos disponíveis:</span>
                      <Badge className="bg-orange-100 text-[#e8491d]">
                        {selectedEvent.availableTickets - selectedEvent.soldTickets} vagas
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valor do ingresso:</span>
                      <span className="text-xl font-bold text-[#e8491d]">
                        {formatCurrency(selectedEvent.price)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => handleClose(false)}
                  className="hover:bg-orange-50 hover:text-[#e8491d] cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setStep("select_student")}
                  disabled={!selectedEventId}
                  className="bg-[#e8491d] hover:bg-[#d43d15] text-white px-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  Continuar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Selecionar Aluno */}
          {step === "select_student" && (
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                onClick={() => setStep("select_event")} 
                className="mb-2 hover:bg-orange-50 hover:text-[#e8491d] cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>

              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  onClick={() => setCustomerType("existing")}
                  className={`flex-1 transition-all duration-300 cursor-pointer ${
                    customerType === "existing"
                      ? "bg-[#e8491d] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Aluno Cadastrado
                </Button>
                <Button
                  type="button"
                  onClick={() => setCustomerType("new")}
                  className={`flex-1 transition-all duration-300 cursor-pointer ${
                    customerType === "new"
                      ? "bg-[#e8491d] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <User className="h-4 w-4 mr-2" />
                  Novo Aluno
                </Button>
              </div>

              {customerType === "existing" && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      className="pl-10 border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d]"
                      placeholder="Buscar por nome, email ou CPF..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredStudents.map((s) => {
                      const alreadyPurchased = hasCpfPurchased(s.cpf)
                      return (
                        <button
                          key={s.id}
                          onClick={() => !alreadyPurchased && handleSelectStudent(s)}
                          disabled={alreadyPurchased}
                          className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 text-left ${
                            alreadyPurchased
                              ? "border-red-200 bg-red-50 opacity-60 cursor-not-allowed"
                              : "border-gray-200 hover:border-[#e8491d] hover:bg-orange-50 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                          }`}
                        >
                          <div className="h-12 w-12 rounded-full bg-[#e8491d] flex items-center justify-center font-bold text-white">
                            {s.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{s.name}</p>
                            <p className="text-sm text-gray-500">{s.email}</p>
                            <p className="text-xs text-gray-400">{s.cpf}</p>
                          </div>
                          {alreadyPurchased && (
                            <Badge className="bg-red-100 text-red-700">
                              Já comprou
                            </Badge>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {customerType === "new" && (
                <form onSubmit={handleNewStudentSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Nome completo</Label>
                      <Input
                        placeholder="Digite o nome completo"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        className="border-gray-200 focus:border-[#e8491d]"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">CPF</Label>
                      <Input
                        placeholder="000.000.000-00"
                        value={newCpf}
                        onChange={(e) => setNewCpf(applyCpfMask(e.target.value))}
                        required
                        className="border-gray-200 focus:border-[#e8491d]"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Email</Label>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                        className="border-gray-200 focus:border-[#e8491d]"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">WhatsApp</Label>
                      <Input
                        placeholder="(00) 00000-0000"
                        value={newPhone}
                        onChange={(e) => setNewPhone(applyPhoneMask(e.target.value))}
                        required
                        className="border-gray-200 focus:border-[#e8491d]"
                      />
                    </div>
                  </div>

                  {cpfError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{cpfError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!newName || !newCpf || !newEmail || !newPhone}
                    className="w-full bg-[#e8491d] hover:bg-[#d43d15] text-white transition-all duration-300 cursor-pointer"
                  >
                    Continuar para pagamento
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Step 3: Pagamento */}
          {step === "payment" && (
            <form onSubmit={handleFinalize} className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-[#e8491d]" />
                  <h3 className="text-lg font-semibold text-gray-900">Forma de Pagamento</h3>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "pix" 
                        ? "border-[#e8491d] bg-orange-50" 
                        : "border-gray-200 hover:border-[#e8491d]"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-xl">💰</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">PIX</p>
                      <p className="text-sm text-gray-500">Pagamento instantâneo</p>
                    </div>
                    {paymentMethod === "pix" && (
                      <div className="h-5 w-5 rounded-full bg-[#e8491d] animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("credit")}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "credit" 
                        ? "border-[#e8491d] bg-orange-50" 
                        : "border-gray-200 hover:border-[#e8491d]"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-[#e8491d]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Cartão de Crédito</p>
                      <p className="text-sm text-gray-500">Pagamento à vista</p>
                    </div>
                    {paymentMethod === "credit" && (
                      <div className="h-5 w-5 rounded-full bg-[#e8491d] animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("boleto")}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "boleto" 
                        ? "border-[#e8491d] bg-orange-50" 
                        : "border-gray-200 hover:border-[#e8491d]"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-xl">📄</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Boleto Bancário</p>
                      <p className="text-sm text-gray-500">Vencimento em 3 dias</p>
                    </div>
                    {paymentMethod === "boleto" && (
                      <div className="h-5 w-5 rounded-full bg-[#e8491d] animate-pulse" />
                    )}
                  </button>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Evento:</span>
                    <span className="font-medium">{selectedEvent?.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Valor:</span>
                    <span className="text-2xl font-bold text-[#e8491d]">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => setStep("select_student")}
                  className="hover:bg-orange-50 hover:text-[#e8491d] cursor-pointer"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#e8491d] hover:bg-[#d43d15] text-white px-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  {saving ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                  {saving ? "Processando..." : "Confirmar e Enviar Ingresso"}
                </Button>
              </div>
            </form>
          )}

          {/* Step 4: Sucesso */}
          {step === "success" && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-6 animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-[#e8491d]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Venda realizada com sucesso!
              </h2>
              <div className="bg-orange-50 rounded-lg p-4 mb-6 text-left">
                <p className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <Send className="h-4 w-4 text-[#e8491d]" />
                  Ingresso enviado por e-mail
                </p>
                <p className="text-sm text-gray-600">
                  O ingresso foi enviado para {customerType === "existing" ? selectedStudent?.email : newEmail}. 
                  Por favor, verifique a caixa de entrada e o spam.
                </p>
              </div>
              <Button 
                onClick={() => handleClose(false)}
                className="bg-[#e8491d] hover:bg-[#d43d15] text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
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