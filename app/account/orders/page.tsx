"use client"

import Link from "next/link"
import { Package } from "lucide-react"
import { AccountShell, StatusPill } from "@/components/account/account-ui"
import { useMyOrders } from "@/components/account/use-orders"
import { EmptyState } from "@/components/empty-state"
import { PAYMENT_LABELS } from "@/lib/order-status"
import { formatPrice } from "@/lib/shop-config"

export default function OrdersPage() {
  const { orders, loading, error } = useMyOrders()

  return (
    <AccountShell title="Porositë e mia">
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Nuk u ngarkuan porositë" description="Rifreskoni faqen ose provoni pak më vonë." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Asnjë porosi ende"
          description="Kur të bëni porosinë e parë, do ta gjeni këtu bashkë me statusin e saj."
          action={{ href: "/shop", label: "Filloni blerjen" }}
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const items = order.items ?? []
            const count = items.reduce((n, i) => n + i.quantity, 0)
            return (
              <li key={order.id} className="rounded-3xl border bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold">{order.order_number || `#${order.id.slice(0, 8)}`}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("sq-AL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {count > 0 && ` · ${count} ${count === 1 ? "artikull" : "artikuj"}`}
                    </p>
                  </div>
                  <StatusPill status={order.status} />
                </div>

                {items.length > 0 ? (
                  <ul className="mt-5 space-y-3">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3">
                        <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.product_image || "/placeholder.svg"}
                            alt=""
                            className="size-full object-contain p-1 mix-blend-multiply"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          {item.product_id ? (
                            <Link href={`/products/${item.product_id}`} className="line-clamp-1 text-sm hover:text-primary">
                              {item.product_title}
                            </Link>
                          ) : (
                            <span className="line-clamp-1 text-sm">{item.product_title}</span>
                          )}
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {item.quantity} × {formatPrice(item.price)}
                          </span>
                        </span>
                        <span className="text-sm tabular-nums">{formatPrice(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  order.furniture_title && <p className="mt-4 text-sm">{order.furniture_title}</p>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm">
                  <span className="text-muted-foreground">{PAYMENT_LABELS[order.payment_method] ?? ""}</span>
                  <span>
                    <span className="mr-2 text-muted-foreground">Totali</span>
                    <span className="font-semibold tabular-nums">{formatPrice(order.total ?? order.furniture_price)}</span>
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </AccountShell>
  )
}
