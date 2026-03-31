"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { mockSystemUsers } from "@/lib/mock-data"
import {
  Users,
  Plus,
  Search,
  Settings,
  Edit3,
  UserCheck,
  UserX,
  Crown,
  Briefcase,
  GraduationCap,
  BookOpen,
  User,
  Filter,
  BarChart3,
  Shield,
  CheckCircle,
  XCircle,
  Percent,
  Mail,
  Phone,
  Calendar
} from "lucide-react"

interface NewUserForm {
  name: string
  email: string
  cpf: string
  password: string
  role: "ceo" | "assistente_comercial" | "equipe_pedagogica" | "professor" | "aluno"
  commission_percent?: number
}

export default function CeoUsuariosPage() {
  const [users, setUsers] = useState(mockSystemUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<"todos" | "ceo" | "assistente_comercial" | "equipe_pedagogica" | "professor" | "aluno">("todos")
  const [filterStatus, setFilterStatus] = useState<"todos" | "ativo" | "inativo">("todos")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Form states for create modal
  const [createName, setCreateName] = useState("")
  const [createEmail, setCreateEmail] = useState("")
  const [createCpf, setCreateCpf] = useState("")
  const [createPassword, setCreatePassword] = useState("")
  const [createRole, setCreateRole] = useState<"ceo" | "assistente_comercial" | "equipe_pedagogica" | "professor" | "aluno">("aluno")
  const [createCommission, setCreateCommission] = useState(10)

  // Filter and search users (with alphabetical sorting)
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === "todos" || user.role === filterRole
        const matchesStatus = filterStatus === "todos" ||
                             (filterStatus === "ativo" && user.active) ||
                             (filterStatus === "inativo" && !user.active)
        return matchesSearch && matchesRole && matchesStatus
      })
      .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical sorting
  }, [users, searchTerm, filterRole, filterStatus])

  // Statistics
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    ceo: users.filter(u => u.role === "ceo").length,
    assistentes: users.filter(u => u.role === "assistente_comercial").length,
    pedagogos: users.filter(u => u.role === "equipe_pedagogica").length,
    professores: users.filter(u => u.role === "professor").length,
    alunos: users.filter(u => u.role === "aluno").length,
  }), [users])

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()

    if (!createName || !createEmail || !createCpf || !createPassword) return

    const nextId = Math.max(0, ...users.map((u) => u.id)) + 1
    setUsers((prev) => [
      ...prev,
      {
        id: nextId,
        name: createName,
        email: createEmail,
        cpf: createCpf,
        password: createPassword,
        role: createRole,
        commission_percent: createRole === "assistente_comercial" ? createCommission : undefined,
        active: true,
      },
    ])

    resetCreateForm()
    setIsCreateModalOpen(false)
  }

  const resetCreateForm = () => {
    setCreateName("")
    setCreateEmail("")
    setCreateCpf("")
    setCreatePassword("")
    setCreateRole("aluno")
    setCreateCommission(10)
  }

  const toggleUserStatus = (userId: number) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u)))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ceo": return Crown
      case "assistente_comercial": return Briefcase
      case "equipe_pedagogica": return GraduationCap
      case "professor": return BookOpen
      default: return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ceo": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "assistente_comercial": return "bg-blue-100 text-blue-800 border-blue-200"
      case "equipe_pedagogica": return "bg-purple-100 text-purple-800 border-purple-200"
      case "professor": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ceo": return "CEO"
      case "assistente_comercial": return "Assistente"
      case "equipe_pedagogica": return "Pedagógico"
      case "professor": return "Professor"
      default: return "Aluno"
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-green-500/40 bg-gradient-to-b from-green-700/30 to-slate-900/50 p-4 text-white">
                <p className="text-xs uppercase tracking-wide text-white/70">Total de Usuários</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </Card>
              <Card className="border-blue-500/40 bg-gradient-to-b from-blue-700/30 to-slate-900/50 p-4 text-white">
                <p className="text-xs uppercase tracking-wide text-white/70">Ativos</p>
                <p className="text-3xl font-bold">{stats.active}</p>
              </Card>
              <Card className="border-red-500/40 bg-gradient-to-b from-red-700/30 to-slate-900/50 p-4 text-white">
                <p className="text-xs uppercase tracking-wide text-white/70">Inativos</p>
                <p className="text-3xl font-bold">{stats.inactive}</p>
              </Card>
              <Card className="border-purple-500/40 bg-gradient-to-b from-purple-700/30 to-slate-900/50 p-4 text-white">
                <p className="text-xs uppercase tracking-wide text-white/70">Perfis</p>
                <p className="text-3xl font-bold">{Object.keys(stats).filter(k => k !== 'total' && k !== 'active' && k !== 'inactive').length}</p>
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
                    <Input
                      placeholder="Nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-40">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Perfil</Label>
                  <Select value={filterRole} onValueChange={(value) => setFilterRole(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ceo">CEO</SelectItem>
                      <SelectItem value="assistente_comercial">Assistente</SelectItem>
                      <SelectItem value="equipe_pedagogica">Pedagógico</SelectItem>
                      <SelectItem value="professor">Professor</SelectItem>
                      <SelectItem value="aluno">Aluno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-32">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Status</Label>
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => { setSearchTerm(""); setFilterRole("todos"); setFilterStatus("todos") }}>
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
                    Lista de Usuários ({filteredUsers.length})
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Ordenado alfabeticamente
                  </div>
                </div>
              </div>

              {filteredUsers.length > 0 ? (
                <div className="divide-y">
                  {filteredUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.role)
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Avatar */}
                          <Avatar className="h-10 w-10 border border-gray-200 flex-shrink-0">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-r from-[#e8491d] to-[#f97316] text-white font-semibold text-sm">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold text-foreground truncate">{user.name}</h4>
                              <Badge className={`text-xs ${getRoleColor(user.role)} flex-shrink-0`}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {getRoleLabel(user.role)}
                              </Badge>
                              {user.active ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-shrink-0">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex-shrink-0">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inativo
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                <span>{user.cpf}</span>
                              </div>
                              {user.role === "assistente_comercial" && user.commission_percent && (
                                <div className="flex items-center gap-1">
                                  <Percent className="h-3 w-3" />
                                  <span>{user.commission_percent}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id)}
                            className="border-gray-200 hover:border-[#e8491d] hover:text-[#e8491d]"
                          >
                            {user.active ? (
                              <>
                                <UserX className="h-3 w-3 mr-1" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Ativar
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-[#e8491d]/10 hover:text-[#e8491d]"
                          >
                            <Settings className="h-4 w-4" />
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
                    {searchTerm || filterRole !== "todos" || filterStatus !== "todos"
                      ? "Tente ajustar os filtros de busca"
                      : "Comece criando seu primeiro usuário"}
                  </p>
                  {!searchTerm && filterRole === "todos" && filterStatus === "todos" && (
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Usuário
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">Distribuição por Perfil</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">CEO</span>
                    </div>
                    <Badge variant="outline">{stats.ceo}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Assistentes</span>
                    </div>
                    <Badge variant="outline">{stats.assistentes}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Pedagógicos</span>
                    </div>
                    <Badge variant="outline">{stats.pedagogos}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Professores</span>
                    </div>
                    <Badge variant="outline">{stats.professores}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Alunos</span>
                    </div>
                    <Badge variant="outline">{stats.alunos}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
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
                  <UserCheck className="h-4 w-4 mr-2" />
                  Ativar Todos
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <UserX className="h-4 w-4 mr-2" />
                  Desativar Inativos
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Comunicado
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Resetar Senhas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create User Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
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
                    <User className="h-4 w-4 inline mr-2" />
                    Nome Completo *
                  </Label>
                  <Input
                    id="create-name"
                    placeholder="Digite o nome completo"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="create-email" className="text-sm font-medium mb-2 block">
                    <Mail className="h-4 w-4 inline mr-2" />
                    E-mail *
                  </Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="usuario@email.com"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="create-cpf" className="text-sm font-medium mb-2 block">
                    <Shield className="h-4 w-4 inline mr-2" />
                    CPF *
                  </Label>
                  <Input
                    id="create-cpf"
                    placeholder="000.000.000-00"
                    value={createCpf}
                    onChange={(e) => setCreateCpf(e.target.value)}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="create-password" className="text-sm font-medium mb-2 block">
                    <Settings className="h-4 w-4 inline mr-2" />
                    Senha *
                  </Label>
                  <Input
                    id="create-password"
                    type="password"
                    placeholder="Digite uma senha segura"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="create-role" className="text-sm font-medium mb-2 block">
                    <Crown className="h-4 w-4 inline mr-2" />
                    Perfil de Acesso *
                  </Label>
                  <Select value={createRole} onValueChange={(value) => setCreateRole(value as any)}>
                    <SelectTrigger className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300">
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ceo">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-600" />
                          CEO - Acesso Total
                        </div>
                      </SelectItem>
                      <SelectItem value="assistente_comercial">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                          Assistente Comercial
                        </div>
                      </SelectItem>
                      <SelectItem value="equipe_pedagogica">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                          Equipe Pedagógica
                        </div>
                      </SelectItem>
                      <SelectItem value="professor">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          Professor
                        </div>
                      </SelectItem>
                      <SelectItem value="aluno">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-600" />
                          Aluno
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {createRole === "assistente_comercial" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Percent className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Configuração de Comissão</span>
                  </div>
                  <div>
                    <Label htmlFor="create-commission" className="text-sm font-medium mb-2 block">
                      Percentual de Comissão (%)
                    </Label>
                    <Input
                      id="create-commission"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={createCommission}
                      onChange={(e) => setCreateCommission(Number(e.target.value))}
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
                <Button
                  type="submit"
                  className="flex-1 bg-[#e8491d] hover:bg-[#d13a0f] text-white"
                >
                  Criar Usuário
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
