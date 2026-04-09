import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer"
import type { ApiEvent } from "@/lib/api"
import path from "path"

Font.register({
  family: "BebasNeue",
  src: path.join(process.cwd(), "public", "fonts", "BebasNeue.ttf"),
})

const C = {
  primary: "#e8491d",
  dark: "#1a1a2e",
  gray: "#64748b",
  grayLight: "#f1f5f9",
  border: "#e2e8f0",
  white: "#ffffff",
  green: "#16a34a",
  greenBg: "#dcfce7",
  blue: "#1d4ed8",
  blueBg: "#dbeafe",
  yellow: "#92400e",
  yellowBg: "#fef3c7",
  red: "#dc2626",
  redBg: "#fee2e2",
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  aulao: "Aulão", simulado: "Simulado",
}
const STATUS_LABELS: Record<string, string> = {
  agendado: "Agendado", em_andamento: "Em Andamento", concluido: "Concluído", cancelado: "Cancelado",
}

const styles = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: "Helvetica" },

  headerBand: { backgroundColor: C.dark, paddingHorizontal: 40, paddingVertical: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  tigerImg: { width: 52, height: 52, objectFit: "contain" },
  dividerV: { width: 1, height: 40, backgroundColor: C.primary, marginHorizontal: 12 },
  logoText: { fontSize: 26, fontFamily: "BebasNeue", letterSpacing: 2 },
  institutionSub: { fontSize: 8, color: "#94a3b8", marginTop: 2, letterSpacing: 0.5 },
  headerRight: { alignItems: "flex-end" },
  docTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.white },
  docTime: { fontSize: 8, color: "#94a3b8", marginTop: 1 },

  accentBand: { backgroundColor: C.primary, height: 4 },

  body: { paddingHorizontal: 40, paddingTop: 24, paddingBottom: 60 },

  summaryCard: { backgroundColor: C.grayLight, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: C.primary, padding: 16, marginBottom: 24, flexDirection: "row", gap: 32 },
  summaryLabel: { fontSize: 7.5, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3, fontFamily: "Helvetica-Bold" },
  summaryValue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.dark },

  tableTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 },
  tableHead: { flexDirection: "row", backgroundColor: C.dark, borderRadius: 4, paddingVertical: 9, paddingHorizontal: 10, marginBottom: 2 },
  thText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.white, textTransform: "uppercase", letterSpacing: 0.6 },
  tableRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: C.grayLight },
  tdText: { fontSize: 8, color: C.dark },
  tdLight: { fontSize: 8, color: C.gray },

  colNum:    { width: 20 },
  colTitle:  { flex: 2.5 },
  colType:   { flex: 1 },
  colDate:   { flex: 1.2 },
  colTime:   { flex: 1 },
  colStatus: { flex: 1 },
  colPrice:  { flex: 1.1 },
  colSlots:  { flex: 0.9, alignItems: "flex-end" },

  badge: { borderRadius: 99, paddingHorizontal: 5, paddingVertical: 2, fontSize: 7, fontFamily: "Helvetica-Bold" },

  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.border, paddingTop: 6 },
  footerText: { fontSize: 7, color: C.gray },
  footerAccent: { fontSize: 7, color: C.primary, fontFamily: "Helvetica-Bold" },
})

interface Props {
  events: ApiEvent[]
  tigerBase64?: string
}

export default function RelatorioEventosPDF({ events, tigerBase64 }: Props) {
  const now = new Date()
  const dataBR = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
  const horaBR = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  const totalInscritos = events.reduce((s, e) => s + (e.registered_count ?? 0), 0)
  const agendados = events.filter((e) => e.status === "agendado").length
  const concluidos = events.filter((e) => e.status === "concluido").length

  function statusColors(status: string) {
    if (status === "agendado")    return { bg: C.blueBg,   fg: C.blue }
    if (status === "em_andamento") return { bg: C.yellowBg, fg: C.yellow }
    if (status === "concluido")   return { bg: C.greenBg,  fg: C.green }
    return { bg: C.redBg, fg: C.red }
  }

  function priceLabel(ev: ApiEvent): string {
    if (ev.is_free) return "Gratuito"
    if (ev.event_lotes && ev.event_lotes.length > 0) {
      const active = ev.event_lotes.find((l) => l.available)
      if (active) return `${active.name} R$${Number(active.price).toFixed(2)}`
      return "Esgotado"
    }
    return `R$ ${Number(ev.price ?? 0).toFixed(2)}`
  }

  return (
    <Document title="Relatório de Eventos" author="Federal Cursos">
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* Cabeçalho */}
        <View style={styles.headerBand} fixed>
          <View style={styles.headerLeft}>
            {tigerBase64 && <Image src={tigerBase64} style={styles.tigerImg} />}
            <View style={styles.dividerV} />
            <View>
              <Text style={styles.logoText}>
                <Text style={{ color: C.primary }}>FEDERAL</Text>
                <Text style={{ color: C.white }}> CURSOS</Text>
              </Text>
              <Text style={styles.institutionSub}>federal@federalcursos.com  •  (69) 99369-7213</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>RELATÓRIO DE EVENTOS</Text>
            <Text style={styles.docTime}>Emitido em {dataBR} às {horaBR}</Text>
          </View>
        </View>
        <View style={styles.accentBand} fixed />

        <View style={styles.body}>
          {/* Resumo */}
          <View style={styles.summaryCard}>
            {[
              { label: "Total de Eventos", value: String(events.length) },
              { label: "Agendados",         value: String(agendados) },
              { label: "Concluídos",        value: String(concluidos) },
              { label: "Total de Inscritos", value: String(totalInscritos) },
            ].map(({ label, value }) => (
              <View key={label}>
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={styles.summaryValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Tabela */}
          <Text style={styles.tableTitle}>Lista de Eventos</Text>

          <View style={styles.tableHead} fixed>
            <Text style={[styles.thText, styles.colNum]}>#</Text>
            <Text style={[styles.thText, styles.colTitle]}>Título</Text>
            <Text style={[styles.thText, styles.colType]}>Tipo</Text>
            <Text style={[styles.thText, styles.colDate]}>Data</Text>
            <Text style={[styles.thText, styles.colTime]}>Horário</Text>
            <Text style={[styles.thText, styles.colStatus]}>Status</Text>
            <Text style={[styles.thText, styles.colPrice]}>Ingresso</Text>
            <Text style={[styles.thText, styles.colSlots]}>Inscritos</Text>
          </View>

          {events.map((ev, i) => {
            const sc = statusColors(ev.status)
            return (
              <View key={ev.id} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]} wrap={false}>
                <Text style={[styles.tdLight, styles.colNum]}>{i + 1}</Text>
                <View style={styles.colTitle}>
                  <Text style={styles.tdText}>{ev.title}</Text>
                  {ev.location ? <Text style={styles.tdLight}>{ev.location}</Text> : null}
                </View>
                <Text style={[styles.tdLight, styles.colType]}>{EVENT_TYPE_LABELS[ev.event_type] ?? ev.event_type}</Text>
                <Text style={[styles.tdText, styles.colDate]}>
                  {new Date(ev.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </Text>
                <Text style={[styles.tdLight, styles.colTime]}>{ev.start_time}–{ev.end_time}</Text>
                <View style={styles.colStatus}>
                  <Text style={[styles.badge, { backgroundColor: sc.bg, color: sc.fg }]}>
                    {STATUS_LABELS[ev.status] ?? ev.status}
                  </Text>
                </View>
                <Text style={[styles.tdText, styles.colPrice]}>{priceLabel(ev)}</Text>
                <Text style={[styles.tdText, styles.colSlots]}>{ev.registered_count}/{ev.max_participants}</Text>
              </View>
            )
          })}
        </View>

        {/* Rodapé */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Federal Cursos — Relatório de Eventos</Text>
          <Text style={styles.footerAccent}>federalcursos.com.br</Text>
        </View>

      </Page>
    </Document>
  )
}
