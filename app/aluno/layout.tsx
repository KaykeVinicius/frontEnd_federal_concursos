import { AlunoSidebar } from "@/components/aluno-sidebar"

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AlunoSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
