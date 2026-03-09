"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import type { Order } from "@/lib/types"

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Ne pritje", variant: "secondary" },
  confirmed: { label: "Konfirmuar", variant: "default" },
  processing: { label: "Duke u procesuar", variant: "default" },
  shipped: { label: "Derguar", variant: "default" },
  delivered: { label: "Dorezuar", variant: "default" },
  cancelled: { label: "Anulluar", variant: "destructive" },
  in_progress: { label: "Ne progres", variant: "default" },
  completed: { label: "Perfunduar", variant: "default" },
}

export default function OrdersPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/account/login")
      return
    }

    if (isLoggedIn) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setOrders(data)
        })
        .catch(() => {})
        .finally(() => setIsLoading(false))
    }
  }, [authLoading, isLoggedIn, router])

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f8f9fa] min-h-[60vh]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Porosite e mia</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Nuk keni bere ende asnje porosi.</p>
            <Link href="/shop" className="text-primary font-medium hover:underline">
              Filloni blerjen
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = STATUS_MAP[order.status] || STATUS_MAP.pending
              return (
                <div key={order.id} className="bg-white rounded-xl border border-border/50 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-bold text-foreground">
                        {order.order_number || `#${order.id.slice(0, 8)}`}
                      </span>
                      <span className="text-xs text-muted-foreground ml-3">
                        {new Date(order.created_at).toLocaleDateString("sq-AL")}
                      </span>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  {/* Order items preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {order.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="h-12 w-12 rounded bg-[#f8f9fa] overflow-hidden shrink-0">
                          <img
                            src={item.product_image || "/placeholder.svg"}
                            alt={item.product_title}
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-xs font-medium">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {order.total ? `${Number(order.total).toFixed(2)} €` : order.furniture_price ? `${Number(order.furniture_price).toFixed(2)} €` : ""}
                    </span>
                    <span className="text-muted-foreground capitalize">
                      {order.payment_method === "cash_on_delivery" ? "Para ne dore" : order.payment_method === "bank_transfer" ? "Transfer bankar" : ""}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
