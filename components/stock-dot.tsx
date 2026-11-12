import type { Product } from "@/lib/types"
import { SHOP } from "@/lib/shop-config"
import { cn } from "@/lib/utils"

export function stockState(product: Pick<Product, "stock">) {
  if (product.stock <= 0) return { tone: "out", label: "Jo në stok" } as const
  if (product.stock <= SHOP.lowStockThreshold) return { tone: "low", label: `Vetëm ${product.stock} copë` } as const
  return { tone: "in", label: "Në stok" } as const
}

export function StockDot({ product, className }: { product: Pick<Product, "stock">; className?: string }) {
  const state = stockState(product)
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground", className)}>
      <span
        className={cn(
          "size-1.5 rounded-full",
          state.tone === "out" ? "bg-destructive" : state.tone === "low" ? "animate-pulse bg-warning" : "bg-success",
        )}
      />
      {state.label}
    </span>
  )
}
