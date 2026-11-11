import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string
  description?: string
  back?: { href: string; label: string }
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" /> {back.label}
          </Link>
        )}
        <h1 className="font-display text-4xl leading-none sm:text-5xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("rounded-3xl border bg-card", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-5 sm:p-6", bodyClassName)}>{children}</div>
    </section>
  )
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string
  hint?: React.ReactNode
  icon: LucideIcon
  tone?: "default" | "primary" | "warning"
}) {
  return (
    <div className="rounded-3xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span
          className={cn(
            "grid size-9 place-items-center rounded-full",
            tone === "primary" && "bg-primary/10 text-primary",
            tone === "warning" && "bg-warning-soft text-warning-strong",
            tone === "default" && "bg-muted text-foreground",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function Thumb({ src, className }: { src?: string | null; className?: string }) {
  return (
    <span className={cn("block size-11 shrink-0 overflow-hidden rounded-xl bg-muted", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src || "/placeholder.svg"} alt="" className="size-full object-contain p-1 mix-blend-multiply" loading="lazy" />
    </span>
  )
}

export function FilterTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; count?: number }[]
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-full bg-muted p-1 scrollbar-none">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors",
            value === o.value ? "bg-card font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="text-xs text-muted-foreground tabular-nums">{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function relativeDate(iso: string) {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return "tani"
  if (diff < 3600) return `${Math.floor(diff / 60)} min më parë`
  if (diff < 86400) return `${Math.floor(diff / 3600)} orë më parë`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ditë më parë`
  return d.toLocaleDateString("sq-AL", { day: "numeric", month: "short", year: "numeric" })
}
