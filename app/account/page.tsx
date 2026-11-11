"use client"

import Link from "next/link"
import { ArrowUpRight, Heart, Package, UserRound } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { AccountShell, StatusPill } from "@/components/account/account-ui"
import { useMyOrders } from "@/components/account/use-orders"
import { formatPrice } from "@/lib/shop-config"

export default function AccountPage() {
  const { customer } = useAuth()
  const { itemCount } = useWishlist()
  const { orders, loading } = useMyOrders()
  const latest = orders[0]
  const greeting = customer?.first_name ? `Përshëndetje, ${customer.first_name}` : "Llogaria ime"

  const cards = [
    { href: "/account/orders", icon: Package, title: "Porositë", value: loading ? "…" : String(orders.length) },
    { href: "/wishlist", icon: Heart, title: "Të ruajturat", value: String(itemCount) },
    { href: "/account/profile", icon: UserRound, title: "Profili", value: customer?.phone ? "I plotë" : "Plotësoni" },
  ]

  return (
    <AccountShell title={greeting}>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-3xl border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-full bg-muted">
                <c.icon className="size-[18px]" />
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="mt-6 font-display text-4xl leading-none">{c.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.title}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Porosia e fundit</h2>
          {orders.length > 0 && (
            <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">
              Të gjitha
            </Link>
          )}
        </div>
        {loading ? (
          <div className="mt-4 h-16 animate-pulse rounded-2xl bg-muted" />
        ) : latest ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted/60 p-4">
            <div>
              <p className="font-mono text-sm font-semibold">{latest.order_number || `#${latest.id.slice(0, 8)}`}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(latest.created_at).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <StatusPill status={latest.status} />
            <p className="font-semibold tabular-nums">{formatPrice(latest.total ?? latest.furniture_price)}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Nuk keni ende porosi.{" "}
            <Link href="/shop" className="font-medium text-foreground underline-offset-4 hover:underline">
              Filloni blerjen
            </Link>
          </p>
        )}
      </div>
    </AccountShell>
  )
}
