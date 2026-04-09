"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { api, type ApiEvent, type ApiEventRegistration } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft, Users, CheckCircle2, XCircle, Loader2,
  QrCode, Tag, Calendar, Clock, MapPin,
} from "lucide-react"

const QrScanner = dynamic(() => import("@/components/qr-scanner"), { ssr: false })

const STATUS_LABELS: Record<string, string> = {
  agendado: "Agendado", em_andamento: "Em Andamento", concluido: "Concluído", cancelado: "Cancelado",
}

export default function PedagogicaEventoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = Number(params.id)

  const [event, setEvent] = useState<ApiEvent | null>(null)
  const [registrations, setRegistrations] = useState<ApiEventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const checkinInputRef = useRef<HTMLInputElement>(null)
  const [checkinToken, setCheckinToken] = useState("")
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkinResult, setCheckinResult] = useState<{ ok: boolean; msg: string; name?: string } | null>(null)
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    if (!eventId) return
    Promise.all([api.events.get(eventId), api.events.registrations.list(eventId)])
      .then(([ev, regs]) => { setEvent(ev); setRegistrations(regs) })
      .catch((err) => setError(err?.message ?? "Erro ao carregar dados."))
      .finally(() => { setLoading(false); setTimeout(() => checkinInputRef.current?.focus(), 200) })
  }, [eventId])

  const doCheckin = useCallback(async (token: string) => {
    if (!token.trim() || checkingIn) return
    setCheckingIn(true)
    setCheckinResult(null)
    try {
      const reg = await api.events.checkin(token.trim())
      setRegistrations((prev) => prev.map((r) => r.id === reg.id ? reg : r))
      setCheckinResult({ ok: true, msg: "Presença confirmada!", name: reg.student?.name })
      setCheckinToken("")
      setShowScanner(false)
    } catch (err: unknown) {
      setCheckinResult({ ok: false, msg: err instanceof Error ? err.message : "Token inválido." })
    } finally {
      setCheckingIn(false)
      setTimeout(() => checkinInputRef.current?.focus(), 100)
    }
  }, [checkingIn])

  async function handleUndoCheckin(reg: ApiEventRegistration) {
    try {
      const updated = await api.events.undoCheckin(reg.id)
      setRegistrations((prev) => prev.map((r) => r.id === updated.id ? updated : r))
    } catch (err) { console.error(err) }
  }

  const totalPresentes = registrations.filter((r) => r.attended).length
  const totalAusentes = registrations.length - totalPresentes

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (error || !event) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-destructive">{error || "Evento não encontrado."}</p>
      <Button variant="outline" onClick={() => router.back()} className="gap-2"><ArrowLeft className="h-4 w-4" /> Voltar</Button>
    </div>
  )

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        {/* Info do evento */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{event.event_type}</p>
                <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
                {event.description && <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-blue-100 text-blue-700">{STATUS_LABELS[event.status] ?? event.status}</Badge>
                <Badge className={event.is_free ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                  <Tag className="mr-1 h-3 w-3" />{event.is_free ? "Gratuito" : `R$ ${Number(event.price ?? 0).toFixed(2)}`}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(event.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{event.start_time} – {event.end_time}</span>
              {event.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.location}</span>}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "Inscritos",  val: registrations.length, color: "text-foreground" },
                { label: "Presentes",  val: totalPresentes,        color: "text-green-600" },
                { label: "Ausentes",   val: totalAusentes,         color: "text-red-600" },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-lg border bg-muted/20 p-3 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{val}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Check-in */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-5 w-5 text-primary" /> Check-in de Presença
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <button
                type="button"
                onClick={() => { setShowScanner((v) => !v); setCheckinResult(null) }}
                className={`w-full rounded-lg border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${showScanner ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
              >
                <QrCode className="h-4 w-4" />
                {showScanner ? "Fechar câmera" : "Abrir câmera para escanear QR Code"}
              </button>
              {showScanner && (
                <div className="mt-3">
                  <QrScanner onScan={(token) => doCheckin(token)} />
                  <p className="mt-2 text-center text-xs text-muted-foreground">Aponte a câmera para o QR Code do ingresso</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">ou cole o código manualmente</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); doCheckin(checkinToken) }} className="flex gap-3">
              <Input
                ref={checkinInputRef}
                placeholder="Cole o token do ingresso aqui..."
                value={checkinToken}
                onChange={(e) => setCheckinToken(e.target.value)}
                className="flex-1 font-mono text-sm"
              />
              <Button type="submit" disabled={checkingIn || !checkinToken.trim()} className="bg-primary text-white hover:bg-primary/90 shrink-0">
                {checkingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
              </Button>
            </form>

            {checkinResult && (
              <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${checkinResult.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {checkinResult.ok ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
                <span>{checkinResult.ok ? `✓ ${checkinResult.name} — ${checkinResult.msg}` : checkinResult.msg}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de inscritos (somente leitura + desfazer check-in) */}
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-primary" /> Inscritos ({registrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {registrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum aluno inscrito ainda.</p>
              </div>
            ) : (
              <div className="divide-y">
                {registrations.map((reg, i) => (
                  <div key={reg.id} className={`flex items-center justify-between px-6 py-3 gap-3 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${reg.attended ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"}`}>
                        {reg.student?.name?.charAt(0) ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{reg.student?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">{reg.student?.email ?? "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {reg.attended ? (
                        <>
                          <Badge className="bg-green-100 text-green-700 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Presente
                            {reg.attended_at && (
                              <span className="ml-1 font-normal opacity-75">
                                {new Date(reg.attended_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </Badge>
                          <button
                            onClick={() => handleUndoCheckin(reg)}
                            className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-yellow-700 hover:bg-yellow-50 transition-colors border border-transparent hover:border-yellow-200"
                          >
                            Desfazer check-in
                          </button>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Aguardando</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
