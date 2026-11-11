import { cn } from "@/lib/utils"
import { formatPrice, unitPrice } from "@/lib/shop-config"

export function discountPercent(product: { price: number; discount_price: number | null }) {
  const final = unitPrice(product)
  return final < product.price ? Math.round(((product.price - final) / product.price) * 100) : 0
}

export function Price({
  product,
  size = "md",
  className,
}: {
  product: { price: number; discount_price: number | null }
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const final = unitPrice(product)
  const onSale = final < product.price
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums", className)}>
      <span
        className={cn(
          "font-semibold tracking-tight",
          size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-[15px]",
          onSale && "text-primary",
        )}
      >
        {formatPrice(final)}
      </span>
      {onSale && (
        <span className={cn("text-muted-foreground line-through", size === "lg" ? "text-lg" : "text-xs")}>
          {formatPrice(product.price)}
        </span>
      )}
    </div>
  )
}
