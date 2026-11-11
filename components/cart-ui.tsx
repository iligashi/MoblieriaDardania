"use client"

import { Minus, Plus, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { SHOP, formatPrice, shippingFor } from "@/lib/shop-config"

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = SHOP.maxQuantityPerItem,
  size = "md",
  disabled,
  className,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
}) {
  const dims = size === "sm" ? "h-8 [&_button]:w-8" : size === "lg" ? "h-12 [&_button]:w-12" : "h-10 [&_button]:w-10"
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-input bg-card text-sm font-medium tabular-nums",
        dims,
        disabled && "opacity-60",
        className,
      )}
    >
      <button
        type="button"
        className="grid h-full place-items-center rounded-l-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Zvogëlo sasinë"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-7 text-center" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="grid h-full place-items-center rounded-r-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Rrit sasinë"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

export function FreeShippingProgress({ subtotal, className }: { subtotal: number; className?: string }) {
  const threshold = SHOP.freeShippingThreshold
  const remaining = Math.max(0, threshold - subtotal)
  const progress = Math.min(100, (subtotal / threshold) * 100)

  return (
    <div className={cn("rounded-2xl bg-muted/70 p-3.5", className)}>
      <p className="flex items-center gap-2 text-[13px]">
        <Truck className={cn("size-4 shrink-0", remaining === 0 ? "text-success" : "text-muted-foreground")} />
        {remaining === 0 ? (
          <span className="font-medium text-success">Keni fituar transport falas!</span>
        ) : (
          <span>
            Edhe <strong className="font-semibold">{formatPrice(remaining)}</strong> për transport falas
          </span>
        )}
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", remaining === 0 ? "bg-success" : "bg-primary")}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export function OrderTotals({ subtotal, className }: { subtotal: number; className?: string }) {
  const shipping = shippingFor(subtotal)
  return (
    <dl className={cn("space-y-2.5 text-sm", className)}>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Nëntotali</dt>
        <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Transporti</dt>
        <dd className="tabular-nums">
          {shipping === 0 ? <span className="font-medium text-success">Falas</span> : formatPrice(shipping)}
        </dd>
      </div>
      <div className="flex items-baseline justify-between border-t pt-3">
        <dt className="font-medium">Totali</dt>
        <dd className="text-xl font-semibold tabular-nums">{formatPrice(subtotal + shipping)}</dd>
      </div>
    </dl>
  )
}
