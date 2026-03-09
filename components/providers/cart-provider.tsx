"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { CartItem, Product } from "@/lib/types"

interface CartContextType {
  items: CartItem[]
  isLoading: boolean
  itemCount: number
  subtotal: number
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem("cart_session_id")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("cart_session_id", id)
  }
  return id
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCart = useCallback(async () => {
    try {
      const sessionId = getSessionId()
      const res = await fetch(`/api/cart?sessionId=${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addItem = async (product: Product, quantity = 1) => {
    const sessionId = getSessionId()
    const existing = items.find((i) => i.product_id === product.id)

    if (existing) {
      await updateQuantity(existing.id, existing.quantity + quantity)
      return
    }

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product.id, quantity, session_id: sessionId }),
    })

    if (res.ok) {
      await fetchCart()
    }
  }

  const removeItem = async (itemId: string) => {
    const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" })
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(itemId)
      return
    }

    const res = await fetch(`/api/cart/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    })

    if (res.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      )
    }
  }

  const clearCart = async () => {
    const sessionId = getSessionId()
    await fetch(`/api/cart?sessionId=${sessionId}`, { method: "DELETE" })
    setItems([])
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => {
    const price = i.product?.discount_price ?? i.product?.price ?? 0
    return sum + price * i.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{ items, isLoading, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}
