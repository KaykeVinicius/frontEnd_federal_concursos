"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api, type ApiEventRegistration } from "@/lib/api"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Image from "next/image"

export default function CheckinPage() {
  const params = useParams()
  const token = params.token as string

  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading")
  const [registration, setRegistration] = useState<ApiEventRegistration | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) return
    api.events.checkin(token)
      .then((reg) => { setRegistration(reg); setStatus("success") })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Erro desconhecido."
        if (msg.includes("já registrada")) { setStatus("already") } else { setStatus("error") }
        setMessage(msg)
      })
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e] p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-[#1a1a2e] px-6 py-5 text-center">
          <Image src="/images/logofederalsemfundo.jpeg" alt="Federal Cursos" width={120} height={40} className="mx-auto object-contain" style={{ height: 40, width: "auto" }} />
        </div>
        <div className="h-1 bg-[#e8491d]" />

        <div className="px-6 py-8 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Validando ingresso...</p>
            </>
          )}

          {status === "success" && registration && (
            <>
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
              <div>
                <p className="text-lg font-bold text-foreground">Presença confirmada!</p>
                <p className="text-sm text-muted-foreground mt-1">{registration.student?.name}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-4 py-3 text-left text-sm space-y-1">
                <p><strong>Evento:</strong> {registration.event?.title}</p>
                <p><strong>Data:</strong> {registration.event?.date ? new Date(registration.event.date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</p>
                <p><strong>Horário:</strong> {registration.event?.start_time} – {registration.event?.end_time}</p>
                {registration.event?.location && <p><strong>Local:</strong> {registration.event.location}</p>}
              </div>
              <p className="text-xs text-muted-foreground">Registrado em {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
            </>
          )}

          {status === "already" && (
            <>
              <XCircle className="mx-auto h-14 w-14 text-yellow-500" />
              <p className="text-lg font-bold text-foreground">Presença já registrada</p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="mx-auto h-14 w-14 text-destructive" />
              <p className="text-lg font-bold text-foreground">Ingresso inválido</p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </>
          )}
        </div>

        <div className="border-t px-6 py-3 text-center">
          <p className="text-xs text-muted-foreground">Federal Cursos — Sistema de Check-in</p>
        </div>
      </div>
    </div>
  )
}
