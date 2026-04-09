import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer"
import type { ApiEvent, ApiEventRegistration } from "@/lib/api"

Font.register({ family: "BebasNeue", src: "/fonts/BebasNeue.ttf" })

const C = {
  primary: "#e8491d",
  dark: "#1a1a2e",
  gray: "#64748b",
  grayLight: "#f1f5f9",
  border: "#e2e8f0",
  white: "#ffffff",
  green: "#16a34a",
  greenBg: "#dcfce7",
}

const styles = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: "Helvetica" },

  header: {
    backgroundColor: C.dark,
    paddingHorizontal: 32,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLogo: { fontSize: 22, fontFamily: "BebasNeue", letterSpacing: 2 },
  headerSub: { fontSize: 7, color: "#94a3b8", marginTop: 2 },
  tigerImg: { width: 36, height: 36, objectFit: "contain" },

  accent: { backgroundColor: C.primary, height: 3 },

  body: { paddingHorizontal: 32, paddingTop: 18, paddingBottom: 48 },

  ticket: { borderWidth: 1.5, borderColor: C.border, borderRadius: 8 },

  ticketTop: { backgroundColor: C.dark, borderTopLeftRadius: 8, borderTopRightRadius: 8, paddingHorizontal: 20, paddingVertical: 14 },
  ticketEventType: { fontSize: 7, color: C.primary, textTransform: "uppercase", letterSpacing: 2, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  ticketEventTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.white, marginBottom: 8 },
  ticketMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  ticketMeta: { fontSize: 8, color: "#94a3b8" },
  ticketMetaBold: { fontFamily: "Helvetica-Bold", color: C.white },

  ticketBody: { backgroundColor: C.white, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, paddingHorizontal: 20, paddingVertical: 18 },

  dashedLine: { borderTopWidth: 1, borderTopColor: C.border, marginVertical: 14 },

  studentLabel: { fontSize: 7, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  studentName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 2 },
  studentEmail: { fontSize: 8, color: C.gray },

  qrSection: { alignItems: "center", marginTop: 16, marginBottom: 12 },
  qrBox: { width: 120, height: 120, backgroundColor: C.white, padding: 4, borderWidth: 1, borderColor: C.border, borderRadius: 6 },
  qrImage: { width: "100%", height: "100%" },
  qrLabel: { fontSize: 7.5, color: C.gray, marginTop: 7, textAlign: "center" },
  tokenText: { fontSize: 7, color: C.gray, fontFamily: "Helvetica", letterSpacing: 0.3, marginTop: 3, textAlign: "center" },

  validBadge: {
    alignSelf: "center",
    marginTop: 10,
    backgroundColor: C.greenBg,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.green,
  },
  expiredBadge: {
    alignSelf: "center",
    marginTop: 10,
    backgroundColor: "#fee2e2",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
  },

  infoBox: { backgroundColor: C.grayLight, borderRadius: 6, padding: 10, marginTop: 14 },
  infoText: { fontSize: 7.5, color: C.gray, lineHeight: 1.6 },

  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  footerText: { fontSize: 6.5, color: C.gray },
  footerAccent: { fontSize: 6.5, color: C.primary, fontFamily: "Helvetica-Bold" },
})

interface Props {
  registration: ApiEventRegistration
  event: ApiEvent
  qrCodeUrl: string
  tigerBase64?: string
}

export default function IngressoEventoPDF({ registration, event, qrCodeUrl, tigerBase64 }: Props) {
  const now = new Date()
  const dataBR = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
  const horaBR = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  const eventDateObj = new Date(event.date + "T00:00:00")
  const eventDate = eventDateObj.toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  })
  const validityDate = eventDateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
  const isExpired = eventDateObj < new Date(new Date().toDateString())

  return (
    <Document title={`Ingresso — ${event.title}`} author="Federal Cursos">
      <Page size="A5" style={styles.page}>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLogo}>
              <Text style={{ color: C.primary }}>FEDERAL</Text>
              <Text style={{ color: C.white }}> CURSOS</Text>
            </Text>
            <Text style={styles.headerSub}>federal@federalcursos.com  •  (69) 99369-7213</Text>
          </View>
          {tigerBase64 && <Image src={tigerBase64} style={styles.tigerImg} />}
        </View>

        <View style={styles.accent} />

        {/* Corpo */}
        <View style={styles.body}>
          <View style={styles.ticket}>

            {/* Topo escuro — info do evento */}
            <View style={styles.ticketTop}>
              <Text style={styles.ticketEventType}>{event.event_type} — INGRESSO</Text>
              <Text style={styles.ticketEventTitle}>{event.title}</Text>
              <View style={styles.ticketMetaRow}>
                <Text style={styles.ticketMeta}>
                  <Text style={styles.ticketMetaBold}>Data: </Text>{eventDate}
                </Text>
                <Text style={styles.ticketMeta}>
                  <Text style={styles.ticketMetaBold}>Horário: </Text>{event.start_time} – {event.end_time}
                </Text>
                {event.location ? (
                  <Text style={styles.ticketMeta}>
                    <Text style={styles.ticketMetaBold}>Local: </Text>{event.location}
                  </Text>
                ) : null}
                <Text style={styles.ticketMeta}>
                  <Text style={styles.ticketMetaBold}>Ingresso: </Text>
                  {event.is_free
                    ? "Gratuito"
                    : registration.lote_name
                      ? `${registration.lote_name} — R$ ${Number(registration.lote_price ?? 0).toFixed(2)}`
                      : `R$ ${Number(event.price ?? 0).toFixed(2)}`
                  }
                </Text>
              </View>
            </View>

            {/* Corpo branco — participante + QR */}
            <View style={styles.ticketBody}>

              <Text style={styles.studentLabel}>Participante</Text>
              <Text style={styles.studentName}>{registration.student?.name ?? "—"}</Text>
              {registration.student?.email && (
                <Text style={styles.studentEmail}>{registration.student.email}</Text>
              )}

              <View style={styles.dashedLine} />

              <View style={styles.qrSection}>
                <View style={styles.qrBox}>
                  <Image src={qrCodeUrl} style={styles.qrImage} />
                </View>
                <Text style={styles.qrLabel}>Apresente este QR Code na entrada do evento</Text>
                <Text style={styles.tokenText}>{registration.ticket_token}</Text>
              </View>

              {isExpired ? (
                <Text style={styles.expiredBadge}>INGRESSO EXPIRADO</Text>
              ) : (
                <Text style={styles.validBadge}>VÁLIDO ATÉ: {validityDate.toUpperCase()}</Text>
              )}

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  {"• Este ingresso é pessoal e intransferível.\n"}
                  {"• Apresente o QR Code na entrada para confirmar presença.\n"}
                  {"• Em caso de dúvidas, entre em contato: (69) 99369-7213"}
                </Text>
              </View>

            </View>
          </View>
        </View>

        {/* Rodapé */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Emitido em {dataBR} às {horaBR} — Federal Cursos</Text>
          <Text style={styles.footerAccent}>federalcursos.com.br</Text>
        </View>

      </Page>
    </Document>
  )
}
