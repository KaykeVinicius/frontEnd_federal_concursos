import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer"
import type { ApiEvent, ApiEventRegistration } from "@/lib/api"
import path from "path"

Font.register({ family: "BebasNeue", src: path.join(process.cwd(), "public", "fonts", "BebasNeue.ttf") })

const C = {
  primary: "#e8491d", dark: "#1a1a2e", gray: "#64748b", grayLight: "#f1f5f9",
  border: "#e2e8f0", white: "#ffffff", green: "#16a34a", greenBg: "#dcfce7",
  red: "#dc2626", redBg: "#fee2e2",
}

const styles = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: "Helvetica" },
  headerBand: { backgroundColor: C.dark, paddingHorizontal: 40, paddingVertical: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tigerImg: { width: 52, height: 52, objectFit: "contain" },
  dividerV: { width: 1, height: 40, backgroundColor: C.primary, marginHorizontal: 12 },
  institutionSub: { fontSize: 8, color: "#94a3b8", marginTop: 2 },
  docTime: { fontSize: 8, color: "#94a3b8" },
  accentBand: { backgroundColor: C.primary, height: 4 },
  body: { paddingHorizontal: 40, paddingTop: 24, paddingBottom: 60 },
  card: { backgroundColor: C.grayLight, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: C.primary, padding: 16, marginBottom: 24 },
  cardLabel: { fontSize: 7.5, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  cardTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 6 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  meta: { fontSize: 9, color: C.gray },
  metaBold: { fontFamily: "Helvetica-Bold", color: C.dark },
  summaryRow: { flexDirection: "row", gap: 24, marginTop: 10 },
  summaryBox: { alignItems: "center" },
  summaryVal: { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.dark },
  summaryLbl: { fontSize: 7.5, color: C.gray, textTransform: "uppercase", letterSpacing: 1 },
  tableHead: { flexDirection: "row", backgroundColor: C.dark, borderRadius: 4, paddingVertical: 9, paddingHorizontal: 10, marginBottom: 2 },
  thText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white, textTransform: "uppercase", letterSpacing: 0.6 },
  tableRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: C.grayLight },
  tdText: { fontSize: 8.5, color: C.dark },
  tdLight: { fontSize: 8.5, color: C.gray },
  colNum: { width: 22 },
  colName: { flex: 2.2 },
  colEmail: { flex: 2.2 },
  colPhone: { flex: 1.5 },
  colStatus: { flex: 1, alignItems: "flex-start" },
  badgePresent: { backgroundColor: C.greenBg, color: C.green, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2, fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  badgePending: { backgroundColor: C.grayLight, color: C.gray, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2, fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8 },
  footerText: { fontSize: 7.5, color: C.gray },
  footerAccent: { fontSize: 7.5, color: C.primary, fontFamily: "Helvetica-Bold" },
})

interface Props {
  event: ApiEvent
  registrations: ApiEventRegistration[]
  tigerBase64?: string
}

export default function RelatorioEventoPDF({ event, registrations, tigerBase64 }: Props) {
  const now = new Date()
  const dataBR = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
  const horaBR = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  const presentes = registrations.filter((r) => r.attended).length
  const ausentes = registrations.length - presentes

  return (
    <Document title={`Lista de Presença — ${event.title}`} author="Federal Cursos">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {tigerBase64 && <Image src={tigerBase64} style={styles.tigerImg} />}
            <View style={styles.dividerV} />
            <View>
              <Text style={{ fontSize: 26, fontFamily: "BebasNeue", letterSpacing: 2, marginBottom: 3 }}>
                <Text style={{ color: C.primary }}>FEDERAL</Text>
                <Text style={{ color: C.white }}> CURSOS</Text>
              </Text>
              <Text style={styles.institutionSub}>federal@federalcursos.com  •  (69) 99369-7213</Text>
              <Text style={styles.institutionSub}>R. Getúlio Vargas, 2634 — Porto Velho – RO</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end", justifyContent: "flex-end", alignSelf: "flex-end" }}>
            <Text style={styles.docTime}>Emitido em {dataBR} às {horaBR}</Text>
          </View>
        </View>

        <View style={styles.accentBand} />

        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Lista de Presença</Text>
            <Text style={styles.cardTitle}>{event.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}><Text style={styles.metaBold}>Data: </Text>{new Date(event.date + "T00:00:00").toLocaleDateString("pt-BR")}</Text>
              <Text style={styles.meta}><Text style={styles.metaBold}>Horário: </Text>{event.start_time} – {event.end_time}</Text>
              {event.location ? <Text style={styles.meta}><Text style={styles.metaBold}>Local: </Text>{event.location}</Text> : null}
              <Text style={styles.meta}><Text style={styles.metaBold}>Ingresso: </Text>{event.is_free ? "Gratuito" : `R$ ${Number(event.price ?? 0).toFixed(2)}`}</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryVal}>{registrations.length}</Text>
                <Text style={styles.summaryLbl}>Inscritos</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={[styles.summaryVal, { color: C.green }]}>{presentes}</Text>
                <Text style={styles.summaryLbl}>Presentes</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={[styles.summaryVal, { color: C.red }]}>{ausentes}</Text>
                <Text style={styles.summaryLbl}>Ausentes</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableHead}>
            <Text style={[styles.thText, styles.colNum]}>#</Text>
            <Text style={[styles.thText, styles.colName]}>Nome</Text>
            <Text style={[styles.thText, styles.colEmail]}>E-mail</Text>
            <Text style={[styles.thText, styles.colPhone]}>WhatsApp</Text>
            <Text style={[styles.thText, styles.colStatus]}>Presença</Text>
          </View>

          {registrations.map((r, i) => (
            <View key={r.id} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tdLight, styles.colNum]}>{i + 1}</Text>
              <Text style={[styles.tdText, styles.colName]}>{r.student?.name ?? "—"}</Text>
              <Text style={[styles.tdLight, styles.colEmail]}>{r.student?.email ?? "—"}</Text>
              <Text style={[styles.tdLight, styles.colPhone]}>{r.student?.whatsapp ?? "—"}</Text>
              <View style={styles.colStatus}>
                <Text style={r.attended ? styles.badgePresent : styles.badgePending}>
                  {r.attended ? "Presente" : "Ausente"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Federal Cursos — Documento gerado automaticamente pelo sistema.</Text>
          <Text style={styles.footerAccent}>{presentes} de {registrations.length} presentes</Text>
        </View>
      </Page>
    </Document>
  )
}
