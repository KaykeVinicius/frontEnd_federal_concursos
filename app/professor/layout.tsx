import { ProfessorSidebar } from "@/components/professor-sidebar"

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <ProfessorSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
