"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Loader2, Monitor, MapPin, Layers } from "lucide-react"
import { api, type ApiCourse } from "@/lib/api"

const modalidadeLabel: Record<string, string> = {
  presencial: "Presencial",
  online:     "Online",
  hibrido:    "Híbrido",
}
const modalidadeClass: Record<string, string> = {
  presencial: "bg-amber-100 text-amber-700",
  online:     "bg-sky-100 text-sky-700",
  hibrido:    "bg-violet-100 text-violet-700",
}
const modalidadeIcon: Record<string, typeof MapPin> = {
  presencial: MapPin,
  online:     Monitor,
  hibrido:    Layers,
}

export default function ProfessorCursosPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [search,  setSearch ] = useState("")

  useEffect(() => {
    api.courses.list()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Cursos</h1>
          <p className="mt-1 text-muted-foreground">Cursos vinculados ao seu perfil</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar curso..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <span>Lista de Cursos</span>
            <span className="text-sm font-normal text-muted-foreground">{filtered.length} curso(s)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" /> Curso
                      </span>
                    </th>
                    <th className="pb-3 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" /> Modalidade
                      </span>
                    </th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((course) => {
                    const Icon = modalidadeIcon[course.access_type] ?? BookOpen
                    return (
                      <tr key={course.id} className="border-b last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {course.title.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">{course.title}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge
                            variant="secondary"
                            className={modalidadeClass[course.access_type] ?? "bg-gray-100 text-gray-600"}
                          >
                            <Icon className="mr-1 h-3 w-3" />
                            {modalidadeLabel[course.access_type] ?? course.access_type}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Badge
                            variant="secondary"
                            className={
                              course.status === "published"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }
                          >
                            {course.status === "published" ? "Publicado" : "Rascunho"}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">Nenhum curso encontrado.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
