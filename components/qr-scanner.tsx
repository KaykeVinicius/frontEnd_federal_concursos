"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, CameraOff, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  onScan: (token: string) => void
}

function extractToken(text: string) {
  const parts = text.split("/")
  return parts[parts.length - 1]
}

type PermState = "idle" | "requesting" | "active" | "denied" | "error"

export default function QrScanner({ onScan }: Props) {
  const liveId = "qr-live-container"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null)
  const [state, setState] = useState<PermState>("idle")
  const [errMsg, setErrMsg] = useState("")

  useEffect(() => () => safeStop(), [])

  function safeStop() {
    try {
      const s = scannerRef.current
      if (s?.getState?.() === 2 || s?.getState?.() === 3) s.stop().catch(() => {})
      s?.clear?.()
    } catch {}
    scannerRef.current = null
  }

  async function startLive() {
    setErrMsg("")
    setState("requesting")
    await new Promise(r => setTimeout(r, 300))

    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      safeStop()

      const cameras = await Html5Qrcode.getCameras()
      if (!cameras.length) throw new Error("no_camera")

      const cam = cameras.find((c: { label: string }) =>
        /back|rear|traseira|environment/i.test(c.label)
      ) ?? cameras[0]

      const scanner = new Html5Qrcode(liveId)
      scannerRef.current = scanner

      await scanner.start(
        cam.id,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (text: string) => onScan(extractToken(text)),
        () => {}
      )

      setState("active")
    } catch (err: unknown) {
      safeStop()
      const msg = err instanceof Error ? err.message : String(err)
      const isDenied = /permission|denied|notallowed|not allowed/i.test(msg)
      setState(isDenied ? "denied" : "error")
      setErrMsg(msg)
    }
  }

  function stopLive() {
    safeStop()
    setState("idle")
    setErrMsg("")
  }

  const isActive = state === "active"

  return (
    <div className="space-y-3">
      {/* Container da câmera */}
      <div
        id={liveId}
        style={{
          width: "100%",
          maxWidth: 360,
          height: isActive ? 300 : 0,
          margin: "0 auto",
          overflow: "hidden",
          borderRadius: 12,
          background: "#000",
          border: isActive ? "1px solid #e2e8f0" : "none",
          transition: "height 0.2s ease",
        }}
      />

      {/* Botão */}
      {!isActive ? (
        <Button
          type="button"
          onClick={startLive}
          disabled={state === "requesting"}
          className="w-full gap-2 bg-primary text-white hover:bg-primary/90"
        >
          <Camera className="h-4 w-4" />
          {state === "requesting" ? "Abrindo câmera..." : "Abrir câmera"}
        </Button>
      ) : (
        <Button type="button" variant="outline" onClick={stopLive} className="w-full gap-2">
          <CameraOff className="h-4 w-4" /> Fechar câmera
        </Button>
      )}

      {/* Permissão negada — instruções claras */}
      {state === "denied" && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 space-y-2">
          <div className="flex items-center gap-2 text-orange-700 font-medium text-sm">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            Permissão de câmera bloqueada
          </div>
          <p className="text-xs text-orange-700">
            Para liberar no <strong>Chrome</strong>: clique no ícone de câmera
            <strong> 🔒 na barra de endereço</strong> → selecione <strong>Sempre permitir</strong> → recarregue a página.
          </p>
          <p className="text-xs text-orange-700">
            Para liberar no <strong>Safari (iPhone)</strong>: Ajustes → Safari → Câmera → Permitir.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
            onClick={() => window.location.reload()}
          >
            Recarregar página após liberar
          </Button>
        </div>
      )}

      {/* Outro erro */}
      {state === "error" && (
        <p className="text-xs text-center text-destructive px-2">{errMsg}</p>
      )}
    </div>
  )
}
