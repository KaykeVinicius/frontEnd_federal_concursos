"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  BookOpen,
  CalendarDays,
  ShoppingBag,
  Menu,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { href: "/assistente", label: "Início", icon: Home },
  { href: "/assistente/alunos", label: "Alunos", icon: Users },
  { href: "/assistente/cursos-disponiveis", label: "Cursos Disponíveis", icon: BookOpen },
  { href: "/assistente/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/assistente/vendas-eventos", label: "Venda de Eventos", icon: ShoppingBag },
]

export function AssistenteSidebar() {
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
            <span className="text-xs text-sidebar-foreground/50">Assistente</span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/assistente" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
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
        className="fixed top-4 left-4 z-50 flex cursor-pointer items-center gap-2 rounded-lg bg-sidebar px-3 py-2 text-sidebar-foreground lg:hidden"
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