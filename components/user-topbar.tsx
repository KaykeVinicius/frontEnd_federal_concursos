"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  LogOut,
  User,
  Settings,
  Bell,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface UserTopbarProps {
  roleLabel: string
}

export function UserTopbar({ roleLabel }: UserTopbarProps) {
  const router = useRouter()
  const [userName, setUserName] = useState("Usuário")

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setUserName(user.name || "Usuário")
      } catch {}
    }
  }, [])

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

          {/* 🔔 NOTIFICAÇÕES */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex items-center justify-center rounded-xl p-2 hover:bg-muted/60 transition-all cursor-pointer">
                <Bell className="h-5 w-5 text-muted-foreground" />

                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                  3
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 rounded-xl border shadow-xl">
              <div className="p-3 border-b">
                <p className="text-sm font-medium">Notificações</p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <span className="text-sm font-medium">
                    Nova matrícula realizada
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Um novo aluno foi cadastrado
                  </span>
                </DropdownMenuItem>
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