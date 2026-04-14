"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plus, Search, BookOpen, Loader2, Eye } from "lucide-react"
import { api, type ApiCourse, type ApiSubject, type ApiTurma } from "@/lib/api"

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
}
const statusLabels: Record<string, string> = { published: "Publicado", draft: "Rascunho" }
const turmaStatusColors: Record<string, string> = {
  aberta: "bg-green-100 text-green-700", em_andamento: "bg-blue-100 text-blue-700", fechada: "bg-red-100 text-red-700",
}
const turmaStatusLabels: Record<string, string> = { aberta: "Aberta", em_andamento: "Em Andamento", fechada: "Fechada" }

export default function CursosPage() {
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null)
  const [detailSubjects, setDetailSubjects] = useState<ApiSubject[]>([])
  const [detailTurmas, setDetailTurmas] = useState<ApiTurma[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchCourses = useCallback((q?: string) => {
    return api.courses.list(q ? { title_cont: q } : undefined)
  }, [])

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [fetchCourses])

  useEffect(() => {
    const t = setTimeout(() => {
      fetchCourses(search || undefined).then(setCourses).catch(console.error)
    }, 300)
    return () => clearTimeout(t)
  }, [search, fetchCourses])

  async function openDetail(course: ApiCourse) {
    setSelectedCourse(course)
    setDetailSubjects([])
    setDetailTurmas([])
    setDetailLoading(true)
    try {
      const [subjects, turmas] = await Promise.all([
        api.subjects.list(course.id),
        api.turmas.list(course.id),
      ])
      setDetailSubjects(subjects)
      setDetailTurmas(turmas)
    } catch (err) { console.error(err) }
    finally { setDetailLoading(false) }
  }

  const filtered = courses

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cursos</h1>
          <p className="mt-1 text-muted-foreground">Visualize os cursos disponíveis</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <a href="/pedagogica/cursos"><Plus className="mr-2 h-4 w-4" /> Novo Curso</a>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar cursos..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Card key={course.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <Badge className={statusColors[course.status] ?? "bg-gray-100 text-gray-700"} variant="secondary">
                    {statusLabels[course.status] ?? course.status}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-lg text-foreground">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-primary">R$ {Number(course.price).toFixed(2)}</span>
                  <span className="text-muted-foreground">{course.duration_in_days} dias</span>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => openDetail(course)}>
                    <Eye className="mr-1 h-3 w-3" /> Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">Nenhum curso encontrado.</p>
          )}
        </div>
      )}

      {/* Course Detail Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedCourse?.title}</DialogTitle>
            <DialogDescription>Detalhes do curso, matérias e turmas</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Preço</span>
                  <p className="font-semibold text-primary">R$ {Number(selectedCourse.price).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duração</span>
                  <p className="font-medium text-foreground">{selectedCourse.duration_in_days} dias</p>
                </div>
              </div>

              {detailLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : (
                <>
                  <div>
                    <h4 className="mb-2 font-semibold text-foreground">Matérias do Curso</h4>
                    <div className="space-y-2">
                      {detailSubjects.map((sub) => (
                        <div key={sub.id} className="rounded-lg border p-3">
                          <p className="font-medium text-foreground">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">{sub.description}</p>
                        </div>
                      ))}
                      {detailSubjects.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma matéria cadastrada.</p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold text-foreground">Turmas do Curso</h4>
                    <div className="space-y-2">
                      {detailTurmas.map((turma) => (
                        <div key={turma.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground">{turma.name}</p>
                            <Badge className={turmaStatusColors[turma.status] ?? "bg-gray-100 text-gray-700"} variant="secondary">
                              {turmaStatusLabels[turma.status] ?? turma.status}
                            </Badge>
                          </div>
                          {turma.schedule && <p className="text-xs text-muted-foreground">{turma.schedule}</p>}
                          <p className="text-xs text-muted-foreground">{turma.enrolled_count}/{turma.max_students} alunos</p>
                        </div>
                      ))}
                      {detailTurmas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma turma cadastrada.</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
