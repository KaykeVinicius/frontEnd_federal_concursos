"use client"

import { PDFViewer } from "@react-pdf/renderer"
import IngressoEventoPDF from "@/components/ingresso-evento-pdf"
import type { ApiEventRegistration, ApiEvent } from "@/lib/api"

interface Props {
  registration: ApiEventRegistration
  event: ApiEvent
  qrCodeUrl: string
}

export default function IngressoViewer({ registration, event, qrCodeUrl }: Props) {
  return (
    <PDFViewer style={{ width: "100%", height: "100vh", border: "none" }}>
      <IngressoEventoPDF
        registration={registration}
        event={event}
        qrCodeUrl={qrCodeUrl}
      />
    </PDFViewer>
  )
}
