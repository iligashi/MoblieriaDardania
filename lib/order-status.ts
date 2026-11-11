import type { OrderStatus } from "@/lib/types"

export type StatusTone = "neutral" | "info" | "warning" | "success" | "danger"

export const ORDER_STATUS_META: Record<OrderStatus | string, { label: string; tone: StatusTone }> = {
  pending: { label: "Në pritje", tone: "warning" },
  confirmed: { label: "E konfirmuar", tone: "info" },
  processing: { label: "Në përpunim", tone: "info" },
  in_progress: { label: "Në progres", tone: "info" },
  shipped: { label: "E dërguar", tone: "info" },
  delivered: { label: "E dorëzuar", tone: "success" },
  completed: { label: "E përfunduar", tone: "success" },
  cancelled: { label: "E anuluar", tone: "danger" },
}

/** Statuses an admin can move an order into, in workflow order. */
export const ORDER_FLOW: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]

export const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning-strong",
  success: "bg-success-soft text-success",
  danger: "bg-destructive/10 text-destructive",
}

export function statusMeta(status: string | null | undefined) {
  return ORDER_STATUS_META[status ?? "pending"] ?? { label: status ?? "—", tone: "neutral" as const }
}

export const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: "Para në dorë",
  bank_transfer: "Transfer bankar",
}
