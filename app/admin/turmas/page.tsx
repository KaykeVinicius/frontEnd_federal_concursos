"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Loader2, Users, Calendar, Clock, ChevronDown, ChevronUp, User } from "lucide-react"
import { api, type ApiTurma, type ApiCourse, type ApiEnrollment } from "@/lib/api"

const statusLabels: Record<string, string> = { aberta: "Aberta", fechada: "Fechada", em_andamento: "Em Andamento" }
const statusColors: Record<string, string> = { aberta: "bg-green-100 text-green-700", fechada: "bg-red-100 text-red-700", em_andamento: "bg-blue-100 text-blue-700" }

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<ApiTurma[]>([])
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [expandedTurma, setExpandedTurma] = useState<number | null>(null)

  // Form
  const [fCourseId, setFCourseId] = useState("")
  const [fName, setFName] = useState("")
  const [fShift, setFShift] = useState("")
  const [fSchedule, setFSchedule] = useState("")
  const [fMax, setFMax] = useState("40")
  const [fStart, setFStart] = useState("")
  const [fEnd, setFEnd] = useState("")
  const [fStatus, setFStatus] = useState("aberta")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([api.turmas.list(), api.courses.list(), api.enrollments.list()])
      .then(([t, c, e]) => { setTurmas(t); setCourses(c); setEnrollments(e) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = turmas.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.course?.title?.toLowerCase().includes(search.toLowerCase())
  )

  function getStudentsByTurma(turmaId: number) {
    return enrollments
      .filter((e) => e.turma?.id === turmaId && e.status === "active")
      .map((e) => e.student)
      .filter(Boolean)
  }

  async function handleNewTurma(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!fCourseId || !fName || !fStart || !fEnd) { setError("Preencha os campos obrigatórios."); return }
    setSaving(true); setError("")
    try {
      const nova = await api.turmas.create({
        course_id: parseInt(fCourseId),
        name: fName,
        shift: fShift,
        schedule: fSchedule,
        max_students: parseInt(fMax) || 40,
        start_date: fStart,
        end_date: fEnd,
        status: fStatus,
      })
      setTurmas((prev) => [nova, ...prev])
      setShowNew(false)
      setFCourseId(""); setFName(""); setFShift(""); setFSchedule(""); setFMax("40"); setFStart(""); setFEnd(""); setFStatus("aberta")
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro ao criar turma") }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Turmas</h1>
          <p className="mt-1 text-muted-foreground">Gerencie as turmas dos cursos</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nova Turma
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar turmas..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((turma) => {
            const occupancy = Math.round((turma.enrolled_count / turma.max_students) * 100)
            const isExpanded = expandedTurma === turma.id
            const students = isExpanded ? getStudentsByTurma(turma.id) : []
            return (
              <Card key={turma.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-foreground">{turma.name}</CardTitle>
                    <Badge className={statusColors[turma.status] ?? "bg-gray-100 text-gray-700"} variant="secondary">
                      {statusLabels[turma.status] ?? turma.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{turma.course?.title}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {turma.schedule && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" /><span>{turma.schedule}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{turma.start_date} a {turma.end_date}</span>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" />Ocupação</span>
                      <span className="font-medium text-foreground">{turma.enrolled_count}/{turma.max_students}</span>
                    </div>
                    <Progress value={occupancy} className="h-2" />
                  </div>
                  <button type="button"
                    onClick={() => setExpandedTurma(isExpanded ? null : turma.id)}
                    className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                    <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Alunos Matriculados</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {isExpanded && (
                    <div className="rounded-lg border bg-background">
                      {students.length > 0 ? (
                        <ul className="divide-y">
                          {students.map((student, idx) => (
                            <li key={student!.id} className="flex items-center gap-3 px-3 py-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{idx + 1}</div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">{student!.name}</p>
                                <p className="truncate text-xs text-muted-foreground">{student!.email}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-4">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Nenhum aluno matriculado</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">Nenhuma turma encontrada.</p>
          )}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Turma</DialogTitle>
            <DialogDescription>Preencha as informações da nova turma.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewTurma} className="space-y-4">
            <div className="space-y-2">
              <Label>Curso *</Label>
              <Select value={fCourseId} onValueChange={setFCourseId} required>
                <SelectTrigger><SelectValue placeholder="Selecione o curso" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nome da Turma *</Label>
              <Input placeholder="Ex: Turma A - Manhã" value={fName} onChange={(e) => setFName(e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Turno</Label>
                <Select value={fShift} onValueChange={setFShift}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Máximo de Alunos</Label>
                <Input type="number" value={fMax} onChange={(e) => setFMax(e.target.value)} placeholder="40" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input placeholder="Ex: Seg a Sex, 08h00 às 11h15" value={fSchedule} onChange={(e) => setFSchedule(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Data Início *</Label>
                <Input type="date" value={fStart} onChange={(e) => setFStart(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Data Término *</Label>
                <Input type="date" value={fEnd} onChange={(e) => setFEnd(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={fStatus} onValueChange={setFStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="fechada">Fechada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Criar Turma"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
