import type { Metadata } from "next"
import { Headset, RotateCcw, ShieldCheck, Truck, Wallet } from "lucide-react"
import { SHOP, formatPrice, whatsappLink } from "@/lib/shop-config"

export const metadata: Metadata = {
  title: "Ndihmë: dërgesa, pagesa dhe kthimi",
  description: `Dërgesa në gjithë Kosovën brenda 24–48 orëve, falas mbi ${formatPrice(SHOP.freeShippingThreshold)}. Pagesë në dorëzim dhe kthim brenda 48 orëve.`,
  alternates: { canonical: "/ndihme" },
}

const SECTIONS = [
  {
    id: "dergesa",
    icon: Truck,
    title: "Dërgesa",
    body: [
      "Dërgojmë në të gjithë Kosovën. Porositë arrijnë zakonisht brenda 24–48 orëve.",
      `Transporti kushton ${formatPrice(SHOP.shippingCost)} dhe është falas për porosi mbi ${formatPrice(SHOP.freeShippingThreshold)}.`,
    ],
  },
  {
    id: "pagesa",
    icon: Wallet,
    title: "Pagesa",
    body: [
      "Paguani me para në dorë kur ta pranoni porosinë. Nuk ju kërkohet kartë bankare.",
      "Mund të porositni direkt në faqe ose me një mesazh në WhatsApp.",
    ],
  },
  {
    id: "kthimi",
    icon: RotateCcw,
    title: "Kthimi i produkteve",
    body: ["Kthimi është i mundur brenda 48 orëve. Na kontaktoni dhe ju udhëzojmë hap pas hapi."],
  },
  {
    id: "garancia",
    icon: ShieldCheck,
    title: "Garancia",
    body: ["Të gjitha produktet janë origjinale dhe vijnë me garancinë zyrtare të prodhuesit."],
  },
]

export default function HelpPage() {
  return (
    <div className="container-page pt-10 lg:pt-14">
      <p className="eyebrow">Ndihmë</p>
      <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">Si mund t&apos;ju ndihmojmë?</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Gjithçka që duhet të dini për dërgesën, pagesën, kthimin dhe garancinë.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="Temat" className="lg:sticky lg:top-36 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto scrollbar-none lg:flex-col lg:gap-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-5">
          {SECTIONS.map(({ id, icon: Icon, title, body }) => (
            <section key={id} id={id} className="scroll-mt-40 rounded-2xl border bg-card p-6 sm:p-8">
              <h2 className="flex items-center gap-3 font-display text-3xl">
                <span className="grid size-11 place-items-center rounded-xl bg-sand/70 text-gold-ink">
                  <Icon className="size-5" />
                </span>
                {title}
              </h2>
              <div className="mt-4 space-y-2 leading-relaxed text-muted-foreground">
                {body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="flex flex-col gap-5 rounded-2xl bg-ink p-6 text-ink-foreground sm:flex-row sm:items-center sm:p-8">
            <Headset className="size-8 shrink-0 text-highlight" />
            <div className="flex-1">
              <h2 className="font-display text-2xl">Keni ende pyetje?</h2>
              <p className="mt-1 text-sm text-white/65">
                Na shkruani ose telefononi çdo ditë, {SHOP.contact.hours}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={whatsappLink("Përshëndetje Flux Dekor! Kam një pyetje.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center rounded-lg bg-[#25d366] px-4 text-sm font-semibold text-[#0b3d1f]"
              >
                WhatsApp
              </a>
              <a
                href={SHOP.contact.phoneHref}
                className="inline-flex h-11 items-center rounded-lg border border-white/20 px-4 text-sm font-semibold hover:bg-white/10"
              >
                {SHOP.contact.phone}
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
