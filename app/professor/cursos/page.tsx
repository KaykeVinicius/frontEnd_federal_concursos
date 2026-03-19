"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Search,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import {
  mockCourses,
  getSubjectsByCourseId,
  getTurmasByCourseId,
  type Course,
} from "@/lib/mock-data"

export default function ProfessorCursosPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState("")
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      await fakeApiCall(null)
      setCourses(mockCourses.filter((c) => c.status === "published"))
      setLoading(false)
    }
    loadData()
  }, [])

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Cursos</h1>
        <p className="text-muted-foreground">Visualize os cursos e suas materias</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar curso..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((course) => {
          const subjects = getSubjectsByCourseId(course.id)
          const turmas = getTurmasByCourseId(course.id)
          const isExpanded = expandedCourse === course.id

          return (
            <Card key={course.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg text-foreground">
                    {course.title}
                  </CardTitle>
                  <Badge className="bg-green-500/10 text-green-600">Publicado</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{course.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{course.duration_in_days} dias</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{subjects.length} materias</span>
                  </div>
                </div>

                {/* Materias Toggle */}
                <button
                  type="button"
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                  className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Ver Materias ({subjects.length})
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="rounded-lg border bg-background p-3">
                    <ul className="space-y-2">
                      {subjects.map((subject, idx) => (
                        <li
                          key={subject.id}
                          className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {subject.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {subject.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Turmas */}
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Turmas ({turmas.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {turmas.map((turma) => (
                      <Badge key={turma.id} variant="outline">
                        {turma.name}
                      </Badge>
                    ))}
                  </div>
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
    </div>
  )
}
