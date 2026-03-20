"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, LogOut, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserTopbarProps {
  roleLabel: string
}

export function UserTopbar({ roleLabel }: UserTopbarProps) {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setUserName(user.name || ",")
      } catch {
        setUserName(null)
      }
    }
  }, [])

  function logout() {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/30 bg-background px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700/40 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{roleLabel}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors"
            >
              <UserCircle className="h-4 w-4" />
              <span>{userName ?? "Usuário"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}