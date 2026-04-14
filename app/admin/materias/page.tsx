"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plus, Search, Loader2, GraduationCap, Trash2 } from "lucide-react"
import { api, type ApiSubject } from "@/lib/api"

export default function MateriasPage() {
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [fName, setFName] = useState("")
  const [fDesc, setFDesc] = useState("")

  const fetchSubjects = useCallback((q?: string) => {
    return api.subjects.list(undefined, q ? { name_cont: q } : undefined)
  }, [])

  useEffect(() => {
    fetchSubjects()
      .then(setSubjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [fetchSubjects])

  useEffect(() => {
    const t = setTimeout(() => {
      fetchSubjects(search || undefined).then(setSubjects).catch(console.error)
    }, 300)
    return () => clearTimeout(t)
  }, [search, fetchSubjects])

  const filtered = subjects

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
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Matérias</h1>
          <p className="mt-1 text-muted-foreground">Pool global de matérias — disponíveis para vincular a qualquer curso</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nova Matéria
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar matérias..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <GraduationCap className="h-10 w-10 text-muted-foreground" />
          <p className="font-semibold text-foreground">Nenhuma matéria encontrada</p>
          <p className="text-sm text-muted-foreground">Clique em &quot;Nova Matéria&quot; para criar.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">{sub.name}</p>
                    {sub.description && <p className="text-sm text-muted-foreground mt-0.5">{sub.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="ml-4 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Matéria</DialogTitle>
            <DialogDescription>Crie a matéria no pool global. Depois vincule-a aos cursos desejados.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input placeholder="Ex: Língua Portuguesa" value={fName} onChange={(e) => setFName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea placeholder="Descreva a matéria..." rows={3} value={fDesc} onChange={(e) => setFDesc(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Adicionar Matéria"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
