"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Search, BookOpen, Loader2, Eye } from "lucide-react"
import { fakeApiCall, fakeApiPost } from "@/lib/api"
import {
  mockCourses,
  getSubjectsByCourseId,
  getTurmasByCourseId,
  type Course,
} from "@/lib/mock-data"

export default function CursosPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  useEffect(() => {
    async function fetchCourses() {
      const data = await fakeApiCall(mockCourses)
      setCourses(data)
      setLoading(false)
    }
    fetchCourses()
  }, [])

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  async function handleNewCourse(e: React.FormEvent<HTMLFormElement>) {
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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cursos</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie os cursos disponiveis
          </p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Curso
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cursos..."
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
          {filtered.map((course) => {
            const subjects = getSubjectsByCourseId(course.id)
            const turmas = getTurmasByCourseId(course.id)
            return (
              <Card key={course.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <Badge
                      className={
                        course.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                      variant="secondary"
                    >
                      {course.status === "published" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 text-lg text-foreground">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">
                      R$ {course.price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      {subjects.length} materias - {turmas.length} turmas
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{course.duration_in_days} dias</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCourse(course)}>
                      <Eye className="mr-1 h-3 w-3" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">
              Nenhum curso encontrado.
            </p>
          )}
        </div>
      )}

      {/* New Course Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Novo Curso</DialogTitle>
            <DialogDescription>Preencha as informacoes do novo curso.</DialogDescription>
          </DialogHeader>
          {success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-foreground">Curso criado com sucesso!</p>
            </div>
          ) : (
            <form onSubmit={handleNewCourse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course-title">Titulo do Curso</Label>
                <Input id="course-title" placeholder="Ex: Reta Final - Assembleia Legislativa" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-desc">Descricao</Label>
                <Textarea id="course-desc" placeholder="Descreva o curso..." rows={3} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="course-price">Preco (R$)</Label>
                  <Input id="course-price" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-duration">Duracao (dias)</Label>
                  <Input id="course-duration" type="number" placeholder="30" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Acesso</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interno">Interno</SelectItem>
                      <SelectItem value="externo">Externo</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Criar Curso"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Course Detail Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedCourse?.title}</DialogTitle>
            <DialogDescription>Detalhes do curso, materias e turmas</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Preco</span>
                  <p className="font-semibold text-primary">R$ {selectedCourse.price.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duracao</span>
                  <p className="font-medium text-foreground">{selectedCourse.duration_in_days} dias</p>
                </div>
              </div>

              {/* Subjects of this course */}
              <div>
                <h4 className="mb-2 font-semibold text-foreground">Materias do Curso</h4>
                <div className="space-y-2">
                  {getSubjectsByCourseId(selectedCourse.id).map((sub) => (
                    <div key={sub.id} className="rounded-lg border p-3">
                      <p className="font-medium text-foreground">{sub.name}</p>
                      <p className="text-xs text-muted-foreground">{sub.description}</p>
                    </div>
                  ))}
                  {getSubjectsByCourseId(selectedCourse.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma materia cadastrada.</p>
                  )}
                </div>
              </div>

              {/* Turmas of this course */}
              <div>
                <h4 className="mb-2 font-semibold text-foreground">Turmas do Curso</h4>
                <div className="space-y-2">
                  {getTurmasByCourseId(selectedCourse.id).map((turma) => (
                    <div key={turma.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{turma.name}</p>
                        <Badge
                          className={
                            turma.status === "aberta"
                              ? "bg-green-100 text-green-700"
                              : turma.status === "em_andamento"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }
                          variant="secondary"
                        >
                          {turma.status === "aberta" ? "Aberta" : turma.status === "em_andamento" ? "Em Andamento" : "Fechada"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{turma.schedule}</p>
                      <p className="text-xs text-muted-foreground">
                        {turma.enrolled_count}/{turma.max_students} alunos
                      </p>
                    </div>
                  ))}
                  {getTurmasByCourseId(selectedCourse.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma turma cadastrada.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
