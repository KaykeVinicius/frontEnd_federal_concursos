"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  GraduationCap,
  FileText,
  CalendarDays,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ShoppingBag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { href: "/admin",                label: "Dashboard",        icon: LayoutDashboard },
  { href: "/admin/alunos",         label: "Alunos",           icon: Users },
  { href: "/admin/contratos",      label: "Contratos",        icon: FileText },
  { href: "/admin/cursos",         label: "Cursos",           icon: BookOpen },
  { href: "/admin/turmas",         label: "Turmas",           icon: Layers },
  { href: "/admin/materias",       label: "Matérias",         icon: GraduationCap },
  { href: "/admin/eventos",        label: "Eventos",          icon: CalendarDays },
  { href: "/admin/vendas-eventos", label: "Vendas de Eventos", icon: ShoppingBag },
  { href: "/admin/configuracoes",  label: "Configurações",    icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

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
          <div className="flex flex-col">
            <span className="text-sm font-bold">
              <span className="text-primary">FEDERAL</span>
              <span className="text-sidebar-foreground">CONCURSOS</span>
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href))

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
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Assistente Comercial</span>
              <span className="text-xs text-sidebar-foreground/50">
                assistente@federalcursos.com.br
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-sidebar px-3 py-2 text-sidebar-foreground lg:hidden"
      >
        {mobileOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span>{mobileOpen ? "Fechar" : "Menu"}</span>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent collapsed={false} />
      </aside>

      {/* Desktop Sidebar */}
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