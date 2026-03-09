"use client"

import { useState } from "react"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { useCart } from "@/components/providers/cart-provider"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addItem } = useCart()
  const { isInWishlist, toggleItem } = useWishlist()
  const wishlisted = isInWishlist(product.id)

  const imageUrl = product.images?.[0] || "/placeholder.svg"
  const hasDiscount = product.discount_price && product.discount_price < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0
  const displayPrice = hasDiscount ? product.discount_price! : product.price
  const slug = product.slug || product.id

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock <= 0 || isAddingToCart) return
    setIsAddingToCart(true)
    try {
      await addItem(product, 1)
      toast.success(`${product.title} u shtua ne shporte`)
    } catch {
      toast.error("Dicka shkoi gabim")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await toggleItem(product.id)
      toast.success(wishlisted ? "U hoq nga lista e deshirave" : "U shtua ne listen e deshirave")
    } catch {
      toast.error("Kycu per te perdorur listen e deshirave")
    }
  }

  return (
    <div className="group relative bg-white rounded-lg border border-border/60 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-border">
      {/* Image Section */}
      <Link href={`/products/${slug}`} className="block relative aspect-square overflow-hidden bg-[#f8f9fa]">
        <img
          src={imageError ? "/placeholder.svg" : imageUrl}
          alt={product.title}
          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="inline-flex items-center justify-center h-6 px-2 rounded bg-red-600 text-white text-xs font-bold">
              -{discountPercent}%
            </span>
          )}
          {product.is_new && !hasDiscount && (
            <span className="inline-flex items-center justify-center h-6 px-2 rounded bg-blue-600 text-white text-xs font-bold">
              E RE
            </span>
          )}
          {product.stock <= 0 && (
            <span className="inline-flex items-center justify-center h-6 px-2 rounded bg-gray-800 text-white text-xs font-bold">
              JO NE STOK
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
            )}
          />
        </button>

        {/* Quick View */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-black/70 text-white text-xs font-medium backdrop-blur-sm">
            <Eye className="h-3.5 w-3.5" />
            Shiko
          </span>
        </div>
      </Link>

      {/* Info Section */}
      <div className="p-3.5">
        {/* Category */}
        {product.category && (
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1 truncate">
            {product.category}
          </p>
        )}

        {/* Title */}
        <Link href={`/products/${slug}`}>
          <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[40px]">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-bold text-foreground">
            {displayPrice.toFixed(2)} &euro;
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {product.price.toFixed(2)} &euro;
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || isAddingToCart}
          className={cn(
            "w-full h-9 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5",
            product.stock > 0
              ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {product.stock > 0
            ? isAddingToCart
              ? "Duke shtuar..."
              : "Shto ne shporte"
            : "Jo ne stok"}
        </button>
      </div>
    </div>
  )
}
