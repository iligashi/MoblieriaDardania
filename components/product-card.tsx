"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, Heart, Loader2, Plus, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { useCart } from "@/components/providers/cart-provider"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { Price, discountPercent } from "@/components/price"
import { QuickView } from "@/components/quick-view"
import { StockDot } from "@/components/stock-dot"
import { imageFit } from "@/lib/media"
import { cn } from "@/lib/utils"

export function ProductCard({
  product,
  category,
  priority = false,
}: {
  product: Product
  /** Display name of the product's category, shown above the title. */
  category?: string
  priority?: boolean
}) {
  const [imageError, setImageError] = useState(false)
  const [adding, setAdding] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const { addItem } = useCart()
  const { isInWishlist, toggleItem } = useWishlist()
  const wishlisted = isInWishlist(product.id)

  const href = `/products/${product.slug || product.id}`
  const images = product.images?.filter(Boolean) ?? []
  const primary = imageError || !images[0] ? "/placeholder.svg" : images[0]
  const secondary = !imageError && images[1] ? images[1] : null
  const off = discountPercent(product)
  const outOfStock = product.stock <= 0
  const label = category || product.brand

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
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

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await toggleItem(product.id)
      toast.success(wishlisted ? "U hoq nga lista e dëshirave" : "U shtua në listën e dëshirave")
    } catch {
      toast.error("Nuk u ruajt. Provoni përsëri.")
    }
  }

  return (
    <article className="group/card relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-sand/55 ring-1 ring-border/50 ring-inset">
        <Link href={href} className="absolute inset-0" aria-label={product.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primary}
            alt={product.title}
            loading={priority ? "eager" : "lazy"}
            onError={() => setImageError(true)}
            data-fit={imageFit(primary)}
            className={cn(
              "product-shot transition-[transform,opacity] duration-700 ease-out group-hover/card:scale-[1.045]",
              secondary && "lg:group-hover/card:opacity-0",
            )}
          />
          {secondary && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={secondary}
              alt=""
              loading="lazy"
              data-fit={imageFit(secondary)}
              className="product-shot opacity-0 transition-[transform,opacity] duration-700 ease-out max-lg:hidden lg:group-hover/card:scale-[1.045] lg:group-hover/card:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {off > 0 && (
            <span className="rounded-md bg-sale px-2 py-1 text-[11px] font-bold text-sale-foreground tabular-nums">−{off}%</span>
          )}
          {product.is_new && off === 0 && (
            <span className="rounded-md bg-card px-2 py-1 text-[11px] font-semibold shadow-sm">E re</span>
          )}
          {product.is_bestseller && (
            <span className="rounded-md bg-ink px-2 py-1 text-[11px] font-semibold text-ink-foreground">Më e shitur</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? "Hiq nga lista e dëshirave" : "Shto në listën e dëshirave"}
          className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-transform hover:scale-110 active:scale-95"
        >
          <Heart className={cn("size-4 transition-colors", wishlisted ? "fill-sale text-sale" : "text-foreground/70")} />
        </button>

        {outOfStock && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg bg-card/90 py-2 text-center text-xs font-semibold backdrop-blur">
            Momentalisht jo në stok
          </div>
        )}

        {/* Desktop: quick view + add, revealed on hover or keyboard focus. */}
        {!outOfStock && (
          <div className="absolute inset-x-3 bottom-3 hidden gap-2 transition-all duration-300 lg:flex lg:translate-y-3 lg:opacity-0 lg:group-hover/card:translate-y-0 lg:group-hover/card:opacity-100 lg:has-[:focus-visible]:translate-y-0 lg:has-[:focus-visible]:opacity-100">
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-card/95 text-xs font-semibold shadow-sm backdrop-blur transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Eye className="size-4" /> Shiko shpejt
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding}
              aria-label={`Shto ${product.title} në shportë`}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {adding ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />} Shto
            </button>
          </div>
        )}

        {/* Touch: one compact add button. */}
        {!outOfStock && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            aria-label={`Shto ${product.title} në shportë`}
            className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)] active:scale-95 lg:hidden"
          >
            {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-3.5">
        {label && (
          <p className="mb-1 truncate text-[10.5px] font-bold tracking-[0.14em] text-gold-ink uppercase">{label}</p>
        )}
        <Link
          href={href}
          className="line-clamp-2 text-[15px] leading-snug font-semibold transition-colors hover:text-gold-ink"
        >
          {product.title}
        </Link>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1 pt-2.5">
          <Price product={product} />
          {!outOfStock && <StockDot product={product} />}
        </div>
      </div>

      <QuickView product={product} category={category} open={quickOpen} onOpenChange={setQuickOpen} />
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col" aria-hidden>
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>
      <div className="mt-3.5 h-2.5 w-1/4 rounded bg-muted" />
      <div className="mt-2 h-4 w-4/5 rounded bg-muted" />
      <div className="mt-3 h-4 w-1/3 rounded bg-muted" />
    </div>
  )
}

export function ProductGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6", className)}>
      {children}
    </div>
  )
}
