import type { Metadata } from "next"
import { requireAdminPage } from "@/lib/auth/admin"
import { AdminShell } from "@/components/admin/admin-shell"
import { logoutAction } from "./actions"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Flux Dekor" },
  robots: { index: false, follow: false },
}

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { db, user } = await requireAdminPage()
  const { count } = await db.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending")

  return (
    <AdminShell email={user.email ?? "admin"} badges={{ pendingOrders: count ?? 0 }} logoutAction={logoutAction}>
      {children}
    </AdminShell>
  )
}
