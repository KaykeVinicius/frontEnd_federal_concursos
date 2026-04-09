"use client"

import { useEffect, useRef, useState } from "react"
import { api, type ProfessorEventAulao, type ApiEventMaterial } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays, Clock, MapPin, Loader2, BookOpen,
  UploadCloud, Trash2, FileText, CheckCircle2, AlertCircle,
} from "lucide-react"

export default function ProfessorAuloesPage() {
  const [loading, setLoading] = useState(true)
  const [auloes, setAuloes] = useState<ProfessorEventAulao[]>([])
  const [uploading, setUploading] = useState<string | null>(null) // "eventId_subjectId"
  const [feedback, setFeedback] = useState<{ key: string; ok: boolean; msg: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingUpload = useRef<{ eventId: number; subjectId: number; subjectName: string } | null>(null)

  useEffect(() => {
    api.professor.eventMaterials.list()
      .then(setAuloes)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function triggerUpload(eventId: number, subjectId: number, subjectName: string) {
    pendingUpload.current = { eventId, subjectId, subjectName }
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingUpload.current) return
    const { eventId, subjectId, subjectName } = pendingUpload.current
    const key = `${eventId}_${subjectId}`

    setUploading(key)
    setFeedback(null)
    try {
      const material = await api.professor.eventMaterials.upload(eventId, subjectId, subjectName, file)
      setAuloes((prev) => prev.map((ev) => {
        if (ev.id !== eventId) return ev
        return {
          ...ev,
          subjects: ev.subjects.map((s) =>
            s.subject_id === subjectId ? { ...s, material } : s
          ),
        }
      }))
      setFeedback({ key, ok: true, msg: "PDF enviado com sucesso!" })
    } catch (err) {
      setFeedback({ key, ok: false, msg: err instanceof Error ? err.message : "Erro ao enviar." })
    } finally {
      setUploading(null)
      e.target.value = ""
    }
  }

  async function handleDelete(eventId: number, subjectId: number, material: ApiEventMaterial) {
    const key = `${eventId}_${subjectId}`
    try {
      await api.professor.eventMaterials.delete(material.id)
      setAuloes((prev) => prev.map((ev) => {
        if (ev.id !== eventId) return ev
        return {
          ...ev,
          subjects: ev.subjects.map((s) =>
            s.subject_id === subjectId ? { ...s, material: null } : s
          ),
        }
      }))
      setFeedback({ key, ok: true, msg: "PDF removido." })
    } catch (err) {
      setFeedback({ key, ok: false, msg: err instanceof Error ? err.message : "Erro ao remover." })
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Aulões — Envio de Material</h1>
        <p className="text-muted-foreground">Faça upload do PDF da sua matéria para cada aulão</p>
      </div>

      {auloes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum aulão com sua(s) matéria(s) agendado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {auloes.map((ev) => (
            <Card key={ev.id} className="overflow-hidden">
              <div className="h-1 bg-primary" />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{ev.title}</CardTitle>
                  <Badge className="bg-blue-100 text-blue-700 shrink-0">Aulão</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{new Date(ev.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{ev.start_time} – {ev.end_time}</span>
                  {ev.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{ev.location}</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {ev.subjects.map((s) => {
                  const key = `${ev.id}_${s.subject_id}`
                  const isUploading = uploading === key
                  const fb = feedback?.key === key ? feedback : null

                  return (
                    <div key={s.subject_id} className="rounded-lg border bg-muted/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <BookOpen className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-medium text-sm truncate">{s.subject_name}</span>
                        </div>

                        {s.material ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className="bg-green-100 text-green-700 gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Enviado
                            </Badge>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(ev.id, s.subject_id, s.material!)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-1.5 shrink-0"
                            disabled={isUploading}
                            onClick={() => triggerUpload(ev.id, s.subject_id, s.subject_name)}>
                            {isUploading
                              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando...</>
                              : <><UploadCloud className="h-3.5 w-3.5" /> Enviar PDF</>
                            }
                          </Button>
                        )}
                      </div>

                      {s.material && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          <span className="truncate">{s.material.title}</span>
                          {s.material.file_size && <span>· {s.material.file_size}</span>}
                          <span>· válido até {new Date(s.material.expires_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                      )}

                      {fb && (
                        <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${fb.ok ? "text-green-700" : "text-red-600"}`}>
                          {fb.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                          {fb.msg}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
