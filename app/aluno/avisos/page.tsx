"use client"

import { useCallback, useEffect, useState } from "react"
import { Megaphone, Loader2, Pin, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

interface Announcement {
  id: number
  title: string
  body: string
  category: string
  audience: string
  pinned: boolean
  active: boolean
  expires_at: string | null
  created_at: string
  author?: { id: number; name: string }
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  geral:       { label: "Geral",       color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  urgente:     { label: "Urgente",     color: "bg-red-500/20 text-red-400 border-red-500/30" },
  evento:      { label: "Evento",      color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  financeiro:  { label: "Financeiro",  color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  pedagogico:  { label: "Pedagógico",  color: "bg-green-500/20 text-green-300 border-green-500/30" },
}

export default function AlunoAvisosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    try {
      const q: Record<string, string> = {}
      if (search) q["title_or_body_cont"] = search
      if (category) q["category_eq"] = category

      const params = new URLSearchParams()
      Object.entries(q).forEach(([k, v]) => params.set(`q[${k}]`, v))

      const data = await api.announcements.list(Object.keys(q).length > 0 ? q as never : undefined)
      setAnnouncements(Array.isArray(data) ? data : [])
    } catch {
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }, [search, category])

  useEffect(() => {
    const t = setTimeout(fetchAnnouncements, 300)
    return () => clearTimeout(t)
  }, [fetchAnnouncements])

  const catConfig = (cat: string) => CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG.geral

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Megaphone className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Avisos</h1>
          <p className="text-xs text-muted-foreground">Comunicados e informações importantes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar avisos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Todas as categorias</option>
          {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          Nenhum aviso encontrado.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const cfg = catConfig(a.category)
            return (
              <div
                key={a.id}
                className={cn(
                  "rounded-lg border border-border bg-card p-4 space-y-2",
                  a.pinned ? "border-primary/40 bg-primary/5" : ""
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {a.pinned && (
                      <Pin className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-foreground">{a.title}</span>
                    <Badge variant="outline" className={cn("text-[10px] py-0 border", cfg.color)}>
                      {cfg.label}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</p>
                {a.author?.name && (
                  <p className="text-[11px] text-muted-foreground/60">— {a.author.name}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
