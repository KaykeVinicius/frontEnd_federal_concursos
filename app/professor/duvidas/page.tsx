"use client"

import { useEffect, useState } from "react"
import { HelpCircle, CheckCircle2, Clock, Search, Send, ChevronDown, ChevronUp, BookOpen, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type ApiQuestion } from "@/lib/api"

type Filtro = "todas" | "pending" | "answered"

export default function ProfessorDuvidasPage() {
  const [duvidas, setDuvidas] = useState<ApiQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>("todas")
  const [busca, setBusca] = useState("")
  const [expandida, setExpandida] = useState<number | null>(null)
  const [respostas, setRespostas] = useState<Record<number, string>>({})
  const [salvando, setSalvando] = useState<number | null>(null)
  const [professorNome, setProfessorNome] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      try { setProfessorNome(JSON.parse(stored).name ?? "Professor") } catch { /* ignore */ }
    }
    api.professor.questions()
      .then(setDuvidas)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtradas = duvidas
    .filter((d) => filtro === "todas" || d.status === filtro)
    .filter((d) =>
      busca.trim() === "" ||
      (d.student?.name ?? "").toLowerCase().includes(busca.toLowerCase()) ||
      d.text.toLowerCase().includes(busca.toLowerCase()) ||
      (d.lesson?.title ?? "").toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const totalPendentes = duvidas.filter((d) => d.status === "pending").length

  async function handleResponder(id: number) {
    const texto = respostas[id]?.trim()
    if (!texto) return
    setSalvando(id)
    try {
      const updated = await api.professor.answerQuestion(id, texto)
      setDuvidas((prev) => prev.map((d) => (d.id === id ? updated : d)))
      setExpandida(null)
      setRespostas((r) => { const n = { ...r }; delete n[id]; return n })
    } catch (err) {
      console.error("Erro ao responder:", err)
    } finally {
      setSalvando(null)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dúvidas das Suas Matérias</h1>
          <p className="text-sm text-muted-foreground">
            Apenas dúvidas das matérias sob sua responsabilidade, {professorNome.split(" ")[0]}
          </p>
        </div>
        {totalPendentes > 0 && (
          <span className="inline-flex items-center gap-2 rounded-xl bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-600 border border-yellow-500/20">
            <Clock className="h-4 w-4" />
            {totalPendentes} pendente{totalPendentes > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["todas", "pending", "answered"] as Filtro[]).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all",
                filtro === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f === "todas" ? "Todas" : f === "pending" ? "Pendentes" : "Respondidas"}
              <span className="ml-1.5 opacity-70">
                ({f === "todas" ? duvidas.length : duvidas.filter((d) => d.status === f).length})
              </span>
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por aluno, aula ou dúvida..."
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhuma dúvida encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map((d) => {
            const aberta = expandida === d.id
            return (
              <div key={d.id} className={cn("rounded-2xl border bg-card transition-all", d.status === "pending" ? "border-yellow-500/20" : "border-border")}>
                <button onClick={() => setExpandida(aberta ? null : d.id)} className="flex w-full items-start gap-4 p-4 text-left">
                  <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", d.status === "answered" ? "bg-green-500/10" : "bg-yellow-500/10")}>
                    {d.status === "answered" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-yellow-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {d.student?.name ?? "Aluno"}
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        d.status === "answered" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                      )}>
                        {d.status === "answered" ? "Respondida" : "Pendente"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{d.text}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground/60">
                      {d.subject && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{d.subject.name}</span>
                      )}
                      {d.lesson && (
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {d.lesson.title}</span>
                      )}
                      {d.video_moment && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {d.video_moment}</span>
                      )}
                      <span>{formatDate(d.created_at)}</span>
                    </div>
                  </div>

                  {aberta ? <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>

                {aberta && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Dúvida completa</p>
                      <p className="text-sm text-foreground leading-relaxed">{d.text}</p>
                    </div>

                    {d.answer && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                          Sua resposta{d.answered_at ? ` · ${formatDate(d.answered_at)}` : ""}
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">{d.answer}</p>
                      </div>
                    )}

                    {d.status === "pending" && (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">Sua resposta</label>
                        <textarea
                          value={respostas[d.id] ?? ""}
                          onChange={(e) => setRespostas((r) => ({ ...r, [d.id]: e.target.value }))}
                          placeholder="Digite sua resposta para o aluno..." rows={4}
                          className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 leading-relaxed"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">O aluno será notificado quando você responder.</p>
                          <button onClick={() => handleResponder(d.id)} disabled={!respostas[d.id]?.trim() || salvando === d.id}
                            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {salvando === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            {salvando === d.id ? "Salvando..." : "Responder aluno"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
