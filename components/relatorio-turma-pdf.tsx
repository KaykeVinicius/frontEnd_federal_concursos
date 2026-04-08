import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, Circle, Rect, G, Font } from "@react-pdf/renderer"
import type { ApiTurma, ApiEnrollment } from "@/lib/api"
import path from "path"

Font.register({
  family: "BebasNeue",
  src: path.join(process.cwd(), "public", "fonts", "BebasNeue.ttf"),
})

// Paleta da empresa
const C = {
  primary: "#e8491d",
  primaryDark: "#c03a10",
  primaryLight: "#fdf0ec",
  dark: "#1a1a2e",
  gray: "#64748b",
  grayLight: "#f1f5f9",
  border: "#e2e8f0",
  white: "#ffffff",
  green: "#16a34a",
  greenBg: "#dcfce7",
  red: "#dc2626",
  redBg: "#fee2e2",
  yellow: "#ca8a04",
  yellowBg: "#fef9c3",
}

const styles = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: "Helvetica" },

  // Cabeçalho
  headerBand: { backgroundColor: C.dark, paddingHorizontal: 40, paddingVertical: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  tigerImg: { width: 52, height: 52, objectFit: "contain" },
  logoImg: { width: 100, height: 36, objectFit: "contain" },
  dividerV: { width: 1, height: 40, backgroundColor: C.primary, marginHorizontal: 12 },
  institutionName: { fontSize: 15, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 0.5 },
  institutionSub: { fontSize: 8, color: "#94a3b8", marginTop: 2, letterSpacing: 0.5 },
  headerRight: { alignItems: "flex-end" },
  docTitle: { fontSize: 9, color: C.primary, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "Helvetica-Bold" },
  docDate: { fontSize: 11, color: C.white, fontFamily: "Helvetica-Bold", marginTop: 3 },
  docTime: { fontSize: 8, color: "#94a3b8", marginTop: 1 },

  // Faixa laranja fina
  accentBand: { backgroundColor: C.primary, height: 4 },

  // Corpo
  body: { paddingHorizontal: 40, paddingTop: 24, paddingBottom: 32 },

  // Card da turma
  turmaCard: { backgroundColor: C.grayLight, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: C.primary, padding: 16, marginBottom: 24 },
  turmaLabel: { fontSize: 7.5, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  turmaNome: { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 2 },
  turmaCurso: { fontSize: 10, color: C.gray, marginBottom: 12 },
  turmaMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  turmaMeta: { fontSize: 9, color: C.gray },
  turmaMetaBold: { fontFamily: "Helvetica-Bold", color: C.dark },

  // Badge status turma
  badgeTurma: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, fontSize: 8, fontFamily: "Helvetica-Bold" },

  // Tabela
  tableTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 },
  tableHead: { flexDirection: "row", backgroundColor: C.dark, borderRadius: 4, paddingVertical: 9, paddingHorizontal: 10, marginBottom: 2 },
  thText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white, textTransform: "uppercase", letterSpacing: 0.6 },
  tableRow: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: C.grayLight },
  tdText: { fontSize: 9, color: C.dark },
  tdLight: { fontSize: 9, color: C.gray },

  // Colunas
  colNum: { width: 22 },
  colName: { flex: 2.5 },
  colEmail: { flex: 2.5 },
  colPhone: { flex: 1.8 },
  colStatus: { flex: 1, alignItems: "flex-start" },

  // Badges situação
  badgeActive: { backgroundColor: C.greenBg, color: C.green, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3, fontSize: 8, fontFamily: "Helvetica-Bold" },
  badgeInactive: { backgroundColor: C.redBg, color: C.red, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3, fontSize: 8, fontFamily: "Helvetica-Bold" },
  badgeCanceled: { backgroundColor: C.yellowBg, color: C.yellow, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3, fontSize: 8, fontFamily: "Helvetica-Bold" },
  badgeOther: { backgroundColor: C.border, color: C.gray, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3, fontSize: 8, fontFamily: "Helvetica-Bold" },

  // Vazio
  empty: { textAlign: "center", color: C.gray, marginTop: 40, fontSize: 11 },

  // Rodapé
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8 },
  footerText: { fontSize: 7.5, color: C.gray },
  footerAccent: { fontSize: 7.5, color: C.primary, fontFamily: "Helvetica-Bold" },
})

function turmaStatusLabel(s: string) {
  return s === "aberta" ? "Aberta" : s === "em_andamento" ? "Em Andamento" : "Fechada"
}

function turmaStatusStyle(s: string) {
  if (s === "aberta") return { ...styles.badgeTurma, backgroundColor: C.greenBg, color: C.green }
  if (s === "em_andamento") return { ...styles.badgeTurma, backgroundColor: "#dbeafe", color: "#1d4ed8" }
  return { ...styles.badgeTurma, backgroundColor: C.redBg, color: C.red }
}

function enrollmentStatusLabel(s: string) {
  if (s === "active") return "Matriculado"
  if (s === "inactive") return "Inativo"
  if (s === "canceled" || s === "cancelled") return "Cancelado"
  return s
}

function enrollmentStatusStyle(s: string) {
  if (s === "active") return styles.badgeActive
  if (s === "inactive") return styles.badgeInactive
  if (s === "canceled" || s === "cancelled") return styles.badgeInactive
  return styles.badgeOther
}

interface Props {
  turma: ApiTurma
  enrollments: ApiEnrollment[]
  tigerBase64?: string
  logoBase64?: string
}

export default function RelatorioTurmaPDF({ turma, enrollments, tigerBase64 }: Props) {
  const now = new Date()
  const dataBR = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
  const horaBR = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  return (
    <Document title={`Relatório de Alunos — ${turma.name}`} author="Federal Cursos">
      <Page size="A4" style={styles.page}>

        {/* Cabeçalho escuro */}
        <View style={styles.headerBand}>

          {/* Esquerda: tigre + divisor + nome + contatos */}
          <View style={styles.headerLeft}>
            {tigerBase64 && <Image src={tigerBase64} style={styles.tigerImg} />}
            <View style={styles.dividerV} />
            <View>
              {/* FEDERAL laranja + CURSOS branco */}
              <Text style={{ fontSize: 26, fontFamily: "BebasNeue", letterSpacing: 2, marginBottom: 5 }}>
                <Text style={{ color: C.primary }}>FEDERAL</Text>
                <Text style={{ color: C.white }}> CURSOS</Text>
              </Text>

              {/* WhatsApp */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 }}>
                <Svg viewBox="0 0 24 24" width={10} height={10}>
                  <Path fill="#25d366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </Svg>
                <Text style={styles.institutionSub}>(69) 99369-7213</Text>
              </View>

              {/* E-mail */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 }}>
                <Svg viewBox="0 0 24 24" width={10} height={10}>
                  <Path fill="#94a3b8" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                </Svg>
                <Text style={styles.institutionSub}>federal@federalcursos.com</Text>
              </View>

              {/* Instagram */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 }}>
                <Svg viewBox="0 0 24 24" width={10} height={10}>
                  <G fill="none">
                    <Rect x="2" y="2" width="20" height="20" rx="5" stroke="#c13584" strokeWidth="2" />
                    <Circle cx="12" cy="12" r="4" stroke="#c13584" strokeWidth="2" />
                    <Circle cx="17.5" cy="6.5" r="1" fill="#c13584" />
                  </G>
                </Svg>
                <Text style={styles.institutionSub}>@federalcursos</Text>
              </View>

              {/* Endereço */}
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 5 }}>
                <Svg viewBox="0 0 24 24" width={10} height={11}>
                  <Path fill="#94a3b8" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </Svg>
                <View>
                  <Text style={styles.institutionSub}>R. Getúlio Vargas, 2634 — São Cristóvão</Text>
                  <Text style={styles.institutionSub}>Porto Velho – RO, 76804-060</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Direita: data */}
          <View style={[styles.headerRight, { justifyContent: "flex-end", alignSelf: "flex-end" }]}>
            <Text style={styles.docTime}>Emitido em {dataBR} às {horaBR}</Text>
          </View>
        </View>

        {/* Faixa laranja */}
        <View style={styles.accentBand} />

        {/* Corpo */}
        <View style={styles.body}>

          {/* Card da turma */}
          <View style={styles.turmaCard}>
            <Text style={styles.turmaLabel}>Turma</Text>
            <Text style={styles.turmaNome}>{turma.name}</Text>
            <Text style={styles.turmaCurso}>{turma.course?.title ?? "—"}</Text>
            <View style={styles.turmaMetaRow}>
              <View><Text style={turmaStatusStyle(turma.status)}>{turmaStatusLabel(turma.status)}</Text></View>
              <Text style={styles.turmaMeta}><Text style={styles.turmaMetaBold}>Alunos: </Text>{enrollments.length} / {turma.max_students}</Text>
              {turma.shift ? <Text style={styles.turmaMeta}><Text style={styles.turmaMetaBold}>Turno: </Text>{turma.shift}</Text> : null}
              {turma.start_date ? <Text style={styles.turmaMeta}><Text style={styles.turmaMetaBold}>Início: </Text>{new Date(turma.start_date).toLocaleDateString("pt-BR")}</Text> : null}
              {turma.end_date ? <Text style={styles.turmaMeta}><Text style={styles.turmaMetaBold}>Término: </Text>{new Date(turma.end_date).toLocaleDateString("pt-BR")}</Text> : null}
              {turma.schedule ? <Text style={styles.turmaMeta}><Text style={styles.turmaMetaBold}>Horário: </Text>{turma.schedule}</Text> : null}
            </View>
          </View>

          {/* Tabela */}
          <Text style={styles.tableTitle}>Lista de Alunos Matriculados</Text>

          {enrollments.length === 0 ? (
            <Text style={styles.empty}>Nenhum aluno matriculado nesta turma.</Text>
          ) : (
            <View>
              {/* Cabeçalho da tabela */}
              <View style={styles.tableHead}>
                <Text style={[styles.thText, styles.colNum]}>#</Text>
                <Text style={[styles.thText, styles.colName]}>Nome Completo</Text>
                <Text style={[styles.thText, styles.colEmail]}>E-mail</Text>
                <Text style={[styles.thText, styles.colPhone]}>WhatsApp</Text>
                <Text style={[styles.thText, styles.colStatus]}>Situação</Text>
              </View>

              {/* Linhas */}
              {enrollments.map((e, i) => (
                <View key={e.id} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tdLight, styles.colNum]}>{i + 1}</Text>
                  <Text style={[styles.tdText, styles.colName]}>{e.student?.name ?? "—"}</Text>
                  <Text style={[styles.tdLight, styles.colEmail]}>{e.student?.email ?? "—"}</Text>
                  <Text style={[styles.tdLight, styles.colPhone]}>{e.student?.whatsapp ?? "—"}</Text>
                  <View style={styles.colStatus}>
                    <Text style={enrollmentStatusStyle(e.status)}>
                      {enrollmentStatusLabel(e.status)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Rodapé fixo */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Federal Cursos — Documento gerado automaticamente pelo sistema.</Text>
          <Text style={styles.footerAccent}>{enrollments.length} aluno(s) listado(s)</Text>
        </View>

      </Page>
    </Document>
  )
}
