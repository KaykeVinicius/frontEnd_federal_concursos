import { DiretorSidebar } from "@/components/diretor-sidebar"
import { UserTopbar } from "@/components/user-topbar"
import { RouteGuard } from "@/components/route-guard"

export default function CeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["ceo", "diretor"]}>
      <div className="min-h-screen lg:flex">
        <DiretorSidebar />
        <div className="flex w-full flex-col">
          <UserTopbar roleLabel="CEO" />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RouteGuard>
  )
}
