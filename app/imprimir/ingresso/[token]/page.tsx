"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import QRCode from "qrcode"
import { Loader2 } from "lucide-react"
import type { ApiEventRegistration, ApiEvent } from "@/lib/api"

const IngressoViewer = dynamic(() => import("./ingresso-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <span className="text-muted-foreground">Gerando ingresso...</span>
    </div>
  ),
})

interface IngressoData {
  registration: ApiEventRegistration
  event: ApiEvent
}

export default function ImprimirIngressoPage() {
  const params = useParams()
  const token = params.token as string

  const [data, setData] = useState<IngressoData | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) return

    const stored = localStorage.getItem(`ingresso_${token}`)
    if (!stored) {
      setError("Ingresso não encontrado. Por favor, gere o ingresso novamente a partir da página do evento.")
      return
    }

    try {
      const parsed = JSON.parse(stored) as IngressoData
      setData(parsed)

      QRCode.toDataURL(token, {
        width: 256,
        margin: 1,
        color: { dark: "#1a1a2e", light: "#ffffff" },
      }).then(setQrCodeUrl)
    } catch {
      setError("Erro ao processar ingresso.")
    }
  }, [token])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-destructive px-4 text-center">
        {error}
      </div>
    )
  }

  if (!data || !qrCodeUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-muted-foreground">Gerando ingresso...</span>
      </div>
    )
  }

  return (
    <IngressoViewer
      registration={data.registration}
      event={data.event}
      qrCodeUrl={qrCodeUrl}
    />
  )
}
