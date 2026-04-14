"use client"

import { useEffect, useState } from "react"
import {
  ShieldCheck, Monitor, Smartphone, Tablet, Globe,
  CheckCircle, XCircle, Search, RefreshCw, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1"

const ROLE_LABEL: Record<string, string> = {
  ceo:                  "CEO",
  diretor:              "Diretor",
  equipe_pedagogica:    "Pedagógica",
  assistente_comercial: "Comercial",
  professor:            "Professor",
  aluno:                "Aluno",
}

const ROLE_COLOR: Record<string, string> = {
  ceo:                  "bg-red-500/10 text-red-400 border-red-500/20",
  diretor:              "bg-purple-500/10 text-purple-400 border-purple-500/20",
  equipe_pedagogica:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  assistente_comercial: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  professor:            "bg-green-500/10 text-green-400 border-green-500/20",
  aluno:                "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

interface AccessLog {
  id: number
  action: string
  success: boolean
  ip_address: string
  device: string
  browser: string
  user_agent: string
  created_at: string
  user: { id: number; name: string; email: string; role: string }
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone className="h-3.5 w-3.5" />
  if (device === "Tablet")  return <Tablet className="h-3.5 w-3.5" />
  return <Monitor className="h-3.5 w-3.5" />
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  })
}

export default function LogsAcessoPage() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [filterSuccess, setFilterSuccess] = useState("")
  const perPage = 50

  async function fetchLogs(p = page) {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const params = new URLSearchParams({ page: String(p), per_page: String(perPage) })
      if (filterSuccess !== "") params.set("success", filterSuccess)
      // Ransack: search across user name, email and ip_address
      if (search) params.set("q[user_name_or_user_email_or_ip_address_cont]", search)
      if (filterRole) params.set("q[user_role_eq]", filterRole)

      const res = await fetch(`${BASE_URL}/access_logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLogs(data.logs ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  // Debounce search/role filter changes
  useEffect(() => {
    const t = setTimeout(() => { fetchLogs(1); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search, filterRole]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchLogs(1); setPage(1) }, [filterSuccess]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLogs(page) }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = logs

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Logs de Acesso</h1>
            <p className="text-xs text-muted-foreground">Histórico de todos os logins na plataforma</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchLogs(page)} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos os perfis</option>
          {Object.entries(ROLE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterSuccess}
          onChange={(e) => setFilterSuccess(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Sucesso e falha</option>
          <option value="true">Somente sucesso</option>
          <option value="false">Somente falha</option>
        </select>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total de acessos", value: total, color: "text-zinc-100" },
          { label: "Nesta página", value: filtered.length, color: "text-zinc-100" },
          { label: "Bem-sucedidos", value: filtered.filter(l => l.success).length, color: "text-green-400" },
          { label: "Falhas", value: filtered.filter(l => !l.success).length, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-xl font-bold mt-0.5", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {["Data / Hora", "Usuário", "Perfil", "Status", "Dispositivo", "Browser", "IP"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum log encontrado.
                  </td>
                </tr>
              ) : filtered.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-sm leading-tight">{log.user.name}</p>
                    <p className="text-xs text-muted-foreground">{log.user.email}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className={cn("text-xs", ROLE_COLOR[log.user.role] ?? "")}>
                      {ROLE_LABEL[log.user.role] ?? log.user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    {log.success ? (
                      <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                        <CheckCircle className="h-3.5 w-3.5" /> Sucesso
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                        <XCircle className="h-3.5 w-3.5" /> Falha
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <DeviceIcon device={log.device} />
                      {log.device ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      {log.browser ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono whitespace-nowrap">
                    {log.ip_address ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Página {page} de {totalPages} · {total} registros
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
