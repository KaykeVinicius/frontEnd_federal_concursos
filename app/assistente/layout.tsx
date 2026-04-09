import { AssistenteSidebar } from "@/components/assistente-sidebar"
import { UserTopbar } from "@/components/user-topbar"
import { RouteGuard } from "@/components/route-guard"

export default function AssistenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["assistente_comercial"]}>
      <div className="min-h-screen lg:h-screen lg:flex lg:overflow-hidden">
        <AssistenteSidebar />
        <div className="flex w-full flex-col lg:overflow-hidden">
          <UserTopbar roleLabel="Assistente Comercial" />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </RouteGuard>
  )
}
