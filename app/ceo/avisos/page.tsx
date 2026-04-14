"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Megaphone, Pin, PinOff, Plus, Search, Trash2, Pencil,
  AlertTriangle, Calendar, BookOpen, DollarSign, Users, Loader2,
  X, RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { api, type ApiAnnouncement } from "@/lib/api"

// ─── Config ──────────────────────────────────────────────
const CATEGORY_CONFIG: Record<ApiAnnouncement["category"], { label: string; color: string; bg: string; icon: React.ElementType }> = {
  geral:       { label: "Geral",       color: "text-zinc-400",   bg: "bg-zinc-500/10 border-zinc-500/20",   icon: Megaphone },
  urgente:     { label: "Urgente",     color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",     icon: AlertTriangle },
  evento:      { label: "Evento",      color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",   icon: Calendar },
  financeiro:  { label: "Financeiro",  color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: DollarSign },
  pedagogico:  { label: "Pedagógico",  color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20", icon: BookOpen },
}

const AUDIENCE_LABELS: Record<ApiAnnouncement["audience"], string> = {
  todos:       "Todos",
  alunos:      "Alunos",
  professores: "Professores",
  equipe:      "Equipe interna",
}

const EMPTY_FORM = {
  title: "", body: "", category: "geral" as ApiAnnouncement["category"],
  audience: "todos" as ApiAnnouncement["audience"], pinned: false, expires_at: "",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

// ─── Page ─────────────────────────────────────────────────
export default function AvisosPage() {
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterAudience, setFilterAudience] = useState("")

  // Modal
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ApiAnnouncement | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  // Confirm delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAnnouncements = useCallback((q?: string, cat?: string, aud?: string) => {
    const ransackQ: Record<string, string> = {}
    if (q)   ransackQ["title_or_body_cont"] = q
    if (cat) ransackQ["category_eq"] = cat
    if (aud) ransackQ["audience_eq"] = aud
    return api.announcements.list(Object.keys(ransackQ).length ? ransackQ : undefined)
  }, [])

  useEffect(() => {
    fetchAnnouncements()
      .then(setAnnouncements)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [fetchAnnouncements])

  useEffect(() => {
    const t = setTimeout(() => {
      fetchAnnouncements(search || undefined, filterCategory || undefined, filterAudience || undefined)
        .then(setAnnouncements)
        .catch(console.error)
    }, 300)
    return () => clearTimeout(t)
  }, [search, filterCategory, filterAudience, fetchAnnouncements])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError("")
    setShowForm(true)
  }

  function openEdit(a: ApiAnnouncement) {
    setEditing(a)
    setForm({
      title: a.title, body: a.body, category: a.category,
      audience: a.audience, pinned: a.pinned,
      expires_at: a.expires_at ? a.expires_at.slice(0, 10) : "",
    })
    setFormError("")
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim()) { setFormError("Título é obrigatório."); return }
    if (!form.body.trim())  { setFormError("Conteúdo é obrigatório."); return }
    setSaving(true); setFormError("")
    try {
      const payload = {
        ...form,
        expires_at: form.expires_at || undefined,
        active: true,
      }
      if (editing) {
        const updated = await api.announcements.update(editing.id, payload)
        setAnnouncements((prev) => prev.map((a) => a.id === updated.id ? updated : a))
      } else {
        const created = await api.announcements.create(payload)
        setAnnouncements((prev) => [created, ...prev])
      }
      setShowForm(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar aviso.")
    } finally {
      setSaving(false)
    }
  }

  async function togglePin(a: ApiAnnouncement) {
    const updated = await api.announcements.update(a.id, { pinned: !a.pinned })
    setAnnouncements((prev) => prev.map((x) => x.id === updated.id ? updated : x))
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try {
      await api.announcements.delete(id)
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
      setConfirmDeleteId(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const pinnedCount = announcements.filter((a) => a.pinned).length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Central de Avisos</h1>
            <p className="text-xs text-muted-foreground">Comunicados para alunos, professores e equipe</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchAnnouncements().then(setAnnouncements)} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="h-3.5 w-3.5" /> Novo Aviso
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total de avisos", value: announcements.length, color: "text-zinc-100" },
          { label: "Fixados", value: pinnedCount, color: "text-yellow-400" },
          { label: "Urgentes", value: announcements.filter((a) => a.category === "urgente").length, color: "text-red-400" },
          { label: "Audiências", value: [...new Set(announcements.map((a) => a.audience))].length, color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-xl font-bold mt-0.5", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou conteúdo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todas as categorias</option>
          {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todas as audiências</option>
          {Object.entries(AUDIENCE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : announcements.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          Nenhum aviso encontrado.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const cfg = CATEGORY_CONFIG[a.category]
            const Icon = cfg.icon
            return (
              <div key={a.id}
                className={cn(
                  "rounded-lg border bg-card p-4 transition-colors",
                  a.pinned ? "border-yellow-500/30 bg-yellow-500/5" : "border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", cfg.bg)}>
                    <Icon className={cn("h-4 w-4", cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {a.pinned && (
                        <Pin className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                      )}
                      <p className="font-semibold text-sm text-foreground">{a.title}</p>
                      <Badge variant="outline" className={cn("text-[10px] py-0", cfg.bg, cfg.color)}>
                        {cfg.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] py-0">
                        <Users className="h-2.5 w-2.5 mr-1" />
                        {AUDIENCE_LABELS[a.audience]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3">{a.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                      <span>Por {a.author?.name ?? "—"}</span>
                      <span>{formatDate(a.created_at)}</span>
                      {a.expires_at && <span>Expira em {formatDate(a.expires_at)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => togglePin(a)} title={a.pinned ? "Desafixar" : "Fixar"}
                      className={cn("h-7 w-7 p-0", a.pinned ? "text-yellow-400 hover:text-yellow-300" : "text-muted-foreground")}
                    >
                      {a.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a)} className="h-7 w-7 p-0 text-muted-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {confirmDeleteId === a.id ? (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" disabled={deleting} onClick={() => handleDelete(a.id)}
                          className="h-7 px-2 text-xs text-red-400 hover:text-red-300"
                        >
                          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirmar"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} className="h-7 w-7 p-0 text-muted-foreground">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(a.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal criar/editar */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">{editing ? "Editar Aviso" : "Novo Aviso"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="h-7 w-7 p-0"><X className="h-4 w-4" /></Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Título *</label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Aula extra confirmada para sábado" maxLength={200}
                  className="h-9 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Categoria</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ApiAnnouncement["category"] }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Audiência</label>
                  <select value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as ApiAnnouncement["audience"] }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {Object.entries(AUDIENCE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Conteúdo *</label>
                <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Detalhe o aviso para os destinatários..."
                  maxLength={5000} rows={5}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none"
                />
                <p className="text-right text-[10px] text-muted-foreground">{form.body.length}/5000</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Data de expiração <span className="font-normal text-muted-foreground">(opcional)</span></label>
                <Input type="date" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="text-sm text-foreground flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5 text-yellow-400" /> Fixar este aviso no topo
                </span>
              </label>
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : editing ? "Salvar alterações" : "Publicar aviso"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
