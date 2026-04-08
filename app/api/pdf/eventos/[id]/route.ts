import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement } from "react"
import path from "path"
import fs from "fs"
import RelatorioEventoPDF from "@/components/relatorio-evento-pdf"

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = req.nextUrl.searchParams.get("token")
    const [event, registrations] = await Promise.all([
      fetchWithToken(`/events/${id}`, token),
      fetchWithToken(`/events/${id}/registrations`, token),
    ])

    const sorted = [...registrations].sort((a: { student?: { name?: string } }, b: { student?: { name?: string } }) =>
      (a.student?.name ?? "").localeCompare(b.student?.name ?? "", "pt-BR")
    )

    const tigerBase64 = imageToBase64("tigre_sem_fundo.png")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(RelatorioEventoPDF, { event, registrations: sorted, tigerBase64 }) as any
    const buffer = await renderToBuffer(element)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="evento_${id}_presenca.pdf"`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
