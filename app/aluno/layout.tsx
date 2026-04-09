import { AlunoSidebar } from "@/components/aluno-sidebar"
import { UserTopbar } from "@/components/user-topbar"
import { RouteGuard } from "@/components/route-guard"

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["aluno"]}>
      <div className="flex min-h-screen bg-background">
        <AlunoSidebar />
        <div className="flex w-full flex-col">
          <UserTopbar roleLabel="Aluno" />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </RouteGuard>
  )
}
