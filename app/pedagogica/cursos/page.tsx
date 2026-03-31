"use client"

import { useState } from "react"
import {
  PlusCircle,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Layers,
  GraduationCap,
  FileText,
  PlayCircle,
  Trash2,
  Pencil,
  Check,
  X,
  Link2,
  UploadCloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────
type Aula = {
  id: number
  titulo: string
  youtube_url: string
  pdf_nome?: string
}

type Conteudo = {
  id: number
  titulo: string
  aulas: Aula[]
}

type Materia = {
  id: number
  nome: string
  conteudos: Conteudo[]
}

type Modulo = {
  id: number
  nome: string
  materias: Materia[]
}

type Curso = {
  id: number
  nome: string
  descricao: string
  status: "rascunho" | "publicado"
  modulos: Modulo[]
}

// ─── Helpers ──────────────────────────────────────────────
let _id = 100
const uid = () => ++_id

function getYouTubeId(url: string): string | null {
  const regexes = [
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtu\.be\/([^?\s]+)/,
    /youtube\.com\/embed\/([^?\s]+)/,
  ]
  for (const re of regexes) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return null
}

// ─── Mock inicial ─────────────────────────────────────────
const mockCursos: Curso[] = [
  {
    id: 1,
    nome: "Concurso IPERON 2026",
    descricao: "Preparatório completo para o IPERON",
    status: "publicado",
    modulos: [
      {
        id: 2,
        nome: "Módulo 1 — Direito Constitucional",
        materias: [
          {
            id: 3,
            nome: "Princípios Fundamentais",
            conteudos: [
              {
                id: 4,
                titulo: "Introdução à CF/88",
                aulas: [
                  {
                    id: 5,
                    titulo: "Aula 1 — Apresentação",
                    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    pdf_nome: "cf88_resumo.pdf",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

// ─── Subcomponents ────────────────────────────────────────

function InlineAdd({
  placeholder,
  onAdd,
  onCancel,
}: {
  placeholder: string
  onAdd: (v: string) => void
  onCancel: () => void
}) {
  const [val, setVal] = useState("")
  return (
    <div className="flex items-center gap-2 py-1">
      <Input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) onAdd(val.trim())
          if (e.key === "Escape") onCancel()
        }}
      />
      <Button size="sm" className="h-8 px-3" onClick={() => val.trim() && onAdd(val.trim())}>
        <Check className="h-3.5 w-3.5" />
      </Button>
      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={onCancel}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function AulaRow({
  aula,
  onDelete,
}: {
  aula: Aula
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const embedId = getYouTubeId(aula.youtube_url)

  return (
    <div className="rounded-lg border border-border bg-background">
      <button
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 text-sm">
          <PlayCircle className="h-4 w-4 text-red-500" />
          <span className="font-medium">{aula.titulo}</span>
          {aula.pdf_nome && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              {aula.pdf_nome}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4 space-y-3">
          {embedId ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${embedId}`}
                  title={aula.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Link do YouTube inválido.</p>
          )}
          {aula.pdf_nome && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">{aula.pdf_nome}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NovaAulaForm({ onAdd }: { onAdd: (a: Aula) => void }) {
  const [show, setShow] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [url, setUrl] = useState("")
  const [pdfNome, setPdfNome] = useState<string | undefined>()

  function handlePdf(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f && f.type === "application/pdf") setPdfNome(f.name)
    else setPdfNome(undefined)
  }

  function submit() {
    if (!titulo.trim() || !url.trim()) return
    onAdd({ id: uid(), titulo: titulo.trim(), youtube_url: url.trim(), pdf_nome: pdfNome })
    setTitulo(""); setUrl(""); setPdfNome(undefined); setShow(false)
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
      >
        <PlusCircle className="h-3.5 w-3.5" /> Adicionar aula
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nova Aula</p>
      <Input
        placeholder="Título da aula"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="h-8 text-sm"
      />
      <div className="relative">
        <Link2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Link do YouTube (https://youtube.com/watch?v=...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-8 pl-8 text-sm"
        />
      </div>

      {/* Preview embed */}
      {getYouTubeId(url) && (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${getYouTubeId(url)}`}
              title="preview"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* PDF */}
      <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
        <UploadCloud className="h-4 w-4" />
        {pdfNome ? (
          <span className="text-foreground font-medium">{pdfNome}</span>
        ) : (
          "Anexar material PDF (opcional)"
        )}
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handlePdf}
        />
      </label>

      <div className="flex gap-2">
        <Button size="sm" className="h-8" onClick={submit}>Adicionar Aula</Button>
        <Button size="sm" variant="ghost" className="h-8" onClick={() => setShow(false)}>Cancelar</Button>
      </div>
    </div>
  )
}

function ConteudoBlock({
  conteudo,
  onDelete,
  onUpdateAulas,
}: {
  conteudo: Conteudo
  onDelete: () => void
  onUpdateAulas: (aulas: Aula[]) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-muted/20">
      <button
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{conteudo.titulo}</span>
          <Badge variant="secondary" className="text-xs">{conteudo.aulas.length} aula(s)</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {conteudo.aulas.map((aula) => (
            <AulaRow
              key={aula.id}
              aula={aula}
              onDelete={() => onUpdateAulas(conteudo.aulas.filter((a) => a.id !== aula.id))}
            />
          ))}
          <NovaAulaForm onAdd={(a) => onUpdateAulas([...conteudo.aulas, a])} />
        </div>
      )}
    </div>
  )
}

function MateriaBlock({
  materia,
  onDelete,
  onUpdate,
}: {
  materia: Materia
  onDelete: () => void
  onUpdate: (m: Materia) => void
}) {
  const [open, setOpen] = useState(false)
  const [addingConteudo, setAddingConteudo] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-background">
      <button
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{materia.nome}</span>
          <Badge variant="secondary" className="text-xs">{materia.conteudos.length} conteúdo(s)</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {materia.conteudos.map((c) => (
            <ConteudoBlock
              key={c.id}
              conteudo={c}
              onDelete={() => onUpdate({ ...materia, conteudos: materia.conteudos.filter((x) => x.id !== c.id) })}
              onUpdateAulas={(aulas) =>
                onUpdate({
                  ...materia,
                  conteudos: materia.conteudos.map((x) => x.id === c.id ? { ...x, aulas } : x),
                })
              }
            />
          ))}

          {addingConteudo ? (
            <InlineAdd
              placeholder="Nome do conteúdo"
              onAdd={(v) => {
                onUpdate({ ...materia, conteudos: [...materia.conteudos, { id: uid(), titulo: v, aulas: [] }] })
                setAddingConteudo(false)
              }}
              onCancel={() => setAddingConteudo(false)}
            />
          ) : (
            <button
              onClick={() => setAddingConteudo(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Adicionar conteúdo
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ModuloBlock({
  modulo,
  onDelete,
  onUpdate,
}: {
  modulo: Modulo
  onDelete: () => void
  onUpdate: (m: Modulo) => void
}) {
  const [open, setOpen] = useState(false)
  const [addingMateria, setAddingMateria] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-muted/30">
      <button
        className="flex w-full items-center justify-between px-5 py-3 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-500" />
          <span className="font-semibold text-foreground">{modulo.nome}</span>
          <Badge variant="outline" className="text-xs">
            {modulo.materias.length} matéria(s)
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
          {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-3 space-y-2">
          {modulo.materias.map((mat) => (
            <MateriaBlock
              key={mat.id}
              materia={mat}
              onDelete={() => onUpdate({ ...modulo, materias: modulo.materias.filter((x) => x.id !== mat.id) })}
              onUpdate={(updated) =>
                onUpdate({ ...modulo, materias: modulo.materias.map((x) => x.id === mat.id ? updated : x) })
              }
            />
          ))}

          {addingMateria ? (
            <InlineAdd
              placeholder="Nome da matéria"
              onAdd={(v) => {
                onUpdate({ ...modulo, materias: [...modulo.materias, { id: uid(), nome: v, conteudos: [] }] })
                setAddingMateria(false)
              }}
              onCancel={() => setAddingMateria(false)}
            />
          ) : (
            <button
              onClick={() => setAddingMateria(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Adicionar matéria
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function CursoCard({
  curso,
  onDelete,
  onUpdate,
}: {
  curso: Curso
  onDelete: () => void
  onUpdate: (c: Curso) => void
}) {
  const [open, setOpen] = useState(false)
  const [addingModulo, setAddingModulo] = useState(false)

  const totalAulas = curso.modulos
    .flatMap((m) => m.materias)
    .flatMap((mat) => mat.conteudos)
    .flatMap((c) => c.aulas).length

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Course header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{curso.nome}</h3>
              <Badge
                className={cn(
                  "text-xs",
                  curso.status === "publicado"
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                )}
                variant="outline"
              >
                {curso.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {curso.modulos.length} módulo(s) · {totalAulas} videoaula(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            onClick={() =>
              onUpdate({ ...curso, status: curso.status === "publicado" ? "rascunho" : "publicado" })
            }
          >
            <Pencil className="h-3 w-3" />
            {curso.status === "publicado" ? "Despublicar" : "Publicar"}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <button onClick={() => setOpen(!open)}>
            {open ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Modules */}
      {open && (
        <div className="px-5 py-4 space-y-3">
          {curso.modulos.map((mod) => (
            <ModuloBlock
              key={mod.id}
              modulo={mod}
              onDelete={() => onUpdate({ ...curso, modulos: curso.modulos.filter((x) => x.id !== mod.id) })}
              onUpdate={(updated) =>
                onUpdate({ ...curso, modulos: curso.modulos.map((x) => x.id === mod.id ? updated : x) })
              }
            />
          ))}

          {addingModulo ? (
            <InlineAdd
              placeholder="Nome do módulo"
              onAdd={(v) => {
                onUpdate({ ...curso, modulos: [...curso.modulos, { id: uid(), nome: v, materias: [] }] })
                setAddingModulo(false)
              }}
              onCancel={() => setAddingModulo(false)}
            />
          ) : (
            <button
              onClick={() => setAddingModulo(true)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
            >
              <PlusCircle className="h-4 w-4" /> Adicionar módulo
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function PedagogicaCursosPage() {
  const [cursos, setCursos] = useState<Curso[]>(mockCursos)
  const [criando, setCriando] = useState(false)
  const [novoCursoNome, setNovoCursoNome] = useState("")
  const [novoCursoDesc, setNovoCursoDesc] = useState("")

  function criarCurso() {
    if (!novoCursoNome.trim()) return
    const novo: Curso = {
      id: uid(),
      nome: novoCursoNome.trim(),
      descricao: novoCursoDesc.trim(),
      status: "rascunho",
      modulos: [],
    }
    setCursos((prev) => [novo, ...prev])
    setNovoCursoNome("")
    setNovoCursoDesc("")
    setCriando(false)
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cursos</h1>
            <p className="text-sm text-muted-foreground">
              Organize cursos, módulos, matérias e videoaulas
            </p>
          </div>
          <Button onClick={() => setCriando(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Novo Curso
          </Button>
        </div>

        {/* Hierarquia visual */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {[
            { icon: BookOpen, label: "Curso", color: "text-primary" },
            { icon: Layers, label: "Módulo", color: "text-purple-500" },
            { icon: GraduationCap, label: "Matéria", color: "text-blue-500" },
            { icon: FileText, label: "Conteúdo", color: "text-yellow-500" },
            { icon: PlayCircle, label: "Aula (vídeo + PDF)", color: "text-red-500" },
          ].map((item, i, arr) => (
            <span key={item.label} className="flex items-center gap-1">
              <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              <span>{item.label}</span>
              {i < arr.length - 1 && <ChevronRight className="h-3 w-3" />}
            </span>
          ))}
        </div>

        {/* Formulário de criação */}
        {criando && (
          <div className="rounded-xl border border-dashed border-primary bg-primary/5 p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">Novo Curso</p>
            <Input
              autoFocus
              placeholder="Nome do curso"
              value={novoCursoNome}
              onChange={(e) => setNovoCursoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && criarCurso()}
            />
            <Input
              placeholder="Descrição (opcional)"
              value={novoCursoDesc}
              onChange={(e) => setNovoCursoDesc(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={criarCurso}>Criar Curso</Button>
              <Button variant="ghost" onClick={() => setCriando(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {/* Lista de cursos */}
        {cursos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum curso criado ainda.</p>
            <Button onClick={() => setCriando(true)} variant="outline">Criar primeiro curso</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cursos.map((curso) => (
              <CursoCard
                key={curso.id}
                curso={curso}
                onDelete={() => setCursos((prev) => prev.filter((c) => c.id !== curso.id))}
                onUpdate={(updated) =>
                  setCursos((prev) => prev.map((c) => c.id === curso.id ? updated : c))
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
