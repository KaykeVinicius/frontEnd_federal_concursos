"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarDays,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Settings,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/professor", label: "Inicio", icon: LayoutDashboard },
  { href: "/professor/turmas", label: "Minhas Turmas", icon: Users },
  { href: "/professor/cursos", label: "Cursos", icon: BookOpen },
  { href: "/professor/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/professor/configuracoes", label: "Configurações", icon: Settings },
]

export function ProfessorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false) // ✅ ADICIONADO
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      const user = JSON.parse(stored)
      setUserName(user.name || "Professor")
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Image
            src="/images/logo.jpg"
            alt="Federal Cursos"
            width={160}
            height={50}
            className="rounded"
            style={{ height: 40, width: "auto" }}
          />
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="border-b border-sidebar-border px-4 py-3">
          <p className="text-xs text-sidebar-foreground/60">Bem-vindo(a),</p>
          <p className="truncate font-medium text-sidebar-foreground">{userName}</p>
          <p className="text-xs text-primary">Professor</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2" : "",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-4">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed ? "justify-center px-2" : ""
          )}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && "Sair"}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 flex items-center gap-2 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <ChevronLeft className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        <span>{mobileOpen ? "Fechar" : "Menu"}</span>
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent collapsed={false} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 transition-all duration-300 lg:block",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>
    </>
  )
}