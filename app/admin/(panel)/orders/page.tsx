import type { Metadata } from "next"
import { Suspense } from "react"
import { requireAdminPage } from "@/lib/auth/admin"
import { PageHeader } from "@/components/admin/admin-ui"
import { OrdersTable } from "@/components/admin/orders-table"
import type { Order } from "@/lib/types"

export const metadata: Metadata = { title: "Porositë" }

export default async function AdminOrdersPage() {
  const { db } = await requireAdminPage()
  const { data, error } = await db
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(500)
  if (error) console.error("[admin] orders:", error.message)

  const orders = ((data ?? []) as (Order & { order_items?: Order["items"] })[]).map((o) => ({
    ...o,
    items: o.order_items ?? [],
  }))

  return (
    <>
      <PageHeader title="Porositë" description="Ndiqni dhe përditësoni statusin e çdo porosie." />
      <Suspense>
        <OrdersTable initialOrders={orders} />
      </Suspense>
    </>
  )
}
