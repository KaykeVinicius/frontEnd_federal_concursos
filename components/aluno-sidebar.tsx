"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  GraduationCap,
  CalendarDays,
  SlidersHorizontal,
  MessageCircle,
  X,
  Menu,
  Radio,
} from "lucide-react"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/aluno",               label: "Painel",          icon: Home },
  { href: "/aluno/ao-vivo",       label: "Ao Vivo",         icon: Radio },
  { href: "/aluno/meus-cursos",   label: "Meus Cursos",     icon: GraduationCap },
  { href: "/aluno/eventos",       label: "Meus Eventos",    icon: CalendarDays },
  { href: "/aluno/configuracoes", label: "Configurações",   icon: SlidersHorizontal },
]

export function AlunoSidebar() {
  const pathname  = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed]   = useState(false)
  const [userName, setUserName]     = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      const user = JSON.parse(stored)
      setUserName(user.name || "Aluno")
    }
  }, [])

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
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
            width={140}
            height={40}
            className="rounded"
            style={{ height: 36, width: "auto" }}
          />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* User */}
      {!collapsed && (
        <div className="border-b border-sidebar-border px-4 py-2.5">
          <p className="text-[11px] text-sidebar-foreground/50 uppercase tracking-wide">Bem-vindo(a)</p>
          <p className="truncate text-sm font-semibold text-sidebar-foreground">{userName}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/aluno" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        {/* Comunidade WhatsApp */}
        <a
          href="https://chat.whatsapp.com/LINK_DO_GRUPO_AQUI"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? "Comunidade" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            "text-[#25d366] hover:bg-[#25d366]/10",
            collapsed ? "justify-center" : ""
          )}
        >
          <MessageCircle style={{ width: 18, height: 18 }} className="shrink-0" />
          {!collapsed && (
            <span className="flex items-center gap-2">
              Comunidade
              <span className="rounded-full bg-[#25d366]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#25d366]">
                WhatsApp
              </span>
            </span>
          )}
        </a>
      </nav>

    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-3.5 z-50 flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground shadow-md lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

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
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>
    </>
  )
}
