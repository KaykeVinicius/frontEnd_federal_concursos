"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BookMarked,
  Layers,
  GraduationCap,
  FileText,
  CalendarDays,
  DollarSign,
  BarChart3,
  Settings,
  Menu,
  X,
  ShieldCheck,
  Megaphone,
  CalendarRange,
  Briefcase,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/ceo",             label: "Dashboard",     icon: LayoutDashboard },
  { href: "/ceo/carreiras",   label: "Carreiras",     icon: Briefcase },
  { href: "/ceo/materias",    label: "Matérias",      icon: BookMarked },
  { href: "/ceo/cursos",      label: "Cursos",        icon: BookOpen },
  { href: "/ceo/turmas",      label: "Turmas",        icon: Layers },
  { href: "/ceo/alunos",      label: "Alunos",        icon: Users },
  { href: "/ceo/contratos",   label: "Contratos",     icon: FileText },
  { href: "/ceo/financeiro",  label: "Financeiro",    icon: DollarSign },
  { href: "/ceo/eventos",     label: "Eventos",       icon: CalendarDays },
  { href: "/ceo/agenda",      label: "Agenda",        icon: CalendarRange },
  { href: "/ceo/avisos",      label: "Avisos",        icon: Megaphone },
  { href: "/ceo/usuarios",    label: "Usuários",      icon: Users },
  { href: "/ceo/relatorios",  label: "Relatórios",    icon: BarChart3 },
  { href: "/ceo/logs-acesso", label: "Logs de Acesso", icon: ShieldCheck },
  { href: "/ceo/configuracoes", label: "Configurações", icon: Settings },
]

export function DiretorSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      {/* Header with Logo and Toggle */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {collapsed ? (
          <Image
            src="/images/logofederalsemfundo.jpeg"
            alt="Federal Cursos"
            width={32}
            height={32}
            className="rounded object-contain"
            style={{ height: 32, width: 32 }}
          />
        ) : (
          <Image
            src="/images/logofederalsemfundo.jpeg"
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
          className="flex h-8 w-8 items-center justify-center rounded-lg p-0 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Menu className="h-4 w-4" />
        </Button>
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
                collapsed ? "justify-center px-2" : "",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

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
        <SidebarContent collapsed={false} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn("hidden shrink-0 transition-all duration-300 lg:block", collapsed ? "w-16" : "w-64")}>
        <SidebarContent collapsed={collapsed} />
      </aside>
    </>
  )
}
