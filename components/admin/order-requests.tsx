"use client"

import { useMemo, useState, useTransition } from "react"
import type { Order } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { Inbox, Loader2, ChevronDown, ChevronUp, Phone, Mail, MapPin, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUS_OPTIONS: { value: Order["status"]; label: string; color: string }[] = [
  { value: "pending", label: "Ne pritje", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "Konfirmuar", color: "bg-blue-100 text-blue-800" },
  { value: "processing", label: "Duke u procesuar", color: "bg-indigo-100 text-indigo-800" },
  { value: "shipped", label: "Derguar", color: "bg-purple-100 text-purple-800" },
  { value: "delivered", label: "Dorezuar", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Anulluar", color: "bg-red-100 text-red-800" },
]

interface OrderRequestsProps {
  orders: Order[]
}

export function OrderRequests({ orders }: OrderRequestsProps) {
  const router = useRouter()
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const formattedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      items: (order as any).order_items || order.items || [],
      createdAgo: formatDistanceToNow(new Date(order.created_at), { addSuffix: true }),
    }))
  }, [orders])

  const handleStatusChange = async (orderId: string, status: Order["status"]) => {
    setPendingOrderId(orderId)

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Deshtoi ndryshimi i statusit")
      }

      toast.success("Statusi u ndryshua!")
      startTransition(() => router.refresh())
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error(error instanceof Error ? error.message : "Nuk mund te ndryshohej statusi")
    } finally {
      setPendingOrderId(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/30 py-12 text-center text-muted-foreground">
        <Inbox className="h-10 w-10 text-muted-foreground/70" />
        <div>
          <p className="font-medium text-foreground">Nuk ka porosi ende</p>
          <p className="text-sm text-muted-foreground/80">Kur klientet bejne porosi, ato do te shfaqen ketu.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {formattedOrders.map((order) => {
        const isExpanded = expandedOrder === order.id
        const statusOption = STATUS_OPTIONS.find((s) => s.value === order.status) || STATUS_OPTIONS[0]
        const itemCount = order.items?.length || 0

        return (
          <div key={order.id} className="bg-white rounded-xl border border-border/60 overflow-hidden">
            {/* Order Header */}
            <div
              className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">
                    {order.order_number || `#${order.id.slice(0, 8)}`}
                  </span>
                  <Badge className={`text-[10px] ${statusOption.color} border-0`}>
                    {statusOption.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{order.customer_name || "Pa emer"}</span>
                  <span>{order.createdAgo}</span>
                  <span>{itemCount} produkte</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-sm">
                  {order.total ? `${Number(order.total).toFixed(2)} €` : order.furniture_price ? `${Number(order.furniture_price).toFixed(2)} €` : "—"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {order.payment_method === "cash_on_delivery" ? "Para ne dore" : order.payment_method === "bank_transfer" ? "Transfer bankar" : order.payment_method || "—"}
                </p>
              </div>

              {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-border/50 p-4 bg-muted/10">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Customer Info */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Klienti</h4>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium">{order.customer_name || "Pa emer"}</p>
                      {order.customer_phone && (
                        <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                          <Phone className="h-3.5 w-3.5" />
                          {order.customer_phone}
                        </a>
                      )}
                      {order.customer_email && (
                        <a href={`mailto:${order.customer_email}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                          <Mail className="h-3.5 w-3.5" />
                          {order.customer_email}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Adresa e dergeses</h4>
                      <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <div>
                          <p>{(order.shipping_address as any).street}</p>
                          <p>{(order.shipping_address as any).city}{(order.shipping_address as any).postal_code ? `, ${(order.shipping_address as any).postal_code}` : ""}</p>
                          <p>{(order.shipping_address as any).country}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Permbledhje</h4>
                    <div className="space-y-1 text-sm">
                      {order.subtotal && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nentotali</span>
                          <span>{Number(order.subtotal).toFixed(2)} €</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transporti</span>
                        <span>{order.shipping_cost === 0 ? "Falas" : `${Number(order.shipping_cost).toFixed(2)} €`}</span>
                      </div>
                      {order.total && (
                        <div className="flex justify-between font-bold border-t border-border/50 pt-1">
                          <span>Totali</span>
                          <span>{Number(order.total).toFixed(2)} €</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Produktet</h4>
                    <div className="space-y-2">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-2 border border-border/30">
                          <div className="h-10 w-10 rounded bg-[#f8f9fa] overflow-hidden shrink-0">
                            <img
                              src={item.product_image || "/placeholder.svg"}
                              alt={item.product_title}
                              className="h-full w-full object-contain p-0.5"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.product_title}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} x {Number(item.price).toFixed(2)} €
                            </p>
                          </div>
                          <span className="text-sm font-bold shrink-0">
                            {(Number(item.price) * item.quantity).toFixed(2)} €
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legacy single item display */}
                {!order.items?.length && order.furniture_title && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Produkti</h4>
                    <div className="bg-white rounded-lg p-3 border border-border/30">
                      <p className="text-sm font-medium">{order.furniture_title}</p>
                      <p className="text-xs text-muted-foreground">{Number(order.furniture_price).toFixed(2)} €</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {(order.notes || order.customer_message) && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Shenime</h4>
                    <p className="text-sm text-muted-foreground bg-white rounded-lg p-3 border border-border/30">
                      {order.notes || order.customer_message}
                    </p>
                  </div>
                )}

                {/* Status Update */}
                <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                  <span className="text-sm font-medium">Ndrysho statusin:</span>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                    disabled={pendingOrderId === order.id || isPending}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pendingOrderId === order.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

                  {order.customer_phone && (
                    <a
                      href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto"
                    >
                      <Button variant="outline" size="sm" type="button">
                        WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
