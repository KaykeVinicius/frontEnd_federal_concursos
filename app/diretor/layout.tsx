"use client"

import { DiretorSidebar } from "@/components/diretor-sidebar"

export default function DiretorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <DiretorSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
