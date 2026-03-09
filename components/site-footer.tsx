import Link from "next/link"
import { Instagram, MessageCircle, Phone, Mail, MapPin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-[#1b1f22] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <span className="text-xl font-black">FLUX</span>
              <span className="text-xl font-light text-[#ffc21f] ml-0.5">DEKOR</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Mobileri, dekorime, vegla pune dhe shume me teper. Produkte origjinale me garanci.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/dardaniamobileri"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/38349514788"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25d366]/20 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/80">Navigimi</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">
                  Ballina
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-white/60 hover:text-white transition-colors">
                  Dyqani
                </Link>
              </li>
              <li>
                <Link href="/shop?on_sale=true" className="text-sm text-white/60 hover:text-white transition-colors">
                  Zbritje
                </Link>
              </li>
              <li>
                <Link href="/shop?new=true" className="text-sm text-white/60 hover:text-white transition-colors">
                  Te rejat
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/80">Sherbim klienti</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/account" className="text-sm text-white/60 hover:text-white transition-colors">
                  Llogaria ime
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-sm text-white/60 hover:text-white transition-colors">
                  Gjurmo porosine
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-sm text-white/60 hover:text-white transition-colors">
                  Lista e deshirave
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-white/60 hover:text-white transition-colors">
                  Shporta
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/80">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 mt-0.5 text-[#ffc21f] shrink-0" />
                <div>
                  <a href="tel:+38349514788" className="text-sm text-white/80 hover:text-white transition-colors block">
                    +383 49 514 788
                  </a>
                  <span className="text-xs text-white/40">10:00 - 22:00</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 text-[#ffc21f] shrink-0" />
                <a href="mailto:info@fluxdekor.com" className="text-sm text-white/80 hover:text-white transition-colors">
                  info@fluxdekor.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-[#ffc21f] shrink-0" />
                <span className="text-sm text-white/60">Kosove</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 pt-6 border-t border-white/10 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-lg">🚚</span>
            </div>
            <div>
              <p className="font-medium text-white/80">24-48 ore ne Kosove</p>
              <p className="text-xs">Transport i shpejte</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-lg">✓</span>
            </div>
            <div>
              <p className="font-medium text-white/80">Produkte origjinale</p>
              <p className="text-xs">Me garanci</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-lg">↩</span>
            </div>
            <div>
              <p className="font-medium text-white/80">Kthim brenda 48 oreve</p>
              <p className="text-xs">Pa pyetje</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Flux Dekor. Te gjitha te drejtat te rezervuara.
          </p>
        </div>
      </div>
    </footer>
  )
}
