import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"

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

type Student = {
  id: number
  name: string
  email: string
  cpf?: string
  whatsapp?: string
  instagram?: string
  birth_date?: string
  active: boolean
}

function formatCpf(cpf?: string) {
  if (!cpf) return "—"
  const d = cpf.replace(/\D/g, "")
  if (d.length !== 11) return cpf
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

function formatDate(date?: string) {
  if (!date) return "—"
  const d = new Date(date + "T12:00:00")
  return d.toLocaleDateString("pt-BR")
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")
    const status = req.nextUrl.searchParams.get("status")

    const allStudents: Student[] = await fetchWithToken(
      "/students?per_page=2000&page=1&include_enrollments=false",
      token
    )

    let students = allStudents.sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "", "pt-BR")
    )

    let filterLabel = "Todos"
    if (status === "active") {
      students = students.filter((s) => s.active)
      filterLabel = "Ativos"
    } else if (status === "inactive") {
      students = students.filter((s) => !s.active)
      filterLabel = "Inativos"
    }

    const tigerBase64 = imageToBase64("tigre_sem_fundo.png")
    const ativos = students.filter((s) => s.active).length
    const inativos = students.filter((s) => !s.active).length
    const now = new Date()
    const emitidoEm = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    const emitidoAs = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

    const rows = students
      .map(
        (s, i) => `
        <tr class="${i % 2 === 0 ? "" : "alt"}">
          <td class="num">${i + 1}</td>
          <td class="nome">${s.name}</td>
          <td>${formatCpf(s.cpf)}</td>
          <td>${formatDate(s.birth_date)}</td>
          <td>${s.whatsapp ?? "—"}</td>
          <td>${s.email}</td>
          <td>${s.instagram ? "@" + s.instagram.replace(/^@/, "") : "—"}</td>
          <td class="center"><span class="badge ${s.active ? "ativo" : "inativo"}">${s.active ? "Ativo" : "Inativo"}</span></td>
        </tr>`
      )
      .join("")

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Relatório de Alunos — Federal Cursos</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #1a1a2e;
      background: #fff;
    }

    /* ---- HEADER ---- */
    .header {
      background: #1a1a2e;
      color: #fff;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .header-left { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
    .header img { width: 52px; height: 52px; object-fit: contain; }
    .divider { width: 1px; height: 44px; background: #e8491d; margin: 0 4px; }
    .brand { font-size: 22px; font-weight: 900; letter-spacing: 2px; line-height: 1; }
    .brand span { color: #e8491d; }
    .sub { font-size: 8px; color: #94a3b8; margin-top: 4px; letter-spacing: 0.5px; }

    .header-center {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 5px;
      border-left: 1px solid #2d3748;
      border-right: 1px solid #2d3748;
      padding: 0 24px;
    }
    .contact-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 9px;
      color: #94a3b8;
    }

    .header-right { text-align: right; flex-shrink: 0; }
    .emit-label { font-size: 7px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
    .emit-date { font-size: 10px; color: #fff; font-weight: bold; margin-top: 2px; }
    .emit-time { font-size: 8px; color: #94a3b8; margin-top: 1px; }

    .accent { height: 4px; background: #e8491d; }

    /* ---- BODY ---- */
    .body { padding: 20px 32px 40px; }

    /* ---- SUMMARY ---- */
    .summary {
      display: flex;
      gap: 32px;
      background: #f1f5f9;
      border-left: 4px solid #e8491d;
      border-radius: 6px;
      padding: 14px 20px;
      margin-bottom: 20px;
    }
    .summary-item .label { font-size: 7px; text-transform: uppercase; letter-spacing: 1.2px; color: #64748b; font-weight: bold; margin-bottom: 2px; }
    .summary-item .value { font-size: 18px; font-weight: bold; color: #1a1a2e; }
    .value.green { color: #16a34a; }
    .value.red { color: #dc2626; }

    /* ---- TABLE ---- */
    .section-title { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; color: #1a1a2e; margin-bottom: 8px; }

    table { width: 100%; border-collapse: collapse; }

    thead tr { background: #1a1a2e; }
    thead th {
      color: #fff;
      font-size: 7.5px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 8px 8px;
      text-align: left;
      font-weight: bold;
    }
    thead th.center { text-align: center; }

    tbody tr { border-bottom: 1px solid #e2e8f0; }
    tbody tr.alt { background: #f8fafc; }

    td { padding: 6px 8px; font-size: 9px; color: #1a1a2e; vertical-align: middle; }
    td.num { color: #94a3b8; width: 28px; }
    td.nome { font-weight: 500; }
    td.center { text-align: center; }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 7.5px;
      font-weight: bold;
    }
    .badge.ativo { background: #dcfce7; color: #16a34a; }
    .badge.inativo { background: #fee2e2; color: #dc2626; }

    /* ---- PRINT BAR ---- */
    .print-bar {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 10px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .print-bar p { font-size: 11px; color: #64748b; }
    .print-btn {
      background: #e8491d;
      color: #fff;
      border: none;
      padding: 8px 20px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      letter-spacing: 0.5px;
    }
    .print-btn:hover { background: #d13a0f; }

    /* ---- FOOTER ---- */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0; right: 0;
      padding: 8px 32px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 7.5px;
      color: #94a3b8;
      background: #fff;
    }
    .footer span { color: #e8491d; font-weight: bold; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-bar { display: none; }
      .footer { position: fixed; bottom: 0; }
      @page { margin: 10mm; size: A4 landscape; }
    }
  </style>
</head>
<body>

  <div class="print-bar">
    <p>Visualização do relatório — clique em <strong>Imprimir</strong> para salvar como PDF</p>
    <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  </div>

  <div class="header">
    <div class="header-left">
      <img src="${tigerBase64}" alt="Logo" />
      <div class="divider"></div>
      <div>
        <div class="brand"><span>FEDERAL</span> CURSOS</div>
        <div class="sub">Preparatório para Concursos Públicos</div>
      </div>
    </div>
    <div class="header-center">
      <div class="contact-row">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="#e8491d"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        (69) 99369-7213
      </div>
      <div class="contact-row">
        <svg viewBox="0 0 24 24" width="11" height="11"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#c13584" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="4" stroke="#c13584" stroke-width="2" fill="none"/><circle cx="17.5" cy="6.5" r="1" fill="#c13584"/></svg>
        @federalcursos
      </div>
      <div class="contact-row">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="#94a3b8"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
        federal@federalcursos.com
      </div>
      <div class="contact-row">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="#94a3b8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        R. Getúlio Vargas, 2634 — São Cristóvão, Porto Velho – RO
      </div>
    </div>
    <div class="header-right">
      <div class="emit-label">Emitido em</div>
      <div class="emit-date">${emitidoEm}</div>
      <div class="emit-time">às ${emitidoAs}</div>
    </div>
  </div>

  <div class="accent"></div>

  <div class="body">
    <div class="summary">
      <div class="summary-item">
        <div class="label">Filtro</div>
        <div class="value">${filterLabel}</div>
      </div>
      <div class="summary-item">
        <div class="label">Total</div>
        <div class="value">${students.length}</div>
      </div>
      <div class="summary-item">
        <div class="label">Ativos</div>
        <div class="value green">${ativos}</div>
      </div>
      <div class="summary-item">
        <div class="label">Inativos</div>
        <div class="value red">${inativos}</div>
      </div>
    </div>

    <div class="section-title">Lista de Alunos</div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Nome</th>
          <th>CPF</th>
          <th>Nascimento</th>
          <th>WhatsApp</th>
          <th>E-mail</th>
          <th>Instagram</th>
          <th class="center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <span>Federal Cursos</span> — Documento gerado automaticamente pelo sistema.
    <span>${students.length} aluno(s) listado(s)</span>
  </div>

</body>
</html>`

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  } catch (err) {
    return new NextResponse(`<h1>Erro</h1><pre>${String(err)}</pre>`, {
      status: 500,
      headers: { "Content-Type": "text/html" },
    })
  }
}
