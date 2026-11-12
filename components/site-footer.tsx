import Link from "next/link"
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react"
import { Logo } from "@/components/logo"
import { InstagramIcon, WhatsAppIcon } from "@/components/icons"
import { SHOP, formatPrice, whatsappLink } from "@/lib/shop-config"

const COLUMNS = [
  {
    title: "Dyqani",
    links: [
      { href: "/shop", label: "Të gjitha produktet" },
      { href: "/shop?new=true", label: "Të rejat" },
      { href: "/shop?bestseller=true", label: "Më të shiturat" },
      { href: "/shop?on_sale=true", label: "Zbritje" },
    ],
  },
  {
    title: "Shërbimi i klientit",
    links: [
      { href: "/ndihme#dergesa", label: "Dërgesa" },
      { href: "/ndihme#pagesa", label: "Pagesa" },
      { href: "/ndihme#kthimi", label: "Kthimi i produkteve" },
      { href: "/ndihme#garancia", label: "Garancia" },
    ],
  },
  {
    title: "Llogaria",
    links: [
      { href: "/account", label: "Llogaria ime" },
      { href: "/account/orders", label: "Porositë e mia" },
      { href: "/wishlist", label: "Lista e dëshirave" },
      { href: "/cart", label: "Shporta" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-28 bg-ink text-ink-foreground">
      {/* Statement + contact */}
      <div className="container-page grid gap-10 border-b border-white/10 py-14 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:py-16">
        <div>
          <Logo inverted />
          <p className="mt-6 max-w-xl font-display text-3xl leading-tight text-balance sm:text-4xl">
            Mobilje, dekor dhe vegla për shtëpinë tuaj, të dërguara me kujdes në gjithë Kosovën.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <a
            href={whatsappLink("Përshëndetje Flux Dekor!")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#25d366] px-5 text-sm font-semibold text-[#0b3d1f] transition-colors hover:bg-[#25d366]/90"
          >
            <WhatsAppIcon className="size-5" /> WhatsApp
          </a>
          <a
            href={SHOP.contact.phoneHref}
            className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 px-5 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            <Phone className="size-4" /> {SHOP.contact.phone}
          </a>
        </div>
      </div>

      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.25fr]">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-[11px] font-bold tracking-[0.18em] text-highlight uppercase">{col.title}</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/70 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-[11px] font-bold tracking-[0.18em] text-highlight uppercase">Kontakt</h3>
          <ul className="mt-5 space-y-3.5 text-sm text-white/70">
            <li>
              <a href={`mailto:${SHOP.contact.email}`} className="flex items-center gap-3 hover:text-white">
                <Mail className="size-4 text-white/40" /> {SHOP.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="size-4 text-white/40" /> Çdo ditë, {SHOP.contact.hours}
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="size-4 text-white/40" /> Dërgesë në gjithë Kosovën
            </li>
            <li>
              <a
                href={SHOP.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 hover:text-white"
              >
                <InstagramIcon className="size-4 text-white/40" /> Instagram
                <ArrowUpRight className="size-3.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SHOP.name}. Të gjitha të drejtat e rezervuara.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Transport falas mbi {formatPrice(SHOP.freeShippingThreshold)}</span>
            <span className="rounded border border-white/15 px-2 py-0.5 text-white/60">Pagesë në dorëzim</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
