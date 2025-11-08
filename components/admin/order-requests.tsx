"use client"

import { useMemo, useState, useTransition } from "react"
import type { Order } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Inbox, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUS_OPTIONS: { value: Order["status"]; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
]

interface OrderRequestsProps {
  orders: Order[]
}

export function OrderRequests({ orders }: OrderRequestsProps) {
  const router = useRouter()
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const formattedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      createdAgo: formatDistanceToNow(new Date(order.created_at), { addSuffix: true }),
      messagePreview: order.customer_message ? order.customer_message.slice(0, 120) : "—",
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
        throw new Error(errorData?.error || "Failed to update status.")
      }

      toast.success("Order status updated.")
      startTransition(() => router.refresh())
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error(error instanceof Error ? error.message : "Unable to update order status.")
    } finally {
      setPendingOrderId(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/30 py-12 text-center text-muted-foreground">
        <Inbox className="h-10 w-10 text-muted-foreground/70" />
        <div>
          <p className="font-medium text-foreground">No order requests yet</p>
          <p className="text-sm text-muted-foreground/80">When customers submit the form, their details will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-white dark:bg-gray-900/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Requested</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="hidden xl:table-cell">Notes</TableHead>
            <TableHead>Channels</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formattedOrders.map((order) => (
            <TableRow key={order.id} className="align-top">
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{order.furniture_title}</p>
                  <p className="text-xs text-muted-foreground">
                    ${Number(order.furniture_price).toFixed(2)} • {order.createdAgo}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">Request #{order.id.slice(0, 8)}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {order.customer_email && <span>{order.customer_email}</span>}
                  {order.customer_phone && <span>{order.customer_phone}</span>}
                  {!order.customer_email && !order.customer_phone && <span>—</span>}
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <p className="max-w-xs truncate text-sm text-muted-foreground" title={order.customer_message ?? undefined}>
                  {order.messagePreview}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={order.send_via_whatsapp ? "default" : "secondary"} className="text-xs">
                    WhatsApp
                  </Badge>
                  <Badge variant={order.send_via_email ? "default" : "secondary"} className="text-xs">
                    Email
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                    disabled={pendingOrderId === order.id || isPending}
                  >
                    <SelectTrigger className="w-[160px]">
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

