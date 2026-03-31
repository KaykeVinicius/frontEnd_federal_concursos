"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { mockTurmas, mockCourses, Turma, Course } from "@/lib/mock-data"
import { Plus, Users, BookOpen, Clock, Calendar, UserCheck, Edit3, Search, GraduationCap } from "lucide-react"

export default function CeoTurmasPage() {
  // Filtrar cursos que podem ter turmas (presencial ou híbrido)
  const availableCourses = mockCourses.filter(course => course.access_type === "interno" || course.access_type === "ambos")

  const [turmas, setTurmas] = useState<Turma[]>(mockTurmas)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"todos" | "aberta" | "em_andamento" | "fechada">("todos")
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Form states for create modal
  const [createCourseId, setCreateCourseId] = useState<number>(availableCourses[0]?.id ?? 0)
  const [createName, setCreateName] = useState("")
  const [createShift, setCreateShift] = useState("Manhã")

  // Form states for edit modal
  const [editCourseId, setEditCourseId] = useState<number>(0)
  const [editName, setEditName] = useState("")
  const [editShift, setEditShift] = useState("Manhã")

  const handleCreateTurma = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedCourse = mockCourses.find(c => c.id === createCourseId)
    if (!selectedCourse) return

    const newTurma: Turma = {
      id: Math.max(0, ...turmas.map((t) => t.id)) + 1,
      course_id: createCourseId,
      name: createName,
      shift: createShift,
      start_date: selectedCourse.start_date || new Date().toISOString().slice(0, 10),
      end_date: selectedCourse.end_date || new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().slice(0, 10),
      schedule: "Seg - Sex",
      max_students: 30,
      enrolled_count: 0,
      status: "aberta",
      availableSlots: undefined,
      turno: createShift
    }
    setTurmas((prev) => [...prev, newTurma])
    resetCreateForm()
    setIsCreateModalOpen(false)
  }

  const handleEditTurma = (turma: Turma) => {
    setEditingTurma(turma)
    setEditCourseId(turma.course_id)
    setEditName(turma.name)
    setEditShift(turma.shift)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTurma) return
    const updatedTurma: Turma = {
      ...editingTurma,
      course_id: editCourseId,
      name: editName,
      shift: editShift,
      turno: editShift
    }
    setTurmas((prev) => prev.map((t) => (t.id === editingTurma.id ? updatedTurma : t)))
    setIsEditModalOpen(false)
    setEditingTurma(null)
    resetEditForm()
  }

  const resetCreateForm = () => {
    setCreateCourseId(availableCourses[0]?.id ?? 0)
    setCreateName("")
    setCreateShift("Manhã")
  }

  const resetEditForm = () => {
    setEditCourseId(0)
    setEditName("")
    setEditShift("Manhã")
  }

  const countByStatus = useMemo(() => ({
    abertas: turmas.filter((t) => t.status === "aberta").length,
    em_andamento: turmas.filter((t) => t.status === "em_andamento").length,
    fechadas: turmas.filter((t) => t.status === "fechada").length,
  }), [turmas])

  // Filter turmas based on search and status
  const filteredTurmas = useMemo(() => {
    return turmas.filter((turma) => {
      const course = mockCourses.find((c) => c.id === turma.course_id)
      const matchesSearch = turma.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course?.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "todos" || turma.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [turmas, searchTerm, filterStatus])

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Turmas</h1>
          <p className="text-sm text-muted-foreground">Gestão de turmas presenciais e híbridas. Crie turmas vinculadas a cursos com horários definidos.</p>
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

        {/* Header with Create Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Gerenciar Turmas</h2>
            <p className="text-sm text-muted-foreground">Visualize e gerencie todas as turmas disponíveis</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Criar Turma
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Buscar Turmas</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Digite o nome da turma ou curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Status</Label>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as "todos" | "aberta" | "em_andamento" | "fechada")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="aberta">Abertas</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="fechada">Fechadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => { setTurmas(mockTurmas); setSearchTerm(""); setFilterStatus("todos") }}>
              Resetar Filtros
            </Button>
          </div>
        </Card>

        {/* Turma Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTurmas.map((turma) => {
            const course = mockCourses.find((c) => c.id === turma.course_id)
            return (
              <Card key={turma.id} className="group relative overflow-hidden border border-slate-200 hover:border-[#e8491d]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e8491d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">{turma.name}</h3>
                      <Badge variant="secondary" className={`text-xs ${
                        turma.status === "aberta" ? "bg-green-100 text-green-800" :
                        turma.status === "em_andamento" ? "bg-blue-100 text-blue-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {turma.status === "aberta" ? "Aberta" :
                         turma.status === "em_andamento" ? "Em Andamento" : "Fechada"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTurma(turma)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#e8491d]/10 hover:text-[#e8491d]"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Course Info */}
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground line-clamp-1">
                      {course?.title || "Curso não encontrado"}
                    </span>
                  </div>

                  {/* Shift and Modality */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">{turma.shift}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-purple-600" />
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        {course?.access_type === "interno" ? "Presencial" : "Híbrido"}
                      </Badge>
                    </div>
                  </div>

                  {/* Students Count */}
                  <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">
                      {turma.enrolled_count} / {turma.max_students} alunos
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">
                      <span>Início: {new Date(turma.start_date).toLocaleDateString("pt-BR")}</span>
                      <span className="mx-1">•</span>
                      <span>Fim: {new Date(turma.end_date).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>ID: {turma.id}</span>
                      <span>Horário: {turma.schedule}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {filteredTurmas.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "todos"
                ? "Tente ajustar os filtros de busca"
                : "Comece criando sua primeira turma"}
            </p>
            {!searchTerm && filterStatus === "todos" && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Turma
              </Button>
            )}
          </Card>
        )}

        {/* Create Turma Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <div className="bg-gradient-to-r from-[#e8491d] to-[#f97316] p-6 rounded-t-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Plus className="h-6 w-6" />
                  Criar Nova Turma
                </DialogTitle>
                <DialogDescription className="text-orange-100">
                  Vincule a turma a um curso existente e defina os detalhes
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleCreateTurma} className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="create-course" className="text-sm font-medium mb-2 block">
                    Curso Vinculado *
                  </Label>
                  <Select value={createCourseId.toString()} onValueChange={(value) => setCreateCourseId(Number(value))}>
                    <SelectTrigger className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300">
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{course.title}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {course.access_type === "interno" ? "Presencial" : "Híbrido"}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="create-name" className="text-sm font-medium mb-2 block">
                    Nome da Turma *
                  </Label>
                  <Input
                    id="create-name"
                    placeholder="Ex: Turma A, Turma Manhã 1"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="create-shift" className="text-sm font-medium mb-2 block">
                    Turno *
                  </Label>
                  <Select value={createShift} onValueChange={setCreateShift}>
                    <SelectTrigger className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300">
                      <SelectValue placeholder="Selecione o turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          Manhã
                        </div>
                      </SelectItem>
                      <SelectItem value="Tarde">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          Tarde
                        </div>
                      </SelectItem>
                      <SelectItem value="Noite">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          Noite
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {createCourseId > 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-gray-900">Informações do Curso Selecionado</span>
                  </div>
                  {(() => {
                    const selectedCourse = mockCourses.find(c => c.id === createCourseId)
                    return selectedCourse ? (
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Curso:</strong> {selectedCourse.title}</p>
                        <p><strong>Modalidade:</strong> {selectedCourse.access_type === "interno" ? "Presencial" : "Híbrido"}</p>
                        <p><strong>Preço:</strong> R$ {selectedCourse.price.toFixed(2)}</p>
                        {selectedCourse.start_date && (
                          <p><strong>Início:</strong> {new Date(selectedCourse.start_date).toLocaleDateString("pt-BR")}</p>
                        )}
                        {selectedCourse.end_date && (
                          <p><strong>Fim:</strong> {new Date(selectedCourse.end_date).toLocaleDateString("pt-BR")}</p>
                        )}
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#e8491d] hover:bg-[#d13a0f] text-white"
                  disabled={createCourseId === 0}
                >
                  Criar Turma
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Turma Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <div className="bg-gradient-to-r from-[#e8491d] to-[#f97316] p-6 rounded-t-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Edit3 className="h-6 w-6" />
                  Editar Turma
                </DialogTitle>
                <DialogDescription className="text-orange-100">
                  Atualize as informações da turma
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="edit-course" className="text-sm font-medium mb-2 block">
                    Curso Vinculado *
                  </Label>
                  <Select value={editCourseId.toString()} onValueChange={(value) => setEditCourseId(Number(value))}>
                    <SelectTrigger className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300">
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{course.title}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {course.access_type === "interno" ? "Presencial" : "Híbrido"}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-name" className="text-sm font-medium mb-2 block">
                    Nome da Turma *
                  </Label>
                  <Input
                    id="edit-name"
                    placeholder="Ex: Turma A, Turma Manhã 1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-shift" className="text-sm font-medium mb-2 block">
                    Turno *
                  </Label>
                  <Select value={editShift} onValueChange={setEditShift}>
                    <SelectTrigger className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300">
                      <SelectValue placeholder="Selecione o turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          Manhã
                        </div>
                      </SelectItem>
                      <SelectItem value="Tarde">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          Tarde
                        </div>
                      </SelectItem>
                      <SelectItem value="Noite">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          Noite
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#e8491d] hover:bg-[#d13a0f] text-white"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}