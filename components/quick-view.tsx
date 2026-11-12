"use client"

import { useState } from "react"
import Link from "next/link"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { ArrowRight, Truck, X } from "lucide-react"
import type { Product } from "@/lib/types"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { Price, discountPercent } from "@/components/price"
import { StockDot } from "@/components/stock-dot"
import { SHOP, formatPrice } from "@/lib/shop-config"
import { imageFit } from "@/lib/media"
import { cn } from "@/lib/utils"

/** A fast look at a product without leaving the listing. */
export function QuickView({
  product,
  category,
  open,
  onOpenChange,
}: {
  product: Product
  category?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const images = product.images?.filter(Boolean).length ? product.images.filter(Boolean) : ["/placeholder.svg"]
  const [index, setIndex] = useState(0)
  const off = discountPercent(product)
  const href = `/products/${product.slug || product.id}`
  const current = images[Math.min(index, images.length - 1)]

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[min(960px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-card shadow-[var(--shadow-lift)] outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 md:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-3 bg-sand/45 p-4 sm:p-5">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-sand/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={current}
                src={current}
                alt={product.title}
                data-fit={imageFit(current)}
                className="product-shot animate-in duration-300 fade-in-0"
              />
              {off > 0 && (
                <span className="absolute top-3 left-3 rounded-md bg-sale px-2 py-1 text-xs font-bold text-sale-foreground">
                  −{off}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {images.slice(0, 6).map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Fotoja ${i + 1}`}
                    aria-current={i === index}
                    className={cn(
                      "relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg bg-sand/60 ring-1 transition",
                      i === index ? "ring-2 ring-foreground" : "ring-border opacity-70 hover:opacity-100",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" data-fit={imageFit(src)} className="product-shot !p-1" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col p-6 sm:p-8">
            {(category || product.brand) && (
              <p className="text-[11px] font-bold tracking-[0.14em] text-gold-ink uppercase">{category || product.brand}</p>
            )}
            <DialogPrimitive.Title className="mt-2 font-display text-3xl leading-tight text-balance">
              {product.title}
            </DialogPrimitive.Title>
            <Price product={product} size="lg" className="mt-4" />
            <StockDot product={product} className="mt-3 text-xs" />
            <DialogPrimitive.Description className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {product.short_description || product.description || "Shikoni detajet e plota të produktit."}
            </DialogPrimitive.Description>

            <div className="mt-6">
              <AddToCartButton product={product} />
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="size-4 text-gold-ink" />
              Dërgesë 24–48 orë · falas mbi {formatPrice(SHOP.freeShippingThreshold)}
            </p>

            <Link
              href={href}
              onClick={() => onOpenChange(false)}
              className="group mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Shiko të gjitha detajet
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <DialogPrimitive.Close
            className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-colors hover:bg-muted"
            aria-label="Mbyll"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
