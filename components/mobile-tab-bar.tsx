"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Home, LayoutGrid, Search, User } from "lucide-react"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"

/** Routes that bring their own bottom bar (product page) or should stay focused (checkout). */
export function hidesTabBar(pathname: string) {
  return pathname.startsWith("/products/") || pathname.startsWith("/checkout")
}

/** Thumb-reachable navigation for phones. Hidden from `lg` up. */
export function MobileTabBar({ onCategories, onSearch }: { onCategories: () => void; onSearch: () => void }) {
  const pathname = usePathname()
  const { itemCount: wishlistCount } = useWishlist()
  const { isLoggedIn } = useAuth()
  if (hidesTabBar(pathname)) return null

  const item =
    "relative flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-semibold transition-colors"
  const tone = (active: boolean) => (active ? "text-foreground" : "text-muted-foreground")

  return (
    <nav
      aria-label="Navigimi i shpejtë"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="flex h-16">
        <Link href="/" className={cn(item, tone(pathname === "/"))} aria-current={pathname === "/" ? "page" : undefined}>
          <Home className="size-5" />
          Ballina
        </Link>
        <button type="button" onClick={onCategories} className={cn(item, tone(pathname.startsWith("/shop")))}>
          <LayoutGrid className="size-5" />
          Kategoritë
        </button>
        <button type="button" onClick={onSearch} className={cn(item, tone(false))}>
          <Search className="size-5" />
          Kërko
        </button>
        <Link href="/wishlist" className={cn(item, tone(pathname === "/wishlist"))}>
          <span className="relative">
            <Heart className="size-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-highlight px-1 text-[9px] font-bold text-highlight-foreground tabular-nums">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </span>
          Lista
        </Link>
        <Link
          href={isLoggedIn ? "/account" : "/account/login"}
          className={cn(item, tone(pathname.startsWith("/account")))}
        >
          <User className="size-5" />
          Llogaria
        </Link>
      </div>
    </nav>
  )
}
