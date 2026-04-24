import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import path from "path"
import fs from "fs"
import QRCode from "qrcode"
import IngressoPDF from "@/components/ingresso-evento-pdf"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1"

function imageToBase64(filename: string): string {
  const filePath = path.join(process.cwd(), "public", "images", filename)
  const buffer = fs.readFileSync(filePath)
  const ext = path.extname(filename).replace(".", "")
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png"
  return `data:${mime};base64,${buffer.toString("base64")}`
}

async function fetchWithToken(p: string, token: string | null) {
  const res = await fetch(`${API}${p}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Erro ${res.status}`)
  return res.json()
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token: ticketToken } = await params
    const authToken = req.nextUrl.searchParams.get("token")

    const events = await fetchWithToken("/events", authToken)

    let registration = null
    let event = null

    for (const ev of events) {
      const regs = await fetchWithToken(`/events/${ev.id}/registrations`, authToken)
      const found = regs.find((r: { ticket_token: string }) => r.ticket_token === ticketToken)
      if (found) { registration = found; event = ev; break }
    }

    if (!registration || !event) {
      return NextResponse.json({ error: "Ingresso não encontrado." }, { status: 404 })
    }

    const tigerBase64 = imageToBase64("tigre_sem_fundo.png")

    const checkinUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://federalcursos.com.br"}/ceo/eventos/checkin/${ticketToken}`
    let qrBase64 = ""
    try {
      qrBase64 = await QRCode.toDataURL(checkinUrl, { width: 256, margin: 2 })
    } catch {
      qrBase64 = ""
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(IngressoPDF, { registration, event, tigerBase64, qrCodeUrl: qrBase64 }) as any
    const buffer = await renderToBuffer(element)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="ingresso_${ticketToken.slice(0, 8)}.pdf"`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
