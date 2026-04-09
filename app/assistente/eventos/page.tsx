"use client"

import { useEffect, useState, useMemo } from "react"
import { api, type ApiEvent, type ApiEventRegistration, type ApiStudent } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  CalendarDays, Clock, MapPin, Loader2, Users, Tag, Layers,
  UserPlus, UserCheck, Percent, Search, ArrowLeft, ChevronRight,
  CheckCircle2, Ticket,
} from "lucide-react"

// Máscaras
const applyCpfMask = (v: string) => {
  const n = v.replace(/\D/g, "")
  if (n.length <= 3) return n
  if (n.length <= 6) return n.replace(/(\d{3})(\d{1,3})/, "$1.$2")
  if (n.length <= 9) return n.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3")
  return n.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4")
}
const applyPhoneMask = (v: string) => {
  const n = v.replace(/\D/g, "")
  if (n.length <= 2) return n
  if (n.length <= 7) return n.replace(/(\d{2})(\d{1,5})/, "($1) $2")
  return n.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3")
}

type Step = "choose_type" | "new_student_form" | "select_existing" | "success"

const STATUS_LABELS: Record<string, string> = {
  agendado: "Agendado", em_andamento: "Em Andamento", concluido: "Concluído", cancelado: "Cancelado",
}
const STATUS_COLORS: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700",
  em_andamento: "bg-yellow-100 text-yellow-700",
  concluido: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
}

export default function AssistenteEventosPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [students, setStudents] = useState<ApiStudent[]>([])
  const [search, setSearch] = useState("")

  // Modal state
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null)
  const [step, setStep] = useState<Step>("choose_type")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successReg, setSuccessReg] = useState<ApiEventRegistration | null>(null)

  // Novo aluno
  const [newName, setNewName] = useState("")
  const [newCpf, setNewCpf] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newWhatsapp, setNewWhatsapp] = useState("")
  const [newInstagram, setNewInstagram] = useState("")

  // Ex-aluno
  const [studentSearch, setStudentSearch] = useState("")

  useEffect(() => {
    Promise.all([api.events.list(), api.students.list()])
      .then(([evs, studs]) => {
        // Apenas aulões não cancelados e não esgotados
        setEvents(evs.filter((e) => e.event_type === "aulao" && e.status !== "cancelado" && !e.is_full))
        setStudents(studs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.location ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const filteredStudents = useMemo(() =>
    students.filter((s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.cpf.includes(studentSearch)
    ), [students, studentSearch])

  function openModal(ev: ApiEvent) {
    setSelectedEvent(ev)
    setStep("choose_type")
    setError("")
    setSuccessReg(null)
    setNewName(""); setNewCpf(""); setNewEmail(""); setNewWhatsapp(""); setNewInstagram("")
    setStudentSearch("")
  }

  function closeModal() {
    setSelectedEvent(null)
  }

  async function enroll(studentId: number) {
    if (!selectedEvent) return
    setSaving(true); setError("")
    const ingressoWin = window.open("", "_blank")
    try {
      const reg = await api.events.registrations.create(selectedEvent.id, studentId)
      setSuccessReg(reg)
      setStep("success")
      // Atualiza contagem local
      setEvents((prev) => prev.map((e) =>
        e.id === selectedEvent.id
          ? { ...e, registered_count: e.registered_count + 1, is_full: e.registered_count + 1 >= e.max_participants }
          : e
      ).filter((e) => !e.is_full))

      if (ingressoWin) {
        localStorage.setItem(`ingresso_${reg.ticket_token}`, JSON.stringify({ registration: reg, event: selectedEvent }))
        ingressoWin.location.href = `/imprimir/ingresso/${reg.ticket_token}`
      }
    } catch (err) {
      ingressoWin?.close()
      setError(err instanceof Error ? err.message : "Erro ao inscrever.")
    } finally { setSaving(false) }
  }

  async function handleNewStudentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newName || !newCpf || !newEmail || !newWhatsapp) { setError("Preencha os campos obrigatórios."); return }
    setSaving(true); setError("")
    try {
      const student = await api.students.create({
        name: newName, cpf: newCpf, email: newEmail,
        whatsapp: newWhatsapp, instagram: newInstagram || undefined, active: true,
      })
      setStudents((prev) => [student, ...prev])
      await enroll(student.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar aluno.")
      setSaving(false)
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Aulões Disponíveis</h1>
        <p className="text-muted-foreground">Inscreva alunos nos aulões abertos</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por título ou local..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhum aulão disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ev) => (
            <Card key={ev.id} className="flex flex-col overflow-hidden border hover:shadow-md transition-shadow">
              <div className="h-2 bg-[#e8491d]" />
              <CardContent className="flex flex-col flex-1 p-5 gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Aulão</p>
                  <h2 className="text-base font-bold text-foreground leading-tight line-clamp-2">{ev.title}</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={STATUS_COLORS[ev.status]}>{STATUS_LABELS[ev.status] ?? ev.status}</Badge>
                  {ev.is_free ? (
                    <Badge className="bg-green-100 text-green-700"><Tag className="mr-1 h-3 w-3" />Gratuito</Badge>
                  ) : ev.event_lotes && ev.event_lotes.length > 0 ? (
                    <Badge className="bg-orange-100 text-orange-700">
                      <Layers className="mr-1 h-3 w-3" />
                      {ev.current_lote_price != null ? `R$ ${Number(ev.current_lote_price).toFixed(2)}` : "Lotes esgotados"}
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-700"><Tag className="mr-1 h-3 w-3" />R$ {Number(ev.price ?? 0).toFixed(2)}</Badge>
                  )}
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 shrink-0" /><span>{new Date(ev.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span></div>
                  <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 shrink-0" /><span>{ev.start_time} – {ev.end_time}</span></div>
                  {ev.location && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{ev.location}</span></div>}
                  <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 shrink-0" /><span>{ev.registered_count} / {ev.max_participants} inscritos</span></div>
                </div>

                <Button
                  onClick={() => openModal(ev)}
                  className="mt-auto w-full gap-2 bg-[#e8491d] hover:bg-[#d43d15] text-white"
                >
                  <UserPlus className="h-4 w-4" /> Inscrever Aluno
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de inscrição */}
      <Dialog open={!!selectedEvent} onOpenChange={(o) => { if (!o) closeModal() }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {step === "success" ? "Inscrição Realizada!" : "Inscrever em Aulão"}
            </DialogTitle>
            {selectedEvent && step !== "success" && (
              <DialogDescription className="font-medium text-foreground">
                {selectedEvent.title}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* STEP: choose_type */}
          {step === "choose_type" && (
            <div className="space-y-6 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => { setError(""); setStep("new_student_form") }}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all duration-300 hover:border-[#e8491d] hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e8491d] to-[#f97316] opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="rounded-full bg-orange-100 p-3 text-[#e8491d] transition-all duration-300 group-hover:bg-[#e8491d] group-hover:text-white group-hover:scale-110">
                      <UserPlus className="h-8 w-8" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Aluno Novo</span>
                    <p className="text-sm text-gray-500">Cadastre um novo aluno</p>
                  </div>
                </button>

                <button
                  onClick={() => { setError(""); setStudentSearch(""); setStep("select_existing") }}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all duration-300 hover:border-[#e8491d] hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e8491d] to-[#f97316] opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="rounded-full bg-orange-100 p-3 text-[#e8491d] transition-all duration-300 group-hover:bg-[#e8491d] group-hover:text-white group-hover:scale-110">
                      <UserCheck className="h-8 w-8" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Ex-Aluno</span>
                    <Badge className="bg-orange-100 text-[#e8491d] border-orange-200">
                      <Percent className="h-3 w-3 mr-1" />
                      Já cadastrado
                    </Badge>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP: new_student_form */}
          {step === "new_student_form" && (
            <form onSubmit={handleNewStudentSubmit} className="space-y-4 pt-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-[#e8491d] to-[#f97316] rounded-full" />
                  <h3 className="text-base font-semibold text-gray-900">Dados do Aluno</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Nome completo *</Label>
                    <Input placeholder="Nome completo" value={newName} onChange={(e) => setNewName(e.target.value)} required className="border-gray-200 focus:border-[#e8491d]" />
                  </div>
                  <div className="space-y-1">
                    <Label>CPF *</Label>
                    <Input placeholder="000.000.000-00" value={newCpf} onChange={(e) => setNewCpf(applyCpfMask(e.target.value))} required className="border-gray-200 focus:border-[#e8491d]" />
                  </div>
                  <div className="space-y-1">
                    <Label>Email *</Label>
                    <Input type="email" placeholder="email@exemplo.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="border-gray-200 focus:border-[#e8491d]" />
                  </div>
                  <div className="space-y-1">
                    <Label>WhatsApp *</Label>
                    <Input placeholder="(00) 00000-0000" value={newWhatsapp} onChange={(e) => setNewWhatsapp(applyPhoneMask(e.target.value))} required className="border-gray-200 focus:border-[#e8491d]" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Instagram</Label>
                    <Input placeholder="@usuario" value={newInstagram} onChange={(e) => setNewInstagram(e.target.value)} className="border-gray-200 focus:border-[#e8491d]" />
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-between items-center">
                <Button type="button" variant="ghost" onClick={() => setStep("choose_type")} className="hover:bg-orange-50 hover:text-[#e8491d]">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button type="submit" disabled={saving} className="bg-gradient-to-r from-[#e8491d] to-[#f97316] hover:from-[#d43d15] hover:to-[#e86a0f] text-white">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inscrevendo...</> : <>Inscrever & Gerar Ingresso <ChevronRight className="ml-1 h-4 w-4" /></>}
                </Button>
              </div>
            </form>
          )}

          {/* STEP: select_existing */}
          {step === "select_existing" && (
            <div className="space-y-4 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input className="pl-10 border-gray-200 focus:border-[#e8491d]" placeholder="Buscar por nome, email ou CPF..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                  <button key={s.id} disabled={saving}
                    onClick={() => enroll(s.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 transition-all duration-300 hover:border-[#e8491d] hover:bg-orange-50 hover:shadow-md text-left cursor-pointer group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#e8491d] to-[#f97316] flex items-center justify-center font-bold text-white shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                      <p className="text-sm text-gray-500 truncate">{s.email}</p>
                      <p className="text-xs text-gray-400">{s.cpf}</p>
                    </div>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin text-[#e8491d] shrink-0" /> : <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#e8491d] shrink-0" />}
                  </button>
                )) : (
                  <div className="text-center py-8 text-gray-500">Nenhum aluno encontrado</div>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button variant="ghost" onClick={() => setStep("choose_type")} className="hover:bg-orange-50 hover:text-[#e8491d]">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            </div>
          )}

          {/* STEP: success */}
          {step === "success" && successReg && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">Inscrição realizada!</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedEvent?.title}</p>
              </div>
              <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm w-full">
                <p className="text-muted-foreground">Token do ingresso:</p>
                <p className="font-mono font-medium text-foreground break-all mt-1">{successReg.ticket_token}</p>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Ticket className="h-3.5 w-3.5" /> O ingresso em PDF foi aberto em outra aba
              </p>
              <Button onClick={closeModal} className="bg-[#e8491d] hover:bg-[#d43d15] text-white">
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
