"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { api, type ApiTurma, type ApiCourse } from "@/lib/api"
import { Plus, BookOpen, Clock, Calendar, UserCheck, Edit3, Search, GraduationCap, Loader2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

function parseDias(schedule: string): string[] {
  const part = schedule.split("|")[0] ?? ""
  return part.split(",").map((d) => d.trim()).filter((d) => DIAS.includes(d))
}

function parseHorario(schedule: string): string {
  return schedule.split("|")[1]?.trim() ?? ""
}

function buildSchedule(dias: string[], horario: string): string {
  return [dias.join(", "), horario].filter(Boolean).join(" | ")
}

export default function PedagogicaTurmasPage() {
  const [turmas, setTurmas] = useState<ApiTurma[]>([])
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"todos" | "aberta" | "em_andamento" | "fechada">("todos")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTurma, setEditingTurma] = useState<ApiTurma | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Create form
  const [createCourseId, setCreateCourseId] = useState("")
  const [createName, setCreateName] = useState("")
  const [createShift, setCreateShift] = useState("Manhã")
  const [createModalidade, setCreateModalidade] = useState("presencial")
  const [createDias, setCreateDias] = useState<string[]>([])
  const [createHorario, setCreateHorario] = useState("")
  const [createStart, setCreateStart] = useState("")
  const [createEnd, setCreateEnd] = useState("")
  const [createMax, setCreateMax] = useState("30")

  // Edit form
  const [editName, setEditName] = useState("")
  const [editShift, setEditShift] = useState("")
  const [editModalidade, setEditModalidade] = useState("")
  const [editDias, setEditDias] = useState<string[]>([])
  const [editHorario, setEditHorario] = useState("")
  const [editStatus, setEditStatus] = useState("")

  const fetchTurmas = useCallback((q?: string, status?: string) => {
    const ransackQ: Record<string, string> = {}
    if (q) ransackQ["name_or_course_title_cont"] = q
    if (status && status !== "todos") ransackQ["status_eq"] = status
    return api.turmas.list(undefined, Object.keys(ransackQ).length ? ransackQ : undefined)
  }, [])

  useEffect(() => {
    Promise.all([fetchTurmas(), api.courses.list()])
      .then(([t, c]) => { setTurmas(t); setCourses(c) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [fetchTurmas])

  useEffect(() => {
    const t = setTimeout(() => {
      fetchTurmas(searchTerm || undefined, filterStatus)
        .then(setTurmas)
        .catch(console.error)
    }, 300)
    return () => clearTimeout(t)
  }, [searchTerm, filterStatus, fetchTurmas])

  const availableCourses = courses.filter(
    (c) => c.access_type === "presencial" || c.access_type === "hibrido"
  )

  const countByStatus = useMemo(() => ({
    abertas: turmas.filter((t) => t.status === "aberta").length,
    em_andamento: turmas.filter((t) => t.status === "em_andamento").length,
    fechadas: turmas.filter((t) => t.status === "fechada").length,
  }), [turmas])

  const filteredTurmas = turmas

  function toggleDia(dia: string, dias: string[], setDias: (d: string[]) => void) {
    setDias(dias.includes(dia) ? dias.filter((d) => d !== dia) : [...dias, dia])
  }

  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!createCourseId || !createName.trim()) { setError("Preencha os campos obrigatórios."); return }
    if (createDias.length === 0) { setError("Selecione ao menos um dia da semana."); return }
    setSaving(true); setError("")
    try {
      const created = await api.turmas.create({
        course_id: parseInt(createCourseId),
        name: createName.trim(),
        shift: createShift,
        modalidade: createModalidade,
        schedule: buildSchedule(createDias, createHorario),
        start_date: createStart || undefined,
        end_date: createEnd || undefined,
        max_students: parseInt(createMax) || 30,
        status: "aberta",
      })
      setTurmas((prev) => [...prev, created])
      setIsCreateModalOpen(false)
      setCreateCourseId(""); setCreateName(""); setCreateShift("Manhã")
      setCreateModalidade("presencial"); setCreateDias([]); setCreateHorario("")
      setCreateStart(""); setCreateEnd(""); setCreateMax("30")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar turma")
    } finally {
      setSaving(false)
    }
  }

  function openEdit(turma: ApiTurma) {
    setEditingTurma(turma)
    setEditName(turma.name)
    setEditShift(turma.shift ?? "Manhã")
    setEditModalidade(turma.modalidade ?? "presencial")
    setEditDias(parseDias(turma.schedule ?? ""))
    setEditHorario(parseHorario(turma.schedule ?? ""))
    setEditStatus(turma.status)
    setIsEditModalOpen(true)
  }

  async function handleEdit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!editingTurma) return
    if (editDias.length === 0) { setError("Selecione ao menos um dia da semana."); return }
    setSaving(true); setError("")
    try {
      const updated = await api.turmas.update(editingTurma.id, {
        name: editName.trim(),
        shift: editShift,
        modalidade: editModalidade,
        schedule: buildSchedule(editDias, editHorario),
        status: editStatus,
      })
      setTurmas((prev) => prev.map((t) => t.id === updated.id ? updated : t))
      setIsEditModalOpen(false); setEditingTurma(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao editar turma")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Turmas</h1>
          <p className="text-sm text-muted-foreground">Gestão de turmas presenciais e híbridas.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-500/40 bg-gradient-to-b from-green-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Abertas</p>
            <p className="text-3xl font-bold">{countByStatus.abertas}</p>
          </Card>
          <Card className="border-blue-500/40 bg-gradient-to-b from-blue-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Em Andamento</p>
            <p className="text-3xl font-bold">{countByStatus.em_andamento}</p>
          </Card>
          <Card className="border-red-500/40 bg-gradient-to-b from-red-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Fechadas</p>
            <p className="text-3xl font-bold">{countByStatus.fechadas}</p>
          </Card>
          <Card className="border-purple-500/40 bg-gradient-to-b from-purple-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Total</p>
            <p className="text-3xl font-bold">{turmas.length}</p>
          </Card>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Gerenciar Turmas</h2>
            <p className="text-sm text-muted-foreground">Fecha automaticamente ao atingir o limite de alunos</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
            <Plus className="h-4 w-4 mr-2" /> Criar Turma
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Buscar Turmas</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Nome da turma ou curso..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Status</Label>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="aberta">Abertas</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="fechada">Fechadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setFilterStatus("todos") }}>Resetar</Button>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTurmas.map((turma) => {
            const dias = parseDias(turma.schedule ?? "")
            const horario = parseHorario(turma.schedule ?? "")
            const pct = turma.max_students > 0 ? (turma.enrolled_count / turma.max_students) * 100 : 0

            return (
              <Card key={turma.id} className="group relative overflow-hidden border border-slate-200 hover:border-[#e8491d]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e8491d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-foreground mb-1 truncate">{turma.name}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className={
                          turma.status === "aberta" ? "bg-green-100 text-green-800" :
                          turma.status === "em_andamento" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                        }>
                          {turma.status === "aberta" ? "Aberta" : turma.status === "em_andamento" ? "Em Andamento" : "Fechada"}
                        </Badge>
                        <Badge className={cn(
                          "text-xs",
                          turma.modalidade === "presencial" ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-purple-100 text-purple-800 border-purple-200"
                        )}>
                          <MapPin className="h-3 w-3 mr-1" />
                          {turma.modalidade === "presencial" ? "Presencial" : "Híbrido"}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(turma)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-[#e8491d]/10 hover:text-[#e8491d]">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{turma.course?.title ?? "—"}</span>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-2 text-sm text-muted-foreground">
                    {turma.shift && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{turma.shift}</span>
                      </div>
                    )}
                    {dias.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{dias.join(", ")}</span>
                      </div>
                    )}
                    {horario && (
                      <span className="font-medium text-foreground">{horario}</span>
                    )}
                  </div>

                  {(turma.start_date || turma.end_date) && (
                    <div className="text-xs text-muted-foreground mb-3">
                      {turma.start_date && new Date(turma.start_date).toLocaleDateString("pt-BR")}
                      {turma.start_date && turma.end_date && " → "}
                      {turma.end_date && new Date(turma.end_date).toLocaleDateString("pt-BR")}
                    </div>
                  )}

                  {/* Barra de vagas */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>{turma.enrolled_count} / {turma.max_students} alunos</span>
                      </div>
                      <span className={cn(
                        "font-medium",
                        pct >= 100 ? "text-red-600" : pct >= 80 ? "text-orange-500" : "text-green-600"
                      )}>{Math.round(pct)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-orange-400" : "bg-green-500"
                        )}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    {pct >= 100 && (
                      <p className="text-xs text-red-600 mt-1 font-medium">Turma fechada — limite atingido</p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {filteredTurmas.length === 0 && (
          <Card className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "todos" ? "Tente ajustar os filtros" : "Comece criando sua primeira turma"}
            </p>
            {!searchTerm && filterStatus === "todos" && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                <Plus className="h-4 w-4 mr-2" /> Criar Primeira Turma
              </Button>
            )}
          </Card>
        )}

        {/* ─── Create Modal ─── */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Turma</DialogTitle>
              <DialogDescription>Status inicia como <strong>Aberta</strong> e fecha automaticamente ao atingir o limite de alunos.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">

              <div className="space-y-2">
                <Label>Curso *</Label>
                <Select value={createCourseId} onValueChange={setCreateCourseId}>
                  <SelectTrigger><SelectValue placeholder="Selecione um curso" /></SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                {availableCourses.length === 0 && (
                  <p className="text-xs text-amber-600">⚠ Nenhum curso presencial/híbrido cadastrado.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Nome da Turma *</Label>
                  <Input placeholder="Ex: Turma A" value={createName} onChange={(e) => setCreateName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Modalidade *</Label>
                  <Select value={createModalidade} onValueChange={setCreateModalidade}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Turno</Label>
                  <Select value={createShift} onValueChange={setCreateShift}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input placeholder="Ex: 19:00 às 22:00" value={createHorario} onChange={(e) => setCreateHorario(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dias da Semana *</Label>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleDia(dia, createDias, setCreateDias)}
                      className={cn(
                        "rounded-md border px-3 py-1 text-sm font-medium transition-colors",
                        createDias.includes(dia)
                          ? "border-[#e8491d] bg-[#e8491d] text-white"
                          : "border-border text-muted-foreground hover:border-[#e8491d]/50 hover:text-foreground"
                      )}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input type="date" value={createStart} onChange={(e) => setCreateStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input type="date" value={createEnd} onChange={(e) => setCreateEnd(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Máx. Alunos <span className="text-muted-foreground">(fecha automaticamente ao atingir)</span></Label>
                  <Input type="number" min="1" value={createMax} onChange={(e) => setCreateMax(e.target.value)} />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1 bg-[#e8491d] hover:bg-[#d13a0f] text-white" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Criar Turma
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ─── Edit Modal ─── */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Turma</DialogTitle>
              <DialogDescription>Atualize as informações da turma</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Turma *</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Modalidade</Label>
                  <Select value={editModalidade} onValueChange={setEditModalidade}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Turno</Label>
                  <Select value={editShift} onValueChange={setEditShift}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input placeholder="Ex: 19:00 às 22:00" value={editHorario} onChange={(e) => setEditHorario(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberta">Aberta</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="fechada">Fechada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dias da Semana</Label>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleDia(dia, editDias, setEditDias)}
                      className={cn(
                        "rounded-md border px-3 py-1 text-sm font-medium transition-colors",
                        editDias.includes(dia)
                          ? "border-[#e8491d] bg-[#e8491d] text-white"
                          : "border-border text-muted-foreground hover:border-[#e8491d]/50 hover:text-foreground"
                      )}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1 bg-[#e8491d] hover:bg-[#d13a0f] text-white" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
