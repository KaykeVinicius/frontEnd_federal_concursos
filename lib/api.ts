// ========== API CLIENT ==========
// Cliente real conectado ao backend Rails (http://localhost:3001/api/v1)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1"

// --- Storage helpers ---
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function setToken(token: string): void {
  localStorage.setItem("auth_token", token)
}

export function clearAuth(): void {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("currentUser")
}

// --- Core request helper ---
async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken()
  const isFormData = body instanceof FormData
  const headers: Record<string, string> = {}
  if (!isFormData) headers["Content-Type"] = "application/json"
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    if (res.status === 401) {
      // Token expirado ou inválido — limpa sessão e redireciona para login
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("currentUser")
        window.location.href = "/login"
      }
      throw new Error("Sessão expirada. Faça login novamente.")
    }
    const err = await res.json().catch(() => ({ error: `Erro ${res.status}` }))
    const msg = err.error ?? (Array.isArray(err.errors) ? err.errors.join(", ") : null) ?? `Erro ${res.status}`
    throw new Error(msg)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ─── Types ───────────────────────────────────────────────

export interface ApiUser {
  id: number
  name: string
  email: string
  cpf: string
  role: string
  commission_percent?: number
  active: boolean
  created_at: string
}

export interface ApiStudent {
  id: number
  name: string
  email: string
  whatsapp?: string
  cpf: string
  instagram?: string
  active: boolean
  address?: string
  address_number?: string
  address_complement?: string
  cep?: string
  user?: ApiUser
}

export interface ApiCareer {
  id: number
  name: string
  description: string
  created_at: string
}

export interface ApiCourse {
  id: number
  title: string
  description: string
  price: number
  status: string
  access_type: string
  duration_in_days: number
  start_date: string
  end_date: string
  created_at?: string
  career_id?: number
  career?: ApiCareer
}

export interface ApiSubject {
  id: number
  name: string
  description: string
  position: number
  course_id: number
  professor_id: number
  professor?: ApiUser
  created_at?: string
}

export interface ApiTopic {
  id: number
  title: string
  position: number
  subject_id: number
  lessons?: ApiLesson[]
}

export interface ApiLesson {
  id: number
  title: string
  duration: string
  youtube_id: string
  position: number
  available: boolean
  topic_id: number
  lesson_pdfs?: ApiLessonPdf[]
}

export interface ApiLessonPdf {
  id: number
  name: string
  file_size?: string
  file_url?: string
}

export interface ApiTurma {
  id: number
  name: string
  shift: string
  start_date: string
  end_date: string
  schedule: string
  max_students: number
  status: string
  modalidade: string
  course_id: number
  professor_id: number
  enrolled_count: number
  course?: ApiCourse
  professor?: ApiUser
}

export interface ApiEventLote {
  id: number
  name: string
  price: number
  quantity: number
  position: number
  sold_count: number
  available: boolean
}

export interface ProfessorEventAulaoSubject {
  subject_id: number
  subject_name: string
  material: ApiEventMaterial | null
}

export interface ProfessorEventAulao {
  id: number
  title: string
  date: string
  start_time: string
  end_time: string
  location?: string
  subjects: ProfessorEventAulaoSubject[]
}

export interface ApiEventSubject {
  id: number
  subject_id: number
  subject_name: string
}

export interface ApiEventMaterial {
  id: number
  event_id: number
  subject_id: number
  subject_name: string
  professor_id: number
  professor_name: string
  title: string
  file_url?: string
  file_size?: string
  expires_at: string
}

export interface ApiEvent {
  id: number
  title: string
  description?: string
  event_type: string
  date: string
  start_time: string
  end_time: string
  location?: string
  status: string
  is_free: boolean
  price?: number
  max_participants: number
  registered_count: number
  course_id: number | null
  created_at: string
  is_full?: boolean
  current_lote_price?: number | null
  event_lotes?: ApiEventLote[]
  event_subjects?: ApiEventSubject[]
}

export interface ApiEventRegistration {
  id: number
  event_id?: number
  ticket_token: string
  attended: boolean
  attended_at?: string
  created_at: string
  lote_name?: string | null
  lote_price?: number | null
  student?: ApiStudent
  event?: ApiEvent
}

export interface ApiEnrollment {
  id: number
  status: string
  started_at: string
  expires_at: string
  enrollment_type: string | number
  payment_method: string
  total_paid: number
  contract_signed: boolean
  student?: ApiStudent
  course?: ApiCourse
  turma?: ApiTurma
}

export interface ApiQuestion {
  id: number
  text: string
  video_moment?: string
  status: string
  answer?: string | null
  answered_at?: string | null
  created_at: string
  student_id: number
  professor_id: number
  lesson_id?: number
  subject_id?: number
  student?: ApiStudent
  lesson?: { id: number; title: string }
  subject?: { id: number; name: string }
}

export interface ApiMaterial {
  id: number
  title: string
  material_type: string
  file_name: string
  file_url?: string
  file_size: string
  professor_id: number
  subject_id?: number
  turma_id?: number
  created_at: string
  professor?: ApiUser
  subject?: ApiSubject
}

export interface ApiNotification {
  id: number
  title: string
  body?: string
  notifiable_type: "Event" | "Course"
  notifiable_id: number
  read_at: string | null
  created_at: string
}

export interface AlunoDashboardResponse {
  student: ApiStudent
  active_enrollments: number
  lessons_completed: number
  pending_questions: number
  upcoming_events: ApiEvent[]
  enrollments: ApiEnrollment[]
}

export interface ProfessorDashboardResponse {
  turmas_count: number
  active_turmas_count: number
  courses_count: number
  subjects_count: number
  pending_questions_count: number
  total_students: number
}

// --- Compatibilidade: mantidas para páginas ainda não migradas ---
export async function fakeApiCall<T>(data: T, delayMs = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs))
}
export async function fakeApiPost<T>(data: T, delayMs = 800): Promise<{ success: boolean; data: T }> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true, data }), delayMs))
}
export async function fakeApiDelete(delayMs = 500): Promise<{ success: boolean }> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), delayMs))
}

// ─── API Methods ─────────────────────────────────────────

export const api = {
  auth: {
    login: (email: string, password: string) =>
      req<{ token: string; user: ApiUser }>("POST", "/auth/login", { email, password }),
    me: () => req<ApiUser>("GET", "/auth/me"),
  },

  users: {
    list: () => req<ApiUser[]>("GET", "/users"),
    create: (body: {
      name: string
      email: string
      cpf: string
      password: string
      role: string
      commission_percent?: number
    }) => req<ApiUser>("POST", "/users", body),
    update: (id: number, body: Partial<ApiUser> & { password?: string }) =>
      req<ApiUser>("PATCH", `/users/${id}`, body),
    delete: (id: number) => req<void>("DELETE", `/users/${id}`),
  },

  careers: {
    list: () => req<ApiCareer[]>("GET", "/careers"),
    create: (body: { name: string; description?: string }) => req<ApiCareer>("POST", "/careers", body),
    update: (id: number, body: Partial<ApiCareer>) => req<ApiCareer>("PATCH", `/careers/${id}`, body),
    delete: (id: number) => req<void>("DELETE", `/careers/${id}`),
  },

  courses: {
    list: () => req<ApiCourse[]>("GET", "/courses"),
    get: (id: number) => req<ApiCourse>("GET", `/courses/${id}`),
    create: (body: Partial<ApiCourse>) => req<ApiCourse>("POST", "/courses", body),
    update: (id: number, body: Partial<ApiCourse>) => req<ApiCourse>("PATCH", `/courses/${id}`, body),
    delete: (id: number) => req<void>("DELETE", `/courses/${id}`),
  },

  subjects: {
    list: (courseId?: number) =>
      courseId
        ? req<ApiSubject[]>("GET", `/courses/${courseId}/subjects`)
        : req<ApiSubject[]>("GET", `/subjects`),
    create: (body: Partial<ApiSubject>) =>
      body.course_id
        ? req<ApiSubject>("POST", `/courses/${body.course_id}/subjects`, body)
        : req<ApiSubject>("POST", `/subjects`, body),
    update: (id: number, body: Partial<ApiSubject>) => req<ApiSubject>("PATCH", `/subjects/${id}`, body),
    delete: (id: number) => req<void>("DELETE", `/subjects/${id}`),
  },

  topics: {
    list: (subjectId?: number) =>
      req<ApiTopic[]>("GET", `/topics${subjectId ? `?subject_id=${subjectId}` : ""}`),
    create: (body: { subject_id: number; title: string; position?: number }) =>
      req<ApiTopic>("POST", "/topics", body),
    update: (id: number, body: Partial<ApiTopic>) => req<ApiTopic>("PATCH", `/topics/${id}`, body),
    delete: (id: number) => req<void>("DELETE", `/topics/${id}`),
  },

  lessons: {
    list: (topicId?: number) =>
      req<ApiLesson[]>("GET", `/lessons${topicId ? `?topic_id=${topicId}` : ""}`),
    get: (id: number) => req<ApiLesson>("GET", `/lessons/${id}`),
    create: (body: Partial<ApiLesson>) => req<ApiLesson>("POST", "/lessons", body),
    update: (id: number, body: Partial<ApiLesson>) => req<ApiLesson>("PATCH", `/lessons/${id}`, body),
    delete: (id: number) => req<void>("DELETE", `/lessons/${id}`),
  },

  lesson_pdfs: {
    list: (lessonId: number) => req<ApiLessonPdf[]>("GET", `/lesson_pdfs?lesson_id=${lessonId}`),
    create: (body: { lesson_id: number; name: string; file?: File; file_url?: string; file_size?: string }) => {
      if (body.file) {
        const form = new FormData()
        form.append("lesson_id", String(body.lesson_id))
        form.append("name", body.name)
        form.append("file", body.file)
        return req<ApiLessonPdf>("POST", "/lesson_pdfs", form)
      }
      const { file: _f, ...rest } = body
      return req<ApiLessonPdf>("POST", "/lesson_pdfs", rest)
    },
    delete: (id: number) => req<void>("DELETE", `/lesson_pdfs/${id}`),
  },

  turmas: {
    list: (courseId?: number) =>
      req<ApiTurma[]>("GET", `/turmas${courseId ? `?course_id=${courseId}` : ""}`),
    get: (id: number) => req<ApiTurma>("GET", `/turmas/${id}`),
    create: (body: Partial<ApiTurma>) => req<ApiTurma>("POST", "/turmas", body),
    update: (id: number, body: Partial<ApiTurma>) => req<ApiTurma>("PATCH", `/turmas/${id}`, body),
    delete: (id: number) => req<void>("DELETE", `/turmas/${id}`),
  },

  students: {
    list: () => req<ApiStudent[]>("GET", "/students"),
    get: (id: number) => req<ApiStudent>("GET", `/students/${id}`),
    create: (body: Partial<ApiStudent>) => req<ApiStudent>("POST", "/students", body),
    update: (id: number, body: Partial<ApiStudent>) => req<ApiStudent>("PATCH", `/students/${id}`, body),
    delete: (id: number) => req<void>("DELETE", `/students/${id}`),
  },

  enrollments: {
    list: () => req<ApiEnrollment[]>("GET", "/enrollments"),
    create: (body: {
      student_id: number
      course_id: number
      turma_id?: number
      career_id?: number
      status: string
      started_at: string
      expires_at?: string
      enrollment_type?: string
      payment_method?: string
      total_paid?: number
      contract_signed?: boolean
    }) => req<ApiEnrollment>("POST", "/enrollments", body),
    update: (id: number, body: Partial<ApiEnrollment>) =>
      req<ApiEnrollment>("PATCH", `/enrollments/${id}`, body),
    delete: (id: number) => req<void>("DELETE", `/enrollments/${id}`),
  },

  events: {
    list: () => req<ApiEvent[]>("GET", "/events"),
    get: (id: number) => req<ApiEvent>("GET", `/events/${id}`),
    create: (body: Partial<ApiEvent>) => req<ApiEvent>("POST", "/events", body),
    update: (id: number, body: Partial<ApiEvent>) => req<ApiEvent>("PATCH", `/events/${id}`, body),
    delete: (id: number) => req<void>("DELETE", `/events/${id}`),
    registrations: {
      list: (eventId: number) => req<ApiEventRegistration[]>("GET", `/events/${eventId}/registrations`),
      create: (eventId: number, studentId: number) =>
        req<ApiEventRegistration>("POST", `/events/${eventId}/registrations`, { student_id: studentId }),
      delete: (eventId: number, regId: number) => req<void>("DELETE", `/events/${eventId}/registrations/${regId}`),
    },
    lotes: {
      list: (eventId: number) => req<ApiEventLote[]>("GET", `/events/${eventId}/lotes`),
      create: (eventId: number, body: Omit<ApiEventLote, "id" | "sold_count" | "available">) =>
        req<ApiEventLote>("POST", `/events/${eventId}/lotes`, { event_lote: body }),
      update: (eventId: number, loteId: number, body: Partial<ApiEventLote>) =>
        req<ApiEventLote>("PATCH", `/events/${eventId}/lotes/${loteId}`, { event_lote: body }),
      delete: (eventId: number, loteId: number) => req<void>("DELETE", `/events/${eventId}/lotes/${loteId}`),
    },
    checkin: (token: string) =>
      req<ApiEventRegistration>("PATCH", "/event_registrations/checkin", { token }),
    undoCheckin: (regId: number) =>
      req<ApiEventRegistration>("PATCH", `/event_registrations/${regId}/undo_checkin`),
    subjects: {
      list: (eventId: number) => req<ApiEventSubject[]>("GET", `/events/${eventId}/subjects`),
      sync: (eventId: number, subjectIds: number[]) =>
        req<ApiEventSubject[]>("POST", `/events/${eventId}/sync_subjects`, { subject_ids: subjectIds }),
    },
  },

  professor: {
    dashboard: () => req<ProfessorDashboardResponse>("GET", "/professor/dashboard"),
    turmas: () => req<ApiTurma[]>("GET", "/professor/turmas"),
    questions: (status?: string) =>
      req<ApiQuestion[]>("GET", `/professor/questions${status ? `?status=${status}` : ""}`),
    answerQuestion: (id: number, answer: string) =>
      req<ApiQuestion>("PATCH", `/professor/questions/${id}/answer`, { answer }),
    materials: {
      list: () => req<ApiMaterial[]>("GET", "/professor/materials"),
      create: (body: Partial<ApiMaterial>) => req<ApiMaterial>("POST", "/professor/materials", body),
      delete: (id: number) => req<void>("DELETE", `/professor/materials/${id}`),
    },
    eventMaterials: {
      list: () => req<ProfessorEventAulao[]>("GET", "/professor/event_materials"),
      upload: (eventId: number, subjectId: number, title: string, file: File) => {
        const form = new FormData()
        form.append("event_id",   String(eventId))
        form.append("subject_id", String(subjectId))
        form.append("title",      title)
        form.append("file",       file)
        return req<ApiEventMaterial>("POST", "/professor/event_materials", form)
      },
      delete: (id: number) => req<void>("DELETE", `/professor/event_materials/${id}`),
    },
  },

  notifications: {
    list: () => req<ApiNotification[]>("GET", "/notifications"),
    markAllRead: () => req<void>("PATCH", "/notifications/mark_all_read"),
    markRead: (id: number) => req<ApiNotification>("PATCH", `/notifications/${id}/mark_read`),
  },

  aluno: {
    dashboard: () => req<AlunoDashboardResponse>("GET", "/aluno/dashboard"),
    questions: () => req<ApiQuestion[]>("GET", "/aluno/questions"),
    createQuestion: (body: {
      professor_id: number
      lesson_id: number
      subject_id: number
      text: string
      video_moment?: string
    }) => req<ApiQuestion>("POST", "/aluno/questions", body),
    eventRegistrations: {
      list: () => req<ApiEventRegistration[]>("GET", "/aluno/event_registrations"),
    },
    eventMaterials: {
      list: (eventId: number) => req<ApiEventMaterial[]>("GET", `/aluno/event_materials?event_id=${eventId}`),
    },
    completions: {
      list: () => req<{ id: number; lesson_id: number }[]>("GET", "/aluno/lesson_completions"),
      create: (lessonId: number) =>
        req<{ id: number; lesson_id: number }>("POST", "/aluno/lesson_completions", { lesson_id: lessonId }),
      delete: (id: number) => req<void>("DELETE", `/aluno/lesson_completions/${id}`),
    },
  },
}
