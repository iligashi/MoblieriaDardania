"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/providers/cart-provider"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Phone,
} from "lucide-react"
import type { Category } from "@/lib/types"

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { itemCount } = useCart()
  const { itemCount: wishlistCount } = useWishlist()
  const { customer, isLoggedIn, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#1b1f22] text-white text-xs py-2 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:+38349514788" className="flex items-center gap-1.5 hover:text-[#ffc21f] transition-colors">
              <Phone className="h-3 w-3" />
              <span>+383 49 514 788</span>
            </a>
            <span className="text-white/40">|</span>
            <span className="text-white/70">Ore pune: 10:00 - 22:00</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#ffc21f] font-medium">Transport falas per porosi mbi 50 EUR</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300 bg-white border-b",
          isScrolled ? "shadow-md border-border/50" : "border-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <Link href="/" className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg overflow-hidden bg-white border border-border/50 flex items-center justify-center">
                  <Image
                    src="/flux-removebg-preview.png"
                    alt="Logo"
                    width={36}
                    height={36}
                    priority
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-black tracking-tight text-[#1b1f22]">FLUX</span>
                  <span className="text-lg font-light tracking-tight text-primary ml-0.5">DEKOR</span>
                </div>
              </Link>
            </div>

            {/* Center: Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/50"
              >
                Ballina
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setCategoryMenuOpen(true)}
                onMouseLeave={() => setCategoryMenuOpen(false)}
              >
                <Link
                  href="/shop"
                  className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/50 flex items-center gap-1"
                >
                  Dyqani
                  <ChevronDown className="h-3.5 w-3.5" />
                </Link>

                {categoryMenuOpen && categories.length > 0 && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-white rounded-xl shadow-2xl border border-border/50 p-4 min-w-[280px] grid gap-1">
                      <Link
                        href="/shop"
                        className="px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted/50 transition-colors"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        Te gjitha produktet
                      </Link>
                      {categories.map((cat) => (
                        <div key={cat.id}>
                          <Link
                            href={`/shop?category=${cat.slug}`}
                            className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between group"
                            onClick={() => setCategoryMenuOpen(false)}
                          >
                            <span className="font-medium group-hover:text-primary transition-colors">{cat.name}</span>
                            {cat.children && cat.children.length > 0 && (
                              <span className="text-xs text-muted-foreground">{cat.children.length}</span>
                            )}
                          </Link>
                          {cat.children?.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/shop?category=${sub.slug}`}
                              className="pl-7 pr-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-muted/50 hover:text-foreground transition-colors block"
                              onClick={() => setCategoryMenuOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/shop?on_sale=true"
                className="px-3 py-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50"
              >
                ZBRITJE
              </Link>

              <Link
                href="/shop?new=true"
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/50"
              >
                Te rejat
              </Link>
            </nav>

            {/* Right: Search + Actions */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2.5 hover:bg-muted rounded-full transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* Wishlist */}
              <Link href="/wishlist" className="p-2.5 hover:bg-muted rounded-full transition-colors relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white px-1">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="p-2.5 hover:bg-muted rounded-full transition-colors relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white px-1">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              {isLoggedIn ? (
                <div className="relative group">
                  <button className="p-2.5 hover:bg-muted rounded-full transition-colors">
                    <User className="h-5 w-5" />
                  </button>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="bg-white rounded-xl shadow-2xl border border-border/50 py-2 min-w-[200px]">
                      <div className="px-4 py-2 border-b border-border/50 mb-1">
                        <p className="text-sm font-medium">{customer?.first_name} {customer?.last_name}</p>
                        <p className="text-xs text-muted-foreground">{customer?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Llogaria ime
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <Package className="h-4 w-4" />
                        Porosite e mia
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/50 transition-colors w-full text-left text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Dil
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/account/login" className="p-2.5 hover:bg-muted rounded-full transition-colors">
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg z-50">
            <div className="container mx-auto px-4 py-4">
              <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Kerko produkte..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <Button type="submit" className="h-11 px-6">Kerko</Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11"
                  onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              <Link
                href="/"
                className="block px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ballina
              </Link>
              <Link
                href="/shop"
                className="block px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dyqani
              </Link>
              <Link
                href="/shop?on_sale=true"
                className="block px-3 py-3 text-sm font-bold text-red-600 rounded-lg hover:bg-red-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                ZBRITJE
              </Link>
              <Link
                href="/shop?new=true"
                className="block px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Te rejat
              </Link>

              {categories.length > 0 && (
                <>
                  <div className="pt-3 pb-1 px-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kategori</p>
                  </div>
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        className="block px-3 py-2.5 text-sm rounded-lg hover:bg-muted/50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                      {cat.children?.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/shop?category=${sub.slug}`}
                          className="block pl-7 pr-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-muted/50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </>
              )}

              <div className="pt-4 mt-4 border-t border-border space-y-1">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/account"
                      className="block px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted/50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Llogaria ime
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false) }}
                      className="w-full text-left px-3 py-3 text-sm font-medium text-destructive rounded-lg hover:bg-red-50"
                    >
                      Dil
                    </button>
                  </>
                ) : (
                  <Link
                    href="/account/login"
                    className="block px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kycu / Regjistrohu
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
