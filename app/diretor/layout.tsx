import { DiretorSidebar } from "@/components/diretor-sidebar"
import { RouteGuard } from "@/components/route-guard"

export default function DiretorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["ceo", "diretor"]}>
      <div className="flex min-h-screen bg-background">
        <DiretorSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </RouteGuard>
  )
}
