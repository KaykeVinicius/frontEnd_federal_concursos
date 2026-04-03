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

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  credito_vista: "Cartão de crédito à vista",
  credito_parcelado: "Cartão de crédito parcelado",
  boleto: "Boleto bancário",
  dinheiro: "Dinheiro",
}

const modalidadeLabel: Record<string, string> = {
  interno: "presencial",
  externo: "online",
  ambos: "híbrida (presencial e online)",
}

function fmt(date?: string) {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("pt-BR")
}

function valorExtenso(valor: number): string {
  // Retorna o valor numérico formatado (extenso completo seria muito complexo aqui)
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

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

  const modalidade = modalidadeLabel[course?.access_type ?? ""] ?? "presencial"
  const startDate = fmt(course?.start_date)
  const endDate = fmt(course?.end_date)
  const enrollDate = fmt(enrollment?.started_at)
  const paymentLabel = paymentLabels[enrollment?.payment_method ?? ""] ?? enrollment?.payment_method ?? "—"
  const totalPaid = enrollment?.total_paid ?? 0
  const isSigned = enrollment?.contract_signed

  function handlePrint() {
    const el = contractRef.current
    if (!el) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Contrato – ${student?.name ?? ""}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 13px;
      line-height: 1.7;
      color: #1a1a1a;
      padding: 40px 50px;
      position: relative;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 70%;
      opacity: 0.07;
      pointer-events: none;
      z-index: 0;
    }
    .content { position: relative; z-index: 1; }
    h1 { text-align: center; font-size: 15px; font-weight: bold; margin-bottom: 2px; }
    h2 { text-align: center; font-size: 13px; font-weight: bold; margin-bottom: 24px; }
    .section { margin-bottom: 18px; }
    .section-title { font-weight: bold; margin-bottom: 6px; }
    p { margin-bottom: 8px; text-align: justify; }
    .signature { margin-top: 60px; }
    .sig-line { border-top: 1px solid #000; width: 300px; margin-top: 40px; margin-bottom: 4px; }
    @media print { body { padding: 20px 30px; } }
  </style>
</head>
<body>
  <img class="watermark" src="${window.location.origin}/images/tigre_proporcional.png" />
  <div class="content">${el.innerHTML}</div>
</body>
</html>`)
    win.document.close()
    win.print()
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
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border bg-accent/50 p-4">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">{student?.name}</p>
                <p className="text-sm text-muted-foreground">{course?.title}</p>
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
            <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm">
              {/* Tigre watermark */}
              <div
                className="pointer-events-none absolute inset-0 z-0"
                aria-hidden
                style={{
                  backgroundImage: "url('/images/fundo_a4_marcadagua.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  opacity: 0.13,
                }}
              />

              <div
                ref={contractRef}
                className="relative z-10 p-8 font-serif text-[13px] leading-relaxed text-gray-900 sm:p-12"
              >
                {/* Título */}
                <p className="mb-1 text-center font-bold uppercase">Contrato de Prestação de Serviços Educacionais</p>
                <p className="mb-8 text-center font-bold uppercase">
                  Curso {modalidade === "presencial" ? "Presencial" : modalidade === "online" ? "Online" : "Híbrido"}
                </p>

                {/* 1. DAS PARTES */}
                <p className="mb-3 font-bold">1. DAS PARTES</p>
                <p className="mb-3 text-justify">
                  <strong>1.1. CONTRATANTE:</strong>{" "}
                  Nome Completo: {student?.name ?? "___________________"},{" "}
                  WhatsApp: {student?.whatsapp ?? "___________________"},{" "}
                  E-mail: {student?.email ?? "___________________"},{" "}
                  Endereço Residência: {student?.address ?? "___________________"},{" "}
                  Número: {student?.address_number ?? "___"},{" "}
                  Complemento: {student?.address_complement ?? "___________________"},{" "}
                  CEP: {student?.cep ?? "___________"}.
                </p>
                <p className="mb-6 text-justify">
                  <strong>1.2. CONTRATADO:</strong>{" "}
                  Federal Cursos Preparatório Para Concursos e Seleções Publicas LTDA, com sede na Rua Getúlio Vargas, nº 2634, Sala 01 São Cristóvão, Porto Velho (RO), CNPJ nº 55.703.401/0001-08.
                </p>

                {/* 2. DO OBJETO */}
                <p className="mb-3 font-bold">2. DO OBJETO</p>
                <p className="mb-3 text-justify">
                  <strong>2.1.</strong> O CONTRATADO fornecerá ao CONTRATANTE o seguinte Curso Preparatório para o Concurso <strong>{course?.title ?? "___________________"}</strong>, modalidade {modalidade}, previsão de início das aulas dia <strong>{startDate}</strong>, e término em <strong>{endDate}</strong>, a ser realizado no endereço situado na Rua Getúlio Vargas, nº 2634, São Cristóvão.
                </p>
                <p className="mb-3 text-justify">
                  <strong>2.2.</strong> Caso o início das aulas seja postergado em relação à data assinalada (<strong>{startDate}</strong>), o término do curso será automaticamente prorrogado por um período equivalente ao atraso verificado no início, garantindo a integralidade da carga horária e do conteúdo programático. O contratante será comunicado formalmente sobre qualquer alteração nas datas de início e término.
                </p>
                <p className="mb-6 text-justify">
                  <strong>2.3.</strong> O curso escolhido pelo (a) contratante mencionado nesta cláusula será designado, doravante, simplesmente "curso".
                </p>

                {/* 3. VALOR E FORMA DE PAGAMENTO */}
                <p className="mb-3 font-bold">3. VALOR E FORMA DE PAGAMENTO</p>
                <p className="mb-3 text-justify">
                  <strong>3.1.</strong> Como contraprestação pelos serviços educacionais prestados, o contratado pagará ao contratado apenas o valor de <strong>{valorExtenso(totalPaid)}</strong>.
                </p>
                <p className="mb-3 text-justify">
                  <strong>3.2. Formas de Pagamento:</strong> {paymentLabel}.
                </p>
                <p className="mb-2 text-justify">
                  <strong>3.2.</strong> No valor acima estão incluídos:
                </p>
                <ul className="mb-3 ml-6 list-disc space-y-1">
                  <li>Matrícula;</li>
                  <li>Material didático em formato digital (PDF);</li>
                  <li>Suporte online (chat, e-mail, etc.);</li>
                  <li>Acesso ao grupo exclusivo de estudos no APP WhatsApp;</li>
                  <li>Acesso ao WhatsApp no mentor do curso; e</li>
                  <li>Montagem de um (1) cronograma de estudos + plano de estudos de acordo com a realidade de cada aluno, considerando suas particularidades.</li>
                </ul>
                <p className="mb-3 text-justify">
                  <strong>3.4.</strong> O valor especificado no caput desta cláusula e os serviços previstos no parágrafo primeiro contemplam tão somente os dias de curso, não sendo o contratado responsável por quaisquer despesas fora das datas de realização de cursos ou despesas com acompanhantes, ingressos, seguros, despesas com hospitais, médicos, lanches, taxas e serviços de locomoção, transporte e outros assemelhados, decorrentes de visitas, passeios, realização de pesquisas, simulados, salas de estudos e outras atividades extra cursos; cópias reprográficas e serviços de impressão, encadernação e similares, bem como outros produtos ou serviços, opcionais ou de uso facultativo, colocados à disposição do contratante.
                </p>
                <p className="mb-3 text-justify">
                  <strong>3.5.</strong> A ausência do contratante às atividades presenciais, bem como a falta do cumprimento das demais obrigações acadêmicas de sua responsabilidade, não o (a) exime do pagamento do preço do curso, que se vencerem durante o período.
                </p>
                <p className="mb-6 text-justify">
                  <strong>3.6.</strong> A matrícula, ato que estabelece o vínculo entre as partes, dar-se-á com o preenchimento do requerimento digital ou verbal de matrícula e o pagamento do valor integral do curso ou se parcelado for.
                </p>

                {/* 4. DIREITO DE ARREPENDIMENTO */}
                <p className="mb-3 font-bold">4. DIREITO DE ARREPENDIMENTO</p>
                <p className="mb-3 text-justify">
                  <strong>4.1.</strong> O CONTRATANTE tem o direito de se arrepender deste contrato, sem ônus, no prazo de 7 (sete) dias corridos, contados da data da contratação ou do primeiro acesso ao conteúdo do curso, o que ocorrer primeiro.
                </p>
                <p className="mb-3 text-justify">
                  <strong>4.2.</strong> Para exercer o direito de arrependimento, o CONTRATANTE deverá comunicar formalmente o CONTRATADO, por meio do WhatsApp da empresa dentro do prazo estipulado.
                </p>
                <p className="mb-6 text-justify">
                  <strong>4.3.</strong> O CONTRATADO reembolsará o valor pago pelo CONTRATANTE em até 7 (sete) dias úteis, contados do recebimento da comunicação de arrependimento.
                </p>

                {/* 5. OBRIGAÇÕES DO CONTRATADO */}
                <p className="mb-3 font-bold">5. OBRIGAÇÕES DO CONTRATADO</p>
                <p className="mb-2 text-justify"><strong>5.1.</strong> O contratado obriga-se a:</p>
                <p className="mb-2 ml-4 text-justify">a) Cumprir a programação anunciada, ressalvando-se que a orientação técnica sobre a prestação dos serviços é de inteira responsabilidade do contratado, especialmente em relação à fixação de carga horária, a grade curricular, a indicação de professores, a moralidade de ensino e a orientação didático-pedagógica, razão pela qual poderá o contratado a qualquer tempo proceder alterações nas atividades aqui mencionadas, procedendo com a prévia comunicação ao contratante, por meio de qualquer meio de divulgação.</p>
                <p className="mb-2 ml-4 text-justify">b) Fornecer instalações adequadas e professores com conhecimento técnico relacionado ao curso;</p>
                <p className="mb-2 ml-4 text-justify">c) Disponibilizar material didático e acesso ao contratante ao ambiente após confirmação do pagamento do contratante;</p>
                <p className="mb-2 ml-4 text-justify">d) Apresentar nos dias e horários previamente agendados as aulas com o professor titular ou, em caso de força maior, apresentar outro professor com conhecimento comprovado na área;</p>
                <p className="mb-2 ml-4 text-justify">e) Coordenar administrativa e academicamente o curso, zelando pela sua qualidade e pelo cumprimento do conteúdo programático.</p>
                <p className="mb-2 ml-4 text-justify">f) Especificar o tipo e a qualidade do material didático a ser disponibilizado, incluindo, mas não se limitando a apostilas, materiais complementares e recursos audiovisuais.</p>
                <p className="mb-2 ml-4 text-justify">g) Definir a carga horária total do curso e a distribuição das aulas ao longo do período letivo.</p>
                <p className="mb-6 ml-4 text-justify">h) Disponibilizar canais de comunicação eficientes para suporte aos alunos, tais como e-mail, telefone e plataformas online.</p>

                {/* 6. OBRIGAÇÕES DO CONTRATANTE */}
                <p className="mb-3 font-bold">6. OBRIGAÇÕES DO CONTRATANTE</p>
                <p className="mb-2 text-justify"><strong>6.1.</strong> O (a) contratante obriga-se a:</p>
                <p className="mb-2 ml-4 text-justify">a) Informar ao contratado toda e qualquer alteração de seus endereços residencial e eletrônicos, principalmente <em>WhatsApp</em>, por constituir-se em nosso principal meio de comunicação, sempre que isso ocorrer durante a vigência do presente instrumento e enquanto perdurar alguma obrigação ainda não adimplida por qualquer das partes;</p>
                <p className="mb-2 ml-4 text-justify">b) Ressarcir os danos de natureza material causados ao contratado, por dolo ou culpa do (a) contratante, bem como aqueles de natureza material ou moral causados nas dependências do contratado contra professores, funcionários, alunos ou qualquer outra pessoa física, bem como às instalações e equipamentos;</p>
                <p className="mb-2 ml-4 text-justify">c) Não gravar as aulas e nem reproduzir ou disponibilizar aulas que eventualmente tenham sido gravadas sem autorização do contratado, sob pena de responder pela violação de direitos autorais, sem prejuízo de outras sanções relacionadas ao ilícito;</p>
                <p className="mb-6 ml-4 text-justify">d) Assistir às aulas com urbanidade e respeito aos demais alunos e professores.</p>

                {/* 7. RESCISÃO CONTRATUAL */}
                <p className="mb-3 font-bold">7. RESCISÃO CONTRATUAL</p>
                <p className="mb-3 text-justify"><strong>7.1.</strong> O presente contrato poderá ser rescindido por qualquer uma das partes, mediante comunicação por escrito à outra parte.</p>
                <p className="mb-2 text-justify"><strong>7.2. Rescisão por Iniciativa do Contratante:</strong></p>
                <p className="mb-2 ml-4 text-justify"><strong>7.2.1.</strong> Caso a rescisão ocorra antes do início das aulas, será devolvido ao CONTRATANTE o valor pago, descontada uma taxa administrativa de 15% (quinze por cento) do valor total do curso.</p>
                <p className="mb-2 ml-4 text-justify"><strong>7.2.2.</strong> Em caso de rescisão contratual após o início das aulas, o CONTRATANTE deverá efetuar o pagamento proporcional às aulas ministradas/disponibilizadas até a data da rescisão, calculado com base no valor integral do curso, acrescido de multa rescisória no montante de 30% (trinta por cento) do valor total do curso.</p>
                <p className="mb-2 ml-4 text-justify"><strong>7.2.3.</strong> Para matrículas realizadas com pagamento efetuado via cartão de crédito, à vista ou parcelado, será descontado adicionalmente o valor de R$ 100,00 (cem reais) referente às despesas com taxas de parcelamento junto às operadoras de cartão de crédito. Este valor será somado aos demais descontos e multas previstos nesta cláusula.</p>
                <p className="mb-2 ml-4 text-justify"><strong>7.2.4.</strong> O não comparecimento do aluno ao curso por causas estritamente particulares não o isenta das condições de cancelamento estipuladas neste contrato.</p>
                <p className="mb-3 ml-4 text-justify"><strong>7.2.5.</strong> A alteração de curso após a efetivação da matrícula será considerada quebra de contrato, sujeitando o CONTRATANTE à cobrança da referida multa e ao pagamento integral das aulas já assistidas no curso originalmente contratado.</p>
                <p className="mb-2 text-justify"><strong>7.3. Rescisão por Iniciativa do Contratado:</strong></p>
                <p className="mb-2 ml-4 text-justify"><strong>7.3.1.</strong> O CONTRATADO poderá rescindir o contrato nas seguintes hipóteses:</p>
                <p className="mb-2 ml-8 text-justify">a) Inadimplência do CONTRATANTE por período superior a 15 (quinze) dias, sem prejuízo da cobrança dos valores devidos.</p>
                <p className="mb-2 ml-8 text-justify">b) Conduta do CONTRATANTE que prejudique o andamento regular das aulas ou que viole as normas de convivência da instituição, a ser apurada mediante procedimento interno, garantido o direito de defesa ao CONTRATANTE.</p>
                <p className="mb-3 ml-8 text-justify">c) Ocorrência de caso fortuito ou força maior que impeça a continuidade da prestação dos serviços.</p>
                <p className="mb-2 text-justify"><strong>Parágrafo Primeiro:</strong> Em caso de rescisão por iniciativa do CONTRATADO, este deverá restituir ao CONTRATANTE o valor proporcional às aulas não ministradas, salvo nos casos de rescisão por inadimplência ou conduta do (a) CONTRATANTE.</p>
                <p className="mb-2 text-justify"><strong>Parágrafo Segundo:</strong> O "início das aulas", para fins de aplicação desta cláusula, será considerado a data da primeira aula do curso, conforme o cronograma divulgado pelo CONTRATADO.</p>
                <p className="mb-6 text-justify"><strong>Parágrafo Terceiro:</strong> A mudança de curso após a matrícula, quando permitida, poderá acarretar a necessidade de ajustes no valor e nas condições de pagamento, a serem acordados entre as partes, não se caracterizando como rescisão, desde que haja anuência expressa do CONTRATADO.</p>

                {/* 8. PROPRIEDADE INTELECTUAL */}
                <p className="mb-3 font-bold">8. PROPRIEDADE INTELECTUAL</p>
                <p className="mb-3 text-justify"><strong>8.1.</strong> O conteúdo do curso (vídeos, textos, materiais, etc.) é protegido por direitos autorais e é de propriedade exclusiva do CONTRATADO.</p>
                <p className="mb-6 text-justify"><strong>8.2.</strong> É proibida a reprodução, distribuição, cópia ou qualquer outra forma de utilização do conteúdo do curso sem a autorização expressa do CONTRATADO.</p>

                {/* 9. PRIVACIDADE */}
                <p className="mb-3 font-bold">9. PRIVACIDADE E PROTEÇÃO DE DADOS</p>
                <p className="mb-3 text-justify"><strong>9.1.</strong> O CONTRATADO se compromete a proteger os dados pessoais do CONTRATANTE, em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>
                <p className="mb-3 text-justify"><strong>9.2.</strong> Os dados do CONTRATANTE serão coletados, utilizados e armazenados para fins de execução deste contrato, comunicação, suporte e melhoria dos serviços.</p>
                <p className="mb-3 text-justify"><strong>9.3.</strong> O CONTRATANTE autoriza o CONTRATADO a utilizar seus dados para envio de informações sobre outros cursos e promoções, podendo revogar essa autorização a qualquer momento.</p>
                <p className="mb-6 text-justify"><strong>9.4.</strong> O CONTRATANTE tem o direito de acessar, retificar, excluir ou solicitar a portabilidade de seus dados, conforme previsto na LGPD.</p>

                {/* 10. DISPOSIÇÕES GERAIS */}
                <p className="mb-3 font-bold">10. DISPOSIÇÕES GERAIS</p>
                <p className="mb-3 text-justify"><strong>10.1.</strong> Se qualquer das partes deixar de fazer valer, a qualquer tempo, quaisquer disposições do presente contrato ou deixar de exigir, a qualquer tempo, o cumprimento pela outra de quaisquer disposições aqui contidas, tal ato não será interpretado, em nenhuma hipótese, como uma renúncia a essas disposições, nem afetará as disposições deste contrato ou qualquer de suas partes.</p>
                <p className="mb-3 text-justify"><strong>10.2.</strong> Qualquer notificação entre as partes será feita por escrito e enviada aos endereços consignados no preâmbulo deste contrato.</p>
                <p className="mb-3 text-justify"><strong>10.3.</strong> Caso haja qualquer alteração nos endereços de correspondências ou nos destinatários das comunicações referentes ao presente contrato, as partes obrigam-se a comunicar à outra os seus novos endereços de correspondência em até 5 (cinco) dias úteis.</p>
                <p className="mb-3 text-justify"><strong>10.4.</strong> O contratado, livre de quaisquer ônus para com o (a) contratante, poderá utilizar-se da sua imagem para fins acadêmicos ou para divulgação de suas atividades ou na gravação de aulas, podendo, para tanto, reproduzi-la ou divulgá-la junto à internet, jornais e todos os demais meios de comunicações físicos ou digitais, públicos ou privados, desde que respeitado o direito à imagem do contratante e que o uso não seja abusivo ou cause prejuízo ao mesmo.</p>
                <p className="mb-8 text-justify"><strong>10.5.</strong> As partes atribuem ao presente contrato plena eficácia e força executiva extracontratual. Sem prejuízo de eventual foro privilegiado pela legislação, fica eleito o foro da cidade de Porto Velho (RO), para dirimir quaisquer dúvidas ou conflitos oriundos do presente contrato.</p>

                <p className="mb-12 text-justify">E, por estarem de pleno acordo, firmam o presente instrumento em 2 (duas) vias de igual teor e conteúdo, para todos os fins de direito.</p>

                <p className="mb-16 text-justify">Porto Velho (RO), {enrollDate}.</p>

                {/* Assinaturas */}
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="mb-2 border-t border-gray-900 pt-1 w-60" />
                    <p>Contratante</p>
                    <p className="text-xs text-gray-600">{student?.name}</p>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 border-t border-gray-900 pt-1 w-60" />
                    <p>Contratado</p>
                    <p className="text-xs text-gray-600">Federal Cursos</p>
                  </div>
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
