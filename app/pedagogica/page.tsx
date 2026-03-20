"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Layers, GraduationCap, CalendarDays, FileText, Users } from "lucide-react"

export default function EquipePedagogicaPage() {
  return (
    <div className="relative min-h-screen p-4 lg:p-8">
      {/* Background watermark */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.03]">
        <Image
          src="/images/logo.jpg"
          alt=""
          width={800}
          height={400}
          className="max-w-[60vw]"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              Painel da Equipe Pedagógica
            </h1>
            <p className="text-muted-foreground">
              Gerencie cursos, disciplinas, conteúdo e materiais
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="/pedagogica/cursos"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  <span className="text-sm font-medium text-foreground">Organizar Cursos</span>
                </a>
                <a
                  href="/pedagogica/materias"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium text-foreground">Materiais</span>
                </a>
                <a
                  href="/pedagogica/turmas"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <Layers className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium text-foreground">Turmas</span>
                </a>
                <a
                  href="/pedagogica/eventos"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <CalendarDays className="h-6 w-6 text-orange-600" />
                  <span className="text-sm font-medium text-foreground">Eventos</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Visão Geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Cursos Ativos</p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Turmas em Andamento</p>
                  <p className="text-2xl font-bold text-foreground">2</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Materiais Disponíveis</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
