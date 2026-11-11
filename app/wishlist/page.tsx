"use client"

import { Heart } from "lucide-react"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { ProductCard, ProductCardSkeleton, ProductGrid } from "@/components/product-card"
import { EmptyState } from "@/components/empty-state"

export default function WishlistPage() {
  const { items, isLoading } = useWishlist()
  const products = items.flatMap((i) => (i.product ? [i.product] : []))

  return (
    <div className="container-page pt-8 lg:pt-12">
      <p className="eyebrow">Të ruajturat</p>
      <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">Lista e dëshirave</h1>
      {!isLoading && products.length > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">{products.length} produkte të ruajtura</p>
      )}

      <div className="mt-10">
        {isLoading ? (
          <ProductGrid>
            {[0, 1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </ProductGrid>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Lista është bosh"
            description="Klikoni zemrën te çdo produkt për ta ruajtur këtu dhe për ta gjetur më lehtë më vonë."
            action={{ href: "/shop", label: "Shfleto produktet" }}
          />
        ) : (
          <ProductGrid>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        )}
      </div>
    </div>
  )
}
