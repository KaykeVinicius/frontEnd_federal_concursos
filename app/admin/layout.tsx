import { AdminSidebar } from "@/components/admin-sidebar"
import { UserTopbar } from "@/components/user-topbar"
import { RouteGuard } from "@/components/route-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["admin", "ceo", "assistente_comercial"]}>
      <div className="min-h-screen bg-background lg:flex">
        <AdminSidebar />
        <div className="flex w-full flex-col">
          <UserTopbar roleLabel="Assistente Comercial" />
          <main className="flex-1 lg:pl-64">
            <div className="p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
          </main>
        </div>
      </div>
    </RouteGuard>
  )
}
