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
  Megaphone,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { api, type ApiQuestion, type ApiNotification, type ApiAnnouncement } from "@/lib/api"

interface UserTopbarProps {
  roleLabel: string
}

// Links por papel + tipo de recurso
const NOTIF_LINKS: Record<string, Record<string, string>> = {
  "CEO":                  { Event: "/ceo/eventos",          Course: "/ceo/cursos" },
  "Equipe Pedagógica":    { Event: "/pedagogica/eventos",   Course: "/pedagogica/cursos" },
  "Professor":            { Event: "/professor/eventos",    Course: "/professor/cursos" },
  "Assistente Comercial": { Event: "/assistente/eventos",   Course: "/assistente/cursos-disponiveis" },
  "Aluno":                { Event: "/aluno/eventos",        Course: "/aluno/cursos-disponiveis" },
  "Administrador":        { Event: "/admin/eventos",        Course: "/admin/cursos" },
}

// Rota de avisos por papel
const AVISOS_LINKS: Record<string, string> = {
  "CEO":                  "/ceo/avisos",
  "Equipe Pedagógica":    "/pedagogica/avisos",
  "Professor":            "/professor/avisos",
  "Aluno":                "/aluno/avisos",
  "Assistente Comercial": "/assistente/avisos",
}

const SEEN_AVISOS_KEY = "seen_aviso_ids"

function getSeenIds(): Set<number> {
  try {
    const raw = localStorage.getItem(SEEN_AVISOS_KEY)
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set()
  } catch { return new Set() }
}

function markIdSeen(id: number) {
  const seen = getSeenIds()
  seen.add(id)
  localStorage.setItem(SEEN_AVISOS_KEY, JSON.stringify([...seen]))
}

type DuvidaNotif = { kind: "duvida"; id: number; title: string; sub: string }
type SysNotif    = { kind: "sys";    notif: ApiNotification }
type AvisoNotif  = { kind: "aviso";  announcement: ApiAnnouncement; unread: boolean }
type AnyNotif    = DuvidaNotif | SysNotif | AvisoNotif

export function UserTopbar({ roleLabel }: UserTopbarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState("Usuário")
  const [notifs, setNotifs] = useState<AnyNotif[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

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
    // Notificações reais do backend (eventos/cursos novos) + avisos
    Promise.all([
      api.notifications.list().catch(() => [] as ApiNotification[]),
      api.announcements.list().catch(() => [] as ApiAnnouncement[]),
    ]).then(([sysNotifs, announcements]) => {
      const mapped: AnyNotif[] = sysNotifs.map((n) => ({ kind: "sys" as const, notif: n }))
      const sysUnread = sysNotifs.filter((n) => !n.read_at).length

      // Avisos: últimos 30 dias, marcados como não lidos se não vistos ainda
      const seen = getSeenIds()
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const avisoNotifs: AnyNotif[] = announcements
        .filter((a) => new Date(a.created_at) >= cutoff)
        .map((a) => ({ kind: "aviso" as const, announcement: a, unread: !seen.has(a.id) }))
      const avisoUnread = avisoNotifs.filter((n) => n.kind === "aviso" && (n as AvisoNotif).unread).length

      setUnreadCount(sysUnread + avisoUnread)

      // Dúvidas por role (mantidas em paralelo)
      const combined = [...mapped, ...avisoNotifs]
      if (roleLabel === "Professor") {
        api.professor.questions("pending")
          .then((questions: ApiQuestion[]) => {
            const duvidas: AnyNotif[] = questions.map((q) => ({
              kind: "duvida" as const,
              id: q.id,
              title: `Dúvida de ${q.student?.name ?? "Aluno"}`,
              sub: [q.subject?.name, q.lesson?.title].filter(Boolean).join(" — "),
            }))
            setNotifs([...combined, ...duvidas])
          })
          .catch(() => setNotifs(combined))
      } else if (roleLabel === "Aluno") {
        api.aluno.questions()
          .then((questions: ApiQuestion[]) => {
            const duvidas: AnyNotif[] = questions
              .filter((q) => q.status === "answered")
              .map((q) => ({
                kind: "duvida" as const,
                id: q.id,
                title: `Dúvida respondida — ${q.subject?.name ?? ""}`,
                sub: q.lesson?.title ?? "",
              }))
            setNotifs([...combined, ...duvidas])
          })
          .catch(() => setNotifs(combined))
      } else {
        setNotifs(combined)
      }
    })
  }, [roleLabel])

  async function handleMarkAllRead() {
    await api.notifications.markAllRead().catch(() => {})
    // Mark all avisos as seen
    setNotifs((prev) => {
      prev.forEach((n) => { if (n.kind === "aviso") markIdSeen(n.announcement.id) })
      return prev.map((n) => {
        if (n.kind === "sys") return { ...n, notif: { ...n.notif, read_at: new Date().toISOString() } }
        if (n.kind === "aviso") return { ...n, unread: false }
        return n
      })
    })
    setUnreadCount(0)
  }

  function handleNotifClick(n: AnyNotif) {
    if (n.kind === "sys") {
      const links = NOTIF_LINKS[roleLabel] ?? {}
      const href = links[n.notif.notifiable_type]
      if (href) router.push(href)
      if (!n.notif.read_at) {
        api.notifications.markRead(n.notif.id).catch(() => {})
        setUnreadCount((c) => Math.max(0, c - 1))
        setNotifs((prev) => prev.map((p) =>
          p.kind === "sys" && p.notif.id === n.notif.id
            ? { ...p, notif: { ...p.notif, read_at: new Date().toISOString() } }
            : p
        ))
      }
    } else if (n.kind === "aviso") {
      if (n.unread) {
        markIdSeen(n.announcement.id)
        setUnreadCount((c) => Math.max(0, c - 1))
        setNotifs((prev) => prev.map((p) =>
          p.kind === "aviso" && p.announcement.id === n.announcement.id
            ? { ...p, unread: false }
            : p
        ))
      }
      const href = AVISOS_LINKS[roleLabel]
      if (href) router.push(href)
    } else {
      if (roleLabel === "Professor") router.push("/professor/duvidas")
      else if (roleLabel === "Aluno") router.push("/aluno/duvidas")
    }
  }

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
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 rounded-xl border shadow-xl">
              <div className="p-3 border-b flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notificações</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {notifs.length === 0 ? "Nenhuma notificação" : `${notifs.length} notificação(ões)`}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhuma notificação no momento
                  </div>
                ) : (
                  notifs.map((n, i) => {
                    const isUnread = n.kind === "sys"
                      ? !n.notif.read_at
                      : n.kind === "aviso"
                        ? n.unread
                        : false
                    const title = n.kind === "sys"
                      ? n.notif.title
                      : n.kind === "aviso"
                        ? n.announcement.title
                        : n.title
                    const sub = n.kind === "sys"
                      ? n.notif.body
                      : n.kind === "aviso"
                        ? n.announcement.body.slice(0, 80) + (n.announcement.body.length > 80 ? "…" : "")
                        : n.sub
                    const icon = n.kind === "sys"
                      ? (n.notif.notifiable_type === "Event"
                          ? <Clock className="h-3.5 w-3.5 text-orange-600" />
                          : <HelpCircle className="h-3.5 w-3.5 text-blue-600" />)
                      : n.kind === "aviso"
                        ? <Megaphone className="h-3.5 w-3.5 text-primary" />
                        : <Mail className="h-3.5 w-3.5 text-yellow-600" />
                    const iconBg = n.kind === "sys"
                      ? (n.notif.notifiable_type === "Event" ? "bg-orange-100" : "bg-blue-100")
                      : n.kind === "aviso"
                        ? "bg-primary/10"
                        : "bg-yellow-100"

                    return (
                      <DropdownMenuItem
                        key={i}
                        onClick={() => handleNotifClick(n)}
                        className={`flex items-start gap-3 p-3 cursor-pointer ${isUnread ? "bg-primary/5" : ""}`}
                      >
                        <div className={`mt-0.5 rounded-full p-1.5 shrink-0 ${iconBg}`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-tight ${isUnread ? "font-semibold" : "font-medium"}`}>{title}</p>
                          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
                        </div>
                        {isUnread && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                      </DropdownMenuItem>
                    )
                  })
                )}
              </div>
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