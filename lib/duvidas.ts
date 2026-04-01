// ── Store mock de dúvidas (localStorage) ──────────────────────
// Chave: "federal_duvidas"
// Em produção: substituir por chamadas à API Rails + disparo de e-mail

export type Duvida = {
  id: string
  alunoNome: string
  alunoCpf: string
  aulaId: number
  aulaTitulo: string
  disciplinaId: number
  disciplinaNome: string
  professorId: number    // ID do professor responsável pela matéria
  professorNome: string
  texto: string
  momentoVideo: string   // ex: "12:30" — momento do vídeo em que surgiu a dúvida
  criadaEm: string       // ISO string
  status: "pendente" | "respondida"
  resposta?: string
  respondidaEm?: string
}

const KEY = "federal_duvidas"

export function getDuvidas(): Duvida[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]")
  } catch {
    return []
  }
}

/** Retorna somente as dúvidas do professor com o ID informado */
export function getDuvidasByProfessor(professorId: number): Duvida[] {
  return getDuvidas().filter((d) => d.professorId === professorId)
}

export function saveDuvida(d: Omit<Duvida, "id" | "criadaEm" | "status">): Duvida {
  const nova: Duvida = {
    ...d,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    criadaEm: new Date().toISOString(),
    status: "pendente",
  }
  const todas = getDuvidas()
  localStorage.setItem(KEY, JSON.stringify([...todas, nova]))
  return nova
}

export function responderDuvida(id: string, resposta: string): void {
  const todas = getDuvidas().map((d) =>
    d.id === id
      ? { ...d, resposta, status: "respondida" as const, respondidaEm: new Date().toISOString() }
      : d
  )
  localStorage.setItem(KEY, JSON.stringify(todas))
}

export function countPendentesByProfessor(professorId: number): number {
  return getDuvidasByProfessor(professorId).filter((d) => d.status === "pendente").length
}
