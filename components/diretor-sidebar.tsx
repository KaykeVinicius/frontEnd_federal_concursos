"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  GraduationCap,
  FileText,
  CalendarDays,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/diretor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/diretor/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/diretor/relatorios", label: "Relatorios", icon: BarChart3 },
  { href: "/diretor/alunos", label: "Alunos", icon: Users },
  { href: "/diretor/cursos", label: "Cursos", icon: BookOpen },
  { href: "/diretor/turmas", label: "Turmas", icon: Layers },
  { href: "/diretor/materias", label: "Materias", icon: GraduationCap },
  { href: "/diretor/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/diretor/contratos", label: "Contratos", icon: FileText },
  { href: "/diretor/configuracoes", label: "Configuracoes", icon: Settings },
]

export function DiretorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
        <Image
          src="/images/logo.jpg"
          alt="Federal Cursos"
          width={160}
          height={50}
          className="rounded"
          style={{ height: 40, width: "auto" }}
        />
      </div>

      {/* User Info */}
      <div className="border-b border-sidebar-border px-4 py-3">
        <p className="text-sm font-medium text-sidebar-foreground">Diretor Geral</p>
        <p className="text-xs text-sidebar-foreground/60">Acesso Total</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-sidebar p-2 text-sidebar-foreground lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle menu</span>
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <SidebarContent />
      </aside>
    </>
  )
}
