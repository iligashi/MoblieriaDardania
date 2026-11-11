import Link from "next/link"
import { ArrowRight, ArrowUpRight, BadgeCheck, Headset, RotateCcw, Truck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ProductCard, ProductGrid } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { WhatsAppIcon } from "@/components/icons"
import { Price } from "@/components/price"
import { SHOP, formatPrice, whatsappLink } from "@/lib/shop-config"
import type { Category, Product } from "@/lib/types"

const VALUE_PROPS = [
  { icon: Truck, title: "Dërgesë 24–48 orë", text: `Falas për porosi mbi ${formatPrice(SHOP.freeShippingThreshold)}` },
  { icon: BadgeCheck, title: "Produkte origjinale", text: "Me garanci zyrtare nga prodhuesi" },
  { icon: RotateCcw, title: "Kthim i thjeshtë", text: "Brenda 48 orëve pa pyetje" },
  { icon: Headset, title: "Mbështetje e shpejtë", text: `Çdo ditë ${SHOP.contact.hours}` },
]

export default async function HomePage() {
  const supabase = await createClient()
  const base = () => supabase.from("products").select("*").eq("is_active", true)

  const [featured, newest, sale, bestsellers, cats] = await Promise.all([
    base().eq("is_featured", true).order("updated_at", { ascending: false }).limit(3),
    base().eq("is_new", true).order("created_at", { ascending: false }).limit(8),
    base().not("discount_price", "is", null).order("updated_at", { ascending: false }).limit(8),
    base().eq("is_bestseller", true).order("updated_at", { ascending: false }).limit(8),
    supabase.from("categories").select("*").eq("is_active", true).is("parent_id", null).order("display_order").limit(8),
  ])

  const newProducts = (newest.data as Product[]) ?? []
  const saleProducts = ((sale.data as Product[]) ?? []).filter((p) => p.discount_price != null && p.discount_price < p.price)
  const bestsellerProducts = (bestsellers.data as Product[]) ?? []
  const categories = (cats.data as Category[]) ?? []
  const heroProducts = [...((featured.data as Product[]) ?? []), ...newProducts, ...bestsellerProducts]
    .filter((p, i, arr) => p.images?.[0] && arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-12 pt-10 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-16 lg:pb-24">
          <div className="animate-fade-up">
            <p className="eyebrow">Koleksioni {new Date().getFullYear()}</p>
            <h1 className="mt-5 font-display text-[3.25rem] leading-[0.95] tracking-tight text-balance sm:text-7xl lg:text-[5.5rem]">
              Shtëpia juaj,
              <br />
              <em className="text-primary">me stil</em> të ri.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Mobilje, dekor dhe vegla të përzgjedhura me kujdes — origjinale, me garanci dhe të dërguara te dera juaj në
              gjithë Kosovën.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="xl">
                <Link href="/shop">
                  Eksploro dyqanin <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/shop?on_sale=true">Shiko zbritjet</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-6">
              {[
                ["24–48h", "Dërgesë"],
                ["100%", "Origjinale"],
                ["48h", "Kthim"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-3xl">{value}</dd>
                  <dd className="mt-0.5 text-xs text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroCollage products={heroProducts} />
        </div>
      </section>

      {/* Value strip */}
      <section className="border-y bg-card">
        <div className="container-page grid grid-cols-2 gap-x-6 gap-y-6 py-7 lg:grid-cols-4">
          {VALUE_PROPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/8 text-primary">
                <Icon className="size-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-page pt-20">
          <SectionHeader eyebrow="Kategoritë" title="Bli sipas hapësirës" href="/shop" cta="Të gjitha kategoritë" />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <CategoryTile key={cat.id} category={cat} index={i} />
            ))}
          </div>
        </section>
      )}

      {saleProducts.length > 0 && (
        <section className="container-page pt-20">
          <SectionHeader
            eyebrow="Oferta"
            title="Zbritjet e javës"
            href="/shop?on_sale=true"
            cta="Të gjitha zbritjet"
            accent
          />
          <ProductGrid className="mt-8">
            {saleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        </section>
      )}

      {newProducts.length > 0 && (
        <section className="container-page pt-20">
          <SectionHeader eyebrow="Sapo arritën" title="Të rejat" href="/shop?new=true" cta="Shiko të rejat" />
          <ProductGrid className="mt-8">
            {newProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        </section>
      )}

      {bestsellerProducts.length > 0 && (
        <section className="container-page pt-20">
          <SectionHeader
            eyebrow="Të preferuarat"
            title="Më të shiturat"
            href="/shop?bestseller=true"
            cta="Shiko të gjitha"
          />
          <ProductGrid className="mt-8">
            {bestsellerProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className="container-page pt-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-ink-foreground sm:px-12 lg:px-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary/40 blur-3xl"
          />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-highlight/20 blur-3xl" />
          <div className="relative grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">Këshillim falas</p>
              <h2 className="mt-4 font-display text-4xl leading-[1.05] text-balance sm:text-5xl lg:text-6xl">
                Nuk e gjeni atë që kërkoni? Na shkruani.
              </h2>
              <p className="mt-4 max-w-lg text-white/65">
                Ekipi ynë ju ndihmon me porosi, dimensione, ngjyra apo produkte që nuk janë ende në faqe.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild size="xl" className="bg-[#25d366] text-[#0b3d1f] hover:bg-[#25d366]/90">
                <a href={whatsappLink("Përshëndetje Flux Dekor! Kam një pyetje.")} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-5" /> Shkruaj në WhatsApp
                </a>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <a href={SHOP.contact.phoneHref}>Telefono</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function SectionHeader({
  eyebrow,
  title,
  href,
  cta,
  accent,
}: {
  eyebrow: string
  title: string
  href: string
  cta: string
  accent?: boolean
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className={accent ? "eyebrow text-primary" : "eyebrow"}>{eyebrow}</p>
        <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">{title}</h2>
      </div>
      <Link
        href={href}
        className="group hidden shrink-0 items-center gap-1.5 text-sm font-medium sm:inline-flex"
      >
        {cta}
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </div>
  )
}

const TILE_TINTS = ["bg-[#efe7dc]", "bg-[#e3e8e1]", "bg-[#ece3e3]", "bg-[#e4e4ea]"]

function CategoryTile({ category, index }: { category: Category; index: number }) {
  const isColor = category.image?.startsWith("#")
  const isImage = category.image && !isColor
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={`group relative flex aspect-[5/4] flex-col justify-end overflow-hidden rounded-2xl p-4 sm:p-5 ${
        isColor || isImage ? "" : TILE_TINTS[index % TILE_TINTS.length]
      }`}
      style={isColor ? { backgroundColor: category.image! } : undefined}
    >
      {isImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.image!}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        </>
      )}
      {isColor && <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />}
      <div className="relative flex items-end justify-between gap-2">
        <span
          className={`font-display text-2xl leading-none sm:text-3xl ${isImage || isColor ? "text-white" : "text-foreground"}`}
        >
          {category.name}
        </span>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-45 ${
            isImage || isColor ? "bg-white/90 text-foreground" : "bg-card text-foreground"
          }`}
        >
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  )
}

function HeroCollage({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#efe7dc] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/flux-removebg-preview.png" alt="" className="absolute inset-0 m-auto w-1/2 opacity-80" />
      </div>
    )
  }

  const [main, second, third] = products
  return (
    <div className="relative grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4 lg:h-[600px]">
      <Link
        href={`/products/${main.slug || main.id}`}
        className="group relative col-span-3 row-span-6 overflow-hidden rounded-[1.75rem] bg-[#efe7dc] max-lg:aspect-[3/4]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main.images[0]}
          alt={main.title}
          className="absolute inset-0 size-full object-contain p-8 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-card/90 p-3.5 shadow-[var(--shadow-soft)] backdrop-blur sm:inset-x-4 sm:bottom-4">
          <p className="line-clamp-1 text-sm font-medium">{main.title}</p>
          <Price product={main} size="sm" className="mt-0.5" />
        </div>
      </Link>
      {[second, third].map((p, i) =>
        p ? (
          <Link
            key={p.id}
            href={`/products/${p.slug || p.id}`}
            className={`group relative col-span-2 row-span-3 overflow-hidden rounded-[1.5rem] ${i === 0 ? "bg-[#e3e8e1]" : "bg-[#ece3e3]"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.images[0]}
              alt={p.title}
              className="absolute inset-0 size-full object-contain p-5 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
        ) : (
          <div key={i} className={`col-span-2 row-span-3 rounded-[1.5rem] ${i === 0 ? "bg-[#e3e8e1]" : "bg-[#ece3e3]"}`} />
        ),
      )}
      <div className="absolute -top-3 -left-3 hidden rotate-[-6deg] rounded-full bg-highlight px-4 py-2 text-xs font-semibold text-highlight-foreground shadow-[var(--shadow-soft)] sm:block">
        Transport falas mbi {formatPrice(SHOP.freeShippingThreshold)}
      </div>
    </div>
  )
}
