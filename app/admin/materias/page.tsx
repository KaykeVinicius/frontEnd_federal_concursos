"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Loader2, GraduationCap } from "lucide-react"
import { api, type ApiSubject, type ApiCourse } from "@/lib/api"

export default function MateriasPage() {
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCourse, setFilterCourse] = useState<string>("all")
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Form
  const [fCourseId, setFCourseId] = useState("")
  const [fName, setFName] = useState("")
  const [fDesc, setFDesc] = useState("")

  useEffect(() => {
    Promise.all([api.subjects.list(), api.courses.list()])
      .then(([subs, cs]) => { setSubjects(subs); setCourses(cs) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = subjects.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchCourse = filterCourse === "all" || s.course_id === Number(filterCourse)
    return matchSearch && matchCourse
  })

  const groupedByCourse = filtered.reduce<Record<number, ApiSubject[]>>((acc, sub) => {
    if (!acc[sub.course_id]) acc[sub.course_id] = []
    acc[sub.course_id].push(sub)
    return acc
  }, {})

  async function handleNewSubject(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!fCourseId || !fName.trim()) { setError("Preencha os campos obrigatórios."); return }
    setSaving(true); setError("")
    try {
      const position = subjects.filter((s) => s.course_id === parseInt(fCourseId)).length + 1
      const created = await api.subjects.create({
        course_id: parseInt(fCourseId),
        name: fName.trim(),
        description: fDesc.trim(),
        position,
      })
      setSubjects((prev) => [...prev, created])
      setShowNew(false)
      setFCourseId(""); setFName(""); setFDesc("")
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro ao criar matéria") }
    finally { setSaving(false) }
  }

  function getCourseName(courseId: number) {
    return courses.find((c) => c.id === courseId)?.title ?? `Curso ${courseId}`
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Matérias</h1>
          <p className="mt-1 text-muted-foreground">Matérias vinculadas aos cursos</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nova Matéria
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar matérias..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Filtrar por curso" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Cursos</SelectItem>
            {courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCourse).map(([courseId, subs]) => (
            <Card key={courseId}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg text-foreground">{getCourseName(Number(courseId))}</CardTitle>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">{subs.length} matéria(s)</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subs.sort((a, b) => a.position - b.position).map((sub) => (
                    <div key={sub.id} className="rounded-lg border p-4 transition-colors hover:border-primary/30 hover:bg-accent">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{sub.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{sub.description}</p>
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
          ))}
          {Object.keys(groupedByCourse).length === 0 && (
            <p className="py-8 text-center text-muted-foreground">Nenhuma matéria encontrada.</p>
          )}
        </div>
      )}

      {/* New Subject Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Matéria</DialogTitle>
            <DialogDescription>Vincule a matéria a um curso existente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewSubject} className="space-y-4">
            <div className="space-y-2">
              <Label>Curso *</Label>
              <Select value={fCourseId} onValueChange={setFCourseId}>
                <SelectTrigger><SelectValue placeholder="Selecione o curso" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nome da Matéria *</Label>
              <Input placeholder="Ex: Língua Portuguesa" value={fName} onChange={(e) => setFName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea placeholder="Descreva a matéria..." rows={3} value={fDesc} onChange={(e) => setFDesc(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Adicionar Matéria"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
