"use client"

import { useWishlist } from "@/components/providers/wishlist-provider"
import { ProductCard } from "@/components/product-card"
import { Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
  const { items, isLoading } = useWishlist()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 bg-muted rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Lista e deshirave eshte bosh</h1>
        <p className="text-muted-foreground mb-6">Shtoni produkte ne listen e deshirave duke klikuar ikonën e zemres.</p>
        <Button asChild>
          <Link href="/shop">Shko ne dyqan</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-[#f8f9fa] min-h-[60vh]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Lista e deshirave ({items.length})</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item) =>
            item.product ? (
              <ProductCard key={item.id} product={item.product} />
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}
