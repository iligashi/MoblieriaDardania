"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Heart, LayoutGrid, LogOut, Package, UserRound } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { TONE_CLASSES, statusMeta } from "@/lib/order-status"
import { cn } from "@/lib/utils"

/** Centered card used by login and register. */
export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <section className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-[440px]">
        <div className="text-center">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 font-display text-5xl leading-none">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="mt-8 rounded-3xl border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">{children}</div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </section>
  )
}

const NAV = [
  { href: "/account", label: "Përmbledhja", icon: LayoutGrid },
  { href: "/account/orders", label: "Porositë", icon: Package },
  { href: "/account/profile", label: "Profili", icon: UserRound },
  { href: "/wishlist", label: "Të ruajturat", icon: Heart },
]

/** Shared frame for the signed-in customer pages. */
export function AccountShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { customer, user, logout } = useAuth()
  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ")
  const initial = (customer?.first_name || user?.email || "?").charAt(0).toUpperCase()

  return (
    <div className="container-page pt-8 lg:pt-12">
      <div className="flex items-center gap-4 border-b pb-8">
        <span className="grid size-14 place-items-center rounded-full bg-ink font-display text-2xl text-ink-foreground">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="eyebrow">Llogaria ime</p>
          <h1 className="mt-1 truncate font-display text-4xl leading-none sm:text-5xl">{title}</h1>
          {name && title !== name && <p className="mt-1 truncate text-sm text-muted-foreground">{name}</p>}
        </div>
      </div>

      <div className="grid gap-8 pt-8 lg:grid-cols-[220px_1fr] lg:gap-12">
        <nav aria-label="Llogaria" className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors lg:rounded-xl",
                  active ? "bg-ink text-ink-foreground" : "text-foreground/75 hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-4" /> {item.label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={async () => {
              await logout()
              router.push("/")
            }}
            className="flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/8 lg:mt-2 lg:rounded-xl"
          >
            <LogOut className="size-4" /> Dil
          </button>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const meta = statusMeta(status)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[meta.tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  )
}

/** Only allow same-site relative redirects (blocks `//evil.com` and absolute URLs). */
export function safeNext(next: string | null, fallback = "/account") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback
}
