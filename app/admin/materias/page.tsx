"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Loader2, GraduationCap, Trash2, Pencil, User, Settings2, AlertTriangle } from "lucide-react"
import { api, type ApiSubject } from "@/lib/api"

export default function MateriasPage() {
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  // New subject dialog
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newError, setNewError] = useState("")
  const [fName, setFName] = useState("")
  const [fDesc, setFDesc] = useState("")

  // Edit subject dialog
  const [editSubject, setEditSubject] = useState<ApiSubject | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState("")

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchSubjects = useCallback((q?: string) => {
    return api.subjects.list(undefined, q ? { name_or_professor_name_cont: q } : undefined)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchSubjects()
      .then(setSubjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [fetchSubjects])

  useEffect(() => { setPage(1) }, [search])

  useEffect(() => {
    const t = setTimeout(() => {
      fetchSubjects(search || undefined).then(setSubjects).catch(console.error)
    }, 300)
    return () => clearTimeout(t)
  }, [search, fetchSubjects])

  function openEditDialog(subject: ApiSubject) {
    setEditSubject(subject)
    setEditName(subject.name)
    setEditDesc(subject.description ?? "")
    setEditError("")
  }

  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!fName.trim()) { setNewError("Nome obrigatório."); return }
    setSaving(true); setNewError("")
    try {
      const created = await api.subjects.create({ name: fName.trim(), description: fDesc.trim() })
      setSubjects((prev) => [...prev, created])
      setShowNew(false); setFName(""); setFDesc("")
    } catch (err: unknown) {
      setNewError(err instanceof Error ? err.message : "Erro ao criar matéria")
    } finally {
      setSaving(false)
    }
  }

  async function handleEditSave(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!editSubject) return
    setEditSaving(true); setEditError("")
    try {
      const updated = await api.subjects.update(editSubject.id, { name: editName.trim(), description: editDesc.trim() })
      setSubjects((prev) => prev.map((s) => s.id === updated.id ? updated : s))
      setEditSubject(null)
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Erro ao salvar alterações")
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await api.subjects.delete(id)
      setSubjects((prev) => prev.filter((s) => s.id !== id))
      setConfirmDeleteId(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir")
    } finally {
      setDeletingId(null)
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
        <Input
          placeholder="Buscar matérias..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <span>Lista de Matérias</span>
            <span className="text-sm font-normal text-muted-foreground">{subjects.length} matéria(s)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 font-medium text-left w-1/2"><span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />Matéria</span></th>
                    <th className="pb-3 font-medium text-center w-1/3"><span className="flex items-center justify-center gap-1.5"><User className="h-3.5 w-3.5" />Professor</span></th>
                    <th className="pb-3 font-medium text-right w-1/6"><span className="flex items-center justify-end gap-1.5"><Settings2 className="h-3.5 w-3.5" />Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((sub) => (
                      <tr key={sub.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {sub.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{sub.name}</p>
                              {sub.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{sub.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground text-center">
                          {sub.professor?.name ?? <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Settings2 className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(sub)} className="gap-2 cursor-pointer">
                                <Pencil className="h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {confirmDeleteId === sub.id ? (
                                <DropdownMenuItem
                                  onClick={() => handleDelete(sub.id)}
                                  disabled={deletingId === sub.id}
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                >
                                  {deletingId === sub.id
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Excluindo...</>
                                    : <><AlertTriangle className="h-4 w-4" /> Confirmar exclusão</>}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => setConfirmDeleteId(sub.id)}
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" /> Excluir
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
              {subjects.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <GraduationCap className="h-10 w-10 text-muted-foreground" />
                  <p className="font-semibold text-foreground">Nenhuma matéria encontrada</p>
                  <p className="text-sm text-muted-foreground">Clique em &quot;Nova Matéria&quot; para criar.</p>
                </div>
              )}
            </div>
          )}
          {subjects.length > PER_PAGE && (
            <div className="flex items-center justify-between border-t pt-4 mt-2">
              <p className="text-sm text-muted-foreground">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, subjects.length)} de {subjects.length}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: Math.ceil(subjects.length / PER_PAGE) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nova Matéria Dialog */}
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
            {newError && <p className="text-sm text-destructive">{newError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Adicionar Matéria"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editar Matéria Dialog */}
      <Dialog open={!!editSubject} onOpenChange={(open) => { if (!open) setEditSubject(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Matéria</DialogTitle>
            <DialogDescription>Altere os dados da matéria e salve.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea rows={3} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
            {editError && <p className="text-sm text-destructive">{editError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditSubject(null)}>Cancelar</Button>
              <Button type="submit" disabled={editSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {editSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
