"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Settings, Bell, Shield, Database, Mail, Users, User, LogOut,
  Edit3, Save, Key, Building2, Phone, AtSign, MapPin, CheckCircle,
  Clock, Server, HardDrive, Activity, Loader2,
} from "lucide-react"
import { api, type ApiUser, type ApiEvent, type ApiEnrollment } from "@/lib/api"

const roleLabel: Record<string, string> = {
  ceo: "CEO",
  assistente_comercial: "Assistente",
  equipe_pedagogica: "Pedagógico",
  professor: "Professor",
  aluno: "Aluno",
}

const roleColor: Record<string, string> = {
  ceo: "bg-yellow-100 text-yellow-800",
  assistente_comercial: "bg-blue-100 text-blue-800",
  equipe_pedagogica: "bg-purple-100 text-purple-800",
  professor: "bg-green-100 text-green-800",
  aluno: "bg-orange-100 text-orange-800",
}

export default function ConfiguracoesPage() {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null)
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Notificações reais
  const [upcomingEvents, setUpcomingEvents] = useState<ApiEvent[]>([])
  const [expiringBoletos, setExpiringBoletos] = useState<ApiEnrollment[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(true)

  // Senha
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState("")

  useEffect(() => {
    Promise.all([api.auth.me(), api.users.list()])
      .then(([me, all]) => {
        setCurrentUser(me)
        setUsers(all)
      })
      .catch(console.error)
      .finally(() => setLoadingUsers(false))

    // Busca eventos e matrículas para notificações
    Promise.all([api.events.list(), api.enrollments.list()])
      .then(([events, enrollments]) => {
        const now = new Date()
        const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const upcoming = events.filter((ev) => {
          const d = new Date(ev.date)
          return d >= now && d <= in7days
        })

        const boletos = enrollments.filter((en) => {
          if (en.payment_method !== "boleto" || !en.expires_at) return false
          const exp = new Date(en.expires_at)
          return exp >= now && exp <= in7days
        })

        setUpcomingEvents(upcoming)
        setExpiringBoletos(boletos)
      })
      .catch(console.error)
      .finally(() => setLoadingNotifs(false))
  }, [])

  const otherUsers = users.filter((u) => u.id !== currentUser?.id)

  async function handleChangePassword(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!currentUser || !newPassword) return
    setSavingPassword(true)
    setPasswordMsg("")
    try {
      await api.users.update(currentUser.id, { password: newPassword })
      setPasswordMsg("Senha alterada com sucesso.")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : "Erro ao alterar senha.")
    } finally {
      setSavingPassword(false)
    }
  }

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#e8491d] to-[#f97316] p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-white/20 p-3">
                <Settings className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
                <p className="text-orange-100">Gerencie todas as configurações e preferências da plataforma</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Informações da Empresa</CardTitle>
                      <CardDescription>Dados básicos e informações de contato</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name" className="flex items-center gap-2 text-sm font-medium">
                      <Building2 className="h-4 w-4" />
                      Nome da Empresa
                    </Label>
                    <Input id="company-name" defaultValue="Federal Cursos" className="border-gray-200 focus:border-[#e8491d]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className="flex items-center gap-2 text-sm font-medium">
                      <Key className="h-4 w-4" />
                      CNPJ
                    </Label>
                    <Input id="cnpj" defaultValue="55.703.401/0001-08" className="border-gray-200 focus:border-[#e8491d]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4" />
                    Endereço Completo
                  </Label>
                  <Input id="address" defaultValue="Rua Getulio Vargas, 2634, Sala 01, Sao Cristovao, Porto Velho - RO" className="border-gray-200 focus:border-[#e8491d]" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </Label>
                    <Input id="phone" defaultValue="(69) 9 9369-7213" className="border-gray-200 focus:border-[#e8491d]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                      <AtSign className="h-4 w-4" />
                      E-mail
                    </Label>
                    <Input id="email" type="email" defaultValue="contato@federalcursos.com.br" className="border-gray-200 focus:border-[#e8491d]" />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Accounts - Enhanced */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Contas de Usuário</CardTitle>
                      <CardDescription>Gerencie múltiplos perfis de acesso</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {loadingUsers ? "..." : `${users.length} Contas`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Account */}
                {loadingUsers ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                ) : currentUser ? (
                  <div className="relative overflow-hidden rounded-xl border-2 border-[#e8491d]/20 bg-gradient-to-r from-[#e8491d]/5 to-orange-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-[#e8491d]">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-[#e8491d] text-white font-bold">{initials(currentUser.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground">{currentUser.name}</p>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                          <p className="text-xs text-green-600 font-medium">Conta ativa</p>
                        </div>
                      </div>
                      <Badge className="bg-[#e8491d] text-white">{roleLabel[currentUser.role] ?? currentUser.role}</Badge>
                    </div>
                  </div>
                ) : null}

                {/* Other Accounts */}
                {otherUsers.length > 0 && (
                  <div className="space-y-3">
                    {otherUsers.map((u) => (
                      <div key={u.id} className="group relative overflow-hidden rounded-lg border border-gray-200 p-4 transition-all duration-300 hover:border-gray-300 hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold">{initials(u.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{u.name}</p>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={roleColor[u.role]}>
                            {roleLabel[u.role] ?? u.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Settings className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">Troca Rápida de Conta</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Clique em "Trocar para" para alternar entre contas de usuário. Isso é útil para usuários com múltiplos perfis de acesso.
                      </p>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair de Todas as Contas
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-yellow-100 p-2">
                      <Bell className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Notificações</CardTitle>
                      <CardDescription>Alertas ativos e preferências do sistema</CardDescription>
                    </div>
                  </div>
                  {!loadingNotifs && (upcomingEvents.length + expiringBoletos.length) > 0 && (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      {upcomingEvents.length + expiringBoletos.length} alerta(s)
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Alertas reais */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">Alertas dos próximos 7 dias</p>
                  {loadingNotifs ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (upcomingEvents.length + expiringBoletos.length) === 0 ? (
                    <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 p-4 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                      <p className="text-sm">Nenhum alerta nos próximos 7 dias.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents.map((ev) => (
                        <div key={ev.id} className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                          <div className="rounded-full bg-orange-100 p-2 shrink-0">
                            <Clock className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">Evento próximo</p>
                            <p className="text-sm text-muted-foreground truncate">{ev.title}</p>
                            <p className="text-xs text-orange-600 mt-0.5">
                              {new Date(ev.date).toLocaleDateString("pt-BR")}
                              {ev.start_time ? ` às ${ev.start_time}` : ""}
                              {ev.location ? ` — ${ev.location}` : ""}
                            </p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200 shrink-0">Evento</Badge>
                        </div>
                      ))}

                      {expiringBoletos.map((en) => (
                        <div key={en.id} className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                          <div className="rounded-full bg-red-100 p-2 shrink-0">
                            <Mail className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">Boleto próximo do vencimento</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {en.student?.name ?? `Matrícula #${en.id}`}
                              {en.course?.title ? ` — ${en.course.title}` : ""}
                            </p>
                            <p className="text-xs text-red-600 mt-0.5">
                              Vence em {new Date(en.expires_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Badge className="bg-red-100 text-red-700 border-red-200 shrink-0">Boleto</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Preferências */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">Preferências</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-2">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Novas matrículas</p>
                          <p className="text-sm text-muted-foreground">Receba um alerta quando houver nova matrícula</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Contratos pendentes</p>
                          <p className="text-sm text-muted-foreground">Alerta de contratos aguardando assinatura</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-purple-100 p-2">
                          <Activity className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Relatório semanal</p>
                          <p className="text-sm text-muted-foreground">Receba um resumo semanal por email</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-2">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Segurança</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm font-medium">Senha Atual</Label>
                    <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="border-gray-200 focus:border-red-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium">Nova Senha</Label>
                    <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="border-gray-200 focus:border-red-500" />
                  </div>
                  {passwordMsg && (
                    <p className={`text-xs ${passwordMsg.includes("sucesso") ? "text-green-600" : "text-destructive"}`}>{passwordMsg}</p>
                  )}
                  <Button type="submit" disabled={savingPassword || !newPassword} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                    {savingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                    Alterar Senha
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <Server className="h-5 w-5 text-gray-600" />
                  </div>
                  <CardTitle className="text-lg">Sistema</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Versão</span>
                    </div>
                    <span className="text-sm font-mono text-gray-700">1.0.0</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Ambiente</span>
                    </div>
                    <Badge variant="outline">Produção</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Último Backup</span>
                    </div>
                    <span className="text-sm text-gray-700">18/03/2026 03:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <Settings className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Backup Manual
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Testar E-mail
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Logs do Sistema
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
