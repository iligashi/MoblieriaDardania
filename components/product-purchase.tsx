"use client"

import { useEffect, useState } from "react"
import { CalendarClock, Loader2, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { useCart } from "@/components/providers/cart-provider"
import { Price } from "@/components/price"
import { deliveryWindow, formatDay } from "@/lib/media"

/**
 * "Order today, get it by …" — computed in the visitor's browser so the date
 * follows their clock (Kosovo time), not the server's.
 */
export function DeliveryEstimate() {
  const [text, setText] = useState<string | null>(null)
  useEffect(() => {
    const { start, end } = deliveryWindow()
    setText(`${formatDay(start)} – ${formatDay(end)}`)
  }, [])

  return (
    <p className="flex items-start gap-3 rounded-xl bg-success-soft/70 px-4 py-3 text-sm">
      <CalendarClock className="mt-0.5 size-4 shrink-0 text-success" />
      <span>
        <span className="font-semibold">Porositni sot, merreni </span>
        <span className="font-semibold text-success">{text ?? "brenda 24–48 orëve"}</span>
        <span className="block text-xs text-muted-foreground">Dërgesë në gjithë Kosovën.</span>
      </span>
    </p>
  )
}

/** Phone-only bar that keeps price and "add to cart" under the thumb. */
export function StickyAddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const outOfStock = product.stock <= 0

  const add = async () => {
    if (outOfStock || adding) return
    setAdding(true)
    try {
      await addItem(product, 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Diçka shkoi gabim")
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="container-page flex h-16 items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{product.title}</p>
          <Price product={product} size="sm" />
        </div>
        <button
          type="button"
          onClick={add}
          disabled={outOfStock || adding}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors active:scale-[0.98] disabled:opacity-50"
        >
          {adding ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}
          {outOfStock ? "Jo në stok" : "Shto në shportë"}
        </button>
      </div>
    </div>
  )
}
