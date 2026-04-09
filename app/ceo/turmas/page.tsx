"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { api, type ApiTurma, type ApiCourse } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Plus, Users, BookOpen, Clock, Calendar, UserCheck, Edit3, Search, GraduationCap, Loader2 } from "lucide-react"

export default function CeoTurmasPage() {
  const router = useRouter()
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
  const [createSchedule, setCreateSchedule] = useState("")
  const [createStart, setCreateStart] = useState("")
  const [createEnd, setCreateEnd] = useState("")
  const [createMax, setCreateMax] = useState("30")
  const [createStatus, setCreateStatus] = useState("aberta")

  // Edit form
  const [editName, setEditName] = useState("")
  const [editShift, setEditShift] = useState("")
  const [editStatus, setEditStatus] = useState("")

  useEffect(() => {
    Promise.all([api.turmas.list(), api.courses.list()])
      .then(([t, c]) => { setTurmas(t); setCourses(c) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const availableCourses = courses.filter(
    (c) => c.access_type === "presencial" || c.access_type === "hibrido"
  )

  const countByStatus = useMemo(() => ({
    abertas: turmas.filter((t) => t.status === "aberta").length,
    em_andamento: turmas.filter((t) => t.status === "em_andamento").length,
    fechadas: turmas.filter((t) => t.status === "fechada").length,
  }), [turmas])

  const filteredTurmas = useMemo(() => {
    return turmas.filter((turma) => {
      const accessType = turma.course?.access_type
      const isPresencialOrHibrido = accessType === "presencial" || accessType === "hibrido"
      const matchesSearch =
        turma.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turma.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "todos" || turma.status === filterStatus
      return isPresencialOrHibrido && matchesSearch && matchesStatus
    })
  }, [turmas, searchTerm, filterStatus])

  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!createCourseId || !createName.trim()) { setError("Preencha os campos obrigatórios."); return }
    setSaving(true); setError("")
    try {
      const created = await api.turmas.create({
        course_id: parseInt(createCourseId),
        name: createName.trim(),
        shift: createShift,
        schedule: createSchedule.trim() || undefined,
        start_date: createStart || undefined,
        end_date: createEnd || undefined,
        max_students: parseInt(createMax) || 30,
        status: createStatus,
      })
      setTurmas((prev) => [...prev, created])
      setIsCreateModalOpen(false)
      setCreateCourseId(""); setCreateName(""); setCreateShift("Manhã")
      setCreateSchedule(""); setCreateStart(""); setCreateEnd(""); setCreateMax("30"); setCreateStatus("aberta")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar turma")
    } finally {
      setSaving(false)
    }
  }

  function openEdit(turma: ApiTurma) {
    setEditingTurma(turma)
    setEditName(turma.name)
    setEditShift(turma.shift ?? "")
    setEditStatus(turma.status)
    setIsEditModalOpen(true)
  }

  async function handleEdit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!editingTurma) return
    setSaving(true); setError("")
    try {
      const updated = await api.turmas.update(editingTurma.id, {
        name: editName.trim(),
        shift: editShift || undefined,
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
            <p className="text-sm text-muted-foreground">Visualize e gerencie todas as turmas disponíveis</p>
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
                <Input placeholder="Digite o nome da turma ou curso..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Status</Label>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="aberta">Abertas</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="fechada">Fechadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setFilterStatus("todos") }}>Resetar Filtros</Button>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTurmas.map((turma) => (
            <Card key={turma.id} className="group relative overflow-hidden border border-slate-200 hover:border-[#e8491d]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e8491d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">{turma.name}</h3>
                    <Badge variant="secondary" className={
                      turma.status === "aberta" ? "bg-green-100 text-green-800" :
                      turma.status === "em_andamento" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                    }>
                      {turma.status === "aberta" ? "Aberta" : turma.status === "em_andamento" ? "Em Andamento" : "Fechada"}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(turma)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#e8491d]/10 hover:text-[#e8491d]">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground line-clamp-1">{turma.course?.title ?? "—"}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {turma.shift && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">{turma.shift}</Badge>
                    </div>
                  )}
                  {turma.course?.access_type && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-purple-600" />
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        {turma.course.access_type === "interno" ? "Presencial" : "Híbrido"}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">{turma.enrolled_count} / {turma.max_students} alunos</span>
                </div>

                {(turma.start_date || turma.end_date) && (
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">
                      {turma.start_date && <span>Início: {new Date(turma.start_date).toLocaleDateString("pt-BR")}</span>}
                      {turma.start_date && turma.end_date && <span className="mx-1">•</span>}
                      {turma.end_date && <span>Fim: {new Date(turma.end_date).toLocaleDateString("pt-BR")}</span>}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>ID: {turma.id}</span>
                    {turma.schedule && <span>Horário: {turma.schedule}</span>}
                  </div>
                  <Button
                    className="w-full gap-2 bg-[#e8491d] hover:bg-[#d13a0f] text-white"
                    onClick={() => router.push(`/ceo/turmas/${turma.id}`)}
                  >
                    <Users className="h-4 w-4" /> Ver Alunos da Turma
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTurmas.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "todos" ? "Tente ajustar os filtros de busca" : "Comece criando sua primeira turma"}
            </p>
            {!searchTerm && filterStatus === "todos" && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                <Plus className="h-4 w-4 mr-2" /> Criar Primeira Turma
              </Button>
            )}
          </Card>
        )}

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Nova Turma</DialogTitle>
              <DialogDescription>Vincule a turma a um curso existente e defina os detalhes</DialogDescription>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Turma *</Label>
                  <Input placeholder="Ex: Turma A" value={createName} onChange={(e) => setCreateName(e.target.value)} required />
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
                  <Label>Data Início</Label>
                  <Input type="date" value={createStart} onChange={(e) => setCreateStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input type="date" value={createEnd} onChange={(e) => setCreateEnd(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input placeholder="Ex: Seg - Sex" value={createSchedule} onChange={(e) => setCreateSchedule(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Max. Alunos</Label>
                  <Input type="number" value={createMax} onChange={(e) => setCreateMax(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Status</Label>
                  <Select value={createStatus} onValueChange={setCreateStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberta">Aberta</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="fechada">Fechada</SelectItem>
                    </SelectContent>
                  </Select>
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

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Turma</DialogTitle>
              <DialogDescription>Atualize as informações da turma</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Turma *</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
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
