"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Settings2,
  ShoppingCart,
} from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/logo"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/admin/dashboard", label: "Paneli", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Porositë", icon: ShoppingCart, badgeKey: "pendingOrders" as const },
  { href: "/admin/products", label: "Produktet", icon: Package },
  { href: "/admin/categories", label: "Kategoritë", icon: FolderTree },
  { href: "/admin/settings", label: "Cilësimet", icon: Settings2 },
]

type Badges = { pendingOrders: number }

function NavLinks({ badges, onNavigate }: { badges: Badges; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="space-y-0.5" aria-label="Admin">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const badge = item.badgeKey ? badges[item.badgeKey] : 0
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active ? "bg-white/10 font-medium text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon className="size-[18px]" />
            <span className="flex-1">{item.label}</span>
            {badge > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white tabular-nums">
                {badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarBody({
  email,
  badges,
  logoutAction,
  onNavigate,
}: {
  email: string
  badges: Badges
  logoutAction: () => Promise<void>
  onNavigate?: () => void
}) {
  return (
    <div className="flex h-full flex-col bg-ink p-4 text-ink-foreground">
      <Link href="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-2 py-2">
        <Wordmark inverted />
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-[0.18em] text-white/60 uppercase">
          Admin
        </span>
      </Link>

      <Button asChild className="mt-6 w-full justify-center" onClick={onNavigate}>
        <Link href="/admin/products/new">
          <Plus /> Produkt i ri
        </Link>
      </Button>

      <div className="mt-6 flex-1">
        <NavLinks badges={badges} onNavigate={onNavigate} />
      </div>

      <div className="space-y-1 border-t border-white/10 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="size-[18px]" /> Shiko dyqanin
        </a>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-[18px]" /> Dil
          </button>
        </form>
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
            {email.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 truncate text-xs text-white/70">{email}</span>
        </div>
      </div>
    </div>
  )
}

export function AdminShell({
  email,
  badges,
  logoutAction,
  children,
}: {
  email: string
  badges: Badges
  logoutAction: () => Promise<void>
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarBody email={email} badges={badges} logoutAction={logoutAction} />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Hap menunë">
          <Menu />
        </Button>
        <Wordmark />
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Admin</span>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0" hideClose>
          <SheetTitle className="sr-only">Menuja e administratorit</SheetTitle>
          <SheetDescription className="sr-only">Navigimi i panelit</SheetDescription>
          <SidebarBody email={email} badges={badges} logoutAction={logoutAction} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  )
}
