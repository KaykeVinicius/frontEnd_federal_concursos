import { ProfessorSidebar } from "@/components/professor-sidebar"
import { UserTopbar } from "@/components/user-topbar"
import { RouteGuard } from "@/components/route-guard"

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["professor"]}>
      <div className="flex min-h-screen bg-background">
        <ProfessorSidebar />
        <div className="flex w-full flex-col">
          <UserTopbar roleLabel="Professor" />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </RouteGuard>
  )
}
