"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Loader2, Users, Calendar, ChevronDown, ChevronUp, User } from "lucide-react"
import { fakeApiCall, fakeApiPost } from "@/lib/api"
import { mockTurmas, mockCourses, getCourseById, getStudentsByTurmaId, type Turma, type Student } from "@/lib/mock-data"
import { Progress } from "@/components/ui/progress"

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [expandedTurma, setExpandedTurma] = useState<number | null>(null)

  useEffect(() => {
    async function fetchTurmas() {
      const data = await fakeApiCall(mockTurmas)
      setTurmas(data)
      setLoading(false)
    }
    fetchTurmas()
  }, [])

  const filtered = turmas.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleNewTurma(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    await fakeApiPost({}, 1000)
    setSaving(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setShowNew(false)
    }, 1500)
  }

  const statusLabels: Record<string, string> = {
    aberta: "Aberta",
    fechada: "Fechada",
    em_andamento: "Em Andamento",
  }

  const statusColors: Record<string, string> = {
    aberta: "bg-green-100 text-green-700",
    fechada: "bg-red-100 text-red-700",
    em_andamento: "bg-blue-100 text-blue-700",
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Turmas</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie as turmas dos cursos
          </p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nova Turma
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar turmas..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((turma) => {
            const course = getCourseById(turma.course_id)
            const occupancy = Math.round((turma.enrolled_count / turma.max_students) * 100)
            const isExpanded = expandedTurma === turma.id
            const students = isExpanded ? getStudentsByTurmaId(turma.id) : []
            return (
              <Card key={turma.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-foreground">{turma.name}</CardTitle>
                    <Badge className={statusColors[turma.status]} variant="secondary">
                      {statusLabels[turma.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{course?.title}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{turma.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{turma.start_date} a {turma.end_date}</span>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Ocupacao
                      </span>
                      <span className="font-medium text-foreground">
                        {turma.enrolled_count}/{turma.max_students}
                      </span>
                    </div>
                    <Progress value={occupancy} className="h-2" />
                  </div>

                  {/* Alunos Matriculados - Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTurma(isExpanded ? null : turma.id)
                    }
                    className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Alunos Matriculados
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="rounded-lg border bg-background">
                      {students.length > 0 ? (
                        <ul className="divide-y">
                          {students.map((student, idx) => (
                            <li
                              key={student.id}
                              className="flex items-center gap-3 px-3 py-2"
                            >
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {idx + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {student.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {student.email}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-4">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Nenhum aluno matriculado
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">
              Nenhuma turma encontrada.
            </p>
          )}
        </div>
      )}

      {/* New Turma Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Turma</DialogTitle>
            <DialogDescription>Preencha as informacoes da nova turma.</DialogDescription>
          </DialogHeader>
          {success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-foreground">Turma criada com sucesso!</p>
            </div>
          ) : (
            <form onSubmit={handleNewTurma} className="space-y-4">
              <div className="space-y-2">
                <Label>Curso</Label>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Selecione o curso" /></SelectTrigger>
                  <SelectContent>
                    {mockCourses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="turma-name">Nome da Turma</Label>
                <Input id="turma-name" placeholder="Ex: Turma A - Manha" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Turno</Label>
                  <Select required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manha">Manha</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="turma-max">Maximo de Alunos</Label>
                  <Input id="turma-max" type="number" placeholder="40" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="turma-schedule">Horario</Label>
                <Input id="turma-schedule" placeholder="Ex: Seg a Sex, 08h00 as 11h15" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="turma-start">Data Inicio</Label>
                  <Input id="turma-start" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="turma-end">Data Termino</Label>
                  <Input id="turma-end" type="date" required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Criar Turma"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
