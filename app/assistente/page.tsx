"use client"

import Image from "next/image"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentEnrollments } from "@/components/recent-enrollments"

export default function AssistenteDashboardPage() {
  return (
    <div className="relative min-h-screen p-4 lg:p-8">
      {/* Background watermark */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.04] lg:pl-64">
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

      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Visão geral do sistema Federal Cursos
          </p>
        </div>

        <DashboardStats />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <RecentEnrollments />

          <div className="flex flex-col gap-6">
            {/* Quick Actions Card */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Ações Rápidas</h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/assistente/alunos?action=new-enrollment"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="text-sm font-medium text-foreground">Nova Matrícula</span>
                </a>
                <a
                  href="/assistente/cursos?action=new"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="text-sm font-medium text-foreground">Novo Curso</span>
                </a>
                <a
                  href="/assistente/turmas?action=new"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="text-sm font-medium text-foreground">Nova Turma</span>
                </a>
                <a
                  href="/assistente/materias?action=new"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="text-sm font-medium text-foreground">Nova Matéria</span>
                </a>
                <a
                  href="/assistente/eventos"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="text-sm font-medium text-foreground">Novo Evento</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}