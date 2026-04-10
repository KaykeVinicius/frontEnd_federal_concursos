"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api, type ApiUser, type ApiSubject, type ApiUserType } from "@/lib/api"
import {
  Users, Plus, Search, Settings, UserCheck, UserX, Crown, Briefcase,
  GraduationCap, BookOpen, User, Filter, BarChart3, Shield,
  CheckCircle, XCircle, Percent, Mail, Loader2, Layers, Pencil, Trash2,
} from "lucide-react"

export default function CeoUsuariosPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [userTypes, setUserTypes] = useState<ApiUserType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [filterTypeId, setFilterTypeId] = useState<string>("todos")
  const [filterStatus, setFilterStatus] = useState<"todos" | "ativo" | "inativo">("todos")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Form states
  const [createName, setCreateName] = useState("")
  const [createEmail, setCreateEmail] = useState("")
  const [createCpf, setCreateCpf] = useState("")
  const [createPassword, setCreatePassword] = useState("")
  const [createUserTypeId, setCreateUserTypeId] = useState<number | null>(null)
  const [createCommission, setCreateCommission] = useState(10)
  // Matérias selecionadas quando perfil = professor
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([])
  const [newSubjectName, setNewSubjectName] = useState("")
  const [addingSubject, setAddingSubject] = useState(false)
  const [savingSubject, setSavingSubject] = useState(false)

  // Gerenciar matérias de professor existente
  const [editingProfessor, setEditingProfessor] = useState<ApiUser | null>(null)
  const [profSubjectIds, setProfSubjectIds] = useState<number[]>([])
  const [savingProfSubjects, setSavingProfSubjects] = useState(false)

  function openEditSubjects(user: ApiUser) {
    setEditingProfessor(user)
    setProfSubjectIds(subjects.filter((s) => s.professor_id === user.id).map((s) => s.id))
  }

  async function handleSaveProfSubjects() {
    if (!editingProfessor) return
    setSavingProfSubjects(true)
    try {
      const original = subjects.filter((s) => s.professor_id === editingProfessor.id).map((s) => s.id)
      const toAdd    = profSubjectIds.filter((id) => !original.includes(id))
      const toRemove = original.filter((id) => !profSubjectIds.includes(id))
      await Promise.all([
        ...toAdd.map((id) => api.subjects.update(id, { professor_id: editingProfessor.id })),
        ...toRemove.map((id) => api.subjects.update(id, { professor_id: null })),
      ])
      setSubjects((prev) =>
        prev.map((s) => {
          if (toAdd.includes(s.id)) return { ...s, professor_id: editingProfessor.id }
          if (toRemove.includes(s.id)) return { ...s, professor_id: null }
          return s
        })
      )
      setEditingProfessor(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar matérias")
    } finally {
      setSavingProfSubjects(false)
    }
  }

  function toggleProfSubject(id: number) {
    setProfSubjectIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  // Tipos de usuário — CRUD
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<ApiUserType | null>(null)
  const [typeName, setTypeName] = useState("")
  const [typeSlug, setTypeSlug] = useState("")
  const [typeDescription, setTypeDescription] = useState("")
  const [savingType, setSavingType] = useState(false)
  const [typeError, setTypeError] = useState("")

  useEffect(() => {
    Promise.all([
      api.users.list(),
      api.subjects.list(),
      api.userTypes.list(),
    ]).then(([u, s, ut]) => {
      setUsers(u)
      setSubjects(s)
      setUserTypes(ut)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const selectedUserType = useMemo(
    () => userTypes.find((ut) => ut.id === createUserTypeId) ?? null,
    [userTypes, createUserTypeId]
  )

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType =
          filterTypeId === "todos" || String(user.user_type_id) === filterTypeId
        const matchesStatus =
          filterStatus === "todos" ||
          (filterStatus === "ativo" && user.active) ||
          (filterStatus === "inativo" && !user.active)
        return matchesSearch && matchesType && matchesStatus
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [users, searchTerm, filterTypeId, filterStatus])

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.active).length,
    inactive: users.filter((u) => !u.active).length,
  }), [users])

  function toggleSubject(id: number) {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  async function handleCreateSubject() {
    if (!newSubjectName.trim()) return
    setSavingSubject(true)
    try {
      const created = await api.subjects.create({ name: newSubjectName.trim() })
      setSubjects((prev) => [...prev, created])
      setSelectedSubjectIds((prev) => [...prev, created.id])
      setNewSubjectName("")
      setAddingSubject(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingSubject(false)
    }
  }

  async function handleCreateUser(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!createName || !createEmail || !createCpf || !createPassword || !createUserTypeId) return
    setSaving(true)
    setCreateError("")
    try {
      const newUser = await api.users.create({
        name: createName,
        email: createEmail,
        cpf: createCpf,
        password: createPassword,
        user_type_id: createUserTypeId,
        commission_percent: selectedUserType?.slug === "assistente_comercial" ? createCommission : undefined,
      })
      setUsers((prev) => [newUser, ...prev])

      if (selectedUserType?.slug === "professor" && selectedSubjectIds.length > 0) {
        await Promise.all(
          selectedSubjectIds.map((sid) =>
            api.subjects.update(sid, { professor_id: newUser.id })
          )
        )
        setSubjects((prev) =>
          prev.map((s) =>
            selectedSubjectIds.includes(s.id) ? { ...s, professor_id: newUser.id } : s
          )
        )
      }

      resetCreateForm()
      setIsCreateModalOpen(false)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar usuário")
    } finally {
      setSaving(false)
    }
  }

  async function toggleUserStatus(user: ApiUser) {
    try {
      const updated = await api.users.update(user.id, { active: !user.active })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
    } catch (err) {
      console.error("Erro ao alterar status:", err)
    }
  }

  function resetCreateForm() {
    setCreateName("")
    setCreateEmail("")
    setCreateCpf("")
    setCreatePassword("")
    setCreateUserTypeId(null)
    setCreateCommission(10)
    setSelectedSubjectIds([])
    setCreateError("")
    setNewSubjectName("")
    setAddingSubject(false)
  }

  // ── User Type CRUD ────────────────────────────────────────
  function openCreateType() {
    setEditingType(null)
    setTypeName("")
    setTypeSlug("")
    setTypeDescription("")
    setTypeError("")
    setIsTypeModalOpen(true)
  }

  function openEditType(ut: ApiUserType) {
    setEditingType(ut)
    setTypeName(ut.name)
    setTypeSlug(ut.slug)
    setTypeDescription(ut.description ?? "")
    setTypeError("")
    setIsTypeModalOpen(true)
  }

  async function handleSaveType(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!typeName.trim() || !typeSlug.trim()) return
    setSavingType(true)
    setTypeError("")
    try {
      if (editingType) {
        const updated = await api.userTypes.update(editingType.id, {
          name: typeName.trim(),
          description: typeDescription.trim() || undefined,
        })
        setUserTypes((prev) => prev.map((ut) => (ut.id === updated.id ? updated : ut)))
      } else {
        const created = await api.userTypes.create({
          name: typeName.trim(),
          slug: typeSlug.trim(),
          description: typeDescription.trim() || undefined,
        })
        setUserTypes((prev) => [...prev, created])
      }
      setIsTypeModalOpen(false)
    } catch (err) {
      setTypeError(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setSavingType(false)
    }
  }

  async function handleDeleteType(ut: ApiUserType) {
    if (!confirm(`Excluir tipo "${ut.name}"? Isso não é permitido se houver usuários vinculados.`)) return
    try {
      await api.userTypes.delete(ut.id)
      setUserTypes((prev) => prev.filter((t) => t.id !== ut.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir")
    }
  }

  const getRoleColor = (slug: string) => {
    switch (slug) {
      case "ceo": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "assistente_comercial": return "bg-blue-100 text-blue-800 border-blue-200"
      case "equipe_pedagogica": return "bg-purple-100 text-purple-800 border-purple-200"
      case "professor": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#e8491d] to-[#f97316] p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-white/20 p-3">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
                <p className="text-orange-100">Administre perfis, permissões e acessos do sistema</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-green-500/40 bg-gradient-to-b from-green-700/30 to-slate-900/50 p-4 text-white">
                <p className="text-xs uppercase tracking-wide text-white/70">Total de Usuários</p>
                <p className="text-3xl font-bold">{loading ? "—" : stats.total}</p>
              </Card>
              <Card className="border-blue-500/40 bg-gradient-to-b from-blue-700/30 to-slate-900/50 p-4 text-white">
                <p className="text-xs uppercase tracking-wide text-white/70">Ativos</p>
                <p className="text-3xl font-bold">{loading ? "—" : stats.active}</p>
              </Card>
              <Card className="border-red-500/40 bg-gradient-to-b from-red-700/30 to-slate-900/50 p-4 text-white">
                <p className="text-xs uppercase tracking-wide text-white/70">Inativos</p>
                <p className="text-3xl font-bold">{loading ? "—" : stats.inactive}</p>
              </Card>
            </div>

            {/* Header with Create Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Usuários do Sistema</h2>
                <p className="text-sm text-muted-foreground">Visualize e gerencie todos os usuários cadastrados</p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Criar Usuário
              </Button>
            </div>

            {/* Filters */}
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Buscar Usuários</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Tipo de Usuário</Label>
                  <Select value={filterTypeId} onValueChange={setFilterTypeId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {userTypes.map((ut) => (
                        <SelectItem key={ut.id} value={String(ut.id)}>{ut.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-32">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Status</Label>
                  <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => { setSearchTerm(""); setFilterTypeId("todos"); setFilterStatus("todos") }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </Card>

            {/* Users List */}
            <Card className="overflow-hidden">
              <div className="border-b bg-gray-50/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Lista de Usuários ({loading ? "..." : filteredUsers.length})
                  </h3>
                  <div className="text-sm text-muted-foreground">Ordenado alfabeticamente</div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="divide-y">
                  {filteredUsers.map((user) => {
                    const userSubjects = subjects.filter((s) => s.professor_id === user.id)
                    const utSlug = user.user_type?.slug ?? user.role
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 border border-gray-200 flex-shrink-0">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-r from-[#e8491d] to-[#f97316] text-white font-semibold text-sm">
                              {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <h4 className="font-semibold text-foreground truncate">{user.name}</h4>
                              <Badge className={`text-xs ${getRoleColor(utSlug)} flex-shrink-0`}>
                                {user.user_type?.name ?? user.role}
                              </Badge>
                              {user.active ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-shrink-0">
                                  <CheckCircle className="h-3 w-3 mr-1" />Ativo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex-shrink-0">
                                  <XCircle className="h-3 w-3 mr-1" />Inativo
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                <span>{user.cpf}</span>
                              </div>
                              {utSlug === "assistente_comercial" && user.commission_percent != null && (
                                <div className="flex items-center gap-1">
                                  <Percent className="h-3 w-3" />
                                  <span>{user.commission_percent}%</span>
                                </div>
                              )}
                            </div>
                            {utSlug === "professor" && userSubjects.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {userSubjects.map((s) => (
                                  <span key={s.id} className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] text-green-700">
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {utSlug === "professor" && (
                            <Button variant="outline" size="sm" onClick={() => openEditSubjects(user)} className="border-green-200 text-green-700 hover:border-green-500 hover:bg-green-50">
                              <BookOpen className="h-3 w-3 mr-1" />Matérias
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => toggleUserStatus(user)} className="border-gray-200 hover:border-[#e8491d] hover:text-[#e8491d]">
                            {user.active ? (
                              <><UserX className="h-3 w-3 mr-1" />Desativar</>
                            ) : (
                              <><UserCheck className="h-3 w-3 mr-1" />Ativar</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum usuário encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterTypeId !== "todos" || filterStatus !== "todos"
                      ? "Tente ajustar os filtros de busca"
                      : "Comece criando seu primeiro usuário"}
                  </p>
                  {!searchTerm && filterTypeId === "todos" && filterStatus === "todos" && (
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                      <Plus className="h-4 w-4 mr-2" />Criar Primeiro Usuário
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Tipos de Usuário Table */}
            <Card className="overflow-hidden">
              <div className="border-b bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <Layers className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Tipos de Usuário</h3>
                    <p className="text-sm text-muted-foreground">Perfis de acesso vinculados aos usuários</p>
                  </div>
                </div>
                <Button size="sm" onClick={openCreateType} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                  <Plus className="h-4 w-4 mr-2" />Novo Tipo
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="divide-y">
                  {userTypes.map((ut) => (
                    <div key={ut.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <Badge className={`text-xs ${getRoleColor(ut.slug)}`}>{ut.slug}</Badge>
                        <div>
                          <p className="font-medium text-foreground">{ut.name}</p>
                          {ut.description && (
                            <p className="text-sm text-muted-foreground">{ut.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{ut.users_count} usuário{ut.users_count !== 1 ? "s" : ""}</span>
                        <Button variant="ghost" size="sm" onClick={() => openEditType(ut)} className="hover:text-[#e8491d]">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteType(ut)} className="hover:text-red-600" disabled={ut.users_count > 0}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">Por Tipo de Usuário</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {userTypes.map((ut) => (
                  <div key={ut.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{ut.name}</span>
                    </div>
                    <Badge variant="outline">{loading ? "—" : ut.users_count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2">
                    <Settings className="h-5 w-5 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <UserCheck className="h-4 w-4 mr-2" />Ativar Todos
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <UserX className="h-4 w-4 mr-2" />Desativar Inativos
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Mail className="h-4 w-4 mr-2" />Enviar Comunicado
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create User Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={(open) => { if (!open) resetCreateForm(); setIsCreateModalOpen(open) }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#e8491d] to-[#f97316] p-6 rounded-t-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Plus className="h-6 w-6" />
                  Criar Novo Usuário
                </DialogTitle>
                <DialogDescription className="text-orange-100">
                  Cadastre um novo usuário no sistema com suas permissões
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="create-name" className="text-sm font-medium mb-2 block">
                    <User className="h-4 w-4 inline mr-2" />Nome Completo *
                  </Label>
                  <Input id="create-name" placeholder="Digite o nome completo" value={createName} onChange={(e) => setCreateName(e.target.value)} required className="border-gray-200 focus:border-[#e8491d]" />
                </div>

                <div>
                  <Label htmlFor="create-email" className="text-sm font-medium mb-2 block">
                    <Mail className="h-4 w-4 inline mr-2" />E-mail *
                  </Label>
                  <Input id="create-email" type="email" placeholder="usuario@email.com" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} required className="border-gray-200 focus:border-[#e8491d]" />
                </div>

                <div>
                  <Label htmlFor="create-cpf" className="text-sm font-medium mb-2 block">
                    <Shield className="h-4 w-4 inline mr-2" />CPF *
                  </Label>
                  <Input id="create-cpf" placeholder="000.000.000-00" value={createCpf} onChange={(e) => setCreateCpf(e.target.value)} required className="border-gray-200 focus:border-[#e8491d]" />
                </div>

                <div>
                  <Label htmlFor="create-password" className="text-sm font-medium mb-2 block">
                    <Settings className="h-4 w-4 inline mr-2" />Senha *
                  </Label>
                  <Input id="create-password" type="password" placeholder="Digite uma senha segura" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} required className="border-gray-200 focus:border-[#e8491d]" />
                </div>

                <div>
                  <Label htmlFor="create-type" className="text-sm font-medium mb-2 block">
                    <Crown className="h-4 w-4 inline mr-2" />Tipo de Usuário *
                  </Label>
                  <Select
                    value={createUserTypeId ? String(createUserTypeId) : ""}
                    onValueChange={(v) => { setCreateUserTypeId(Number(v)); setSelectedSubjectIds([]) }}
                  >
                    <SelectTrigger className="border-gray-200"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      {userTypes.filter((ut) => ut.active).map((ut) => (
                        <SelectItem key={ut.id} value={String(ut.id)}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">{ut.slug}</span>
                            {ut.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Comissão — assistente comercial */}
              {selectedUserType?.slug === "assistente_comercial" && (
                <div>
                  <Label htmlFor="create-commission" className="text-sm font-medium mb-2 block">
                    <Percent className="h-4 w-4 inline mr-2" />Percentual de Comissão (%)
                  </Label>
                  <Input id="create-commission" type="number" min="0" max="100" step="0.1" value={createCommission} onChange={(e) => setCreateCommission(Number(e.target.value))} className="border-gray-200 focus:border-[#e8491d]" />
                </div>
              )}

              {/* Matérias — professor */}
              {selectedUserType?.slug === "professor" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    <BookOpen className="h-4 w-4 inline mr-2" />Matérias que vai ministrar
                  </Label>

                  <div className="flex gap-2">
                    <select
                      className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                      defaultValue=""
                      onChange={(e) => {
                        const id = parseInt(e.target.value)
                        if (id && !selectedSubjectIds.includes(id)) {
                          setSelectedSubjectIds((prev) => [...prev, id])
                        }
                        e.target.value = ""
                      }}
                    >
                      <option value="">Selecione uma matéria...</option>
                      {subjects
                        .filter((s) => !selectedSubjectIds.includes(s.id))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}{s.professor_id ? " (já tem professor)" : ""}
                          </option>
                        ))}
                    </select>
                  </div>

                  {selectedSubjectIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjectIds.map((id) => {
                        const s = subjects.find((s) => s.id === id)
                        if (!s) return null
                        return (
                          <span key={id} className="flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-sm text-green-800">
                            {s.name}
                            <button type="button" onClick={() => toggleSubject(id)} className="ml-1 text-green-600 hover:text-red-500">
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {addingSubject ? (
                    <div className="flex gap-2">
                      <Input
                        autoFocus
                        placeholder="Nome da nova matéria"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); handleCreateSubject() }
                          if (e.key === "Escape") { setAddingSubject(false); setNewSubjectName("") }
                        }}
                        disabled={savingSubject}
                        className="h-8 text-sm"
                      />
                      <Button type="button" size="sm" className="h-8 px-3 bg-[#e8491d] hover:bg-[#d13a0f]" onClick={handleCreateSubject} disabled={savingSubject || !newSubjectName.trim()}>
                        {savingSubject ? <Loader2 className="h-3 w-3 animate-spin" /> : "Criar"}
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={() => { setAddingSubject(false); setNewSubjectName("") }}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingSubject(true)}
                      className="flex items-center gap-1 text-xs text-[#e8491d] hover:underline"
                    >
                      <Plus className="h-3 w-3" /> Criar nova matéria
                    </button>
                  )}
                </div>
              )}

              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { resetCreateForm(); setIsCreateModalOpen(false) }} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || !createUserTypeId} className="flex-1 bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Criando...</> : "Criar Usuário"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Gerenciar Matérias do Professor */}
        <Dialog open={!!editingProfessor} onOpenChange={(open) => { if (!open) setEditingProfessor(null) }}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 rounded-t-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Matérias — {editingProfessor?.name}
                </DialogTitle>
                <DialogDescription className="text-green-100">
                  Vincule ou desvincule matérias a este professor
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-4">
              {/* Lista de todas as matérias template (sem course_id) */}
              <p className="text-sm font-medium text-muted-foreground">Selecione as matérias que este professor irá ministrar:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {subjects.filter((s) => !s.course_id).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma matéria cadastrada. Crie em CEO → Matérias.</p>
                ) : (
                  subjects.filter((s) => !s.course_id).map((s) => {
                    const checked = profSubjectIds.includes(s.id)
                    const otherProf = s.professor_id && s.professor_id !== editingProfessor?.id
                    return (
                      <label key={s.id} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${checked ? "border-green-300 bg-green-50" : "border-border hover:bg-muted/50"}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProfSubject(s.id)}
                          className="h-4 w-4 accent-green-600"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          {otherProf && (
                            <p className="text-[11px] text-amber-600">Vinculada a outro professor</p>
                          )}
                        </div>
                        {checked && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                      </label>
                    )
                  })
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingProfessor(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSaveProfSubjects} disabled={savingProfSubjects} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  {savingProfSubjects ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Type Modal */}
        <Dialog open={isTypeModalOpen} onOpenChange={(open) => { if (!open) { setEditingType(null); setTypeError("") }; setIsTypeModalOpen(open) }}>
          <DialogContent className="max-w-md">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 rounded-t-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  {editingType ? "Editar Tipo de Usuário" : "Novo Tipo de Usuário"}
                </DialogTitle>
                <DialogDescription className="text-indigo-100">
                  {editingType ? "Altere o nome ou descrição" : "Crie um novo tipo vinculado a um perfil de acesso"}
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSaveType} className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Nome *</Label>
                <Input placeholder="Ex: Equipe Pedagógica" value={typeName} onChange={(e) => setTypeName(e.target.value)} required />
              </div>

              {!editingType && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Slug (perfil de acesso) *</Label>
                  <Select value={typeSlug} onValueChange={setTypeSlug}>
                    <SelectTrigger><SelectValue placeholder="Selecione o perfil" /></SelectTrigger>
                    <SelectContent>
                      {["ceo", "assistente_comercial", "equipe_pedagogica", "professor", "aluno", "diretor"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Define quais telas e permissões esse tipo terá.</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium mb-2 block">Descrição</Label>
                <Input placeholder="Descrição opcional" value={typeDescription} onChange={(e) => setTypeDescription(e.target.value)} />
              </div>

              {typeError && <p className="text-sm text-destructive">{typeError}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsTypeModalOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingType} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                  {savingType ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
