import { AdminSidebar } from "@/components/admin-sidebar"
import { UserTopbar } from "@/components/user-topbar"

export default function AssistenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <AdminSidebar />
      <div className="flex w-full flex-col">
        <UserTopbar roleLabel="Assistente Comercial" />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
