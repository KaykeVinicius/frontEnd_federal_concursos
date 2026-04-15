"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Users, Search, Loader2, CalendarDays, ChevronRight } from "lucide-react"
import { api, type ApiTurma } from "@/lib/api"

const modalidadeLabel: Record<string, string> = {
  presencial: "Presencial",
  hibrido:    "Híbrido",
}
const modalidadeClass: Record<string, string> = {
  presencial: "bg-amber-100 text-amber-700",
  hibrido:    "bg-violet-100 text-violet-700",
}
const statusClass: Record<string, string> = {
  aberta:       "bg-green-500/10 text-green-600",
  fechada:      "bg-red-500/10 text-red-600",
  em_andamento: "bg-blue-500/10 text-blue-600",
}
const statusLabel: Record<string, string> = {
  aberta: "Aberta", fechada: "Fechada", em_andamento: "Em Andamento",
}

export default function ProfessorTurmasPage() {
  const router                = useRouter()
  const [loading, setLoading] = useState(true)
  const [turmas,  setTurmas ] = useState<ApiTurma[]>([])
  const [search,  setSearch ] = useState("")
  const [error,   setError  ] = useState("")

  useEffect(() => {
    api.professor.turmas()
      .then(setTurmas)
      .catch((err) => {
        console.error(err)
        setError(err?.message ?? "Erro ao carregar turmas.")
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = turmas.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.course?.title?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-destructive font-medium">{error}</p>
        <p className="text-sm text-muted-foreground">Tente fazer logout e login novamente.</p>
      </div>
    )
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Minhas Turmas</h1>
        <p className="text-sm text-muted-foreground">Turmas presenciais vinculadas ao seu perfil</p>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar turma ou curso..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "turma" : "turmas"}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
          <Users className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-semibold text-foreground">Nenhuma turma encontrada</p>
            <p className="text-sm text-muted-foreground">
              {turmas.length === 0
                ? "Você não está vinculado a nenhuma turma presencial."
                : "Nenhuma turma corresponde à busca."}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {filtered.map((turma, index) => {
            const occupancy = turma.max_students > 0
              ? Math.round((turma.enrolled_count / turma.max_students) * 100)
              : 0

            return (
              <div
                key={turma.id}
                className={`flex items-center gap-4 px-4 py-4 ${
                  index !== filtered.length - 1 ? "border-b border-border" : ""
                }`}
              >
                {/* Info principal */}
                <div className="min-w-0 flex-1 space-y-2">
                  {/* Linha 1: curso + badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground truncate">
                      {turma.course?.title ?? turma.name}
                    </span>
                    {turma.modalidade && (
                      <Badge
                        variant="secondary"
                        className={`${modalidadeClass[turma.modalidade] ?? "bg-gray-100 text-gray-600"} shrink-0`}
                      >
                        {modalidadeLabel[turma.modalidade] ?? turma.modalidade}
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={`${statusClass[turma.status] ?? "bg-gray-100 text-gray-600"} shrink-0`}
                    >
                      {statusLabel[turma.status] ?? turma.status}
                    </Badge>
                  </div>

                  {/* Linha 2: turno + período */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {turma.name && (
                      <span className="font-medium text-foreground/70">{turma.name}</span>
                    )}
                    {(turma.start_date || turma.end_date) && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-primary" />
                        {turma.start_date} a {turma.end_date}
                      </span>
                    )}
                  </div>

                  {/* Linha 3: barra de ocupação */}
                  <div className="flex items-center gap-3">
                    <Progress value={occupancy} className="h-1.5 flex-1" />
                    <span className="shrink-0 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{turma.enrolled_count}</span>
                      /{turma.max_students} alunos
                    </span>
                  </div>
                </div>

                {/* Botão alunos */}
                <button
                  type="button"
                  onClick={() => router.push(`/professor/turmas/${turma.id}/alunos`)}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>Alunos</span>
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {turma.enrolled_count}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
