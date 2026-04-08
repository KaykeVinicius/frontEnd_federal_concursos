import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import path from "path"
import fs from "fs"
import IngressoPDF from "@/components/ingresso-pdf"

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

    // Busca todos os eventos e suas inscrições para achar o ticket_token
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

    // Gera QR code como data URL PNG usando rqrcode via spawn
    const { execSync } = require("child_process")
    const checkinUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/ceo/eventos/checkin/${ticketToken}`
    const qrScript = `
require 'rqrcode'
qr = RQRCode::QRCode.new('${checkinUrl}')
png = qr.as_png(module_px_size: 8, border_modules: 4)
print "data:image/png;base64,#{[png.to_s].pack('m0')}"
`
    const rubyBin = "/home/kayke/.local/share/mise/installs/ruby/3.4.1/bin/ruby"
    const gemPath = execSync(`${rubyBin} -e "puts Gem.paths.home"`, {
      env: { ...process.env, BUNDLE_GEMFILE: path.join(process.cwd(), "..", "backEndFederalConcursos", "Gemfile") }
    }).toString().trim()

    let qrBase64 = ""
    try {
      qrBase64 = execSync(`${rubyBin} -I${gemPath}/gems/rqrcode_core-2.1.0/lib -I${gemPath}/gems/rqrcode-3.2.0/lib -I${gemPath}/gems/chunky_png-1.4.0/lib -e "${qrScript.replace(/\n/g, ";")}"`).toString().trim()
    } catch {
      qrBase64 = ""
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(IngressoPDF, { registration, event, tigerBase64, qrBase64 }) as any
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
