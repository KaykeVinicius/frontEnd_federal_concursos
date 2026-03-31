"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Users,
  BookOpen,
  Layers,
  PlayCircle,
  FileText,
  TrendingUp,
  UserCheck,
  PlusCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  {
    label: "Alunos Ativos",
    value: "348",
    sub: "+12 este mês",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    label: "Cursos Publicados",
    value: "8",
    sub: "2 em rascunho",
    icon: BookOpen,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    label: "Módulos Criados",
    value: "34",
    sub: "em 8 cursos",
    icon: Layers,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    label: "Videoaulas",
    value: "212",
    sub: "horas de conteúdo",
    icon: PlayCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    label: "Materiais PDF",
    value: "89",
    sub: "arquivos disponíveis",
    icon: FileText,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    label: "Conclusões",
    value: "127",
    sub: "alunos concluíram cursos",
    icon: UserCheck,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
]

const recentCourses = [
  { nome: "Concurso IPERON 2026", modulos: 5, aulas: 48, alunos: 120, status: "publicado" },
  { nome: "OAB — 1ª e 2ª Fase", modulos: 8, aulas: 72, alunos: 95, status: "publicado" },
  { nome: "Seduc - AM", modulos: 3, aulas: 24, alunos: 67, status: "publicado" },
  { nome: "Banco do Brasil 2025", modulos: 6, aulas: 54, alunos: 43, status: "rascunho" },
]

export default function PedagogicaDashboard() {
  return (
    <div className="relative min-h-screen p-4 lg:p-8">
      {/* Background watermark */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.03]">
        <Image src="/images/logo.jpg" alt="" width={800} height={400} style={{ width: "auto", height: "auto" }} priority />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              Painel Pedagógico
            </h1>
            <p className="text-muted-foreground">
              Gerencie cursos, videoaulas e materiais dos alunos
            </p>
          </div>
          <Link
            href="/pedagogica/cursos"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-all hover:opacity-90 hover:-translate-y-0.5"
          >
            <PlusCircle className="h-4 w-4" />
            Criar Curso
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label} className={`border ${s.border}`}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cursos Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Cursos em andamento</CardTitle>
            <Link href="/pedagogica/cursos" className="text-xs text-primary hover:underline">
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Curso</th>
                    <th className="pb-2 font-medium">Módulos</th>
                    <th className="pb-2 font-medium">Aulas</th>
                    <th className="pb-2 font-medium">Alunos</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentCourses.map((c) => (
                    <tr key={c.nome} className="group">
                      <td className="py-3 font-medium text-foreground">{c.nome}</td>
                      <td className="py-3 text-muted-foreground">{c.modulos}</td>
                      <td className="py-3 text-muted-foreground">{c.aulas}</td>
                      <td className="py-3">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {c.alunos}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          c.status === "publicado"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-yellow-500/10 text-yellow-600"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link
                          href="/pedagogica/cursos"
                          className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
                        >
                          Gerenciar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Progresso alunos */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Engajamento dos Alunos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Assistiram aula esta semana", value: 78, total: 100 },
                { label: "Completaram módulo recente", value: 45, total: 100 },
                { label: "Baixaram material PDF", value: 62, total: 100 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { href: "/pedagogica/cursos", icon: BookOpen, label: "Gerenciar Cursos", color: "text-purple-500" },
                { href: "/pedagogica/eventos", icon: PlayCircle, label: "Eventos", color: "text-blue-500" },
                { href: "/pedagogica/carreiras", icon: TrendingUp, label: "Carreiras", color: "text-orange-500" },
                { href: "/pedagogica/configuracoes", icon: Users, label: "Configurações", color: "text-teal-500" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:border-primary hover:bg-accent"
                >
                  <a.icon className={`h-5 w-5 ${a.color}`} />
                  <span className="text-xs font-medium text-foreground">{a.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
