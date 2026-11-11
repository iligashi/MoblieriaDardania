"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { useCart } from "@/components/providers/cart-provider"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { Price, discountPercent } from "@/components/price"
import { SHOP } from "@/lib/shop-config"
import { cn } from "@/lib/utils"

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [imageError, setImageError] = useState(false)
  const [adding, setAdding] = useState(false)
  const { addItem } = useCart()
  const { isInWishlist, toggleItem } = useWishlist()
  const wishlisted = isInWishlist(product.id)

  const href = `/products/${product.slug || product.id}`
  const images = product.images?.filter(Boolean) ?? []
  const primary = imageError || !images[0] ? "/placeholder.svg" : images[0]
  const secondary = !imageError && images[1] ? images[1] : null
  const off = discountPercent(product)
  const outOfStock = product.stock <= 0
  const lowStock = !outOfStock && product.stock <= SHOP.lowStockThreshold

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
    <article className="group relative flex flex-col">
      <Link
        href={href}
        className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-muted/70 ring-1 ring-border/60 ring-inset"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primary}
          alt={product.title}
          loading={priority ? "eager" : "lazy"}
          onError={() => setImageError(true)}
          className={cn(
            "absolute inset-0 size-full object-contain p-5 mix-blend-multiply transition-all duration-700 ease-out group-hover:scale-[1.04]",
            secondary && "group-hover:opacity-0",
          )}
        />
        {secondary && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={secondary}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-contain p-5 opacity-0 mix-blend-multiply transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
          />
        )}

        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {off > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground tabular-nums">
              −{off}%
            </span>
          )}
          {product.is_new && (
            <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold shadow-sm">E re</span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-ink-foreground">Jo në stok</span>
          )}
        </div>

        {!outOfStock && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            aria-label={`Shto ${product.title} në shportë`}
            className="absolute right-3 bottom-3 flex h-10 items-center gap-1.5 rounded-full bg-ink pr-4 pl-3 text-xs font-semibold text-ink-foreground shadow-[var(--shadow-lift)] transition-all duration-300 hover:bg-primary focus-visible:translate-y-0 focus-visible:opacity-100 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 max-lg:w-10 max-lg:justify-center max-lg:p-0"
          >
            {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            <span className="max-lg:sr-only">Shto</span>
          </button>
        )}
      </Link>

      <button
        type="button"
        onClick={handleWishlist}
        aria-pressed={wishlisted}
        aria-label={wishlisted ? "Hiq nga lista e dëshirave" : "Shto në listën e dëshirave"}
        className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-transform hover:scale-110"
      >
        <Heart className={cn("size-4 transition-colors", wishlisted ? "fill-primary text-primary" : "text-foreground/70")} />
      </button>

      <div className="flex flex-1 flex-col px-0.5 pt-3">
        {product.brand && (
          <p className="mb-0.5 truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{product.brand}</p>
        )}
        <Link href={href} className="line-clamp-2 text-sm leading-snug font-medium transition-colors hover:text-primary">
          {product.title}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Price product={product} />
          {lowStock && <span className="text-[11px] font-medium text-warning-strong">Vetëm {product.stock} copë</span>}
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
      <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-4 w-1/4 animate-pulse rounded bg-muted" />
    </div>
  )
}

export function ProductGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4", className)}>{children}</div>
  )
}
