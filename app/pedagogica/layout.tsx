import { PedagogicaSidebar } from "@/components/pedagogica-sidebar"
import { UserTopbar } from "@/components/user-topbar"
import { RouteGuard } from "@/components/route-guard"

export default function PedagogicaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["equipe_pedagogica"]}>
      <div className="min-h-screen lg:flex">
        <PedagogicaSidebar />
        <div className="flex w-full flex-col">
          <UserTopbar roleLabel="Equipe Pedagógica" />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RouteGuard>
  )
}
