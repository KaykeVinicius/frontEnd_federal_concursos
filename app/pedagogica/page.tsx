"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users, BookOpen, Layers, PlayCircle, FileText, TrendingUp, UserCheck, PlusCircle, Loader2, Briefcase,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api, type ApiCourse, type ApiEnrollment } from "@/lib/api"

export default function PedagogicaDashboard() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [careersCount, setCareersCount] = useState(0)

  useEffect(() => {
    Promise.all([
      api.courses.list(),
      api.enrollments.list(),
      api.careers.list(),
    ])
      .then(([c, e, ca]) => {
        setCourses(c)
        setEnrollments(e)
        setCareersCount(ca.length)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const publishedCourses = courses.filter((c) => c.status === "published")
  const draftCourses = courses.filter((c) => c.status === "draft")
  const activeEnrollments = enrollments.filter((e) => e.status === "active")

  const stats = [
    {
      label: "Alunos Matriculados",
      value: activeEnrollments.length,
      sub: `${enrollments.length} matrículas no total`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Cursos Publicados",
      value: publishedCourses.length,
      sub: draftCourses.length > 0 ? `${draftCourses.length} em rascunho` : "Todos publicados",
      icon: BookOpen,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Total de Cursos",
      value: courses.length,
      sub: "cadastrados no sistema",
      icon: Layers,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "Carreiras",
      value: careersCount,
      sub: "cadastradas",
      icon: Briefcase,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
  ]

  return (
    <div className="relative min-h-screen p-4 lg:p-8">
      <div className="relative z-10 mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Painel Pedagógico</h1>
            <p className="text-muted-foreground">Gerencie cursos, videoaulas e materiais dos alunos</p>
          </div>
          <Link
            href="/pedagogica/cursos"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-all hover:opacity-90 hover:-translate-y-0.5"
          >
            <PlusCircle className="h-4 w-4" /> Criar Curso
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <CardTitle className="text-base font-semibold">Cursos cadastrados</CardTitle>
                <Link href="/pedagogica/cursos" className="text-xs text-primary hover:underline">
                  Ver todos →
                </Link>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum curso cadastrado ainda.</p>
                    <p className="text-xs text-muted-foreground">
                      Crie primeiro as <Link href="/pedagogica/carreiras" className="text-primary hover:underline">carreiras</Link> e <Link href="/pedagogica/turmas" className="text-primary hover:underline">turmas</Link>, depois crie os cursos.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="pb-2 font-medium">Curso</th>
                          <th className="pb-2 font-medium">Carreira</th>
                          <th className="pb-2 font-medium">Acesso</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {courses.slice(0, 8).map((c) => (
                          <tr key={c.id} className="group">
                            <td className="py-3 font-medium text-foreground">{c.title}</td>
                            <td className="py-3 text-muted-foreground">{c.career?.name ?? "—"}</td>
                            <td className="py-3 text-muted-foreground capitalize">{c.access_type}</td>
                            <td className="py-3">
                              <Badge variant="secondary" className={
                                c.status === "published"
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-yellow-500/10 text-yellow-600"
                              }>
                                {c.status === "published" ? "Publicado" : "Rascunho"}
                              </Badge>
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
                )}
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  Ações Rápidas — Siga a ordem
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { href: "/pedagogica/carreiras", icon: Briefcase, label: "1. Carreiras", color: "text-orange-500", step: true },
                  { href: "/pedagogica/turmas", icon: Layers, label: "2. Turmas", color: "text-blue-500", step: true },
                  { href: "/pedagogica/materias", icon: FileText, label: "3. Matérias", color: "text-purple-500", step: true },
                  { href: "/pedagogica/cursos", icon: BookOpen, label: "4. Cursos", color: "text-green-500", step: true },
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

            {/* Trending */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Resumo de Matrículas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Matrículas ativas", value: activeEnrollments.length, total: Math.max(enrollments.length, 1) },
                    { label: "Total de matrículas", value: enrollments.length, total: Math.max(enrollments.length, 1) },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>{item.label}</span>
                        <span className="font-medium text-foreground">{item.value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.round((item.value / item.total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-green-500" />
                    Status dos Cursos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Publicados", value: publishedCourses.length, color: "bg-green-500" },
                    { label: "Rascunhos", value: draftCourses.length, color: "bg-yellow-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>{item.label}</span>
                        <span className="font-medium text-foreground">{item.value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all`}
                          style={{ width: courses.length > 0 ? `${Math.round((item.value / courses.length) * 100)}%` : "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
