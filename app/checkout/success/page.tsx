import type { Metadata } from "next"
import Link from "next/link"
import { Check, Package, Phone, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SHOP } from "@/lib/shop-config"

export const metadata: Metadata = { title: "Porosia u krye", robots: { index: false } }

const STEPS = [
  { icon: Check, title: "Porosia u pranua", text: "E kemi regjistruar porosinë tuaj." },
  { icon: Phone, title: "Konfirmimi", text: "Ju kontaktojmë me telefon për ta konfirmuar." },
  { icon: Truck, title: "Dërgesa", text: "Brenda 24–48 orëve në adresën tuaj." },
]

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams
  const orderNumber = order?.replace(/[^A-Za-z0-9-]/g, "").slice(0, 40)

  return (
    <section className="container-page flex flex-col items-center py-16 text-center lg:py-24">
      <div className="grid size-20 animate-in place-items-center rounded-full bg-success/12 duration-500 zoom-in-50">
        <div className="grid size-14 place-items-center rounded-full bg-success text-white">
          <Check className="size-7" strokeWidth={2.5} />
        </div>
      </div>
      <p className="eyebrow mt-8">Faleminderit!</p>
      <h1 className="mt-3 font-display text-5xl leading-none text-balance sm:text-6xl">Porosia juaj u krye me sukses</h1>
      {orderNumber && (
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-sm">
          Numri i porosisë <span className="font-mono font-semibold">{orderNumber}</span>
        </p>
      )}

      <ol className="mt-12 grid w-full max-w-3xl gap-4 text-left sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-3xl border bg-card p-5">
            <span className={`grid size-10 place-items-center rounded-full ${i === 0 ? "bg-success text-white" : "bg-muted"}`}>
              <s.icon className="size-[18px]" />
            </span>
            <p className="mt-4 text-sm font-semibold">{s.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/shop">Vazhdo blerjen</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/account/orders">
            <Package /> Porositë e mia
          </Link>
        </Button>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Keni pyetje? Na telefononi në{" "}
        <a href={SHOP.contact.phoneHref} className="font-medium text-foreground underline-offset-4 hover:underline">
          {SHOP.contact.phone}
        </a>
      </p>
    </section>
  )
}
