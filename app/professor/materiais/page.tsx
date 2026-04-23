"use client"

import { useEffect, useState } from "react"
import { FileText, Plus, Trash2, Download, FolderOpen, Link as LinkIcon, X, BookOpen, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type ApiMaterial, type ApiTurma, type ApiSubject } from "@/lib/api"

type TipoMaterial = "pdf" | "link" | "slide" | "exercicio"

const tipoConfig: Record<TipoMaterial, { label: string; color: string; bg: string }> = {
  pdf:       { label: "PDF",       color: "text-red-500",    bg: "bg-red-500/10" },
  slide:     { label: "Slide",     color: "text-blue-500",   bg: "bg-blue-500/10" },
  exercicio: { label: "Exercício", color: "text-orange-500", bg: "bg-orange-500/10" },
  link:      { label: "Link",      color: "text-purple-500", bg: "bg-purple-500/10" },
}

const FORM_EMPTY = {
  title: "",
  material_type: "pdf" as TipoMaterial,
  file_name: "",
  file_url: "",
  file_size: "",
  course_id: "",
  subject_id: "",
  notes: "",
}

export default function MateriaisPage() {
  const [materiais, setMateriais] = useState<ApiMaterial[]>([])
  const [turmas,    setTurmas   ] = useState<ApiTurma[]>([])
  const [subjects,  setSubjects ] = useState<ApiSubject[]>([])
  const [loading,   setLoading  ] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [saving,    setSaving   ] = useState(false)
  const [form,      setForm     ] = useState(FORM_EMPTY)
  const [selectedFile,  setSelectedFile ] = useState<File | null>(null)
  const [selectedTurmas, setSelectedTurmas] = useState<number[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    const professorId = stored ? JSON.parse(stored)?.id : undefined

    const subjectsPromise = api.professor.subjects().catch(() =>
      Promise.resolve<ApiSubject[]>([])
    )

    Promise.all([
      api.professor.materials.list(),
      api.professor.turmas(),
      subjectsPromise,
    ])
      .then(([mats, ts, subs]) => { setMateriais(mats); setTurmas(ts); setSubjects(subs) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Courses derivados das turmas do professor
  const courses = Array.from(
    new Map(turmas.filter((t) => t.course).map((t) => [t.course_id, t.course!])).values()
  )

  // Turmas filtradas pelo curso selecionado
  const turmasDoCurso = form.course_id
    ? turmas.filter((t) => String(t.course_id) === form.course_id)
    : []

  // Matérias filtradas pelo curso selecionado
  const subjectsDoCurso = form.course_id
    ? subjects.filter((s) => s.course_id && String(s.course_id) === form.course_id)
    : subjects

  function handleCourseChange(courseId: string) {
    setForm((f) => ({ ...f, course_id: courseId, subject_id: "" }))
    setSelectedTurmas([])
  }

  function toggleTurma(id: number) {
    setSelectedTurmas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function resetModal() {
    setModalAberto(false)
    setForm(FORM_EMPTY)
    setSelectedFile(null)
    setSelectedTurmas([])
  }

  async function adicionarMaterial() {
    if (!form.title.trim()) return
    if (form.material_type !== "link" && !selectedFile) return
    if (form.material_type === "link" && !form.file_url.trim()) return
    setSaving(true)
    try {
      const base = {
        title:         form.title.trim(),
        material_type: form.material_type,
        file_name:     selectedFile ? selectedFile.name : undefined,
        file_url:      form.material_type === "link" ? form.file_url.trim() : undefined,
        subject_id:    form.subject_id ? parseInt(form.subject_id) : undefined,
        notes:         form.notes.trim() || undefined,
        file:          selectedFile ?? undefined,
      }

      if (selectedTurmas.length === 0) {
        // sem turma vinculada
        const created = await api.professor.materials.create(base)
        setMateriais((m) => [created, ...m])
      } else {
        // cria um material por turma selecionada
        const results = await Promise.all(
          selectedTurmas.map((tid) =>
            api.professor.materials.create({ ...base, turma_id: tid })
          )
        )
        setMateriais((m) => [...results, ...m])
      }
      resetModal()
    } catch (err) {
      console.error("Erro ao adicionar material:", err)
    } finally {
      setSaving(false)
    }
  }

  async function remover(id: number) {
    try {
      await api.professor.materials.delete(id)
      setMateriais((m) => m.filter((x) => x.id !== id))
    } catch (err) {
      console.error("Erro ao remover material:", err)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const tiposStat: TipoMaterial[] = ["pdf", "slide", "exercicio", "link"]

  return (
    <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Materiais Presenciais</h1>
          <p className="text-sm text-muted-foreground">PDFs, slides e exercícios das suas aulas presenciais</p>
        </div>
        <button onClick={() => setModalAberto(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Adicionar material
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiposStat.map((tipo) => {
          const cfg = tipoConfig[tipo]
          const qtd = materiais.filter((m) => m.material_type === tipo).length
          return (
            <div key={tipo} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                <FileText className={`h-5 w-5 ${cfg.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{qtd}</p>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : materiais.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhum material adicionado ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(() => {
            // Agrupa por curso (course_id), sem curso = grupo "Sem curso"
            const groups = new Map<string, { label: string; items: typeof materiais }>()
            for (const m of materiais) {
              const key   = m.course_id ? String(m.course_id) : "sem_curso"
              const label = m.course_title ?? "Sem curso vinculado"
              if (!groups.has(key)) groups.set(key, { label, items: [] })
              groups.get(key)!.items.push(m)
            }
            return Array.from(groups.entries()).map(([key, group]) => (
              <div key={key}>
                {/* Cabeçalho do curso */}
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">{group.label}</h2>
                  <span className="text-xs text-muted-foreground">· {group.items.length} material(is)</span>
                </div>

                <div className="space-y-2">
                  {group.items.map((m) => {
                    const tipo = m.material_type as TipoMaterial
                    const cfg  = tipoConfig[tipo] ?? tipoConfig.pdf
                    return (
                      <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                          {tipo === "link"
                            ? <LinkIcon className={`h-5 w-5 ${cfg.color}`} />
                            : <FileText className={`h-5 w-5 ${cfg.color}`} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="truncate text-sm font-semibold text-foreground">{m.title}</p>
                            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", cfg.bg, cfg.color)}>{cfg.label}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {m.subject && (
                              <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {m.subject.name}</span>
                            )}
                            {m.file_size && <span>{m.file_size}</span>}
                            <span>{formatDate(m.created_at)}</span>
                          </div>
                          {m.notes && (
                            <p className="mt-1 text-xs text-muted-foreground/80 italic line-clamp-2">{m.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {m.file_url && (
                            <a href={m.file_url} target="_blank" rel="noopener noreferrer"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                              title="Baixar"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          <button onClick={() => remover(m.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-red-500/40 hover:text-red-500"
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          })()}
        </div>
      )}

      {/* Modal adicionar */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Adicionar Material</h2>
              <button onClick={resetModal} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Título */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Título *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Resumo — Interpretação de Texto"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Tipo</label>
                <select value={form.material_type} onChange={(e) => setForm((f) => ({ ...f, material_type: e.target.value as TipoMaterial }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                >
                  <option value="pdf">PDF</option>
                  <option value="slide">Slide</option>
                  <option value="exercicio">Exercício</option>
                  <option value="link">Link externo</option>
                </select>
              </div>

              {/* Curso */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Curso</label>
                <select value={form.course_id} onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                >
                  <option value="">Selecione o curso</option>
                  {courses.map((c) => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
                </select>
              </div>

              {/* Turmas do curso — multi-select com checkboxes */}
              {form.course_id && turmasDoCurso.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Turmas <span className="font-normal text-muted-foreground">(selecione uma ou mais)</span>
                  </label>
                  <div className="rounded-xl border border-border bg-background divide-y divide-border">
                    {turmasDoCurso.map((t) => (
                      <label key={t.id} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedTurmas.includes(t.id)}
                          onChange={() => toggleTurma(t.id)}
                          className="h-4 w-4 accent-primary rounded"
                        />
                        <span className="text-sm text-foreground">{t.name}</span>
                        {t.schedule && (
                          <span className="ml-auto text-xs text-muted-foreground">{t.schedule}</span>
                        )}
                      </label>
                    ))}
                  </div>
                  {selectedTurmas.length > 1 && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Será criado um material para cada turma selecionada ({selectedTurmas.length} materiais).
                    </p>
                  )}
                </div>
              )}

              {/* Matéria — filtrada pelo curso selecionado e vinculada ao professor logado */}
              {subjectsDoCurso.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Matéria</label>
                  <select value={form.subject_id} onChange={(e) => setForm((f) => ({ ...f, subject_id: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                  >
                    <option value="">Selecione a matéria</option>
                    {subjectsDoCurso.map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {/* Observação */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Observação <span className="font-normal text-muted-foreground">(opcional, máx. 1000 caracteres)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Ex: Material referente à aula do dia 14/04, capítulo 3..."
                  maxLength={1000}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none"
                />
                {form.notes.length > 0 && (
                  <p className="mt-0.5 text-right text-[10px] text-muted-foreground">{form.notes.length}/1000</p>
                )}
              </div>

              {/* Arquivo ou URL */}
              {form.material_type === "link" ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">URL *</label>
                  <input value={form.file_url} onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Arquivo *</label>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null
                      setSelectedFile(f)
                      if (f) setForm((fm) => ({ ...fm, file_name: f.name }))
                    }}
                    className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:opacity-90"
                  />
                  {selectedFile && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {selectedFile.name} · {(selectedFile.size / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={resetModal} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted">
                Cancelar
              </button>
              <button
                onClick={adicionarMaterial}
                disabled={!form.title.trim() || saving || (form.material_type === "link" ? !form.file_url.trim() : !selectedFile)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
                  : selectedTurmas.length > 1
                    ? `Adicionar para ${selectedTurmas.length} turmas`
                    : "Adicionar"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
