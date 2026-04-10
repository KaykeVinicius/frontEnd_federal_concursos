"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plus, Search, Loader2, GraduationCap, Trash2 } from "lucide-react"
import { api, type ApiSubject } from "@/lib/api"

export default function PedagogicaMateriasPage() {
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [fName, setFName] = useState("")
  const [fDesc, setFDesc] = useState("")

  useEffect(() => {
    api.subjects.list()
      .then(setSubjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!fName.trim()) { setError("Nome obrigatório."); return }
    setSaving(true); setError("")
    try {
      const created = await api.subjects.create({ name: fName.trim(), description: fDesc.trim() })
      setSubjects((prev) => [...prev, created])
      setShowNew(false); setFName(""); setFDesc("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar matéria")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir esta matéria?")) return
    try {
      await api.subjects.delete(id)
      setSubjects((prev) => prev.filter((s) => s.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir")
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Matérias</h1>
            <p className="text-muted-foreground">Crie as matérias. Elas serão vinculadas aos cursos na etapa seguinte.</p>
          </div>
          <Button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Nova Matéria
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar matérias..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <GraduationCap className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                {search ? "Nenhuma matéria encontrada." : "Nenhuma matéria cadastrada ainda."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((sub) => (
              <Card key={sub.id} className="group transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
                      <p className="font-medium text-foreground truncate">{sub.name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">#{sub.id}</Badge>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {sub.description && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{sub.description}</p>
                  )}
                  {false ? (
                    <p className="mt-2 text-xs text-green-600">Vinculada</p>
                  ) : (
                    <p className="mt-2 text-xs text-amber-600">Ainda não vinculada a um curso</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Matéria</DialogTitle>
              <DialogDescription>
                Crie a matéria. Ela será vinculada a um curso na etapa de criação do curso.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Matéria *</Label>
                <Input placeholder="Ex: Língua Portuguesa" value={fName} onChange={(e) => setFName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea placeholder="Descreva brevemente a matéria..." rows={3} value={fDesc} onChange={(e) => setFDesc(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando...</> : "Criar Matéria"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
