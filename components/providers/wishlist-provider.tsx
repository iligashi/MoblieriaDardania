"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { WishlistItem } from "@/lib/types"

interface WishlistContextType {
  items: WishlistItem[]
  isLoading: boolean
  itemCount: number
  addItem: (productId: string) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  toggleItem: (productId: string) => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist")
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const addItem = async (productId: string) => {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    })
    if (res.ok) {
      await fetchWishlist()
    }
  }

  const removeItem = async (productId: string) => {
    const item = items.find((i) => i.product_id === productId)
    if (!item) return
    const res = await fetch(`/api/wishlist/${item.id}`, { method: "DELETE" })
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.product_id !== productId))
    }
  }

  const isInWishlist = (productId: string) => items.some((i) => i.product_id === productId)

  const toggleItem = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeItem(productId)
    } else {
      await addItem(productId)
    }
  }

  return (
    <WishlistContext.Provider
      value={{ items, isLoading, itemCount: items.length, addItem, removeItem, isInWishlist, toggleItem }}
    >
      {children}
    </WishlistContext.Provider>
  )
}
