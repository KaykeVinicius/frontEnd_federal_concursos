"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockCourses, Course } from "@/lib/mock-data"

export default function CeoCursosPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState(0)
  const [accessType, setAccessType] = useState<"interno" | "externo" | "ambos">("ambos")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const newCourse: Course = {
      id: Math.max(0, ...courses.map((c) => c.id)) + 1,
      title,
      description: "Criado pelo CEO",
      price,
      status: "published",
      access_type: accessType,
      duration_in_days: 30,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      created_at: new Date().toISOString().slice(0, 10),
    }
    setCourses((prev) => [...prev, newCourse])
    resetForm()
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setTitle(course.title)
    setPrice(course.price)
    setAccessType(course.access_type)
    setStartDate(course.start_date || "")
    setEndDate(course.end_date || "")
    setIsDialogOpen(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse) return
    const updatedCourse: Course = {
      ...editingCourse,
      title,
      price,
      access_type: accessType,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }
    setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? updatedCourse : c)))
    setIsDialogOpen(false)
    setEditingCourse(null)
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setPrice(0)
    setAccessType("ambos")
    setStartDate("")
    setEndDate("")
  }

  const stats = useMemo(() => ({
    totalCourses: courses.length,
    presencial: courses.filter((c) => c.access_type === "interno").length,
    online: courses.filter((c) => c.access_type === "externo").length,
    hibrido: courses.filter((c) => c.access_type === "ambos").length,
  }), [courses])

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Cursos (CEO)</h1>
          <p className="text-sm text-muted-foreground">Gestão ágil e visual das ofertas de curso. Adicione, localize e monitore performance em poucos cliques.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-500/40 bg-gradient-to-b from-green-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Total de Cursos</p>
            <p className="text-3xl font-bold">{stats.totalCourses}</p>
          </Card>
          <Card className="border-blue-500/40 bg-gradient-to-b from-blue-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Online</p>
            <p className="text-3xl font-bold">{stats.online}</p>
          </Card>
          <Card className="border-orange-500/40 bg-gradient-to-b from-orange-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Presencial</p>
            <p className="text-3xl font-bold">{stats.presencial}</p>
          </Card>
          <Card className="border-fuchsia-500/40 bg-gradient-to-b from-fuchsia-700/30 to-slate-900/50 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Híbrido</p>
            <p className="text-3xl font-bold">{stats.hibrido}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Buscar Curso</p>
              <Input
                placeholder="Digite nome do curso"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="max-w-xs">
              <label className="text-sm font-medium text-muted-foreground">Modalidade</label>
              <select
                className="mt-1 w-full rounded border border-slate-300 bg-transparent px-3 py-2 text-sm"
                value={accessType}
                onChange={(e) => setAccessType(e.target.value as "interno" | "externo" | "ambos")}
              >
                <option value="ambos">Todas</option>
                <option value="interno">Presencial</option>
                <option value="externo">Online</option>
                <option value="ambos">Híbrido</option>
              </select>
            </div>
            <Button type="button" variant="secondary" onClick={() => setCourses(mockCourses)}>
              Resetar Lista
            </Button>
          </div>

          <form onSubmit={handleAdd} className="grid gap-3 lg:grid-cols-4">
            <Input
              placeholder="Título do curso"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="col-span-2"
            />
            <Input
              placeholder="Preço (R$)"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
            <Select value={accessType} onValueChange={(value) => setAccessType(value as "interno" | "externo" | "ambos")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interno">Presencial</SelectItem>
                <SelectItem value="externo">Online</SelectItem>
                <SelectItem value="ambos">Híbrido</SelectItem>
              </SelectContent>
            </Select>
            {(accessType === "interno" || accessType === "ambos") && (
              <>
                <Input
                  type="date"
                  placeholder="Data Início Presencial"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  type="date"
                  placeholder="Data Fim Presencial"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </>
            )}
            {accessType === "externo" && (
              <Input
                type="date"
                placeholder="Data Início Acesso Online"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            )}
            <Button type="submit" className="w-full">
              + Criar Curso
            </Button>
          </form>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="border border-slate-700 p-5 hover:shadow-xl hover:border-primary transition">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase text-slate-200">
                  {course.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{course.description || "Sem descrição"}</p>
              <div className="flex items-center justify-between text-sm font-medium mb-3">
                <span className="rounded-lg bg-slate-800 px-2 py-1 text-sky-300">R$ {course.price.toFixed(2)}</span>
                <span className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase ${
                  course.access_type === "interno" 
                    ? "bg-blue-600 text-white" 
                    : course.access_type === "externo" 
                    ? "bg-green-600 text-white" 
                    : "bg-purple-600 text-white"
                }`}>
                  {course.access_type === "interno" ? "Presencial" : course.access_type === "externo" ? "Online" : "Híbrido"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {course.access_type === "interno" && "Aulas presenciais em sala de aula"}
                {course.access_type === "externo" && "Acesso 100% online, sem necessidade de presença"}
                {course.access_type === "ambos" && "Aulas presenciais + acesso online simultâneo"}
              </div>
              {(course.start_date || course.end_date) && (
                <div className="text-xs text-muted-foreground mb-2">
                  {course.start_date && <span>Início: {new Date(course.start_date).toLocaleDateString("pt-BR")}</span>}
                  {course.end_date && <span> | Fim: {new Date(course.end_date).toLocaleDateString("pt-BR")}</span>}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => handleEdit(course)}>
                Editar
              </Button>
            </Card>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Curso</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Preço (R$)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-access">Modalidade</Label>
                <Select value={accessType} onValueChange={(value) => setAccessType(value as "interno" | "externo" | "ambos")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interno">Presencial</SelectItem>
                    <SelectItem value="externo">Online</SelectItem>
                    <SelectItem value="ambos">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(accessType === "interno" || accessType === "ambos") && (
                <>
                  <div>
                    <Label htmlFor="edit-start">Data Início Presencial</Label>
                    <Input
                      id="edit-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-end">Data Fim Presencial</Label>
                    <Input
                      id="edit-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              {accessType === "externo" && (
                <div>
                  <Label htmlFor="edit-start-online">Data Início Acesso Online</Label>
                  <Input
                    id="edit-start-online"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              )}
              <Button type="submit">Salvar Alterações</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
