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
import { Plus, Search, Loader2, GraduationCap } from "lucide-react"
import { fakeApiCall, fakeApiPost } from "@/lib/api"
import { mockSubjects, mockCourses, getCourseById, type Subject } from "@/lib/mock-data"

export default function MateriasPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCourse, setFilterCourse] = useState<string>("all")
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchSubjects() {
      const data = await fakeApiCall(mockSubjects)
      setSubjects(data)
      setLoading(false)
    }
    fetchSubjects()
  }, [])

  const filtered = subjects.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchCourse =
      filterCourse === "all" || s.course_id === Number(filterCourse)
    return matchSearch && matchCourse
  })

  // Group subjects by course
  const groupedByCourse = filtered.reduce<Record<number, Subject[]>>((acc, sub) => {
    if (!acc[sub.course_id]) acc[sub.course_id] = []
    acc[sub.course_id].push(sub)
    return acc
  }, {})

  async function handleNewSubject(e: React.FormEvent<HTMLFormElement>) {
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
          <h1 className="text-3xl font-bold text-foreground">Materias</h1>
          <p className="mt-1 text-muted-foreground">
            Materias vinculadas aos cursos
          </p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nova Materia
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar materias..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filtrar por curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Cursos</SelectItem>
            {mockCourses.map((course) => (
              <SelectItem key={course.id} value={String(course.id)}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCourse).map(([courseId, subs]) => {
            const course = getCourseById(Number(courseId))
            return (
              <Card key={courseId}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg text-foreground">{course?.title}</CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {subs.length} materias
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {subs
                      .sort((a, b) => a.position - b.position)
                      .map((sub) => (
                        <div
                          key={sub.id}
                          className="rounded-lg border p-4 transition-colors hover:border-primary/30 hover:bg-accent"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-foreground">{sub.name}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {sub.description}
                              </p>
                            </div>
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                              {sub.position}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {Object.keys(groupedByCourse).length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma materia encontrada.
            </p>
          )}
        </div>
      )}

      {/* New Subject Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Materia</DialogTitle>
            <DialogDescription>Vincule a materia a um curso existente.</DialogDescription>
          </DialogHeader>
          {success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-foreground">Materia adicionada com sucesso!</p>
            </div>
          ) : (
            <form onSubmit={handleNewSubject} className="space-y-4">
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
                <Label htmlFor="sub-name">Nome da Materia</Label>
                <Input id="sub-name" placeholder="Ex: Direito Constitucional" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-desc">Descricao</Label>
                <Textarea id="sub-desc" placeholder="Descreva a materia..." rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-position">Posicao (ordem)</Label>
                <Input id="sub-position" type="number" placeholder="1" min="1" required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Adicionar Materia"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
