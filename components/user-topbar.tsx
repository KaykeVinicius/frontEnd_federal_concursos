"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ChevronDown,
  LogOut,
  User,
  Settings,
  Bell,
  Sun,
  Moon,
  Clock,
  Mail,
  HelpCircle,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { api, type ApiEvent, type ApiEnrollment, type ApiQuestion } from "@/lib/api"

interface UserTopbarProps {
  roleLabel: string
}

type Notif =
  | { type: "event"; id: number; title: string; sub: string }
  | { type: "boleto"; id: number; title: string; sub: string }
  | { type: "duvida"; id: number; title: string; sub: string }

export function UserTopbar({ roleLabel }: UserTopbarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState("Usuário")
  const [notifs, setNotifs] = useState<Notif[]>([])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setUserName(user.name || "Usuário")
      } catch {}
    }
  }, [])

  useEffect(() => {
    const now = new Date()
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    if (roleLabel === "Professor") {
      // Professor: apenas dúvidas pendentes das suas matérias
      api.professor.questions("pending")
        .then((questions: ApiQuestion[]) => {
          const notifs: Notif[] = questions.map((q) => ({
            type: "duvida" as const,
            id: q.id,
            title: `Dúvida de ${q.student?.name ?? "Aluno"}`,
            sub: [q.subject?.name, q.lesson?.title].filter(Boolean).join(" — "),
          }))
          setNotifs(notifs)
        })
        .catch(() => {})

    } else if (roleLabel === "Aluno") {
      // Aluno: dúvidas respondidas (novas respostas)
      api.aluno.questions()
        .then((questions: ApiQuestion[]) => {
          const notifs: Notif[] = questions
            .filter((q) => q.status === "answered")
            .map((q) => ({
              type: "duvida" as const,
              id: q.id,
              title: `Dúvida respondida — ${q.subject?.name ?? ""}`,
              sub: q.lesson?.title ?? "",
            }))
          setNotifs(notifs)
        })
        .catch(() => {})

    } else {
      // CEO, admin, pedagógico, assistente: eventos próximos + boletos vencendo
      Promise.all([api.events.list(), api.enrollments.list()])
        .then(([events, enrollments]) => {
          const eventNotifs: Notif[] = events
            .filter((ev: ApiEvent) => { const d = new Date(ev.date); return d >= now && d <= in7 })
            .map((ev: ApiEvent) => ({
              type: "event" as const,
              id: ev.id,
              title: `Evento: ${ev.title}`,
              sub: `${new Date(ev.date).toLocaleDateString("pt-BR")}${ev.location ? ` — ${ev.location}` : ""}`,
            }))

          const boletoNotifs: Notif[] = enrollments
            .filter((en: ApiEnrollment) => en.payment_method === "boleto" && en.expires_at && (() => { const d = new Date(en.expires_at); return d >= now && d <= in7 })())
            .map((en: ApiEnrollment) => ({
              type: "boleto" as const,
              id: en.id,
              title: `Boleto a vencer — ${en.student?.name ?? `Matrícula #${en.id}`}`,
              sub: `Vence em ${new Date(en.expires_at).toLocaleDateString("pt-BR")}`,
            }))

          setNotifs([...eventNotifs, ...boletoNotifs])
        })
        .catch(() => {})
    }
  }, [roleLabel])

  function logout() {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  function getInitial() {
    return userName.charAt(0).toUpperCase()
  }

  // 🔥 MAPEAMENTO INTELIGENTE
  function getProfilePath() {
    if (roleLabel === "Aluno") return "/aluno/perfil"
    return "/perfil"
  }

  function getSettingsPath() {
    if (roleLabel === "Equipe Pedagógica") return "/pedagogica/configuracoes"
    if (roleLabel === "Professor") return "/professor/configuracoes"
    if (roleLabel === "Administrador") return "/admin/configuracoes"
    return "/configuracoes"
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* ESQUERDA */}
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold tracking-tight">
            {roleLabel}
          </h1>

          <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />

          <span className="hidden sm:block text-sm text-muted-foreground">
            Painel
          </span>
        </div>

        {/* DIREITA */}
        <div className="flex items-center gap-3">

            {/* 🌙 DARK MODE TOGGLE */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center rounded-xl p-2 hover:bg-muted/60 transition-all cursor-pointer"
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark"
                ? <Sun className="h-5 w-5 text-muted-foreground" />
                : <Moon className="h-5 w-5 text-muted-foreground" />
              }
            </button>
          )}

          {/* 🔔 NOTIFICAÇÕES */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex items-center justify-center rounded-xl p-2 hover:bg-muted/60 transition-all cursor-pointer">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {notifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                    {notifs.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 rounded-xl border shadow-xl">
              <div className="p-3 border-b">
                <p className="text-sm font-medium">Notificações</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {notifs.length === 0
                    ? "Nenhuma notificação"
                    : roleLabel === "Professor"
                    ? `${notifs.length} dúvida(s) pendente(s)`
                    : roleLabel === "Aluno"
                    ? `${notifs.length} dúvida(s) respondida(s)`
                    : `${notifs.length} alerta(s)`}
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhuma notificação no momento
                  </div>
                ) : (
                  notifs.map((n) => (
                    <DropdownMenuItem key={`${n.type}-${n.id}`} className="flex items-start gap-3 p-3 cursor-pointer">
                      <div className={`mt-0.5 rounded-full p-1.5 shrink-0 ${n.type === "event" ? "bg-orange-100" : n.type === "duvida" ? "bg-yellow-100" : "bg-red-100"}`}>
                        {n.type === "event"
                          ? <Clock className="h-3.5 w-3.5 text-orange-600" />
                          : n.type === "duvida"
                          ? <HelpCircle className="h-3.5 w-3.5 text-yellow-600" />
                          : <Mail className="h-3.5 w-3.5 text-red-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                        {n.sub && <p className="text-xs text-muted-foreground mt-0.5">{n.sub}</p>}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>

              {notifs.length > 0 && roleLabel === "Professor" && (
                <div className="border-t p-2">
                  <a href="/professor/duvidas" className="block w-full rounded-lg px-3 py-1.5 text-center text-xs font-medium text-primary hover:bg-primary/5">
                    Ver todas as dúvidas
                  </a>
                </div>
              )}
              {notifs.length > 0 && roleLabel === "Aluno" && (
                <div className="border-t p-2">
                  <a href="/aluno/duvidas" className="block w-full rounded-lg px-3 py-1.5 text-center text-xs font-medium text-primary hover:bg-primary/5">
                    Ver minhas dúvidas
                  </a>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 👤 USER MENU */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-muted/60 cursor-pointer transition-all">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-sm font-semibold">
                  {getInitial()}
                </div>

                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-sm font-medium">
                    {userName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {roleLabel}
                  </span>
                </div>

                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:rotate-180" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 rounded-xl shadow-xl">

              {/* PERFIL */}
              <DropdownMenuItem
                onClick={() => router.push(getProfilePath())}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Meu perfil
              </DropdownMenuItem>

              {/* CONFIG */}
              <DropdownMenuItem
                onClick={() => router.push(getSettingsPath())}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* LOGOUT */}
              <DropdownMenuItem
                onClick={logout}
                className="text-red-500 hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  )
}