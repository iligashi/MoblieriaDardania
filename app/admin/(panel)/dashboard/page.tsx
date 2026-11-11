import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, ArrowUpRight, Clock, Package, Plus, ShoppingCart, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { requireAdminPage } from "@/lib/auth/admin"
import { Button } from "@/components/ui/button"
import { KpiCard, PageHeader, Panel, Thumb, relativeDate } from "@/components/admin/admin-ui"
import { RevenueChart, type RevenuePoint } from "@/components/admin/revenue-chart"
import { StatusPill } from "@/components/account/account-ui"
import { SHOP, formatPrice } from "@/lib/shop-config"
import type { Order, Product } from "@/lib/types"

export const metadata: Metadata = { title: "Paneli" }

const DAY = 86_400_000

export default async function AdminDashboardPage() {
  const { db } = await requireAdminPage()
  const since = new Date(Date.now() - 60 * DAY).toISOString()

  const [ordersRes, recentRes, productsRes] = await Promise.all([
    db
      .from("orders")
      .select("id, total, furniture_price, status, created_at, order_items(product_id, product_title, product_image, quantity, subtotal)")
      .gte("created_at", since)
      .order("created_at", { ascending: true }),
    db
      .from("orders")
      .select("id, order_number, customer_name, total, furniture_price, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    db.from("products").select("id, title, slug, images, stock, is_active, price, discount_price"),
  ])

  type WindowOrder = Pick<Order, "id" | "total" | "furniture_price" | "status" | "created_at"> & {
    order_items: { product_id: string | null; product_title: string; product_image: string | null; quantity: number; subtotal: number }[] | null
  }
  const windowOrders = ((ordersRes.data as WindowOrder[]) ?? []).filter((o) => o.status !== "cancelled")
  const recent = (recentRes.data as Order[]) ?? []
  const products = (productsRes.data as Product[]) ?? []

  const now = Date.now()
  const amount = (o: { total: number | null; furniture_price: number | null }) => Number(o.total ?? o.furniture_price ?? 0)
  const current = windowOrders.filter((o) => now - new Date(o.created_at).getTime() <= 30 * DAY)
  const previous = windowOrders.filter((o) => now - new Date(o.created_at).getTime() > 30 * DAY)
  const revenue = current.reduce((s, o) => s + amount(o), 0)
  const prevRevenue = previous.reduce((s, o) => s + amount(o), 0)
  const change = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null
  const aov = current.length ? revenue / current.length : 0

  // Daily series for the last 30 days (zero-filled so the line never skips a day).
  const series: RevenuePoint[] = []
  for (let i = 29; i >= 0; i--) {
    const key = new Date(now - i * DAY).toISOString().slice(0, 10)
    series.push({ date: key, revenue: 0, orders: 0 })
  }
  const byDay = new Map(series.map((p) => [p.date, p]))
  for (const o of current) {
    const point = byDay.get(o.created_at.slice(0, 10))
    if (point) {
      point.revenue += amount(o)
      point.orders += 1
    }
  }

  // Top sellers in the last 30 days.
  const tally = new Map<string, { title: string; image: string | null; qty: number; revenue: number }>()
  for (const o of current) {
    for (const item of o.order_items ?? []) {
      const key = item.product_id ?? item.product_title
      const row = tally.get(key) ?? { title: item.product_title, image: item.product_image, qty: 0, revenue: 0 }
      row.qty += item.quantity
      row.revenue += Number(item.subtotal)
      tally.set(key, row)
    }
  }
  const topSellers = [...tally.values()].sort((a, b) => b.qty - a.qty).slice(0, 5)

  const active = products.filter((p) => p.is_active)
  const lowStock = active
    .filter((p) => p.stock <= SHOP.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6)
  const { count: pendingCount } = await db.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending")

  return (
    <>
      <PageHeader
        title="Paneli"
        description="Një pamje e shpejtë e dyqanit në 30 ditët e fundit."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus /> Produkt i ri
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          label="Të ardhurat"
          value={formatPrice(revenue)}
          icon={Wallet}
          tone="primary"
          hint={
            change === null ? (
              "30 ditët e fundit"
            ) : (
              <span className={change >= 0 ? "text-success" : "text-destructive"}>
                {change >= 0 ? <TrendingUp className="mr-1 inline size-3" /> : <TrendingDown className="mr-1 inline size-3" />}
                {change >= 0 ? "+" : ""}
                {change.toFixed(0)}% nga muaji i kaluar
              </span>
            )
          }
        />
        <KpiCard label="Porositë" value={String(current.length)} icon={ShoppingCart} hint={`${previous.length} muajin e kaluar`} />
        <KpiCard
          label="Në pritje"
          value={String(pendingCount ?? 0)}
          icon={Clock}
          tone={(pendingCount ?? 0) > 0 ? "warning" : "default"}
          hint={
            <Link href="/admin/orders?status=pending" className="underline-offset-4 hover:underline">
              Shqyrto porositë
            </Link>
          }
        />
        <KpiCard label="Vlera mesatare" value={formatPrice(aov)} icon={Package} hint={`${active.length} produkte aktive`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
        <Panel title="Të ardhurat ditore" description="Pa porositë e anuluara">
          <RevenueChart data={series} />
        </Panel>

        <Panel title="Më të shiturat" description="30 ditët e fundit">
          {topSellers.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Ende pa shitje këtë muaj.</p>
          ) : (
            <ol className="space-y-3">
              {topSellers.map((p, i) => (
                <li key={p.title + i} className="flex items-center gap-3">
                  <span className="w-4 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                  <Thumb src={p.image} />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm">{p.title}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{p.qty} copë</span>
                  </span>
                  <span className="text-sm font-medium tabular-nums">{formatPrice(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
        <Panel
          title="Porositë e fundit"
          action={
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              Të gjitha <ArrowUpRight className="size-3.5" />
            </Link>
          }
          bodyClassName="p-2 sm:p-3"
        >
          {recent.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Ende nuk ka porosi.</p>
          ) : (
            <ul>
              {recent.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders?open=${o.id}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-2xl px-3 py-3 transition-colors hover:bg-muted sm:grid-cols-[1.2fr_1fr_auto_auto]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{o.customer_name || "Klient"}</span>
                      <span className="font-mono text-xs text-muted-foreground">{o.order_number || o.id.slice(0, 8)}</span>
                    </span>
                    <span className="hidden text-xs text-muted-foreground sm:block">{relativeDate(o.created_at)}</span>
                    <StatusPill status={o.status} />
                    <span className="text-right text-sm font-semibold tabular-nums max-sm:col-start-2">
                      {formatPrice(amount(o))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Stok i ulët"
          description={`${SHOP.lowStockThreshold} copë ose më pak`}
          action={lowStock.length > 0 ? <AlertTriangle className="size-4 text-warning-strong" /> : undefined}
        >
          {lowStock.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Të gjitha produktet kanë stok të mjaftueshëm.</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-3 rounded-xl hover:opacity-80">
                    <Thumb src={p.images?.[0]} />
                    <span className="line-clamp-1 flex-1 text-sm">{p.title}</span>
                    <span
                      className={
                        p.stock === 0
                          ? "rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive tabular-nums"
                          : "rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning-strong tabular-nums"
                      }
                    >
                      {p.stock === 0 ? "Mbaroi" : `${p.stock} copë`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
