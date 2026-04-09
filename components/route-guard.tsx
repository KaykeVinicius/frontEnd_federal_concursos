"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const ROLE_HOME: Record<string, string> = {
  ceo: "/ceo",
  diretor: "/ceo",
  assistente_comercial: "/assistente",
  equipe_pedagogica: "/pedagogica",
  professor: "/professor",
  aluno: "/aluno",
  admin: "/admin",
}

interface RouteGuardProps {
  allowedRoles: string[]
  children: React.ReactNode
}

export function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const router = useRouter()
  const [status, setStatus] = useState<"checking" | "ok" | "redirect">("checking")

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const raw = localStorage.getItem("currentUser")

    if (!token || !raw) {
      router.replace("/login")
      setStatus("redirect")
      return
    }

    try {
      const user = JSON.parse(raw)
      if (!allowedRoles.includes(user.role)) {
        const home = ROLE_HOME[user.role] ?? "/login"
        router.replace(home)
        setStatus("redirect")
        return
      }
      setStatus("ok")
    } catch {
      router.replace("/login")
      setStatus("redirect")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === "checking") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "redirect") return null

  return <>{children}</>
}
