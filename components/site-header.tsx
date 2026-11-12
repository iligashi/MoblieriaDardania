"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Heart,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Search,
  ShoppingBag,
  Truck,
  User,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/providers/cart-provider"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { Logo } from "@/components/logo"
import { SearchDialog } from "@/components/search-dialog"
import { CartDrawer } from "@/components/cart-drawer"
import { MobileNav } from "@/components/mobile-nav"
import { MobileTabBar } from "@/components/mobile-tab-bar"
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

const ANNOUNCEMENTS = [
  { icon: Truck, text: `Transport falas për porosi mbi ${formatPrice(SHOP.freeShippingThreshold)}` },
  { icon: Package, text: "Dërgesë në gjithë Kosovën brenda 24–48 orëve" },
  { icon: Wallet, text: "Paguani me para në dorë kur ta pranoni porosinë" },
  { icon: BadgeCheck, text: "Produkte origjinale me garanci zyrtare" },
]

const QUICK_LINKS = [
  { href: "/shop?new=true", label: "Të rejat" },
  { href: "/shop?bestseller=true", label: "Më të shiturat" },
]

/** Category tile colour: the admin-picked hex, or a calm fallback. */
function tileStyle(category: Category) {
  const image = category.image ?? ""
  if (/^https?:\/\//.test(image)) return { photo: image, color: "#b58a56" }
  return { photo: null, color: /^#[0-9a-f]{3,8}$/i.test(image) ? image : "#7e9c8a" }
}

function CategoryThumb({ category, className }: { category: Category; className?: string }) {
  const { photo, color } = tileStyle(category)
  return (
    <span
      className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-lg", className)}
      style={{ backgroundColor: `color-mix(in oklab, ${color} 16%, #f8f7f3)` }}
      aria-hidden
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
      ) : (
        <span className="font-display text-xl leading-none" style={{ color: `color-mix(in oklab, ${color} 80%, #172a25)` }}>
          {category.name.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  )
}

function CountBadge({ count }: { count: number }) {
  const previous = useRef(count)
  const [bump, setBump] = useState(0)
  useEffect(() => {
    if (count > previous.current) setBump((b) => b + 1)
    previous.current = count
  }, [count])
  if (count <= 0) return null
  return (
    <span
      key={bump}
      className={cn(
        "absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-highlight px-1 text-[10px] font-bold text-highlight-foreground tabular-nums ring-2 ring-background",
        bump > 0 && "animate-bump",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

function AnnouncementBar() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 4500)
    return () => clearInterval(timer)
  }, [])
  const { icon: Icon, text } = ANNOUNCEMENTS[index]

  return (
    <div className="bg-ink text-ink-foreground">
      <div className="container-page flex h-9 items-center justify-center gap-6 text-xs sm:justify-between">
        <span className="hidden text-white/60 lg:block">Çdo ditë {SHOP.contact.hours}</span>
        <p key={index} className="flex animate-ticker items-center gap-2 font-medium" aria-live="polite">
          <Icon className="size-3.5 text-highlight" />
          {text}
        </p>
        <a
          href={SHOP.contact.phoneHref}
          className="hidden items-center gap-1.5 text-white/60 transition-colors hover:text-white lg:flex"
        >
          <MessageCircle className="size-3.5" />
          Na kontaktoni: {SHOP.contact.phone}
        </a>
      </div>
    </div>
  )
}

const iconButton =
  "relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [activeRoot, setActiveRoot] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { itemCount, setOpen: setCartOpen } = useCart()
  const { itemCount: wishlistCount } = useWishlist()
  const { customer, isLoggedIn, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
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

  useEffect(() => {
    setMegaOpen(false)
    setMobileOpen(false)
  }, [pathname])

  // "/" or Ctrl/Cmd+K opens search; Escape closes the mega menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target?.closest("input, textarea, [contenteditable=true]")
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "Escape") setMegaOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // A short delay on close lets the pointer travel from trigger to panel.
  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMegaOpen(true)
  }
  const closeMega = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 140)
  }

  const roots = categories.slice(0, 8)
  const active = roots.find((c) => c.id === activeRoot) ?? roots[0]
  const firstName = customer?.first_name?.trim()

  return (
    <>
      <AnnouncementBar />

      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl transition-shadow duration-300",
          scrolled ? "shadow-[0_10px_30px_-18px_rgb(23_42_37/0.35)]" : "",
        )}
      >
        {/* Row 1: brand, search, actions */}
        <div className="container-page flex h-16 items-center gap-3 lg:h-[72px] lg:gap-8">
          <button
            type="button"
            className={cn(iconButton, "-ml-2 lg:hidden")}
            onClick={() => setMobileOpen(true)}
            aria-label="Hap menunë"
          >
            <Menu className="size-5" />
          </button>

          <Logo className="shrink-0" />

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group mx-auto hidden h-11 w-full max-w-xl items-center gap-3 rounded-lg border border-input bg-card pr-2 pl-4 text-sm text-muted-foreground transition-[border-color,box-shadow] hover:border-foreground/25 hover:shadow-[var(--shadow-soft)] md:flex"
          >
            <Search className="size-4 text-foreground/70" />
            <span className="flex-1 text-left">Kërko mobilje, dekor, vegla…</span>
            <kbd className="hidden rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[10px] lg:inline">Ctrl K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-0.5 md:ml-0">
            <button type="button" className={cn(iconButton, "md:hidden")} onClick={() => setSearchOpen(true)} aria-label="Kërko">
              <Search className="size-5" />
            </button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(iconButton, "hidden sm:inline-flex")} aria-label="Llogaria ime">
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground uppercase">
                    {(firstName?.[0] || customer?.email?.[0] || "U").toUpperCase()}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-xl p-2">
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
              <Link
                href="/account/login"
                className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors hover:bg-accent sm:inline-flex"
              >
                <User className="size-5" />
                <span className="hidden xl:inline">Kyçu</span>
              </Link>
            )}

            <Link
              href="/wishlist"
              className={cn(iconButton, "hidden sm:inline-flex")}
              aria-label={`Lista e dëshirave (${wishlistCount})`}
            >
              <Heart className="size-5" />
              <CountBadge count={wishlistCount} />
            </Link>

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

        {/* Row 2 (desktop): mega menu trigger and quick links */}
        <nav className="hidden border-t border-border/60 lg:block" aria-label="Navigimi kryesor">
          <div className="container-page relative flex h-12 items-center gap-1">
            <div onMouseEnter={openMega} onMouseLeave={closeMega}>
              <button
                type="button"
                // Pointer clicks arrive after hover already opened the menu, so they only
                // ever open it; keyboard activation (detail 0) toggles.
                onClick={(e) => (e.detail === 0 ? setMegaOpen((o) => !o) : openMega())}
                aria-expanded={megaOpen}
                aria-controls="mega-menu"
                className={cn(
                  "-ml-3 inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors",
                  megaOpen ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                <LayoutGrid className="size-4" />
                Të gjitha kategoritë
                <ChevronDown className={cn("size-3.5 transition-transform duration-200", megaOpen && "rotate-180")} />
              </button>

              <div
                id="mega-menu"
                className={cn(
                  "absolute inset-x-0 top-full z-50 px-4 pt-2 transition-[opacity,transform,visibility] duration-200 sm:px-6 lg:px-8",
                  megaOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1.5 opacity-0",
                )}
              >
                <div className="grid grid-cols-[260px_1fr_280px] overflow-hidden rounded-xl border bg-popover shadow-[var(--shadow-lift)]">
                  {/* Roots */}
                  <ul className="border-r bg-muted/40 p-3">
                    {roots.length === 0 && (
                      <li className="px-3 py-2 text-sm text-muted-foreground">Kategoritë po ngarkohen…</li>
                    )}
                    {roots.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/shop?category=${cat.slug}`}
                          onMouseEnter={() => setActiveRoot(cat.id)}
                          onFocus={() => setActiveRoot(cat.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg p-2 text-sm font-semibold transition-colors",
                            active?.id === cat.id ? "bg-card shadow-sm" : "hover:bg-card/60",
                          )}
                        >
                          <CategoryThumb category={cat} className="size-10" />
                          <span className="flex-1 truncate">{cat.name}</span>
                          <ArrowRight
                            className={cn("size-4 transition-opacity", active?.id === cat.id ? "opacity-60" : "opacity-0")}
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* Active category detail */}
                  <div className="p-7">
                    {active ? (
                      <>
                        <p className="eyebrow">Kategoria</p>
                        <p className="mt-1 font-display text-3xl">{active.name}</p>
                        {active.description && (
                          <p className="mt-2 line-clamp-2 max-w-md text-sm text-muted-foreground">{active.description}</p>
                        )}
                        {active.children?.length ? (
                          <div className="mt-6 grid grid-cols-2 gap-2">
                            {active.children.slice(0, 8).map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/shop?category=${sub.slug}`}
                                className="flex items-center gap-3 rounded-lg border bg-card p-2 text-sm font-medium transition-colors hover:border-foreground/25"
                              >
                                <CategoryThumb category={sub} className="size-9" />
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                        <Link
                          href={`/shop?category=${active.slug}`}
                          className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                        >
                          Shiko të gjitha në {active.name}
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </>
                    ) : (
                      <Link href="/shop" className="text-sm font-semibold">
                        Shiko të gjitha produktet
                      </Link>
                    )}
                  </div>

                  {/* Promo */}
                  <Link
                    href="/shop?on_sale=true"
                    className="group relative flex flex-col justify-end overflow-hidden bg-ink p-7 text-ink-foreground"
                  >
                    <div className="absolute -top-16 -right-16 size-56 rounded-full bg-highlight/30 blur-3xl transition-transform duration-700 group-hover:scale-125" />
                    <span className="relative text-[11px] font-bold tracking-[0.18em] text-highlight uppercase">Oferta</span>
                    <span className="relative mt-2 font-display text-[2rem] leading-[1.05]">
                      Zbritjet
                      <br />
                      <em>e javës</em>
                    </span>
                    <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm text-white/80 group-hover:text-white">
                      Zbulo ofertat <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            <span className="mx-2 h-5 w-px bg-border" aria-hidden />

            {roots.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
              >
                {cat.name}
              </Link>
            ))}
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/shop?on_sale=true"
              className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-sale transition-colors hover:bg-sale/10"
            >
              <span className="size-1.5 rounded-full bg-sale" aria-hidden />
              Zbritje
            </Link>
          </div>
        </nav>
      </header>

      {/* Click-away layer for the mega menu */}
      {megaOpen && <div className="fixed inset-0 z-30 hidden bg-ink/10 lg:block" onClick={() => setMegaOpen(false)} aria-hidden />}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} categories={categories} />
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} categories={categories} />
      <MobileTabBar onCategories={() => setMobileOpen(true)} onSearch={() => setSearchOpen(true)} />
      <CartDrawer />
    </>
  )
}
