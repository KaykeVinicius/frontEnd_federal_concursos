"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Users, Search, Loader2, ArrowLeft, Phone } from "lucide-react"
import { api, type ApiTurma } from "@/lib/api"

type Student = {
  id: number
  name: string
  email: string
  whatsapp?: string
  cpf?: string
}

export default function TurmaAlunosPage() {
  const params    = useParams()
  const router    = useRouter()
  const turmaId   = Number(params.id)

  const [loading,  setLoading ] = useState(true)
  const [turma,    setTurma   ] = useState<ApiTurma | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [search,   setSearch  ] = useState("")
  const [error,    setError   ] = useState("")

  useEffect(() => {
    Promise.all([
      api.professor.turmas(),
      api.professor.turmaStudents(turmaId),
    ])
      .then(([turmaList, studentList]) => {
        setTurma(turmaList.find((t) => t.id === turmaId) ?? null)
        setStudents(studentList)
      })
      .catch((err) => {
        console.error(err)
        setError(err?.message ?? "Erro ao carregar dados.")
      })
      .finally(() => setLoading(false))
  }, [turmaId])

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.whatsapp ?? "").includes(search)
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
        <Button variant="ghost" onClick={() => router.back()}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alunos Matriculados</h1>
          <p className="text-sm text-muted-foreground">
            {turma?.course?.title && <span className="font-medium">{turma.course.title}</span>}
            {turma?.name && <span> — {turma.name}</span>}
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "aluno" : "alunos"}
      </p>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
          <Users className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-semibold text-foreground">Nenhum aluno encontrado</p>
            <p className="text-sm text-muted-foreground">
              {students.length === 0
                ? "Esta turma não possui alunos matriculados."
                : "Nenhum aluno corresponde à busca."}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {filtered.map((student, index) => (
            <div
              key={student.id}
              className={`flex items-center justify-between px-4 py-3 ${
                index !== filtered.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-foreground">{student.name}</span>
              </div>

              {student.whatsapp && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{student.whatsapp}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
