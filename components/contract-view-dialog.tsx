"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Printer, Loader2 } from "lucide-react"
import { api, type ApiEnrollment } from "@/lib/api"

interface ContractViewDialogProps {
  enrollmentId: number | null
  onClose: () => void
}

// ─── Helpers ────────────────────────────────────────────────

function fmt(date?: string) {
  if (!date) return "___________"
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR")
}

const UNIDADES = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"]
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"]
const CENTENAS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos"]

function inteiroExtenso(n: number): string {
  if (n === 0) return "zero"
  if (n === 100) return "cem"
  if (n < 20) return UNIDADES[n]
  if (n < 100) {
    const dez = Math.floor(n / 10)
    const uni = n % 10
    return uni === 0 ? DEZENAS[dez] : `${DEZENAS[dez]} e ${UNIDADES[uni]}`
  }
  if (n < 1000) {
    const c = Math.floor(n / 100)
    const resto = n % 100
    return resto === 0 ? CENTENAS[c] : `${CENTENAS[c]} e ${inteiroExtenso(resto)}`
  }
  if (n < 1_000_000) {
    const mil = Math.floor(n / 1000)
    const resto = n % 1000
    const milStr = mil === 1 ? "mil" : `${inteiroExtenso(mil)} mil`
    return resto === 0 ? milStr : `${milStr} e ${inteiroExtenso(resto)}`
  }
  const mi = Math.floor(n / 1_000_000)
  const resto = n % 1_000_000
  const miStr = mi === 1 ? "um milhão" : `${inteiroExtenso(mi)} milhões`
  return resto === 0 ? miStr : `${miStr} e ${inteiroExtenso(resto)}`
}

function valorExtenso(valor: number): string {
  const formatted = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  const reais = Math.floor(valor)
  const centavos = Math.round((valor - reais) * 100)
  const reaisStr = reais === 0 ? "" : `${inteiroExtenso(reais)} real${reais !== 1 ? "s" : ""}`
  const centStr = centavos === 0 ? "" : `${inteiroExtenso(centavos)} centavo${centavos !== 1 ? "s" : ""}`
  let extenso = ""
  if (reaisStr && centStr) extenso = `${reaisStr} e ${centStr}`
  else extenso = reaisStr || centStr || "zero reais"
  return `${formatted} (${extenso})`
}

const SHIFT_LABEL: Record<string, string> = {
  manha: "manhã",
  tarde: "tarde",
  noite: "noite",
}

function getModalidadeLabel(access: string): string {
  if (access === "externo" || access === "online") return "Online"
  if (access === "ambos" || access === "hibrido") return "Híbrido"
  return "Presencial"
}

function getHorarioDesc(modalidade: string, schedule?: string, shift?: string): string {
  const mod = (modalidade ?? "").toLowerCase()
  if (mod === "externo" || mod === "online")
    return "24 (vinte e quatro) horas por dia, todos os dias"
  if (mod === "ambos" || mod === "hibrido")
    return `presencial no horário ${shift ? `(${SHIFT_LABEL[shift] ?? shift})` : ""} das ${schedule ?? "____"}, de segunda-feira a sexta-feira, e online 24 (vinte e quatro) horas por dia`
  // presencial
  const turno = shift ? ` (${SHIFT_LABEL[shift] ?? shift})` : ""
  return `${turno.trim() ? turno.trim() + ", " : ""}das ${schedule ?? "____"}, de segunda-feira a sexta-feira`
}

function getPaymentDesc(method: string, enrollment: ApiEnrollment): string {
  switch (method) {
    case "pix": return "PIX, a ser efetuado em pagamento único"
    case "dinheiro": return "Dinheiro, a ser efetuado em pagamento único"
    case "credito_vista": return "Cartão de crédito, a ser efetuado à vista"
    case "credito_parcelado": return `Cartão de crédito parcelado`
    case "boleto": return "Boleto bancário, conforme data agendada na matrícula"
    default: return method ?? "___________________"
  }
}

// ─── Print HTML ──────────────────────────────────────────────

function buildPrintHtml(innerHtml: string, studentName: string, origin: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Contrato – ${studentName}</title>
  <style>
    @page {
      size: A4;
      margin: 25mm 20mm 20mm 25mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.65;
      color: #111;
      background: #fff;
      position: relative;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      width: 60%;
      opacity: 0.045;
      pointer-events: none;
      z-index: 0;
    }
    .content { position: relative; z-index: 1; }

    /* Header */
    .doc-header {
      border-bottom: 2.5pt solid #c0392b;
      padding-bottom: 10pt;
      margin-bottom: 18pt;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12pt;
    }
    .doc-header-logo {
      width: 80pt;
      flex-shrink: 0;
    }
    .doc-header-info {
      text-align: right;
      font-size: 8pt;
      color: #555;
      line-height: 1.4;
    }
    .doc-header-info strong { font-size: 9pt; color: #111; }

    /* Title */
    .doc-title {
      text-align: center;
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      margin-bottom: 3pt;
    }
    .doc-subtitle {
      text-align: center;
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 20pt;
      color: #c0392b;
    }

    /* Sections */
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 16pt;
      margin-bottom: 6pt;
      padding-bottom: 2pt;
      border-bottom: 0.5pt solid #ccc;
    }
    p {
      margin-bottom: 7pt;
      text-align: justify;
      hyphens: auto;
    }
    ul {
      margin: 4pt 0 8pt 18pt;
    }
    ul li {
      margin-bottom: 3pt;
    }
    .indent1 { margin-left: 18pt; }
    .indent2 { margin-left: 36pt; }

    /* Signatures */
    .sig-section {
      margin-top: 48pt;
      page-break-inside: avoid;
    }
    .sig-city {
      margin-bottom: 36pt;
    }
    .sig-row {
      display: flex;
      justify-content: space-between;
    }
    .sig-block {
      text-align: center;
      width: 45%;
    }
    .sig-line {
      border-top: 1pt solid #111;
      margin-bottom: 4pt;
    }
    .sig-name {
      font-size: 10pt;
      font-weight: bold;
    }
    .sig-label {
      font-size: 9pt;
      color: #444;
    }

    /* Footer */
    .doc-footer {
      border-top: 0.5pt solid #ccc;
      margin-top: 20pt;
      padding-top: 6pt;
      font-size: 8pt;
      color: #777;
      text-align: center;
    }

    @media print {
      .no-print { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <img class="watermark" src="${origin}/images/tigre_proporcional.png" alt="" />
  <div class="content">
    ${innerHtml}
  </div>
</body>
</html>`
}

// ─── Component ───────────────────────────────────────────────

export function ContractViewDialog({ enrollmentId, onClose }: ContractViewDialogProps) {
  const [enrollment, setEnrollment] = useState<ApiEnrollment | null>(null)
  const [loading, setLoading] = useState(false)
  const contractRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enrollmentId) { setEnrollment(null); return }
    setLoading(true)
    api.enrollments.list()
      .then((list) => {
        const found = list.find((e) => e.id === enrollmentId) ?? null
        setEnrollment(found)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [enrollmentId])

  const student = enrollment?.student
  const course = enrollment?.course
  const turma = enrollment?.turma

  const accessType = turma?.modalidade ?? course?.access_type ?? "interno"
  const modalidadeLabel = getModalidadeLabel(accessType)
  const horarioDesc = getHorarioDesc(accessType, turma?.schedule, turma?.shift)
  const startDate = fmt(course?.start_date)
  const endDate = fmt(course?.end_date)
  const enrollDate = fmt(enrollment?.started_at)
  const paymentDesc = getPaymentDesc(enrollment?.payment_method ?? "", enrollment!)
  const totalPaid = enrollment?.total_paid ?? 0
  const isSigned = enrollment?.contract_signed

  function handlePrint() {
    const el = contractRef.current
    if (!el) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(buildPrintHtml(el.innerHTML, student?.name ?? "", window.location.origin))
    win.document.close()
    setTimeout(() => { win.focus(); win.print() }, 400)
  }

  return (
    <Dialog open={enrollmentId !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Contrato de Prestação de Serviços Educacionais
          </DialogTitle>
          <DialogDescription>
            Visualize o contrato de matrícula do aluno
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : enrollment ? (
          <div className="space-y-6">
            {/* Info bar */}
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border bg-accent/50 p-4">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">{student?.name}</p>
                <p className="text-sm text-muted-foreground">{course?.title} — {modalidadeLabel}</p>
                <p className="text-sm text-muted-foreground">Matrícula em: {enrollDate}</p>
              </div>
              <Badge
                className={isSigned ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                variant="secondary"
              >
                {isSigned ? "Assinado" : "Pendente"}
              </Badge>
            </div>

            {/* Contract document */}
            <div className="relative overflow-hidden rounded-lg border bg-white shadow-md">
              {/* Watermark */}
              <div
                className="pointer-events-none absolute inset-0 z-0"
                aria-hidden
                style={{
                  backgroundImage: "url('/images/fundo_a4_marcadagua.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  opacity: 0.1,
                }}
              />

              <div
                ref={contractRef}
                className="relative z-10 p-8 sm:p-12"
                style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: "13px", lineHeight: "1.7", color: "#111" }}
              >
                {/* Header */}
                <div style={{ borderBottom: "2.5px solid #c0392b", paddingBottom: "10px", marginBottom: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/tigre_proporcional.png" alt="Federal Cursos" style={{ width: "72px", flexShrink: 0, opacity: 0.9 }} />
                  <div style={{ textAlign: "right", fontSize: "10px", color: "#555", lineHeight: "1.5" }}>
                    <strong style={{ fontSize: "11px", color: "#111", display: "block" }}>Federal Cursos</strong>
                    Rua Getúlio Vargas, nº 2634, Sala 01, São Cristóvão<br />
                    Porto Velho – RO &nbsp;|&nbsp; CNPJ: 55.703.401/0001-08
                  </div>
                </div>

                {/* Title */}
                <p style={{ textAlign: "center", fontWeight: "bold", textTransform: "uppercase", fontSize: "14px", letterSpacing: "0.5px", marginBottom: "3px" }}>
                  Contrato de Prestação de Serviços Educacionais
                </p>
                <p style={{ textAlign: "center", fontWeight: "bold", textTransform: "uppercase", fontSize: "12px", color: "#c0392b", marginBottom: "22px" }}>
                  Curso {modalidadeLabel}
                </p>

                {/* 1. DAS PARTES */}
                <p style={{ fontWeight: "bold", borderBottom: "0.5px solid #ccc", paddingBottom: "2px", marginTop: "14px", marginBottom: "7px", textTransform: "uppercase", fontSize: "12px" }}>1. Das Partes</p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>1.1. CONTRATANTE:</strong> Nome Completo: <strong>{student?.name ?? "___________________"}</strong>,
                  WhatsApp: {student?.whatsapp ?? "___________________"},
                  E-mail: {student?.email ?? "___________________"},
                  Endereço: {student?.address ?? "___________________"}, nº {student?.address_number ?? "___"},
                  {student?.address_complement ? ` ${student.address_complement},` : ""}
                  CEP: {student?.cep ?? "___________"}.
                </p>
                <p style={{ marginBottom: "14px", textAlign: "justify" }}>
                  <strong>1.2. CONTRATADO:</strong> Federal Cursos Preparatório Para Concursos e Seleções Públicas LTDA,
                  com sede na Rua Getúlio Vargas, nº 2634, Sala 01, São Cristóvão, Porto Velho (RO),
                  CNPJ nº 55.703.401/0001-08.
                </p>

                {/* 2. DO OBJETO */}
                <p style={{ fontWeight: "bold", borderBottom: "0.5px solid #ccc", paddingBottom: "2px", marginTop: "14px", marginBottom: "7px", textTransform: "uppercase", fontSize: "12px" }}>2. Do Objeto</p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>2.1.</strong> O CONTRATADO fornecerá ao CONTRATANTE o seguinte Curso Preparatório para{" "}
                  <strong>{course?.title ?? "___________________"}</strong>, modalidade{" "}
                  <strong>{modalidadeLabel}</strong>, previsão de início das aulas dia{" "}
                  <strong>{startDate}</strong>, e término em <strong>{endDate}</strong>,
                  no horário {horarioDesc}
                  {(accessType === "interno" || accessType === "presencial") && (
                    <>, a ser realizado no endereço situado na Rua Getúlio Vargas, nº 2634, São Cristóvão, Porto Velho (RO)</>
                  )}.
                </p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>2.2.</strong> Caso o início das aulas seja postergado em relação à data assinalada (<strong>{startDate}</strong>),
                  o término do curso será automaticamente prorrogado por um período equivalente ao atraso verificado no início,
                  garantindo a integralidade da carga horária e do conteúdo programático. O CONTRATANTE será comunicado
                  formalmente sobre qualquer alteração nas datas de início e término.
                </p>
                <p style={{ marginBottom: "14px", textAlign: "justify" }}>
                  <strong>2.3.</strong> O curso escolhido pelo (a) CONTRATANTE mencionado nesta cláusula será designado,
                  doravante, simplesmente "curso".
                </p>

                {/* 3. VALOR E FORMA DE PAGAMENTO */}
                <p style={{ fontWeight: "bold", borderBottom: "0.5px solid #ccc", paddingBottom: "2px", marginTop: "14px", marginBottom: "7px", textTransform: "uppercase", fontSize: "12px" }}>3. Valor e Forma de Pagamento</p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>3.1.</strong> Como contraprestação pelos serviços educacionais prestados, o CONTRATANTE pagará
                  ao CONTRATADO apenas o valor de <strong>{valorExtenso(totalPaid)}</strong>.
                </p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>3.2. Forma de Pagamento:</strong> {paymentDesc}.
                </p>
                <p style={{ marginBottom: "5px", textAlign: "justify" }}>
                  <strong>3.3.</strong> No valor acima estão incluídos:
                </p>
                <ul style={{ marginBottom: "8px", marginLeft: "18px" }}>
                  <li>Matrícula;</li>
                  <li>Material didático em formato digital (PDF);</li>
                  <li>Suporte online (chat, e-mail, etc.);</li>
                  <li>Acesso ao grupo exclusivo de estudos no APP WhatsApp;</li>
                  <li>Acesso ao WhatsApp do mentor do curso; e</li>
                  <li>Montagem de um (1) cronograma de estudos + plano de estudos de acordo com a realidade de cada aluno, considerando suas particularidades.</li>
                </ul>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>3.4.</strong> O valor especificado no <em>caput</em> desta cláusula e os serviços previstos no
                  parágrafo anterior contemplam tão somente os dias de curso, não sendo o CONTRATADO responsável por
                  quaisquer despesas fora das datas de realização de cursos ou despesas com acompanhantes, ingressos,
                  seguros, despesas com hospitais, médicos, lanches, taxas e serviços de locomoção, transporte e outros
                  assemelhados; cópias reprográficas e serviços de impressão, encadernação e similares, bem como outros
                  produtos ou serviços opcionais.
                </p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>3.5.</strong> A ausência do CONTRATANTE às atividades, bem como o não cumprimento das demais
                  obrigações acadêmicas de sua responsabilidade, não o (a) exime do pagamento do preço do curso.
                </p>
                <p style={{ marginBottom: "14px", textAlign: "justify" }}>
                  <strong>3.6.</strong> A matrícula, ato que estabelece o vínculo entre as partes, dar-se-á com o
                  preenchimento do requerimento digital ou verbal de matrícula e o pagamento do valor integral do curso
                  ou se parcelado for.
                </p>

                {/* 4. DIREITO DE ARREPENDIMENTO */}
                <p style={{ fontWeight: "bold", borderBottom: "0.5px solid #ccc", paddingBottom: "2px", marginTop: "14px", marginBottom: "7px", textTransform: "uppercase", fontSize: "12px" }}>4. Direito de Arrependimento</p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>4.1.</strong> O CONTRATANTE tem o direito de se arrepender deste contrato, sem ônus, no prazo
                  de 7 (sete) dias corridos, contados da data da contratação ou do primeiro acesso ao conteúdo do curso,
                  o que ocorrer primeiro.
                </p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>4.2.</strong> Para exercer o direito de arrependimento, o CONTRATANTE deverá comunicar
                  formalmente o CONTRATADO, por meio do WhatsApp da empresa, dentro do prazo estipulado.
                </p>
                <p style={{ marginBottom: "14px", textAlign: "justify" }}>
                  <strong>4.3.</strong> O CONTRATADO reembolsará o valor pago pelo CONTRATANTE em até 7 (sete) dias
                  úteis, contados do recebimento da comunicação de arrependimento.
                </p>

                {/* 5. OBRIGAÇÕES DO CONTRATADO */}
                <p style={{ fontWeight: "bold", borderBottom: "0.5px solid #ccc", paddingBottom: "2px", marginTop: "14px", marginBottom: "7px", textTransform: "uppercase", fontSize: "12px" }}>5. Obrigações do Contratado</p>
                <p style={{ marginBottom: "5px", textAlign: "justify" }}><strong>5.1.</strong> O CONTRATADO obriga-se a:</p>
                {[
                  ["a)", "Cumprir a programação anunciada, ressalvando-se que a orientação técnica sobre a prestação dos serviços é de inteira responsabilidade do CONTRATADO, especialmente em relação à fixação de carga horária, grade curricular, indicação de professores e orientação didático-pedagógica, podendo a qualquer tempo proceder alterações nas atividades aqui mencionadas, com prévia comunicação ao CONTRATANTE."],
                  ["b)", "Fornecer instalações adequadas e professores com conhecimento técnico relacionado ao curso;"],
                  ["c)", "Disponibilizar material didático e acesso ao CONTRATANTE ao ambiente após confirmação do pagamento;"],
                  ["d)", "Apresentar nos dias e horários previamente agendados as aulas com o professor titular ou, em caso de força maior, apresentar outro professor com conhecimento comprovado na área;"],
                  ["e)", "Coordenar administrativa e academicamente o curso, zelando pela sua qualidade e pelo cumprimento do conteúdo programático;"],
                  ["f)", "Especificar o tipo e a qualidade do material didático a ser disponibilizado, incluindo apostilas, materiais complementares e recursos audiovisuais;"],
                  ["g)", "Definir a carga horária total do curso e a distribuição das aulas ao longo do período letivo;"],
                  ["h)", "Disponibilizar canais de comunicação eficientes para suporte aos alunos, tais como e-mail, telefone e plataformas online."],
                ].map(([letra, texto]) => (
                  <p key={letra} style={{ marginBottom: "5px", textAlign: "justify", marginLeft: "18px" }}>
                    <strong>{letra}</strong> {texto}
                  </p>
                ))}
                <p style={{ marginBottom: "14px" }} />

                {/* 6. OBRIGAÇÕES DO CONTRATANTE */}
                <p style={{ fontWeight: "bold", borderBottom: "0.5px solid #ccc", paddingBottom: "2px", marginTop: "14px", marginBottom: "7px", textTransform: "uppercase", fontSize: "12px" }}>6. Obrigações do Contratante</p>
                <p style={{ marginBottom: "5px", textAlign: "justify" }}><strong>6.1.</strong> O (a) CONTRATANTE obriga-se a:</p>
                {[
                  ["a)", "Informar ao CONTRATADO toda e qualquer alteração de seus endereços residencial e eletrônicos, principalmente WhatsApp, sempre que isso ocorrer durante a vigência do presente instrumento;"],
                  ["b)", "Ressarcir os danos de natureza material causados ao CONTRATADO, por dolo ou culpa do (a) CONTRATANTE, bem como aqueles causados nas dependências do CONTRATADO contra professores, funcionários, alunos ou qualquer outra pessoa, bem como às instalações e equipamentos;"],
                  ["c)", "Não gravar as aulas e nem reproduzir ou disponibilizar aulas que eventualmente tenham sido gravadas sem autorização do CONTRATADO, sob pena de responder pela violação de direitos autorais;"],
                  ["d)", "Assistir às aulas com urbanidade e respeito aos demais alunos e professores."],
                ].map(([letra, texto]) => (
                  <p key={letra} style={{ marginBottom: "5px", textAlign: "justify", marginLeft: "18px" }}>
                    <strong>{letra}</strong> {texto}
                  </p>
                ))}
                <p style={{ marginBottom: "14px" }} />

                {/* 7. RESCISÃO */}
                <p style={{ fontWeight: "bold", borderBottom: "0.5px solid #ccc", paddingBottom: "2px", marginTop: "14px", marginBottom: "7px", textTransform: "uppercase", fontSize: "12px" }}>7. Rescisão Contratual</p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>7.1.</strong> O presente contrato poderá ser rescindido por qualquer uma das partes, mediante comunicação por escrito à outra parte.
                </p>
                <p style={{ marginBottom: "5px", textAlign: "justify" }}><strong>7.2. Rescisão por Iniciativa do CONTRATANTE:</strong></p>
                {[
                  ["7.2.1.", "Caso a rescisão ocorra antes do início das aulas, será devolvido ao CONTRATANTE o valor pago, descontada uma taxa administrativa de 15% (quinze por cento) do valor total do curso."],
                  ["7.2.2.", "Em caso de rescisão contratual após o início das aulas, o CONTRATANTE deverá efetuar o pagamento proporcional às aulas ministradas/disponibilizadas até a data da rescisão, calculado com base no valor integral do curso, acrescido de multa rescisória no montante de 30% (trinta por cento) do valor total do curso."],
                  ["7.2.3.", "Para matrículas realizadas com pagamento via cartão de crédito, à vista ou parcelado, será descontado adicionalmente o valor de R$ 100,00 (cem reais) referente às despesas com taxas junto às operadoras de cartão de crédito."],
                  ["7.2.4.", "O não comparecimento do aluno ao curso por causas estritamente particulares não o isenta das condições de cancelamento estipuladas neste contrato."],
                  ["7.2.5.", "A alteração de curso após a efetivação da matrícula será considerada quebra de contrato, sujeitando o CONTRATANTE à cobrança da referida multa e ao pagamento integral das aulas já assistidas no curso originalmente contratado."],
                ].map(([num, texto]) => (
                  <p key={num} style={{ marginBottom: "5px", textAlign: "justify", marginLeft: "18px" }}>
                    <strong>{num}</strong> {texto}
                  </p>
                ))}
                <p style={{ marginBottom: "5px", marginTop: "8px", textAlign: "justify" }}><strong>7.3. Rescisão por Iniciativa do CONTRATADO:</strong></p>
                <p style={{ marginBottom: "5px", textAlign: "justify", marginLeft: "18px" }}>
                  <strong>7.3.1.</strong> O CONTRATADO poderá rescindir o contrato nas seguintes hipóteses:
                </p>
                {[
                  ["a)", "Inadimplência do CONTRATANTE por período superior a 15 (quinze) dias, sem prejuízo da cobrança dos valores devidos;"],
                  ["b)", "Conduta do CONTRATANTE que prejudique o andamento regular das aulas ou que viole as normas de convivência da instituição;"],
                  ["c)", "Ocorrência de caso fortuito ou força maior que impeça a continuidade da prestação dos serviços."],
                ].map(([letra, texto]) => (
                  <p key={letra} style={{ marginBottom: "5px", textAlign: "justify", marginLeft: "36px" }}>
                    <strong>{letra}</strong> {texto}
                  </p>
                ))}
                <p style={{ marginBottom: "8px", marginTop: "6px", textAlign: "justify" }}>
                  <strong>Parágrafo Primeiro:</strong> Em caso de rescisão por iniciativa do CONTRATADO, este deverá restituir ao CONTRATANTE o valor proporcional às aulas não ministradas, salvo nos casos de rescisão por inadimplência ou conduta do (a) CONTRATANTE.
                </p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>Parágrafo Segundo:</strong> O "início das aulas", para fins de aplicação desta cláusula, será considerado a data da primeira aula do curso, conforme o cronograma divulgado pelo CONTRATADO.
                </p>
                <p style={{ marginBottom: "14px", textAlign: "justify" }}>
                  <strong>Parágrafo Terceiro:</strong> A mudança de curso após a matrícula, quando permitida, poderá acarretar a necessidade de ajustes no valor e nas condições de pagamento, a serem acordados entre as partes, não se caracterizando como rescisão, desde que haja anuência expressa do CONTRATADO.
                </p>

                {/* 8. PROPRIEDADE INTELECTUAL */}
                <p style={{ fontWeight: "bold", borderBottom: "0.5px solid #ccc", paddingBottom: "2px", marginTop: "14px", marginBottom: "7px", textTransform: "uppercase", fontSize: "12px" }}>8. Propriedade Intelectual</p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>8.1.</strong> O conteúdo do curso (vídeos, textos, materiais, etc.) é protegido por direitos autorais e é de propriedade exclusiva do CONTRATADO.
                </p>
                <p style={{ marginBottom: "14px", textAlign: "justify" }}>
                  <strong>8.2.</strong> É proibida a reprodução, distribuição, cópia ou qualquer outra forma de utilização do conteúdo do curso sem a autorização expressa do CONTRATADO.
                </p>

                {/* 9. PRIVACIDADE */}
                <p style={{ fontWeight: "bold", borderBottom: "0.5px solid #ccc", paddingBottom: "2px", marginTop: "14px", marginBottom: "7px", textTransform: "uppercase", fontSize: "12px" }}>9. Privacidade e Proteção de Dados</p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>9.1.</strong> O CONTRATADO se compromete a proteger os dados pessoais do CONTRATANTE, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                </p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>9.2.</strong> Os dados do CONTRATANTE serão coletados, utilizados e armazenados para fins de execução deste contrato, comunicação, suporte e melhoria dos serviços.
                </p>
                <p style={{ marginBottom: "8px", textAlign: "justify" }}>
                  <strong>9.3.</strong> O CONTRATANTE autoriza o CONTRATADO a utilizar seus dados para envio de informações sobre outros cursos e promoções, podendo revogar essa autorização a qualquer momento.
                </p>
                <p style={{ marginBottom: "14px", textAlign: "justify" }}>
                  <strong>9.4.</strong> O CONTRATANTE tem o direito de acessar, retificar, excluir ou solicitar a portabilidade de seus dados, conforme previsto na LGPD.
                </p>

                {/* 10. DISPOSIÇÕES GERAIS */}
                <p style={{ fontWeight: "bold", borderBottom: "0.5px solid #ccc", paddingBottom: "2px", marginTop: "14px", marginBottom: "7px", textTransform: "uppercase", fontSize: "12px" }}>10. Disposições Gerais</p>
                {[
                  ["10.1.", "Se qualquer das partes deixar de fazer valer, a qualquer tempo, quaisquer disposições do presente contrato ou deixar de exigir o cumprimento pela outra de quaisquer disposições aqui contidas, tal ato não será interpretado, em nenhuma hipótese, como uma renúncia a essas disposições."],
                  ["10.2.", "Qualquer notificação entre as partes será feita por escrito e enviada aos endereços consignados no preâmbulo deste contrato."],
                  ["10.3.", "Caso haja qualquer alteração nos endereços de correspondências, as partes obrigam-se a comunicar à outra os seus novos endereços em até 5 (cinco) dias úteis, sob pena de serem consideradas válidas as comunicações encaminhadas ao endereço anterior."],
                  ["10.4.", "O CONTRATADO, livre de quaisquer ônus, poderá utilizar-se da imagem do CONTRATANTE para fins acadêmicos ou para divulgação de suas atividades, respeitado o direito à imagem e desde que o uso não seja abusivo ou cause prejuízo. O CONTRATANTE poderá revogar esta autorização a qualquer momento, mediante comunicação por escrito."],
                  ["10.5.", "As partes atribuem ao presente contrato plena eficácia e força executiva. Fica eleito o foro da cidade de Porto Velho (RO), para dirimir quaisquer dúvidas ou conflitos oriundos do presente contrato."],
                ].map(([num, texto]) => (
                  <p key={num} style={{ marginBottom: "8px", textAlign: "justify" }}>
                    <strong>{num}</strong> {texto}
                  </p>
                ))}

                <p style={{ marginBottom: "24px", marginTop: "14px", textAlign: "justify" }}>
                  E, por estarem de pleno acordo, firmam o presente instrumento em 2 (duas) vias de igual teor e conteúdo, para todos os fins de direito.
                </p>

                <p style={{ marginBottom: "48px" }}>Porto Velho (RO), {enrollDate}.</p>

                {/* Assinaturas */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ textAlign: "center", width: "42%" }}>
                    <div style={{ borderTop: "1px solid #111", marginBottom: "4px" }} />
                    <p style={{ fontWeight: "bold", fontSize: "12px" }}>Contratante</p>
                    <p style={{ fontSize: "11px", color: "#444" }}>{student?.name}</p>
                  </div>
                  <div style={{ textAlign: "center", width: "42%" }}>
                    <div style={{ borderTop: "1px solid #111", marginBottom: "4px" }} />
                    <p style={{ fontWeight: "bold", fontSize: "12px" }}>Contratado</p>
                    <p style={{ fontSize: "11px", color: "#444" }}>Federal Cursos</p>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ borderTop: "0.5px solid #ccc", marginTop: "28px", paddingTop: "6px", fontSize: "10px", color: "#888", textAlign: "center" }}>
                  Federal Cursos Preparatório Para Concursos e Seleções Públicas LTDA &nbsp;·&nbsp;
                  CNPJ 55.703.401/0001-08 &nbsp;·&nbsp;
                  Rua Getúlio Vargas, nº 2634, Sala 01, São Cristóvão, Porto Velho/RO
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir / Salvar PDF
              </Button>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">Contrato não encontrado.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
