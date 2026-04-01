// ========== MOCK DATA ==========

import { ReactNode } from "react"

// ---------- USERS (Sistema) ----------
export interface SystemUser {
  id: number
  name: string
  email: string
  password: string
  cpf: string
  role: "ceo" | "assistente_comercial" | "equipe_pedagogica" | "professor" | "aluno" | "diretor" // diretor mantido por compatibilidade
  commission_percent?: number
  student_id?: number // Vincula ao aluno se role === "aluno"
  active: boolean
}

export const mockSystemUsers: SystemUser[] = [
  {
    id: 1,
    name: "CEO",
    email: "ceo@federalcursos.com.br",
    password: "ceo123",
    cpf: "123.456.789-00",
    role: "ceo",
    active: true,
  },
  {
    id: 2,
    name: "Assistente Comercial",
    email: "assistente@federalcursos.com.br",
    password: "assistente123",
    cpf: "987.654.321-00",
    role: "assistente_comercial",
    commission_percent: 10,
    active: true,
  },
  {
    id: 6,
    name: "Equipe Pedagogica",
    email: "pedagogico@federalcursos.com.br",
    password: "pedagogico123",
    cpf: "456.789.123-00",
    role: "equipe_pedagogica",
    active: true,
  },
  {
    id: 3,
    name: "Prof. Pinheiro Neto",
    email: "professor@federalcursos.com.br",
    password: "prof123",
    cpf: "321.654.987-00",
    role: "professor",
    active: true,
  },
  {
    id: 7,
    name: "Prof. Ana Rocha",
    email: "ana.rocha@federalcursos.com.br",
    password: "ana123",
    cpf: "741.852.963-00",
    role: "professor",
    active: true,
  },
  {
    id: 4,
    name: "Kayke Vinicius",
    email: "aluno@federalcursos.com.br",
    password: "aluno123",
    cpf: "111.222.333-44",
    role: "aluno",
    student_id: 1,
    active: true,
  },
  {
    id: 5,
    name: "Maria Silva Santos",
    email: "maria.silva@gmail.com",
    password: "maria123",
    cpf: "555.666.777-88",
    role: "aluno",
    student_id: 2,
    active: true,
  },
]

export function authenticateUser(email: string, password: string): SystemUser | null {
  return mockSystemUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.active
  ) || null
}

export interface Course {
  id: number
  title: string
  description: string
  price: number
  status: "draft" | "published"
  access_type: "interno" | "externo" | "ambos"
  duration_in_days: number
  start_date?: string // Data de início (obrigatório para presencial e híbrido)
  end_date?: string // Data de fim (obrigatório para presencial, opcional para híbrido)
  created_at: string
}

export interface Subject {
  id: number
  course_id: number
  name: string
  description: string
  position: number
  professor_id?: number // ID do professor responsável pela matéria
}

export interface Turma {
  availableSlots: ReactNode
  turno: string
  id: number
  course_id: number
  professor_id?: number // Professor responsável pela turma
  name: string
  shift: string
  start_date: string
  end_date: string
  schedule: string
  max_students: number
  enrolled_count: number
  status: "aberta" | "fechada" | "em_andamento"
}

export interface Student {
  id: number
  name: string
  email: string
  whatsapp: string
  cpf: string
  address: string
  role: "aluno"
  internal: boolean
  active: boolean
  created_at: string
}

export interface Career {
  id: number
  name: string
  description: string
  created_at: string
}

export const mockCareers: Career[] = [
  { id: 1, name: "Carreira de Direito", description: "Reta final para concursos de direito", created_at: "2026-01-01" },
  { id: 2, name: "Carreira de Contabilidade", description: "Cursos para perícia, contabilidade e CFC", created_at: "2026-01-05" },
  { id: 3, name: "Carreira Policial", description: "Treinamento para concursos militares e policiais", created_at: "2026-01-10" },
]

export interface Enrollment {
  id: number
  student_id: number
  course_id: number
  turma_id: number
  career_id?: number
  status: "active" | "canceled" | "expired"
  started_at: string
  expires_at: string
  enrollment_type: "interno" | "externo"
  payment_method: string
  total_paid: number
  contract_signed: boolean
  created_at: string
}

export interface Contract {
  id: number
  enrollment_id: number
  student_id: number
  course_id: number
  contract_text: string
  version: string
  signed_at: string | null
  status: "pending" | "signed" | "expired"
  pdf_url: string | null
}

// ---------- COURSES ----------
export const mockCourses: Course[] = [
  {
    id: 1,
    title: "Reta Final - Assembleia Legislativa de Rondonia",
    description: "Curso de Reta Final em Resolucao de Questoes para o Concurso da Assembleia Legislativa de Rondonia, modalidade presencial, materias especificas.",
    price: 453,
    status: "published",
    access_type: "ambos",
    duration_in_days: 33,
    start_date: "2026-03-01",
    end_date: "2026-04-03",
    created_at: "2025-12-01",
  },
  {
    id: 2,
    title: "Preparatorio OAB - 1a Fase",
    description: "Curso completo de preparacao para a primeira fase do Exame da OAB, com resolucao de questoes e simulados.",
    price: 890,
    status: "published",
    access_type: "ambos",
    duration_in_days: 90,
    start_date: "2026-02-01",
    end_date: "2026-05-01",
    created_at: "2025-11-15",
  },
  {
    id: 3,
    title: "CFC - Conselho Federal de Contabilidade",
    description: "Preparatorio completo para o exame do CFC com foco em resolucao de questoes e revisao teorica.",
    price: 650,
    status: "published",
    access_type: "interno",
    duration_in_days: 60,
    start_date: "2026-04-01",
    end_date: "2026-06-01",
    created_at: "2025-10-20",
  },
  {
    id: 4,
    title: "Concurso PM-RO - Soldado",
    description: "Preparatorio intensivo para o concurso da Policia Militar de Rondonia - cargo Soldado.",
    price: 780,
    status: "draft",
    access_type: "ambos",
    duration_in_days: 120,
    start_date: "2026-05-01",
    end_date: "2026-09-01",
    created_at: "2026-01-10",
  },
]

// ---------- SUBJECTS ----------
// professor_id: 3 = Prof. Pinheiro Neto | 7 = Prof. Ana Rocha
export const mockSubjects: Subject[] = [
  { id: 1,  course_id: 1, name: "Direito Constitucional",   description: "Constituicao Federal e Estadual",              position: 1, professor_id: 3 },
  { id: 2,  course_id: 1, name: "Direito Administrativo",   description: "Administracao publica e licitacoes",           position: 2, professor_id: 3 },
  { id: 3,  course_id: 1, name: "Portugues",                description: "Interpretacao de texto e gramatica",           position: 3, professor_id: 3 },
  { id: 4,  course_id: 1, name: "Regimento Interno ALE/RO", description: "Regimento interno da Assembleia Legislativa",  position: 4, professor_id: 7 },
  { id: 5,  course_id: 2, name: "Direito Civil",            description: "Parte Geral, Obrigacoes e Contratos",          position: 1, professor_id: 3 },
  { id: 6,  course_id: 2, name: "Direito Penal",            description: "Parte Geral e Especial",                       position: 2, professor_id: 3 },
  { id: 7,  course_id: 2, name: "Direito Processual Civil", description: "CPC e procedimentos",                          position: 3, professor_id: 7 },
  { id: 8,  course_id: 2, name: "Etica Profissional",       description: "Estatuto da OAB e Codigo de Etica",            position: 4, professor_id: 7 },
  { id: 9,  course_id: 3, name: "Contabilidade Geral",      description: "Principios e normas contabeis",                position: 1, professor_id: 7 },
  { id: 10, course_id: 3, name: "Contabilidade de Custos",  description: "Custos e formacao de precos",                  position: 2, professor_id: 7 },
  { id: 11, course_id: 3, name: "Auditoria",                description: "Normas de auditoria e procedimentos",          position: 3, professor_id: 3 },
  { id: 12, course_id: 4, name: "Direito Penal Militar",    description: "Codigo Penal Militar",                         position: 1, professor_id: 3 },
  { id: 13, course_id: 4, name: "Educacao Fisica",          description: "Preparacao para TAF",                          position: 2, professor_id: 7 },
]

// ---------- TURMAS ----------
// professor_id: 3 = Prof. Pinheiro Neto | 7 = Prof. Ana Rocha
export const mockTurmas: Turma[] = [
  {
    id: 1,
    course_id: 1,
    professor_id: 3,
    name: "Turma A - Manha",
    shift: "Manha",
    start_date: "2026-01-05",
    end_date: "2026-02-06",
    schedule: "Seg a Sex, 08h00 as 11h15",
    max_students: 40,
    enrolled_count: 32,
    status: "em_andamento",
    availableSlots: undefined,
    turno: ""
  },
  {
    id: 2,
    course_id: 1,
    professor_id: 7,
    name: "Turma B - Tarde",
    shift: "Tarde",
    start_date: "2026-01-05",
    end_date: "2026-02-06",
    schedule: "Seg a Sex, 14h30 as 17h45",
    max_students: 40,
    enrolled_count: 28,
    status: "em_andamento",
    availableSlots: undefined,
    turno: ""
  },
  {
    id: 3,
    course_id: 2,
    professor_id: 3,
    name: "Turma OAB 2026.1",
    shift: "Noite",
    start_date: "2026-02-10",
    end_date: "2026-05-10",
    schedule: "Seg a Qui, 19h00 as 22h00",
    max_students: 50,
    enrolled_count: 15,
    status: "aberta",
    availableSlots: undefined,
    turno: ""
  },
  {
    id: 4,
    course_id: 3,
    professor_id: 7,
    name: "Turma CFC Intensivo",
    shift: "Manha",
    start_date: "2026-03-01",
    end_date: "2026-04-30",
    schedule: "Seg a Sex, 08h00 as 12h00",
    max_students: 35,
    enrolled_count: 20,
    status: "aberta",
    availableSlots: undefined,
    turno: ""
  },
]

// ---------- STUDENTS ----------
export const mockStudents: Student[] = [
  {
    id: 1,
    name: "Kayke Vinicius",
    email: "kaykevini01@gmail.com",
    whatsapp: "(69) 99263-1691",
    cpf: "123.456.789-00",
    address: "Rua Ernandes Indio, 7121, Residencial Cancun II CS 229, CEP 76.825-412",
    role: "aluno",
    internal: true,
    active: true,
    created_at: "2025-12-29",
  },
  {
    id: 2,
    name: "Maria Silva Santos",
    email: "maria.silva@gmail.com",
    whatsapp: "(69) 98877-5544",
    cpf: "987.654.321-00",
    address: "Av. Jorge Teixeira, 3500, Nova Porto Velho",
    role: "aluno",
    internal: true,
    active: true,
    created_at: "2025-12-15",
  },
  {
    id: 3,
    name: "Joao Pedro Oliveira",
    email: "joaop.oliveira@hotmail.com",
    whatsapp: "(69) 99111-2233",
    cpf: "456.789.123-00",
    address: "Rua Joaquim Nabuco, 890, Centro",
    role: "aluno",
    internal: false,
    active: true,
    created_at: "2026-01-05",
  },
  {
    id: 4,
    name: "Ana Carolina Ferreira",
    email: "ana.ferreira@outlook.com",
    whatsapp: "(69) 99444-5566",
    cpf: "321.654.987-00",
    address: "Rua Marechal Deodoro, 1500, Caiari",
    role: "aluno",
    internal: true,
    active: true,
    created_at: "2026-01-10",
  },
  {
    id: 5,
    name: "Lucas Ribeiro Costa",
    email: "lucas.rcosta@gmail.com",
    whatsapp: "(69) 99777-8899",
    cpf: "654.321.987-00",
    address: "Rua Dom Pedro II, 2200, Sao Cristovao",
    role: "aluno",
    internal: false,
    active: false,
    created_at: "2025-11-20",
  },
]

// ---------- ENROLLMENTS ----------
export const mockEnrollments: Enrollment[] = [
  {
    id: 1,
    student_id: 1,
    course_id: 1,
    turma_id: 2,
    career_id: 1,
    status: "active",
    started_at: "2026-01-05",
    expires_at: "2026-02-06",
    enrollment_type: "interno",
    payment_method: "Cartao de Credito a vista",
    total_paid: 453,
    contract_signed: true,
    created_at: "2025-12-29",
  },
  {
    id: 2,
    student_id: 2,
    course_id: 1,
    turma_id: 1,
    status: "active",
    started_at: "2026-01-05",
    expires_at: "2026-02-06",
    enrollment_type: "interno",
    payment_method: "PIX",
    total_paid: 453,
    contract_signed: true,
    created_at: "2025-12-20",
  },
  {
    id: 3,
    student_id: 3,
    course_id: 2,
    turma_id: 3,
    status: "active",
    started_at: "2026-02-10",
    expires_at: "2026-05-10",
    enrollment_type: "externo",
    payment_method: "Boleto Bancario",
    total_paid: 890,
    contract_signed: true,
    created_at: "2026-01-15",
  },
  {
    id: 4,
    student_id: 4,
    course_id: 3,
    turma_id: 4,
    status: "active",
    started_at: "2026-03-01",
    expires_at: "2026-04-30",
    enrollment_type: "interno",
    payment_method: "Cartao de Credito 3x",
    total_paid: 650,
    contract_signed: false,
    created_at: "2026-02-20",
  },
  {
    id: 5,
    student_id: 5,
    course_id: 1,
    turma_id: 1,
    status: "canceled",
    started_at: "2026-01-05",
    expires_at: "2026-02-06",
    enrollment_type: "externo",
    payment_method: "PIX",
    total_paid: 453,
    contract_signed: true,
    created_at: "2025-12-10",
  },
]

// ---------- CONTRACTS ----------
export const mockContracts: Contract[] = [
  {
    id: 1,
    enrollment_id: 1,
    student_id: 1,
    course_id: 1,
    version: "1.0",
    signed_at: "2025-12-29",
    status: "signed",
    pdf_url: null,
    contract_text: `CONTRATO DE PRESTACAO DE SERVICOS EDUCACIONAIS
CURSO PRESENCIAL

1. DAS PARTES
1.1. CONTRATANTE: Nome Completo: Kayke Vinicius, WhatsApp: (69) 99263-1691, E-mail: kaykevini01@gmail.com, Endereco Residencia: Rua Ernandes Indio, Numero: 7121, Complemento: Residencial Cancun II CS 229, CEP: 76.825-412.

1.2. CONTRATADO: Federal Cursos Preparatorio Para Concursos e Selecoes Publicas LTDA, com sede na Rua Getulio Vargas, no 2634, Sala 01 Sao Cristovao, Porto Velho (RO), CNPJ no 55.703.401/0001-08.

2. DO OBJETO
2.1. O CONTRATADO fornecera ao CONTRATANTE o seguinte Curso de Reta Final em Resolucao de Questoes para o Concurso da Assembleia Legislativa de Rondonia, modalidade presencial, materias especificas, previsao de inicio das aulas dia 05 de janeiro de 2026, e termino em 06 de fevereiro de 2026, no horario da Tarde: das 14h30 as 17h45, de segunda-feira a sexta-feira.

3. VALOR E FORMA DE PAGAMENTO
3.1. Como contraprestacao pelos servicos educacionais prestados, o contratante pagara ao contratado apenas o valor de R$ 453,00 (quatrocentos e cinquenta e tres reais).
3.2. Formas de Pagamento: Pagamento no Cartao de Credito a vista.

4. DIREITO DE ARREPENDIMENTO
4.1. O CONTRATANTE tem o direito de se arrepender deste contrato, sem onus, no prazo de 7 (sete) dias corridos.

5. OBRIGACOES DO CONTRATADO
5.1. Cumprir a programacao anunciada.
5.2. Fornecer instalacoes adequadas e professores com conhecimento tecnico.
5.3. Disponibilizar material didatico.

6. OBRIGACOES DO CONTRATANTE
6.1. Informar ao contratado toda e qualquer alteracao de seus enderecos.
6.2. Nao gravar as aulas e nem reproduzir ou disponibilizar aulas.
6.3. Assistir as aulas com urbanidade e respeito.

Porto Velho (RO), 29/12/2025.`,
  },
  {
    id: 2,
    enrollment_id: 2,
    student_id: 2,
    course_id: 1,
    version: "1.0",
    signed_at: "2025-12-20",
    status: "signed",
    pdf_url: null,
    contract_text: "Contrato padrao assinado por Maria Silva Santos para o curso Reta Final - Assembleia Legislativa de Rondonia.",
  },
  {
    id: 3,
    enrollment_id: 3,
    student_id: 3,
    course_id: 2,
    version: "1.0",
    signed_at: "2026-01-15",
    status: "signed",
    pdf_url: null,
    contract_text: "Contrato padrao assinado por Joao Pedro Oliveira para o curso Preparatorio OAB - 1a Fase.",
  },
  {
    id: 4,
    enrollment_id: 4,
    student_id: 4,
    course_id: 3,
    version: "1.0",
    signed_at: null,
    status: "pending",
    pdf_url: null,
    contract_text: "Contrato pendente de assinatura de Ana Carolina Ferreira para o curso CFC.",
  },
]

// ---------- EVENTS ----------
export interface Event {
  id: number
  title: string
  description: string
  event_type: "aulao" | "simulado" | "workshop" | "palestra"
  date: string
  start_time: string
  end_time: string
  location: string
  course_id: number | null
  max_participants: number
  registered_count: number
  status: "agendado" | "em_andamento" | "concluido" | "cancelado"
  created_at: string
}

export const mockEvents: Event[] = [
  {
    id: 1,
    title: "Aulao de Vespera - Assembleia Legislativa RO",
    description: "Revisao intensiva de todos os conteudos mais cobrados para o concurso da Assembleia Legislativa de Rondonia.",
    event_type: "aulao",
    date: "2026-02-01",
    start_time: "08:00",
    end_time: "18:00",
    location: "Auditorio Principal - Federal Cursos",
    course_id: 1,
    max_participants: 120,
    registered_count: 95,
    status: "agendado",
    created_at: "2026-01-15",
  },
  {
    id: 2,
    title: "Simulado Nacional OAB - 1a Fase",
    description: "Simulado completo nos moldes da prova da OAB com correcao comentada ao vivo.",
    event_type: "simulado",
    date: "2026-03-15",
    start_time: "09:00",
    end_time: "14:00",
    location: "Todas as salas - Federal Cursos",
    course_id: 2,
    max_participants: 80,
    registered_count: 42,
    status: "agendado",
    created_at: "2026-02-10",
  },
  {
    id: 3,
    title: "Workshop: Como Estudar para Concursos",
    description: "Tecnicas de estudo, organizacao de cronograma e metodos de revisao para aprovacao em concursos.",
    event_type: "workshop",
    date: "2026-01-20",
    start_time: "19:00",
    end_time: "21:30",
    location: "Sala 01 - Federal Cursos",
    course_id: null,
    max_participants: 60,
    registered_count: 60,
    status: "concluido",
    created_at: "2026-01-05",
  },
  {
    id: 4,
    title: "Aulao de Portugues - Revisao Gramatical",
    description: "Aulao especial focado em gramatica e interpretacao de texto para todos os concursos.",
    event_type: "aulao",
    date: "2026-03-08",
    start_time: "14:00",
    end_time: "18:00",
    location: "Auditorio Principal - Federal Cursos",
    course_id: null,
    max_participants: 100,
    registered_count: 67,
    status: "agendado",
    created_at: "2026-02-20",
  },
  {
    id: 5,
    title: "Palestra: Carreiras Policiais em Rondonia",
    description: "Panorama das carreiras policiais, editais previstos e estrategias de preparacao.",
    event_type: "palestra",
    date: "2026-02-25",
    start_time: "19:00",
    end_time: "21:00",
    location: "Auditorio Principal - Federal Cursos",
    course_id: 4,
    max_participants: 150,
    registered_count: 88,
    status: "concluido",
    created_at: "2026-02-01",
  },
]

// Helper functions
export function getStudentById(id: number) {
  return mockStudents.find((s) => s.id === id)
}

export function getCourseById(id: number) {
  return mockCourses.find((c) => c.id === id)
}

export function getTurmaById(id: number) {
  return mockTurmas.find((t) => t.id === id)
}

export function getSubjectsByCourseId(courseId: number) {
  return mockSubjects.filter((s) => s.course_id === courseId)
}

export function getTurmasByCourseId(courseId: number) {
  return mockTurmas.filter((t) => t.course_id === courseId)
}

export function getEnrollmentsByStudentId(studentId: number) {
  return mockEnrollments.filter((e) => e.student_id === studentId)
}

// ── Helpers de Professor ──────────────────────────────────────

/** Turmas onde o professor é responsável */
export function getTurmasByProfessor(professorId: number) {
  return mockTurmas.filter((t) => t.professor_id === professorId)
}

/** IDs de cursos em que o professor leciona (via turmas + subjects) */
export function getCourseIdsByProfessor(professorId: number): number[] {
  const viaTurmas   = mockTurmas.filter((t) => t.professor_id === professorId).map((t) => t.course_id)
  const viaSubjects = mockSubjects.filter((s) => s.professor_id === professorId).map((s) => s.course_id)
  return [...new Set([...viaTurmas, ...viaSubjects])]
}

/** Cursos em que o professor leciona */
export function getCoursesByProfessor(professorId: number) {
  const ids = getCourseIdsByProfessor(professorId)
  return mockCourses.filter((c) => ids.includes(c.id))
}

/** Matérias (subjects) do professor */
export function getSubjectsByProfessor(professorId: number) {
  return mockSubjects.filter((s) => s.professor_id === professorId)
}

export function getContractByEnrollmentId(enrollmentId: number) {
  return mockContracts.find((c) => c.enrollment_id === enrollmentId)
}

export function getStudentsByTurmaId(turmaId: number) {
  const enrollments = mockEnrollments.filter(
    (e) => e.turma_id === turmaId && e.status === "active"
  )
  const students = enrollments
    .map((e) => getStudentById(e.student_id))
    .filter(Boolean) as Student[]
  return students.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
}

export function getEventsByCourseId(courseId: number) {
  return mockEvents.filter((e) => e.course_id === courseId)
}

export function generateContractText(enrollment: Enrollment): string {
  const student = getStudentById(enrollment.student_id)
  const course = getCourseById(enrollment.course_id)
  const turma = getTurmaById(enrollment.turma_id)
  if (!student || !course || !turma) return "Dados insuficientes para gerar contrato."

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-")
    return `${day}/${m}/${y}`
  }

  const valorExtenso = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(enrollment.total_paid)

  return `CONTRATO DE PRESTACAO DE SERVICOS EDUCACIONAIS
CURSO PRESENCIAL

1. DAS PARTES
1.1. CONTRATANTE: Nome Completo: ${student.name}, WhatsApp: ${student.whatsapp}, E-mail: ${student.email}, Endereco Residencia: ${student.address}.

1.2. CONTRATADO: Federal Cursos Preparatorio Para Concursos e Selecoes Publicas LTDA, com sede na Rua Getulio Vargas, no 2634, Sala 01 Sao Cristovao, Porto Velho (RO), CNPJ no 55.703.401/0001-08.

2. DO OBJETO
2.1. O CONTRATADO fornecera ao CONTRATANTE o seguinte ${course.title}, modalidade presencial, materias especificas, previsao de inicio das aulas dia ${formatDate(turma.start_date)}, e termino em ${formatDate(turma.end_date)}, no horario ${turma.schedule}, a ser realizado no endereco situado na Rua Getulio Vargas, no 2634, Sao Cristovao.

2.2. Caso o inicio das aulas seja postergado em relacao a data assinalada (${formatDate(turma.start_date)}), o termino do curso sera automaticamente prorrogado por um periodo equivalente ao atraso verificado no inicio, garantindo a integralidade da carga horaria e do conteudo programatico. O contratante sera comunicado formalmente sobre qualquer alteracao nas datas de inicio e termino.

2.3. O curso escolhido pelo(a) contratante mencionado nesta clausula sera designado, doravante, simplesmente "curso".

3. VALOR E FORMA DE PAGAMENTO
3.1. Como contraprestacao pelos servicos educacionais prestados, o contratante pagara ao contratado apenas o valor de ${valorExtenso}.

3.2. Formas de Pagamento: ${enrollment.payment_method}.
3.3. No valor acima estao incluidos:
  - Matricula;
  - Material didatico em formato digital (PDF);
  - Suporte online (chat, e-mail, etc.);
  - Acesso ao grupo exclusivo de estudos no APP WhatsApp;
  - Acesso ao WhatsApp do mentor do curso; e
  - Montagem de um (1) cronograma de estudos + plano de estudos de acordo com a realidade de cada aluno, considerando suas particularidades.

3.4. O valor especificado no caput desta clausula e os servicos previstos no paragrafo primeiro contemplam tao somente os dias de curso, nao sendo o contratado responsavel por quaisquer despesas fora das datas de realizacao de cursos ou despesas com acompanhantes, ingressos, seguros, despesas com hospitais, medicos, lanches, taxas e servicos de locomocao, transporte e outros assemelhados, decorrentes de visitas, passeios, realizacao de pesquisas, simulados, salas de estudos e outras atividades extra cursos; copias reprograficas e servicos de impressao, encadernacao e similares, bem como outros produtos ou servicos, opcionais ou de uso facultativo, colocados a disposicao do contratante.

3.5. A ausencia do contratante as atividades presenciais, bem como a falta do cumprimento das demais obrigacoes academicas de sua responsabilidade, nao o(a) exime do pagamento do preco do curso, que se vencerem durante o periodo.

3.6. A matricula, ato que estabelece o vinculo entre as partes, dar-se-a com o preenchimento do requerimento digital ou verbal de matricula e o pagamento do valor integral do curso ou se parcelado for.

4. DIREITO DE ARREPENDIMENTO
4.1. O CONTRATANTE tem o direito de se arrepender deste contrato, sem onus, no prazo de 7 (sete) dias corridos, contados da data da contratacao ou do primeiro acesso ao conteudo do curso, o que ocorrer primeiro.
4.2. Para exercer o direito de arrependimento, o CONTRATANTE devera comunicar formalmente o CONTRATADO, por meio do WhatsApp da empresa dentro do prazo estipulado.
4.3. O CONTRATADO reembolsara o valor pago pelo CONTRATANTE em ate 7 (sete) dias uteis, contados do recebimento da comunicacao de arrependimento.

5. OBRIGACOES DO CONTRATADO
5.1. O contratado obriga-se a:
a) Cumprir a programacao anunciada, ressalvando-se que a orientacao tecnica sobre a prestacao dos servicos e de inteira responsabilidade do contratado, especialmente em relacao a fixacao de carga horaria, a grade curricular, a indicacao de professores, a modalidade de ensino e a orientacao didatico-pedagogica, razao pela qual podera o contratado a qualquer tempo proceder alteracoes nas atividades aqui mencionadas, procedendo com a previa comunicacao ao contratante, por meio de qualquer meio de divulgacao.
b) Fornecer instalacoes adequadas e professores com conhecimento tecnico relacionado ao curso;
c) Disponibilizar material didatico e acesso ao contratante ao ambiente apos confirmacao do pagamento do contratante;
d) Apresentar nos dias e horarios previamente agendados as aulas com o professor titular ou, em caso de forca maior, apresentar outro professor com conhecimento comprovado na area;
e) Coordenar administrativa e academicamente o curso, zelando pela sua qualidade e pelo cumprimento do conteudo programatico.
f) Especificar o tipo e a qualidade do material didatico a ser disponibilizado, incluindo, mas nao se limitando a apostilas, materiais complementares e recursos audiovisuais.
g) Definir a carga horaria total do curso e a distribuicao das aulas ao longo do periodo letivo.
h) Disponibilizar canais de comunicacao eficientes para suporte aos alunos, tais como e-mail, telefone e plataformas online.

6. OBRIGACOES DO CONTRATANTE
6.1. O(a) contratante obriga-se a:
a) Informar ao contratado toda e qualquer alteracao de seus enderecos residencial e eletronicos, principalmente WhatsApp, por constituir-se em nosso principal meio de comunicacao, sempre que isso ocorrer durante a vigencia do presente instrumento e enquanto perdurar alguma obrigacao ainda nao adimplida por qualquer das partes;
b) Ressarcir os danos de natureza material causados ao contratado, por dolo ou culpa do(a) contratante, bem como aqueles de natureza material ou moral causados nas dependencias do contratado contra professores, funcionarios, alunos ou qualquer outra pessoa fisica, bem como as instalacoes e equipamentos;
c) Nao gravar as aulas e nem reproduzir ou disponibilizar aulas que eventualmente tenham sido gravadas sem autorizacao do contratado, sob pena de responder pela violacao de direitos autorais, sem prejuizo de outras sancoes relacionadas ao ilicito;
d) Assistir as aulas com urbanidade e respeito aos demais alunos e professores.

7. RESCISAO CONTRATUAL
7.1. O presente contrato podera ser rescindido por qualquer uma das partes, mediante comunicacao por escrito a outra parte.
7.2. Rescisao por Iniciativa do Contratante:
7.2.1. Caso a rescisao ocorra antes do inicio das aulas, sera devolvido ao CONTRATANTE o valor pago, descontada uma taxa administrativa de 15% (quinze por cento) do valor total do curso.
7.2.2. Em caso de rescisao contratual apos o inicio das aulas, o CONTRATANTE devera efetuar o pagamento proporcional as aulas ministradas/disponibilizadas ate a data da rescisao, calculado com base no valor integral do curso, acrescido de multa rescisoria no montante de 30% (trinta por cento) do valor total do curso.
7.2.3. Para matriculas realizadas com pagamento efetuado via cartao de credito, a vista ou parcelado, sera descontado adicionalmente o valor de R$ 100,00 (cem reais) referente as despesas com taxas de parcelamento junto as operadoras de cartao de credito. Este valor sera somado aos demais descontos e multas previstos nesta clausula.
7.2.4. O nao comparecimento do aluno ao curso por causas estritamente particulares nao o isenta das condicoes de cancelamento estipuladas neste contrato.
7.2.5. A alteracao de curso apos a efetivacao da matricula sera considerada quebra de contrato, sujeitando o CONTRATANTE a cobranca da referida multa e ao pagamento integral das aulas ja assistidas no curso originalmente contratado.

7.3. Rescisao por Iniciativa do Contratado:
7.3.1. O CONTRATADO podera rescindir o contrato nas seguintes hipoteses:
a) Inadimplencia do CONTRATANTE por periodo superior a 15 (quinze) dias, sem prejuizo da cobranca dos valores devidos.
b) Conduta do CONTRATANTE que prejudique o andamento regular das aulas ou que viole as normas de convivencia da instituicao, a ser apurada mediante procedimento interno, garantido o direito de defesa ao CONTRATANTE.
c) Ocorrencia de caso fortuito ou forca maior que impeca a continuidade da prestacao dos servicos.
Paragrafo Primeiro: Em caso de rescisao por iniciativa do CONTRATADO, este devera restituir ao CONTRATANTE o valor proporcional as aulas nao ministradas, salvo nos casos de rescisao por inadimplencia ou conduta do(a) CONTRATANTE.
Paragrafo Segundo: O "inicio das aulas", para fins de aplicacao desta clausula, sera considerado a data da primeira aula do curso, conforme o cronograma divulgado pelo CONTRATADO.
Paragrafo Terceiro: A mudanca de curso apos a matricula, quando permitida, podera acarretar a necessidade de ajustes no valor e nas condicoes de pagamento, a serem acordados entre as partes, nao se caracterizando como rescisao, desde que haja anuencia expressa do CONTRATADO. Enquanto nao apresentado o pedido formal de cancelamento, o(a) contratante continuara obrigado aos pagamentos pelas aulas ministradas, sem excecao, nao ocorrendo, por parte do contratado, reembolsos de valores retroativos anteriores a data da rescisao relacionados as aulas.

8. PROPRIEDADE INTELECTUAL
8.1. O conteudo do curso (videos, textos, materiais, etc.) e protegido por direitos autorais e e de propriedade exclusiva do CONTRATADO.
8.2. E proibida a reproducao, distribuicao, copia ou qualquer outra forma de utilizacao do conteudo do curso sem a autorizacao expressa do CONTRATADO.

9. PRIVACIDADE E PROTECAO DE DADOS
9.1. O CONTRATADO se compromete a proteger os dados pessoais do CONTRATANTE, em conformidade com a Lei Geral de Protecao de Dados (LGPD).
9.2. Os dados do CONTRATANTE serao coletados, utilizados e armazenados para fins de execucao deste contrato, comunicacao, suporte e melhoria dos servicos.
9.3. O CONTRATANTE autoriza o CONTRATADO a utilizar seus dados para envio de informacoes sobre outros cursos e promocoes, podendo revogar essa autorizacao a qualquer momento.
9.4. O CONTRATANTE tem o direito de acessar, retificar, excluir ou solicitar a portabilidade de seus dados, conforme previsto na LGPD.

10. DISPOSICOES GERAIS
10.1. Se qualquer das partes deixar de fazer valer, a qualquer tempo, quaisquer disposicoes do presente contrato ou deixar de exigir, a qualquer tempo, o cumprimento pela outra de quaisquer disposicoes aqui contidas, tal ato nao sera interpretado, em nenhuma hipotese, como uma renuncia a essas disposicoes, nem afetara as disposicoes deste contrato ou qualquer de suas partes ou, ainda, o direito de qualquer das partes de fazer valer posteriormente toda e qualquer disposicao nos termos aqui previstos;
10.2. Qualquer notificacao entre as partes sera feita por escrito e enviada aos enderecos consignados no preambulo deste contrato;
10.3. Caso haja qualquer alteracao nos enderecos de correspondencias ou nos destinatarios das comunicacoes referentes ao presente contrato, as partes obrigam-se a comunicar a outra os seus novos enderecos de correspondencia em ate 5 (cinco) dias uteis, sob pena de serem consideradas validas as comunicacoes e notificacoes encaminhadas ao endereco anterior;
10.4. O contratado, livre de quaisquer onus para com o(a) contratante, podera utilizar-se da sua imagem para fins academicos ou para divulgacao de suas atividades ou na gravacao de aulas, podendo, para tanto, reproduzi-la ou divulga-la junto a internet, jornais e todos os demais meios de comunicacoes fisicos ou digitais, publicos ou privados, ainda que o(a) contratante se encontre ja na condicao de egresso, desde que respeitado o direito a imagem do contratante e que o uso nao seja abusivo ou cause prejuizo ao mesmo. O contratante podera revogar esta autorizacao a qualquer momento, mediante comunicacao por escrito ao contratado;
10.5. As partes atribuem ao presente contrato plena eficacia e forca executiva extracontratual.
Sem prejuizo de eventual foro privilegiado pela legislacao, fica eleito o foro da cidade de Porto Velho (RO), para dirimir quaisquer duvidas ou conflitos oriundos do presente contrato.

E, por estarem de pleno acordo, firmam o presente instrumento em 2 (duas) vias de igual teor e conteudo, para todos os fins de direito.


Porto Velho (RO), ${formatDate(enrollment.created_at)}.


____________________________________
Contratante: ${student.name}


____________________________________
Contratado: Federal Cursos Preparatorio Para Concursos e Selecoes Publicas LTDA`
}
