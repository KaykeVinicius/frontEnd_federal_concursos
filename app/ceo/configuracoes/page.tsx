"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Bell, Shield, Database, Mail } from "lucide-react"

export default function ConfiguracoesPage() {
  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Configuracoes</h1>
          <p className="text-muted-foreground">Gerencie as configuracoes do sistema</p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg text-foreground">Configuracoes Gerais</CardTitle>
                <CardDescription>Informacoes basicas da empresa</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nome da Empresa</Label>
                <Input id="company-name" defaultValue="Federal Cursos" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" defaultValue="55.703.401/0001-08" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereco</Label>
              <Input id="address" defaultValue="Rua Getulio Vargas, 2634, Sala 01, Sao Cristovao, Porto Velho - RO" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" defaultValue="(69) 9 9369-7213" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue="contato@federalcursos.com.br" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Salvar Alteracoes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg text-foreground">Notificacoes</CardTitle>
                <CardDescription>Configure as notificacoes do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Notificar novas matriculas</p>
                <p className="text-sm text-muted-foreground">Receba um email quando houver nova matricula</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Notificar contratos pendentes</p>
                <p className="text-sm text-muted-foreground">Alerta de contratos aguardando assinatura</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Relatorio semanal</p>
                <p className="text-sm text-muted-foreground">Receba um resumo semanal por email</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg text-foreground">Seguranca</CardTitle>
                <CardDescription>Configuracoes de seguranca da conta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline">Alterar Senha</Button>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg text-foreground">Informacoes do Sistema</CardTitle>
                <CardDescription>Dados tecnicos do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Versao</p>
                <p className="font-medium text-foreground">1.0.0</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Ambiente</p>
                <p className="font-medium text-foreground">Producao</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Ultimo Backup</p>
                <p className="font-medium text-foreground">18/03/2026 03:00</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium text-green-600">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
