"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockTurmas, mockCourses, Turma, Course } from "@/lib/mock-data"

export default function CeoTurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>(mockTurmas)
  const [selectedCourseId, setSelectedCourseId] = useState<number>(mockCourses.filter(c => c.access_type !== "externo")[0]?.id ?? 0)
  const [name, setName] = useState("")
  const [shift, setShift] = useState("Manhã")
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filtrar cursos que podem ter turmas (presencial ou híbrido)
  const availableCourses = mockCourses.filter(course => course.access_type === "interno" || course.access_type === "ambos")

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedCourse = mockCourses.find(c => c.id === selectedCourseId)
    if (!selectedCourse) return

    const newTurma: Turma = {
        id: Math.max(0, ...turmas.map((t) => t.id)) + 1,
        course_id: selectedCourseId,
        name,
        shift,
        start_date: selectedCourse.start_date || new Date().toISOString().slice(0, 10),
        end_date: selectedCourse.end_date || new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().slice(0, 10),
        schedule: "Seg - Sex",
        max_students: 30,
        enrolled_count: 0,
        status: "aberta",
        availableSlots: undefined,
        turno: ""
    }
    setTurmas((prev) => [...prev, newTurma])
    resetForm()
  }

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma)
    setSelectedCourseId(turma.course_id)
    setName(turma.name)
    setShift(turma.shift)
    setIsDialogOpen(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTurma) return
    const updatedTurma: Turma = {
      ...editingTurma,
      course_id: selectedCourseId,
      name,
      shift,
    }
    setTurmas((prev) => prev.map((t) => (t.id === editingTurma.id ? updatedTurma : t)))
    setIsDialogOpen(false)
    setEditingTurma(null)
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setShift("Manhã")
    setSelectedCourseId(availableCourses[0]?.id ?? 0)
  }

  const countByStatus = useMemo(() => ({
    abertas: turmas.filter((t) => t.status === "aberta").length,
    em_andamento: turmas.filter((t) => t.status === "em_andamento").length,
    fechadas: turmas.filter((t) => t.status === "fechada").length,
  }), [turmas])

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Turmas (CEO)</h1>
          <p className="text-sm text-muted-foreground">Gestão de turmas presenciais e híbridas. Crie turmas vinculadas a cursos com horários definidos.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-500/40 bg-gradient-to-b from-green-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Abertas</p>
            <p className="text-3xl font-bold">{countByStatus.abertas}</p>
          </Card>
          <Card className="border-blue-500/40 bg-gradient-to-b from-blue-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Em Andamento</p>
            <p className="text-3xl font-bold">{countByStatus.em_andamento}</p>
          </Card>
          <Card className="border-red-500/40 bg-gradient-to-b from-red-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Fechadas</p>
            <p className="text-3xl font-bold">{countByStatus.fechadas}</p>
          </Card>
          <Card className="border-purple-500/40 bg-gradient-to-b from-purple-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Total</p>
            <p className="text-3xl font-bold">{turmas.length}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground">Criar Nova Turma</p>
          </div>
          <form onSubmit={handleAdd} className="grid gap-3 lg:grid-cols-4">
            <div className="col-span-2">
              <Label htmlFor="course-select">Curso</Label>
              <Select value={selectedCourseId.toString()} onValueChange={(value) => setSelectedCourseId(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title} ({course.access_type === "interno" ? "Presencial" : "Híbrido"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="turma-name">Nome da Turma</Label>
              <Input
                id="turma-name"
                placeholder="Ex: Turma A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="shift-select">Turno</Label>
              <Select value={shift} onValueChange={setShift}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manhã">Manhã</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-4">
              <Button type="submit" className="w-full">
                + Criar Turma
              </Button>
            </div>
          </form>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {turmas.map((turma) => {
            const course = mockCourses.find((c) => c.id === turma.course_id)
            return (
              <Card key={turma.id} className="border border-slate-700 p-5 hover:shadow-xl hover:border-primary transition">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{turma.name}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs uppercase ${
                    turma.status === "aberta" ? "bg-green-800 text-green-200" :
                    turma.status === "em_andamento" ? "bg-blue-800 text-blue-200" :
                    "bg-red-800 text-red-200"
                  }`}>
                    {turma.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {course?.title || "Curso não encontrado"}
                </p>
                <div className="flex items-center justify-between text-sm font-medium mb-2">
                  <span className="rounded-lg bg-slate-800 px-2 py-1 text-sky-300">{turma.shift}</span>
                  <span className="rounded-lg bg-slate-800 px-2 py-1 text-emerald-300">
                    {course?.access_type === "interno" ? "Presencial" : "Híbrido"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  <p>Início: {new Date(turma.start_date).toLocaleDateString("pt-BR")}</p>
                  <p>Fim: {new Date(turma.end_date).toLocaleDateString("pt-BR")}</p>
                  <p>Alunos: {turma.enrolled_count}/{turma.max_students}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleEdit(turma)}>
                  Editar
                </Button>
              </Card>
            )
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Turma</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-course">Curso</Label>
                <Select value={selectedCourseId.toString()} onValueChange={(value) => setSelectedCourseId(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title} ({course.access_type === "interno" ? "Presencial" : "Híbrido"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-name">Nome da Turma</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-shift">Turno</Label>
                <Select value={shift} onValueChange={setShift}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Salvar Alterações</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}