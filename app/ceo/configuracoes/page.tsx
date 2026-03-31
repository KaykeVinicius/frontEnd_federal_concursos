"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Users,
  User,
  LogOut,
  Edit3,
  Save,
  Key,
  Building2,
  Phone,
  AtSign,
  MapPin,
  CheckCircle,
  Clock,
  Server,
  HardDrive,
  Activity
} from "lucide-react"

export default function ConfiguracoesPage() {
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
                    5 Contas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Account */}
                <div className="relative overflow-hidden rounded-xl border-2 border-[#e8491d]/20 bg-gradient-to-r from-[#e8491d]/5 to-orange-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-[#e8491d]">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-[#e8491d] text-white font-bold">CEO</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground">CEO Geral</p>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm text-muted-foreground">ceo@federalcursos.com.br</p>
                        <p className="text-xs text-green-600 font-medium">Conta ativa</p>
                      </div>
                    </div>
                    <Badge className="bg-[#e8491d] text-white">CEO</Badge>
                  </div>
                </div>

                {/* Other Accounts */}
                <div className="space-y-3">
                  <div className="group relative overflow-hidden rounded-lg border border-gray-200 p-4 transition-all duration-300 hover:border-blue-300 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">AS</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">Assistente Comercial</p>
                          <p className="text-sm text-muted-foreground">assistente@federalcursos.com.br</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-blue-200 text-blue-700">Assistente</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Trocar para
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-lg border border-gray-200 p-4 transition-all duration-300 hover:border-green-300 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-green-100 text-green-600 font-semibold">PR</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">Professor</p>
                          <p className="text-sm text-muted-foreground">professor@federalcursos.com.br</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-green-200 text-green-700">Professor</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Trocar para
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-lg border border-gray-200 p-4 transition-all duration-300 hover:border-purple-300 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">PD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">Equipe Pedagógica</p>
                          <p className="text-sm text-muted-foreground">pedagogico@federalcursos.com.br</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-purple-200 text-purple-700">Pedagógico</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Trocar para
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-lg border border-gray-200 p-4 transition-all duration-300 hover:border-orange-300 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">AL</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">Aluno</p>
                          <p className="text-sm text-muted-foreground">aluno@federalcursos.com.br</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-orange-200 text-orange-700">Aluno</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Trocar para
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

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
                      <CardDescription>Configure alertas e notificações do sistema</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm font-medium">Senha Atual</Label>
                    <Input id="current-password" type="password" className="border-gray-200 focus:border-red-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium">Nova Senha</Label>
                    <Input id="new-password" type="password" className="border-gray-200 focus:border-red-500" />
                  </div>
                </div>
                <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                  <Key className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Button>
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
