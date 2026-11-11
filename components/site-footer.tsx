import Link from "next/link"
import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { Logo } from "@/components/logo"
import { InstagramIcon, WhatsAppIcon } from "@/components/icons"
import { SHOP, formatPrice, whatsappLink } from "@/lib/shop-config"

const SHOP_LINKS = [
  { href: "/shop", label: "Të gjitha produktet" },
  { href: "/shop?new=true", label: "Të rejat" },
  { href: "/shop?bestseller=true", label: "Më të shiturat" },
  { href: "/shop?on_sale=true", label: "Zbritje" },
]

const ACCOUNT_LINKS = [
  { href: "/account", label: "Llogaria ime" },
  { href: "/account/orders", label: "Porositë e mia" },
  { href: "/wishlist", label: "Lista e dëshirave" },
  { href: "/cart", label: "Shporta" },
]

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm">
          <Logo inverted />
          <p className="mt-5 text-sm leading-relaxed text-white/60">
            Mobilje, dekor dhe vegla për shtëpinë tuaj — produkte origjinale me garanci dhe dërgesë në të gjithë Kosovën.
          </p>
          <div className="mt-6 flex gap-2">
            <a
              href={SHOP.contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid size-10 place-items-center rounded-full border border-white/15 transition-colors hover:bg-white/10"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid size-10 place-items-center rounded-full border border-white/15 transition-colors hover:bg-white/10"
            >
              <WhatsAppIcon className="size-4" />
            </a>
          </div>
        </div>

        <FooterColumn title="Dyqani" links={SHOP_LINKS} />
        <FooterColumn title="Llogaria" links={ACCOUNT_LINKS} />

        <div>
          <h3 className="text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">Kontakt</h3>
          <ul className="mt-5 space-y-3.5 text-sm text-white/75">
            <li>
              <a href={SHOP.contact.phoneHref} className="flex items-center gap-3 hover:text-white">
                <Phone className="size-4 text-white/40" /> {SHOP.contact.phone}
              </a>
            </li>
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
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SHOP.name}. Të gjitha të drejtat e rezervuara.</p>
          <p>
            Transport falas për porosi mbi {formatPrice(SHOP.freeShippingThreshold)} · Pagesa në dorëzim
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-white/75 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
