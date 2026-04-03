"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { api, type ApiCourse } from "@/lib/api"
import { Plus, BookOpen, Users, Monitor, Building2, Calendar, DollarSign, Edit3, Search, Loader2 } from "lucide-react"

export default function CeoCursosPage() {
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterModality, setFilterModality] = useState<"todos" | "interno" | "externo" | "ambos">("todos")
  const [editingCourse, setEditingCourse] = useState<ApiCourse | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    api.courses.list()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Form states for create modal
  const [createTitle, setCreateTitle] = useState("")
  const [createPrice, setCreatePrice] = useState(0)
  const [createAccessType, setCreateAccessType] = useState<"interno" | "externo" | "ambos">("ambos")
  const [createStartDate, setCreateStartDate] = useState("")
  const [createEndDate, setCreateEndDate] = useState("")

  // Form states for edit modal
  const [editTitle, setEditTitle] = useState("")
  const [editPrice, setEditPrice] = useState(0)
  const [editAccessType, setEditAccessType] = useState<"interno" | "externo" | "ambos">("ambos")
  const [editStartDate, setEditStartDate] = useState("")
  const [editEndDate, setEditEndDate] = useState("")

  const handleCreateCourse = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setSaving(true)
    try {
      const newCourse = await api.courses.create({
        title: createTitle,
        price: createPrice,
        status: "published",
        access_type: createAccessType,
        start_date: createStartDate || undefined,
        end_date: createEndDate || undefined,
      })
      setCourses((prev) => [newCourse, ...prev])
      resetCreateForm()
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleEditCourse = (course: ApiCourse) => {
    setEditingCourse(course)
    setEditTitle(course.title)
    setEditPrice(course.price)
    setEditAccessType(course.access_type as "interno" | "externo" | "ambos")
    setEditStartDate(course.start_date || "")
    setEditEndDate(course.end_date || "")
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!editingCourse) return
    setSaving(true)
    try {
      const updated = await api.courses.update(editingCourse.id, {
        title: editTitle,
        price: editPrice,
        access_type: editAccessType,
        start_date: editStartDate || undefined,
        end_date: editEndDate || undefined,
      })
      setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? updated : c)))
      setIsEditModalOpen(false)
      setEditingCourse(null)
      resetEditForm()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const resetCreateForm = () => {
    setCreateTitle("")
    setCreatePrice(0)
    setCreateAccessType("ambos")
    setCreateStartDate("")
    setCreateEndDate("")
  }

  const resetEditForm = () => {
    setEditTitle("")
    setEditPrice(0)
    setEditAccessType("ambos")
    setEditStartDate("")
    setEditEndDate("")
  }

  const stats = useMemo(() => ({
    totalCourses: courses.length,
    presencial: courses.filter((c) => c.access_type === "interno").length,
    online: courses.filter((c) => c.access_type === "externo").length,
    hibrido: courses.filter((c) => c.access_type === "ambos").length,
  }), [courses])

  // Filter courses based on search and modality
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesModality = filterModality === "todos" || course.access_type === filterModality
      return matchesSearch && matchesModality
    })
  }, [courses, searchTerm, filterModality])

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
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Cursos</h1>
          <p className="text-sm text-muted-foreground">Gestão ágil e visual das ofertas de curso. Adicione, localize e monitore performance em poucos cliques.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-500/40 bg-gradient-to-b from-green-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Total de Cursos</p>
            <p className="text-3xl font-bold">{stats.totalCourses}</p>
          </Card>
          <Card className="border-blue-500/40 bg-gradient-to-b from-blue-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Online</p>
            <p className="text-3xl font-bold">{stats.online}</p>
          </Card>
          <Card className="border-orange-500/40 bg-gradient-to-b from-orange-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Presencial</p>
            <p className="text-3xl font-bold">{stats.presencial}</p>
          </Card>
          <Card className="border-fuchsia-500/40 bg-gradient-to-b from-fuchsia-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Híbrido</p>
            <p className="text-3xl font-bold">{stats.hibrido}</p>
          </Card>
        </div>

        {/* Header with Create Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Gerenciar Cursos</h2>
            <p className="text-sm text-muted-foreground">Visualize e gerencie todos os cursos disponíveis</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Criar Curso
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Buscar Cursos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Digite o nome do curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Modalidade</Label>
              <Select value={filterModality} onValueChange={(value) => setFilterModality(value as "todos" | "interno" | "externo" | "ambos")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="interno">Presencial</SelectItem>
                  <SelectItem value="externo">Online</SelectItem>
                  <SelectItem value="ambos">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setFilterModality("todos") }}>
              Resetar Filtros
            </Button>
          </div>
        </Card>

        {/* Course Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group relative overflow-hidden border border-slate-200 hover:border-[#e8491d]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e8491d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">{course.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {course.status === "published" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCourse(course)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#e8491d]/10 hover:text-[#e8491d]"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description || "Sem descrição disponível"}
                </p>

                {/* Modality Badge */}
                <div className="flex items-center gap-2 mb-4">
                  {course.access_type === "interno" && (
                    <>
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Presencial</Badge>
                    </>
                  )}
                  {course.access_type === "externo" && (
                    <>
                      <Monitor className="h-4 w-4 text-green-600" />
                      <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>
                    </>
                  )}
                  {course.access_type === "ambos" && (
                    <>
                      <Users className="h-4 w-4 text-purple-600" />
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">Híbrido</Badge>
                    </>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xl font-bold text-green-600">
                    R$ {course.price.toFixed(2)}
                  </span>
                </div>

                {/* Dates */}
                {(course.start_date || course.end_date) && (
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">
                      {course.start_date && <span>Início: {new Date(course.start_date).toLocaleDateString("pt-BR")}</span>}
                      {course.start_date && course.end_date && <span> • </span>}
                      {course.end_date && <span>Fim: {new Date(course.end_date).toLocaleDateString("pt-BR")}</span>}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>ID: {course.id}</span>
                    <span>Criado em {course.created_at ? new Date(course.created_at).toLocaleDateString("pt-BR") : "—"}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterModality !== "todos" 
                ? "Tente ajustar os filtros de busca" 
                : "Comece criando seu primeiro curso"}
            </p>
            {!searchTerm && filterModality === "todos" && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Curso
              </Button>
            )}
          </Card>
        )}

        {/* Create Course Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <div className="bg-gradient-to-r from-[#e8491d] to-[#f97316] p-6 rounded-t-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Plus className="h-6 w-6" />
                  Criar Novo Curso
                </DialogTitle>
                <DialogDescription className="text-orange-100">
                  Preencha as informações do novo curso
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="create-title" className="text-sm font-medium mb-2 block">
                    Título do Curso *
                  </Label>
                  <Input
                    id="create-title"
                    placeholder="Digite o título completo do curso"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="create-price" className="text-sm font-medium mb-2 block">
                    Preço (R$) *
                  </Label>
                  <Input
                    id="create-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={createPrice}
                    onChange={(e) => setCreatePrice(Number(e.target.value))}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="create-access-type" className="text-sm font-medium mb-2 block">
                    Modalidade *
                  </Label>
                  <Select value={createAccessType} onValueChange={(value) => setCreateAccessType(value as "interno" | "externo" | "ambos")}>
                    <SelectTrigger className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300">
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interno">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          Presencial
                        </div>
                      </SelectItem>
                      <SelectItem value="externo">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-green-600" />
                          Online
                        </div>
                      </SelectItem>
                      <SelectItem value="ambos">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          Híbrido
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(createAccessType === "interno" || createAccessType === "ambos") && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Datas das Aulas Presenciais</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="create-start-date" className="text-sm font-medium mb-2 block">
                        Data de Início *
                      </Label>
                      <Input
                        id="create-start-date"
                        type="date"
                        value={createStartDate}
                        onChange={(e) => setCreateStartDate(e.target.value)}
                        required
                        className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-end-date" className="text-sm font-medium mb-2 block">
                        Data de Fim *
                      </Label>
                      <Input
                        id="create-end-date"
                        type="date"
                        value={createEndDate}
                        onChange={(e) => setCreateEndDate(e.target.value)}
                        required
                        className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {createAccessType === "externo" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Data de Início do Acesso Online</span>
                  </div>
                  <div>
                    <Label htmlFor="create-online-start" className="text-sm font-medium mb-2 block">
                      Data de Início *
                    </Label>
                    <Input
                      id="create-online-start"
                      type="date"
                      value={createStartDate}
                      onChange={(e) => setCreateStartDate(e.target.value)}
                      required
                      className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                    />
                  </div>
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
                <Button type="submit" disabled={saving} className="flex-1 bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Criando...</> : "Criar Curso"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Course Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <div className="bg-gradient-to-r from-[#e8491d] to-[#f97316] p-6 rounded-t-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Edit3 className="h-6 w-6" />
                  Editar Curso
                </DialogTitle>
                <DialogDescription className="text-orange-100">
                  Atualize as informações do curso
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="edit-title" className="text-sm font-medium mb-2 block">
                    Título do Curso *
                  </Label>
                  <Input
                    id="edit-title"
                    placeholder="Digite o título completo do curso"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-price" className="text-sm font-medium mb-2 block">
                    Preço (R$) *
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-access-type" className="text-sm font-medium mb-2 block">
                    Modalidade *
                  </Label>
                  <Select value={editAccessType} onValueChange={(value) => setEditAccessType(value as "interno" | "externo" | "ambos")}>
                    <SelectTrigger className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300">
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interno">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          Presencial
                        </div>
                      </SelectItem>
                      <SelectItem value="externo">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-green-600" />
                          Online
                        </div>
                      </SelectItem>
                      <SelectItem value="ambos">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          Híbrido
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(editAccessType === "interno" || editAccessType === "ambos") && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Datas das Aulas Presenciais</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="edit-start-date" className="text-sm font-medium mb-2 block">
                        Data de Início *
                      </Label>
                      <Input
                        id="edit-start-date"
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        required
                        className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-end-date" className="text-sm font-medium mb-2 block">
                        Data de Fim *
                      </Label>
                      <Input
                        id="edit-end-date"
                        type="date"
                        value={editEndDate}
                        onChange={(e) => setEditEndDate(e.target.value)}
                        required
                        className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editAccessType === "externo" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Data de Início do Acesso Online</span>
                  </div>
                  <div>
                    <Label htmlFor="edit-online-start" className="text-sm font-medium mb-2 block">
                      Data de Início *
                    </Label>
                    <Input
                      id="edit-online-start"
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      required
                      className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
