"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, ChevronDown, Heart, LogOut, Menu, Package, Phone, Search, ShoppingBag, Truck, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/providers/cart-provider"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { Logo } from "@/components/logo"
import { SearchDialog } from "@/components/search-dialog"
import { CartDrawer } from "@/components/cart-drawer"
import { MobileNav } from "@/components/mobile-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SHOP, formatPrice } from "@/lib/shop-config"
import type { Category } from "@/lib/types"

const NAV = [
  { href: "/shop?new=true", label: "Të rejat" },
  { href: "/shop?bestseller=true", label: "Më të shiturat" },
]

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums ring-2 ring-background">
      {count > 99 ? "99+" : count}
    </span>
  )
}

const iconButton =
  "relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none"

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const { itemCount, setOpen: setCartOpen } = useCart()
  const { itemCount: wishlistCount } = useWishlist()
  const { customer, isLoggedIn, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/categories", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => Array.isArray(data) && setCategories(data))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  // Close menus on navigation.
  useEffect(() => {
    setMegaOpen(false)
    setMobileOpen(false)
  }, [pathname])

  // Keyboard shortcut: "/" or Ctrl/Cmd+K opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target?.closest("input, textarea, [contenteditable=true]")
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const firstName = customer?.first_name?.trim()

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-ink text-ink-foreground">
        <div className="container-page flex h-9 items-center justify-center gap-6 text-xs sm:justify-between">
          <a
            href={SHOP.contact.phoneHref}
            className="hidden items-center gap-1.5 text-white/70 transition-colors hover:text-white sm:flex"
          >
            <Phone className="size-3.5" />
            {SHOP.contact.phone}
          </a>
          <p className="flex items-center gap-2 font-medium">
            <Truck className="size-3.5 text-highlight" />
            Transport falas për porosi mbi {formatPrice(SHOP.freeShippingThreshold)}
          </p>
          <span className="hidden text-white/70 sm:block">Çdo ditë {SHOP.contact.hours}</span>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-border/70 bg-background/85 shadow-[0_8px_30px_-12px_oklch(0.2_0.01_60/0.12)] backdrop-blur-xl"
            : "border-transparent bg-background",
        )}
      >
        <div className="container-page flex h-16 items-center gap-4 lg:h-[76px]">
          <button
            type="button"
            className={cn(iconButton, "-ml-2 lg:hidden")}
            onClick={() => setMobileOpen(true)}
            aria-label="Hap menunë"
          >
            <Menu className="size-5" />
          </button>

          <Logo className="shrink-0" />

          {/* Desktop navigation */}
          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Navigimi kryesor">
            <div className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
              <Link
                href="/shop"
                className="inline-flex h-10 items-center gap-1 rounded-full px-4 text-sm font-medium transition-colors hover:bg-accent"
                aria-expanded={megaOpen}
                onFocus={() => setMegaOpen(true)}
              >
                Dyqani
                <ChevronDown className={cn("size-3.5 transition-transform", megaOpen && "rotate-180")} />
              </Link>

              <div
                className={cn(
                  "absolute top-full left-0 pt-3 transition-all duration-200",
                  megaOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
                )}
              >
                <div className="grid w-[680px] grid-cols-[1fr_220px] overflow-hidden rounded-2xl border bg-popover shadow-[var(--shadow-lift)]">
                  <div className="p-6">
                    <p className="eyebrow mb-4">Kategoritë</p>
                    {categories.length === 0 ? (
                      <Link href="/shop" className="text-sm font-medium hover:text-primary">
                        Shiko të gjitha produktet
                      </Link>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                        {categories.slice(0, 8).map((cat) => (
                          <div key={cat.id}>
                            <Link
                              href={`/shop?category=${cat.slug}`}
                              className="text-sm font-semibold transition-colors hover:text-primary"
                            >
                              {cat.name}
                            </Link>
                            {!!cat.children?.length && (
                              <ul className="mt-2 space-y-1.5">
                                {cat.children.slice(0, 5).map((sub) => (
                                  <li key={sub.id}>
                                    <Link
                                      href={`/shop?category=${sub.slug}`}
                                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                      {sub.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <Link
                      href="/shop"
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all hover:gap-2.5"
                    >
                      Të gjitha produktet <ArrowRight className="size-4" />
                    </Link>
                  </div>
                  <Link
                    href="/shop?on_sale=true"
                    className="group relative flex flex-col justify-end overflow-hidden bg-ink p-6 text-ink-foreground"
                  >
                    <div className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/40 blur-3xl transition-transform duration-500 group-hover:scale-125" />
                    <div className="absolute bottom-10 -left-10 size-32 rounded-full bg-highlight/30 blur-3xl" />
                    <span className="eyebrow relative text-white/60">Oferta</span>
                    <span className="font-display relative mt-2 text-3xl leading-tight">
                      Zbritjet <em>e javës</em>
                    </span>
                    <span className="relative mt-3 inline-flex items-center gap-1.5 text-sm text-white/80 group-hover:text-white">
                      Zbulo tani <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/shop?on_sale=true"
              className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Zbritje
            </Link>
          </nav>

          {/* Search field (desktop) */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ml-auto hidden h-10 w-full max-w-[280px] items-center gap-2.5 rounded-full border border-input bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-foreground/25 md:flex"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">Kërko produkte…</span>
            <kbd className="hidden rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[10px] lg:inline">Ctrl K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-0.5 md:ml-2">
            <button type="button" className={cn(iconButton, "md:hidden")} onClick={() => setSearchOpen(true)} aria-label="Kërko">
              <Search className="size-5" />
            </button>

            <Link
              href="/wishlist"
              className={cn(iconButton, "hidden sm:inline-flex")}
              aria-label={`Lista e dëshirave (${wishlistCount})`}
            >
              <Heart className="size-5" />
              <CountBadge count={wishlistCount} />
            </Link>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(iconButton, "hidden sm:inline-flex")} aria-label="Llogaria ime">
                  <span className="grid size-8 place-items-center rounded-full bg-ink text-xs font-semibold text-ink-foreground uppercase">
                    {(firstName?.[0] || customer?.email?.[0] || "U").toUpperCase()}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2">
                  <DropdownMenuLabel className="px-2 py-2">
                    <p className="text-sm font-semibold">{firstName ? `Përshëndetje, ${firstName}` : "Llogaria ime"}</p>
                    <p className="truncate text-xs font-normal text-muted-foreground">{customer?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg py-2">
                    <Link href="/account">
                      <User className="size-4" /> Llogaria ime
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg py-2">
                    <Link href="/account/orders">
                      <Package className="size-4" /> Porositë e mia
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg py-2">
                    <Link href="/wishlist">
                      <Heart className="size-4" /> Lista e dëshirave
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="rounded-lg py-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-4" /> Dil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/account/login" className={cn(iconButton, "hidden sm:inline-flex")} aria-label="Kyçu">
                <User className="size-5" />
              </Link>
            )}

            <button
              type="button"
              className={iconButton}
              onClick={() => setCartOpen(true)}
              aria-label={`Shporta (${itemCount})`}
            >
              <ShoppingBag className="size-5" />
              <CountBadge count={itemCount} />
            </button>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} categories={categories} />
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} categories={categories} />
      <CartDrawer />
    </>
  )
}
