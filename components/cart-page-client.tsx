"use client"

import Link from "next/link"
import { ArrowRight, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { FreeShippingProgress, OrderTotals, QuantityStepper } from "@/components/cart-ui"
import { SHOP, formatPrice, unitPrice } from "@/lib/shop-config"

export function CartPageClient() {
  const { items, isLoading, itemCount, subtotal, updateQuantity, removeItem } = useCart()
  const run = (p: Promise<void>) => p.catch((e: Error) => toast.error(e.message))

  if (isLoading) {
    return (
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Shporta është bosh"
          description="Zbuloni koleksionin tonë dhe shtoni produktet që ju pëlqejnë."
          action={{ href: "/shop", label: "Fillo blerjen" }}
        />
      </div>
    )
  }

  return (
    <div className="container-page pt-8 lg:pt-12">
      <h1 className="font-display text-5xl leading-none sm:text-6xl">Shporta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {itemCount} {itemCount === 1 ? "artikull" : "artikuj"}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <ul className="divide-y border-y">
          {items.map((item) => {
            const p = item.product
            if (!p) return null
            const price = unitPrice(p)
            const href = `/products/${p.slug || p.id}`
            return (
              <li key={item.id} className="flex gap-4 py-6 sm:gap-6">
                <Link href={href} className="size-24 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images?.[0] || "/placeholder.svg"}
                    alt={p.title}
                    className="size-full object-contain p-2 mix-blend-multiply"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {p.brand && <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{p.brand}</p>}
                      <Link href={href} className="line-clamp-2 font-medium hover:text-primary">
                        {p.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                        {formatPrice(price)}
                        {price < p.price && <span className="ml-2 text-xs line-through">{formatPrice(p.price)}</span>}
                      </p>
                    </div>
                    <p className="font-semibold tabular-nums">{formatPrice(price * item.quantity)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <QuantityStepper
                      value={item.quantity}
                      max={Math.min(p.stock, SHOP.maxQuantityPerItem)}
                      onChange={(q) => run(updateQuantity(item.id, q))}
                    />
                    <button
                      type="button"
                      onClick={() => run(removeItem(item.id))}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-4" /> <span className="max-sm:sr-only">Hiq</span>
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-3xl">Përmbledhja</h2>
            <FreeShippingProgress subtotal={subtotal} className="mt-5" />
            <OrderTotals subtotal={subtotal} className="mt-5" />
            <Button asChild size="xl" className="mt-6 w-full">
              <Link href="/checkout">
                Vazhdo te pagesa <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link href="/shop">Vazhdo blerjen</Link>
            </Button>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" /> Pagesa në dorëzim · Kthim brenda 48 orëve
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
