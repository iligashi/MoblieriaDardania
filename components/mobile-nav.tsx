"use client"

import Link from "next/link"
import { ChevronRight, Heart, LogOut, Package, Phone, User } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Logo } from "@/components/logo"
import { SHOP } from "@/lib/shop-config"
import type { Category } from "@/lib/types"

const LINKS = [
  { href: "/shop", label: "Të gjitha produktet" },
  { href: "/shop?new=true", label: "Të rejat" },
  { href: "/shop?bestseller=true", label: "Më të shiturat" },
]

export function MobileNav({
  open,
  onOpenChange,
  categories,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
}) {
  const { isLoggedIn, customer, logout } = useAuth()
  const close = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="gap-0 p-0">
        <SheetHeader className="border-b p-5">
          <SheetTitle asChild>
            <div onClick={close}>
              <Logo />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Menuja e navigimit</SheetDescription>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-5 py-3" aria-label="Navigimi në celular">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="flex items-center justify-between border-b py-4 text-[15px] font-medium">
                  {l.label}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/shop?on_sale=true"
                onClick={close}
                className="flex items-center justify-between border-b py-4 text-[15px] font-bold text-sale"
              >
                Zbritje
                <ChevronRight className="size-4" />
              </Link>
            </li>
          </ul>

          {categories.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow mb-1">Kategoritë</p>
              <Accordion type="single" collapsible>
                {categories.map((cat) =>
                  cat.children?.length ? (
                    <AccordionItem key={cat.id} value={cat.id}>
                      <AccordionTrigger className="py-3.5">{cat.name}</AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <ul className="space-y-0.5 border-l pl-4">
                          <li>
                            <Link href={`/shop?category=${cat.slug}`} onClick={close} className="block py-2 text-sm font-medium">
                              Të gjitha në {cat.name}
                            </Link>
                          </li>
                          {cat.children.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={`/shop?category=${sub.slug}`}
                                onClick={close}
                                className="block py-2 text-sm text-muted-foreground"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <div key={cat.id} className="border-b">
                      <Link href={`/shop?category=${cat.slug}`} onClick={close} className="block py-3.5 text-[15px] font-medium">
                        {cat.name}
                      </Link>
                    </div>
                  ),
                )}
              </Accordion>
            </div>
          )}
        </nav>

        <div className="space-y-1 border-t bg-card p-5">
          {isLoggedIn ? (
            <>
              <p className="mb-2 truncate text-sm text-muted-foreground">{customer?.email}</p>
              <Link href="/account" onClick={close} className="flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium">
                <User className="size-4" /> Llogaria ime
              </Link>
              <Link href="/account/orders" onClick={close} className="flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium">
                <Package className="size-4" /> Porositë e mia
              </Link>
            </>
          ) : (
            <Link href="/account/login" onClick={close} className="flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium">
              <User className="size-4" /> Kyçu / Regjistrohu
            </Link>
          )}
          <Link href="/wishlist" onClick={close} className="flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium">
            <Heart className="size-4" /> Lista e dëshirave
          </Link>
          <a href={SHOP.contact.phoneHref} className="flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium">
            <Phone className="size-4" /> {SHOP.contact.phone}
          </a>
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => {
                logout()
                close()
              }}
              className="flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-destructive"
            >
              <LogOut className="size-4" /> Dil
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
