"use client"

import Image from "next/image"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentEnrollments } from "@/components/recent-enrollments"

export default function AdminDashboardPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Background logo watermark */}
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
            Visao geral do sistema Federal Cursos
          </p>
        </div>

        <DashboardStats />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <RecentEnrollments />

          <div className="flex flex-col gap-6">
            {/* Quick Actions Card */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Acoes Rapidas</h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/admin/alunos?action=new-enrollment"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="text-sm font-medium text-foreground">Nova Matricula</span>
                </a>
                <a
                  href="/admin/cursos?action=new"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="text-sm font-medium text-foreground">Novo Curso</span>
                </a>
                <a
                  href="/admin/turmas?action=new"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="text-sm font-medium text-foreground">Nova Turma</span>
                </a>
                <a
                  href="/admin/materias?action=new"
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="text-sm font-medium text-foreground">Nova Materia</span>
                </a>
                <a
                  href="/admin/eventos"
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
