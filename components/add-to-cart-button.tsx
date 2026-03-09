"use client"

import { useState } from "react"
import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Minus, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"

export function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCart()

  const handleAdd = async () => {
    if (product.stock <= 0 || isAdding) return
    setIsAdding(true)
    try {
      await addItem(product, quantity)
      toast.success(`${product.title} u shtua ne shporte`)
      setQuantity(1)
    } catch {
      toast.error("Dicka shkoi gabim")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="flex gap-3">
      {/* Quantity Selector */}
      <div className="flex items-center border border-border rounded-lg">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="h-11 w-11 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg"
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="h-11 w-12 flex items-center justify-center text-sm font-medium border-x border-border">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          className="h-11 w-11 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg"
          disabled={quantity >= product.stock}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Add to Cart */}
      <Button
        onClick={handleAdd}
        disabled={product.stock <= 0 || isAdding}
        className="flex-1 h-11 font-bold text-sm"
        size="lg"
      >
        {isAdding ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <ShoppingCart className="h-4 w-4 mr-2" />
        )}
        {product.stock > 0 ? "SHTO NE SHPORTE" : "JO NE STOK"}
      </Button>
    </div>
  )
}
