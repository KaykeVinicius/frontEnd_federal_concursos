"use client"

import { useEffect, useState } from "react"
import {
  PlusCircle, ChevronRight, ChevronDown, BookOpen, GraduationCap,
  FileText, PlayCircle, Trash2, Check, X, Link2,
  Loader2, DollarSign, Calendar, Clock, Globe, FilePlus, ExternalLink,
  Monitor, Building2, Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  api,
  type ApiCourse, type ApiSubject, type ApiTopic, type ApiLesson, type ApiLessonPdf, type ApiUser,
} from "@/lib/api"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"

// ─── Inline add helper ────────────────────────────────────
function InlineAdd({ placeholder, onAdd, onCancel }: {
  placeholder: string; onAdd: (v: string) => void; onCancel: () => void
}) {
  const [val, setVal] = useState("")
  return (
    <div className="flex items-center gap-2 py-1">
      <Input autoFocus value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder}
        className="h-8 text-sm"
        onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) onAdd(val.trim()); if (e.key === "Escape") onCancel() }} />
      <Button size="sm" className="h-8 px-3" onClick={() => val.trim() && onAdd(val.trim())}><Check className="h-3.5 w-3.5" /></Button>
      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={onCancel}><X className="h-3.5 w-3.5" /></Button>
    </div>
  )
}

// ─── Lesson Row ───────────────────────────────────────────
function LessonRow({ lesson, onDelete }: { lesson: ApiLesson; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const [youtubeId, setYoutubeId] = useState(lesson.youtube_id ?? "")
  const [editingVideo, setEditingVideo] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoDuracao, setVideoDuracao] = useState(lesson.duration ?? "")
  const [savingVideo, setSavingVideo] = useState(false)
  const [videoError, setVideoError] = useState("")
  const [pdfs, setPdfs] = useState<ApiLessonPdf[]>(lesson.lesson_pdfs ?? [])
  const [addingPdf, setAddingPdf] = useState(false)
  const [pdfName, setPdfName] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [savingPdf, setSavingPdf] = useState(false)
  const [pdfError, setPdfError] = useState("")

  function extractYoutubeId(input: string): string | null {
    const regexes = [/youtube\.com\/watch\?v=([^&\s]+)/, /youtu\.be\/([^?\s]+)/, /youtube\.com\/embed\/([^?\s]+)/, /youtube\.com\/shorts\/([^?\s]+)/]
    for (const re of regexes) { const m = input.match(re); if (m) return m[1] }
    return null
  }

  async function handleSaveVideo() {
    const newId = extractYoutubeId(videoUrl.trim())
    if (!newId) { setVideoError("Link do YouTube inválido."); return }
    setSavingVideo(true); setVideoError("")
    try {
      await api.lessons.update(lesson.id, { youtube_id: newId, duration: videoDuracao.trim() || lesson.duration })
      setYoutubeId(newId)
      setEditingVideo(false); setVideoUrl("")
    } catch (e) {
      setVideoError(e instanceof Error ? e.message : "Erro ao salvar vídeo")
    } finally {
      setSavingVideo(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPdfFile(file)
    if (file && !pdfName) setPdfName(file.name.replace(/\.pdf$/i, ""))
  }

  async function handleAddPdf() {
    if (!pdfName.trim()) { setPdfError("Nome é obrigatório."); return }
    if (!pdfFile) { setPdfError("Selecione um arquivo PDF."); return }
    setSavingPdf(true); setPdfError("")
    try {
      const created = await api.lesson_pdfs.create({ lesson_id: lesson.id, name: pdfName.trim(), file: pdfFile })
      setPdfs((prev) => [...prev, created])
      setPdfName(""); setPdfFile(null); setAddingPdf(false)
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "Erro ao salvar PDF")
    } finally {
      setSavingPdf(false)
    }
  }

  async function handleDeletePdf(pdfId: number) {
    await api.lesson_pdfs.delete(pdfId)
    setPdfs((prev) => prev.filter((p) => p.id !== pdfId))
  }

  const previewId = videoUrl ? extractYoutubeId(videoUrl) : null

  return (
    <div className="rounded-lg border border-border bg-background">
      <button className="flex w-full items-center justify-between px-4 py-2.5 text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2 text-sm">
          {youtubeId ? <PlayCircle className="h-4 w-4 text-red-500" /> : <FileText className="h-4 w-4 text-primary" />}
          <span className="font-medium">{lesson.title}</span>
          {lesson.duration && <span className="text-xs text-muted-foreground">{lesson.duration}</span>}
          {pdfs.length > 0 && <span className="text-xs text-muted-foreground">· {pdfs.length} PDF(s)</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-4 py-4 space-y-4">

          {/* Vídeo */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vídeo da Aula</p>
            {youtubeId && !editingVideo && (
              <div className="space-y-2">
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube.com/embed/${youtubeId}`} title={lesson.title} allowFullScreen />
                  </div>
                </div>
                <button onClick={() => { setEditingVideo(true); setVideoUrl("") }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                  <Link2 className="h-3.5 w-3.5" /> Alterar vídeo
                </button>
              </div>
            )}
            {editingVideo && (
              <div className="space-y-2">
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Novo link do YouTube" value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value); setVideoError("") }} className="h-8 pl-8 text-sm" disabled={savingVideo} />
                </div>
                <Input placeholder="Duração (ex: 00:24:00)" value={videoDuracao} onChange={(e) => setVideoDuracao(e.target.value)} className="h-8 text-sm" disabled={savingVideo} />
                {previewId && (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube.com/embed/${previewId}`} title="preview" allowFullScreen />
                    </div>
                  </div>
                )}
                {videoError && <p className="text-xs text-destructive">{videoError}</p>}
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 gap-1 text-xs" onClick={handleSaveVideo} disabled={savingVideo || !videoUrl.trim()}>
                    {savingVideo && <Loader2 className="h-3 w-3 animate-spin" />} Salvar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingVideo(false); setVideoUrl(""); setVideoError("") }} disabled={savingVideo}>Cancelar</Button>
                </div>
              </div>
            )}
            {!youtubeId && !editingVideo && (
              <button onClick={() => setEditingVideo(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                <PlayCircle className="h-3.5 w-3.5" /> Adicionar vídeo
              </button>
            )}
          </div>

          {/* PDFs */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">PDFs da Aula</p>
            {pdfs.map((pdf) => (
              <div key={pdf.id} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">{pdf.name}</span>
                  {pdf.file_size && <span className="text-xs text-muted-foreground">({pdf.file_size})</span>}
                </div>
                <div className="flex items-center gap-2">
                  {pdf.file_url && (
                    <a href={pdf.file_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button onClick={() => handleDeletePdf(pdf.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {addingPdf ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 space-y-2">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Arquivo PDF *</label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    disabled={savingPdf}
                    className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50"
                  />
                  {pdfFile && <p className="text-[10px] text-muted-foreground mt-1">{pdfFile.name} · {(pdfFile.size / 1024).toFixed(0)} KB</p>}
                </div>
                <Input placeholder="Nome do PDF *" value={pdfName} onChange={(e) => setPdfName(e.target.value)} className="h-8 text-sm" disabled={savingPdf} />
                {pdfError && <p className="text-xs text-destructive">{pdfError}</p>}
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 gap-1 text-xs" onClick={handleAddPdf} disabled={savingPdf || !pdfFile}>
                    {savingPdf && <Loader2 className="h-3 w-3 animate-spin" />} Fazer Upload
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setAddingPdf(false); setPdfError(""); setPdfFile(null); setPdfName("") }} disabled={savingPdf}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingPdf(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                <FilePlus className="h-3.5 w-3.5" /> Adicionar PDF
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Nova Aula Form ───────────────────────────────────────
function NovaAulaForm({ topicId, currentLessonsCount, onAdded }: { topicId: number; currentLessonsCount: number; onAdded: (l: ApiLesson) => void }) {
  const [show, setShow] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [url, setUrl] = useState("")
  const [duracao, setDuracao] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function extractYoutubeId(input: string): string | null {
    const regexes = [/youtube\.com\/watch\?v=([^&\s]+)/, /youtu\.be\/([^?\s]+)/, /youtube\.com\/embed\/([^?\s]+)/]
    for (const re of regexes) { const m = input.match(re); if (m) return m[1] }
    return null
  }

  async function submit() {
    if (!titulo.trim() || !url.trim()) return
    const youtubeId = extractYoutubeId(url.trim())
    if (!youtubeId) { setError("Link do YouTube inválido."); return }
    setSaving(true); setError("")
    try {
      const lesson = await api.lessons.create({ topic_id: topicId, title: titulo.trim(), youtube_id: youtubeId, duration: duracao.trim() || "00:00:00", position: currentLessonsCount + 1, available: true })
      onAdded(lesson)
      setTitulo(""); setUrl(""); setDuracao(""); setShow(false)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Erro ao salvar") }
    finally { setSaving(false) }
  }

  const previewId = extractYoutubeId(url)

  if (!show) return (
    <button onClick={() => setShow(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
      <PlusCircle className="h-3.5 w-3.5" /> Adicionar aula
    </button>
  )

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nova Aula</p>
      <Input placeholder="Título da aula" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="h-8 text-sm" disabled={saving} />
      <div className="relative">
        <Link2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Link do YouTube (https://youtube.com/watch?v=...)" value={url} onChange={(e) => { setUrl(e.target.value); setError("") }} className="h-8 pl-8 text-sm" disabled={saving} />
      </div>
      <Input placeholder="Duração (ex: 00:24:00)" value={duracao} onChange={(e) => setDuracao(e.target.value)} className="h-8 text-sm" disabled={saving} />
      {previewId && (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube.com/embed/${previewId}`} title="preview" allowFullScreen />
          </div>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" className="h-8 gap-1" onClick={submit} disabled={saving}>
          {saving && <Loader2 className="h-3 w-3 animate-spin" />} Adicionar Aula
        </Button>
        <Button size="sm" variant="ghost" className="h-8" onClick={() => setShow(false)} disabled={saving}>Cancelar</Button>
      </div>
    </div>
  )
}

// ─── Topic Block ──────────────────────────────────────────
function TopicBlock({ topic, onDelete, onLessonsChange }: {
  topic: ApiTopic & { lessons: ApiLesson[] }
  onDelete: () => void
  onLessonsChange: (lessons: ApiLesson[]) => void
}) {
  const [open, setOpen] = useState(false)

  async function deleteLesson(lessonId: number) {
    await api.lessons.delete(lessonId)
    onLessonsChange(topic.lessons.filter((l) => l.id !== lessonId))
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20">
      <button className="flex w-full items-center justify-between px-4 py-2.5 text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{topic.title}</span>
          <Badge variant="secondary" className="text-xs">{topic.lessons.length} aula(s)</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {topic.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} onDelete={() => deleteLesson(lesson.id)} />
          ))}
          <NovaAulaForm topicId={topic.id} currentLessonsCount={topic.lessons.length} onAdded={(l) => onLessonsChange([...topic.lessons, l])} />
        </div>
      )}
    </div>
  )
}

// ─── Subject Block ────────────────────────────────────────
type TopicWithLessons = ApiTopic & { lessons: ApiLesson[] }
type SubjectWithTopics = ApiSubject & { topics: TopicWithLessons[] }

function SubjectBlock({ subject, onDelete, onUpdate, professors, allGlobalSubjects }: {
  subject: SubjectWithTopics; onDelete: () => void; onUpdate: (s: SubjectWithTopics) => void
  professors: ApiUser[]; allGlobalSubjects: ApiSubject[]
}) {
  const [open, setOpen] = useState(false)
  const [addingTopic, setAddingTopic] = useState(false)
  const [editingProf, setEditingProf] = useState(false)
  const [newProfId, setNewProfId] = useState("")
  const [savingProf, setSavingProf] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Professores que já lecionam esta disciplina (mesmo nome) globalmente
  const eligibleProfessorIds = new Set(
    allGlobalSubjects
      .filter((s) => s.name.toLowerCase() === subject.name.toLowerCase())
      .flatMap((s) => (s.professors ?? []).map((p) => p.id))
  )
  const eligibleProfessors = eligibleProfessorIds.size > 0
    ? professors.filter((p) => eligibleProfessorIds.has(p.id))
    : professors

  const currentProfessors = subject.professors ?? []

  async function saveProf(directPid?: number) {
    const pid = directPid ?? (newProfId ? parseInt(newProfId) : 0)
    if (!pid) return
    setSavingProf(true)
    try {
      const updated = await api.subjects.update(subject.id, { professor_ids: [pid] })
      onUpdate({ ...subject, professors: updated.professors ?? [{ id: pid, name: eligibleProfessors.find(p => p.id === pid)?.name ?? "" }] })
      setEditingProf(false)
      setNewProfId("")
    } catch (e) { console.error(e) }
    finally { setSavingProf(false) }
  }

  async function addTopic(title: string) {
    try {
      const topic = await api.topics.create({ subject_id: subject.id, title, position: subject.topics.length + 1 })
      onUpdate({ ...subject, topics: [...subject.topics, { ...topic, lessons: [] }] })
      setAddingTopic(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao criar tópico")
    }
  }

  async function deleteTopic(topicId: number) {
    await api.topics.delete(topicId)
    onUpdate({ ...subject, topics: subject.topics.filter((t) => t.id !== topicId) })
  }

  return (
    <div className="rounded-lg border border-border bg-background">
      <div
        role="button"
        tabIndex={0}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left cursor-pointer"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <GraduationCap className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{subject.name}</span>
          <Badge variant="secondary" className="text-xs">{subject.topics.length} tópico(s)</Badge>
          {currentProfessors.length > 0 ? (
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] text-blue-700">
              Prof: {currentProfessors.map(p => p.name.split(" ")[0]).join(", ")}
            </span>
          ) : eligibleProfessors.length === 1 ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); saveProf(eligibleProfessors[0].id) }}
              disabled={savingProf}
              className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[11px] text-orange-600 hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-colors disabled:opacity-50"
            >
              {savingProf ? "Vinculando..." : `+ ${eligibleProfessors[0].name.split(" ")[0]}`}
            </button>
          ) : eligibleProfessors.length > 1 ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditingProf((v) => !v); setNewProfId("") }}
              className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[11px] text-orange-600 hover:bg-orange-100 transition-colors"
            >
              Selecionar professor ({eligibleProfessors.length})
            </button>
          ) : (
            <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[11px] text-orange-600">
              Sem professor
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setEditingProf((v) => !v); setNewProfId("") }}
            className="text-muted-foreground hover:text-blue-600"
            title="Alterar professor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); setDeleteError(null) }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </div>

      {editingProf && (
        <div className="border-t border-border bg-blue-50/50 px-4 py-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <select
            value={newProfId}
            onChange={(e) => setNewProfId(e.target.value)}
            className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm"
            disabled={savingProf}
          >
            <option value="">Selecione o professor...</option>
            {eligibleProfessors.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button size="sm" className="h-7 text-xs px-3" onClick={() => saveProf()} disabled={savingProf || !newProfId}>
            {savingProf ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => { setEditingProf(false); setNewProfId("") }} disabled={savingProf}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {open && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {subject.topics.map((topic) => (
            <TopicBlock
              key={topic.id}
              topic={topic}
              onDelete={() => deleteTopic(topic.id)}
              onLessonsChange={(lessons) =>
                onUpdate({ ...subject, topics: subject.topics.map((t) => t.id === topic.id ? { ...t, lessons } : t) })
              }
            />
          ))}
          {addingTopic ? (
            <InlineAdd placeholder="Nome do tópico" onAdd={addTopic} onCancel={() => setAddingTopic(false)} />
          ) : (
            <button onClick={() => setAddingTopic(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
              <PlusCircle className="h-3.5 w-3.5" /> Adicionar tópico
            </button>
          )}
        </div>
      )}

      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={(open) => { if (!open) setConfirmDelete(false) }}
        title="Excluir disciplina"
        description={`Tem certeza que deseja excluir a disciplina "${subject.name}" deste curso? Esta ação não pode ser desfeita.`}
        onConfirm={async () => {
          setDeleting(true)
          setDeleteError(null)
          try {
            await onDelete()
            setConfirmDelete(false)
          } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Erro ao excluir disciplina.")
          } finally {
            setDeleting(false)
          }
        }}
        loading={deleting}
        error={deleteError}
      />
    </div>
  )
}

// ─── Course Card ──────────────────────────────────────────
type CourseWithSubjects = ApiCourse & { subjects: SubjectWithTopics[] }

function CursoCard({ course, onDelete, onUpdate, professors, allGlobalSubjects }: {
  course: CourseWithSubjects; onDelete: () => void; onUpdate: (c: CourseWithSubjects) => void
  professors: ApiUser[]; allGlobalSubjects: ApiSubject[]
}) {
  const [open, setOpen] = useState(false)
  const [addingSubject, setAddingSubject] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState<ApiSubject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedProfId, setSelectedProfId] = useState("")
  const [linkingSubject, setLinkingSubject] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  async function loadSubjects() {
    if (loadingSubjects) return
    setLoadingSubjects(true)
    try {
      const subjects = await api.subjects.list(course.id)
      const withTopics = await Promise.all(subjects.map(async (s) => {
        const topics = await api.topics.list(s.id)
        const withLessons = await Promise.all(topics.map(async (t) => {
          const lessons = await api.lessons.list(t.id)
          return { ...t, lessons }
        }))
        return { ...s, topics: withLessons }
      }))
      onUpdate({ ...course, subjects: withTopics })
    } catch (e) { console.error(e) }
    finally { setLoadingSubjects(false) }
  }

  function handleToggle() {
    setOpen((prev) => {
      if (!prev) loadSubjects()
      return !prev
    })
  }

  async function openAddSubject() {
    setSelectedSubjectId("")
    const all = await api.subjects.list().catch(() => [])
    const linkedNames = course.subjects.map((s) => s.name.toLowerCase())
    setAvailableSubjects(all.filter((s) => !s.course_id && !linkedNames.includes(s.name.toLowerCase())))
    setAddingSubject(true)
  }

  async function linkSubject() {
    if (!selectedSubjectId) return
    setLinkingSubject(true)
    try {
      const template = availableSubjects.find((s) => s.id === parseInt(selectedSubjectId))
      if (!template) return
      const profIds = selectedProfId
        ? [parseInt(selectedProfId)]
        : (template.professors ?? []).map(p => p.id)
      const created = await api.subjects.create({
        course_id:     course.id,
        name:          template.name,
        description:   template.description,
        professor_ids: profIds,
      })
      onUpdate({ ...course, subjects: [...course.subjects, { ...created, topics: [] }] })
      setAddingSubject(false)
      setSelectedSubjectId("")
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao vincular matéria")
    } finally {
      setLinkingSubject(false)
    }
  }

  async function toggleStatus() {
    setToggling(true)
    try {
      const updated = await api.courses.update(course.id, { status: course.status === "published" ? "draft" : "published" })
      onUpdate({ ...course, ...updated })
    } catch (e) { console.error(e) }
    finally { setToggling(false) }
  }

  async function handleDelete() {
    if (!confirm(`Excluir o curso "${course.title}"?`)) return
    setDeleting(true)
    try {
      const enrollments = await api.enrollments.list()
      const active = enrollments.filter(
        (e) => e.course?.id === course.id && e.status === "active"
      )
      if (active.length > 0) {
        alert(`Este curso possui ${active.length} aluno(s) matriculado(s). Cancele as matrículas antes de excluir.`)
        return
      }
      await api.courses.delete(course.id)
      onDelete()
    } catch (e) { console.error(e) }
    finally { setDeleting(false) }
  }

  async function unlinkSubject(subjectId: number) {
    try {
      await api.subjects.delete(subjectId)
      onUpdate({ ...course, subjects: course.subjects.filter((s) => s.id !== subjectId) })
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir disciplina.")
    }
  }

  const totalAulas = course.subjects.flatMap((s) => s.topics).flatMap((t) => t.lessons).length

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{course.title}</h3>
              <Badge className={cn("text-xs", course.status === "published" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20")} variant="outline">
                {course.status === "published" ? "publicado" : "rascunho"}
              </Badge>
              {course.access_type === "presencial" && (
                <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 gap-1" variant="outline">
                  <Building2 className="h-3 w-3" /> Presencial
                </Badge>
              )}
              {course.access_type === "online" && (
                <Badge className="text-xs bg-green-100 text-green-700 border-green-200 gap-1" variant="outline">
                  <Monitor className="h-3 w-3" /> Online
                </Badge>
              )}
              {course.access_type === "hibrido" && (
                <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200 gap-1" variant="outline">
                  <Users className="h-3 w-3" /> Híbrido
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              R$ {Number(course.price).toFixed(2)} · {course.subjects.length} matéria(s) · {totalAulas} aula(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={toggleStatus} disabled={toggling}>
            {toggling ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {course.status === "published" ? "Despublicar" : "Publicar"}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
          <button onClick={handleToggle}>
            {open ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-5 py-4 space-y-3">
          {loadingSubjects ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <>
              {course.subjects.map((subject) => (
                <SubjectBlock
                  key={subject.id}
                  subject={subject}
                  onDelete={() => unlinkSubject(subject.id)}
                  onUpdate={(updated) =>
                    onUpdate({ ...course, subjects: course.subjects.map((s) => s.id === subject.id ? updated : s) })
                  }
                  professors={professors}
                  allGlobalSubjects={allGlobalSubjects}
                />
              ))}
              {addingSubject ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Vincular matéria ao curso</p>
                  {availableSubjects.length === 0 ? (
                    <p className="text-xs text-amber-600">Nenhuma matéria disponível. Crie matérias primeiro em <strong>CEO → Matérias</strong>.</p>
                  ) : (
                    <>
                      <select
                        value={selectedSubjectId}
                        onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedProfId("") }}
                        className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm"
                        disabled={linkingSubject}
                      >
                        <option value="">Selecione uma matéria...</option>
                        {availableSubjects.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      {selectedSubjectId && (() => {
                        const sel = availableSubjects.find((s) => s.id === parseInt(selectedSubjectId))
                        const selProfs = sel?.professors ?? []
                        if (selProfs.length === 0) return (
                          <p className="text-xs text-amber-600">Esta matéria não tem professor vinculado.</p>
                        )
                        if (selProfs.length === 1) return (
                          <p className="text-xs text-muted-foreground">Professor: <span className="font-medium text-foreground">{selProfs[0].name}</span></p>
                        )
                        return (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Selecione o professor para este curso:</p>
                            <select
                              value={selectedProfId}
                              onChange={(e) => setSelectedProfId(e.target.value)}
                              className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm"
                              disabled={linkingSubject}
                            >
                              <option value="">Selecione o professor...</option>
                              {selProfs.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                        )
                      })()}
                    </>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm" className="h-7 text-xs gap-1" onClick={linkSubject}
                      disabled={linkingSubject || !selectedSubjectId || (() => {
                        const sel = availableSubjects.find((s) => s.id === parseInt(selectedSubjectId))
                        return (sel?.professors ?? []).length > 1 && !selectedProfId
                      })()}
                    >
                      {linkingSubject && <Loader2 className="h-3 w-3 animate-spin" />} Vincular
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setAddingSubject(false); setSelectedProfId("") }} disabled={linkingSubject}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <button onClick={openAddSubject} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                  <PlusCircle className="h-4 w-4" /> Vincular matéria
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Formulário de criação de curso ───────────────────────
function NovoCursoForm({ onCreated, onCancel }: {
  onCreated: (c: CourseWithSubjects) => void; onCancel: () => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [careerId, setCareerId] = useState("")
  const [careers, setCareers] = useState<import("@/lib/api").ApiCareer[]>([])
  const [status, setStatus] = useState<"draft" | "published">("draft")
  const [accessType, setAccessType] = useState<"online" | "presencial" | "hibrido">("online")
  const [durationDays, setDurationDays] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    api.careers.list().then(setCareers).catch(console.error)
  }, [])

  async function submit() {
    if (!title.trim()) { setError("Título é obrigatório."); return }
    setSaving(true); setError("")
    try {
      const novo = await api.courses.create({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        career_id: careerId ? parseInt(careerId) : undefined,
        status,
        access_type: accessType,
        duration_in_days: parseInt(durationDays) || 0,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      onCreated({ ...novo, subjects: [] })
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Erro ao criar curso") }
    finally { setSaving(false) }
  }

  return (
    <div className="rounded-xl border border-dashed border-primary bg-primary/5 p-5 space-y-4">
      <p className="text-sm font-semibold text-foreground">Novo Curso</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-xs">Título *</Label>
          <Input placeholder="Ex: Reta Final - Assembleia Legislativa RO" value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-xs">Descrição</Label>
          <Input placeholder="Descrição do curso" value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-xs">Carreira *</Label>
          <select value={careerId} onChange={(e) => setCareerId(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" disabled={saving}>
            <option value="">Selecione uma carreira</option>
            {careers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {careers.length === 0 && <p className="text-xs text-amber-600">⚠ Nenhuma carreira cadastrada. Crie carreiras primeiro.</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1"><DollarSign className="h-3 w-3" /> Preço (R$)</Label>
          <Input type="number" placeholder="450.00" value={price} onChange={(e) => setPrice(e.target.value)} disabled={saving} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> Duração (dias)</Label>
          <Input type="number" placeholder="30" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} disabled={saving} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" /> Data Início</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={saving} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" /> Data Fim</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={saving} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" disabled={saving}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" /> Modalidade</Label>
          <select value={accessType} onChange={(e) => setAccessType(e.target.value as "online" | "presencial" | "hibrido")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" disabled={saving}>
            <option value="online">Online</option>
            <option value="presencial">Presencial</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={submit} disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Criar Curso
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancelar</Button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function PedagogicaCursosPage() {
  const [courses, setCourses] = useState<CourseWithSubjects[]>([])
  const [professors, setProfessors] = useState<ApiUser[]>([])
  const [allGlobalSubjects, setAllGlobalSubjects] = useState<ApiSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [criando, setCriando] = useState(false)

  useEffect(() => {
    api.courses.list()
      .then((data) => setCourses(data.map((c) => ({ ...c, subjects: [] }))))
      .catch(console.error)
      .finally(() => setLoading(false))

    api.users.list()
      .then((users) => setProfessors(users.filter((u) => u.role === "professor")))
      .catch(console.error)

    api.subjects.list()
      .then(setAllGlobalSubjects)
      .catch(console.error)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cursos</h1>
            <p className="text-sm text-muted-foreground">Organize cursos, matérias, tópicos e videoaulas</p>
          </div>
          {!criando && (
            <Button onClick={() => setCriando(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" /> Novo Curso
            </Button>
          )}
        </div>

        {/* Legenda hierarquia */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {[
            { icon: BookOpen, label: "Curso", color: "text-primary" },
            { icon: GraduationCap, label: "Matéria", color: "text-blue-500" },
            { icon: FileText, label: "Tópico", color: "text-yellow-500" },
            { icon: PlayCircle, label: "Aula (YouTube)", color: "text-red-500" },
          ].map((item, i, arr) => (
            <span key={item.label} className="flex items-center gap-1">
              <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              <span>{item.label}</span>
              {i < arr.length - 1 && <ChevronRight className="h-3 w-3" />}
            </span>
          ))}
        </div>

        {/* Formulário novo curso */}
        {criando && (
          <NovoCursoForm
            onCreated={(c) => { setCourses((prev) => [c, ...prev]); setCriando(false) }}
            onCancel={() => setCriando(false)}
          />
        )}

        {/* Lista */}
        {courses.length === 0 && !criando ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum curso criado ainda.</p>
            <Button onClick={() => setCriando(true)} variant="outline">Criar primeiro curso</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <CursoCard
                key={course.id}
                course={course}
                onDelete={() => setCourses((prev) => prev.filter((c) => c.id !== course.id))}
                onUpdate={(updated) => setCourses((prev) => prev.map((c) => c.id === course.id ? updated : c))}
                professors={professors}
                allGlobalSubjects={allGlobalSubjects}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
