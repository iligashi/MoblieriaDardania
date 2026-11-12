"use client"

import { useEffect, useState } from "react"
import type { Product } from "@/lib/types"
import { ProductCard, ProductGrid } from "@/components/product-card"

const KEY = "flux:recently-viewed"
const MAX = 12

function readIds(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]")
    return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string").slice(0, MAX) : []
  } catch {
    return []
  }
}

/** Remembers that the visitor opened this product (ids only, in this browser). */
export function TrackRecentlyViewed({ productId }: { productId: string }) {
  useEffect(() => {
    try {
      const ids = [productId, ...readIds().filter((id) => id !== productId)].slice(0, MAX)
      localStorage.setItem(KEY, JSON.stringify(ids))
    } catch {
      /* storage unavailable (private mode) */
    }
  }, [productId])
  return null
}

/**
 * Products this visitor looked at before, fetched fresh so prices and stock
 * are current. Renders nothing until there is something to show.
 */
export function RecentlyViewed({ excludeId, limit = 4 }: { excludeId?: string; limit?: number }) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const ids = readIds().filter((id) => id !== excludeId).slice(0, limit)
    if (ids.length === 0) return
    const controller = new AbortController()
    fetch(`/api/products?ids=${ids.join(",")}&limit=${ids.length}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        const list: Product[] = Array.isArray(res?.data) ? res.data : []
        // Keep the visitor's order (most recent first).
        setProducts(ids.map((id) => list.find((p) => p.id === id)).filter((p): p is Product => !!p))
      })
      .catch(() => {})
    return () => controller.abort()
  }, [excludeId, limit])

  if (products.length === 0) return null

  return (
    <section className="container-page pt-20" data-reveal>
      <p className="eyebrow">Historiku juaj</p>
      <h2 className="mt-2 font-display text-3xl sm:text-4xl">Shikuar së fundmi</h2>
      <ProductGrid className="mt-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </ProductGrid>
    </section>
  )
}
