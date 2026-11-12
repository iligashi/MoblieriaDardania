import Link from "next/link"
import type { CSSProperties } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Headset,
  MousePointerClick,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ProductCard, ProductGrid } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { InstagramIcon, WhatsAppIcon } from "@/components/icons"
import { Price, discountPercent } from "@/components/price"
import { CategoryCard } from "@/components/category-card"
import { RecentlyViewed } from "@/components/recently-viewed"
import { SHOP, formatPrice, unitPrice, whatsappLink } from "@/lib/shop-config"
import { categoryNameFor, getCategoryOverview } from "@/lib/catalog"
import { firstPhoto, imageFit } from "@/lib/media"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"

const PILLARS = [
  {
    icon: Truck,
    title: "Dërgesë e shpejtë",
    text: `24–48 orë në gjithë Kosovën. Falas për porosi mbi ${formatPrice(SHOP.freeShippingThreshold)}.`,
  },
  { icon: ShieldCheck, title: "Origjinale me garanci", text: "Çdo produkt vjen me garancinë zyrtare të prodhuesit." },
  { icon: RotateCcw, title: "Kthim pa stres", text: "Nuk ju pëlqen? Kthejeni brenda 48 orëve." },
  { icon: Headset, title: "Këshilla reale", text: `Ekipi ynë përgjigjet çdo ditë, ${SHOP.contact.hours}.` },
]

const STEPS = [
  { icon: MousePointerClick, title: "Zgjidhni", text: "Shfletoni katalogun ose na shkruani se çfarë ju duhet." },
  { icon: PackageCheck, title: "Porositni", text: "Direkt në faqe ose me një mesazh në WhatsApp." },
  { icon: Wallet, title: "Paguani në dorëzim", text: "Paguani me para në dorë kur ta pranoni porosinë." },
]

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties

export default async function HomePage() {
  const supabase = await createClient()
  const base = () => supabase.from("products").select("*").eq("is_active", true)

  const [featured, newest, sale, bestsellers, overview] = await Promise.all([
    base().eq("is_featured", true).order("updated_at", { ascending: false }).limit(6),
    base().eq("is_new", true).order("created_at", { ascending: false }).limit(8),
    base().not("discount_price", "is", null).order("updated_at", { ascending: false }).limit(8),
    base().eq("is_bestseller", true).order("updated_at", { ascending: false }).limit(8),
    getCategoryOverview(supabase),
  ])

  const list = (r: { data: unknown }) => (r.data as Product[]) ?? []
  const saleAll = list(sale).filter((p) => discountPercent(p) > 0)
  const all = [...list(featured), ...saleAll, ...list(bestsellers), ...list(newest)].filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
  )
  const label = (p: Product) => categoryNameFor(p, overview.categories)

  // Each product appears in one homepage grid only, so a small catalogue
  // doesn't repeat itself section after section.
  const shown = new Set<string>()
  const take = (items: Product[], n = 8) => {
    const picked: Product[] = []
    for (const p of items) {
      if (picked.length >= n) break
      if (shown.has(p.id)) continue
      shown.add(p.id)
      picked.push(p)
    }
    return picked
  }
  const trending = take([...list(bestsellers), ...list(featured)])
  const onSale = take(saleAll)
  const arrivals = take(list(newest))

  const heroPhoto = firstPhoto(all.flatMap((p) => p.images ?? []))
  const heroProduct = heroPhoto ? all.find((p) => p.images?.includes(heroPhoto)) : all.find((p) => p.images?.[0])
  const heroImage = heroPhoto ?? heroProduct?.images?.[0] ?? null
  const maxDiscount = saleAll.reduce((m, p) => Math.max(m, discountPercent(p)), 0)
  const lifestyle = all
    .map((p) => ({ product: p, photo: firstPhoto(p.images ?? []) }))
    .filter((x): x is { product: Product; photo: string } => !!x.photo && x.photo !== heroPhoto)
    .slice(0, 3)
  const categories = overview.roots.slice(0, 6)

  return (
    <>
      {/* ───────────────── Hero ───────────────── */}
      <section className="container-page pt-4 sm:pt-6">
        <div className="relative grid overflow-hidden rounded-2xl bg-ink text-ink-foreground lg:min-h-[620px] lg:grid-cols-[1fr_1.05fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-12 lg:py-16 lg:pr-6 lg:pl-16">
            <p className="flex animate-fade-up items-center gap-3 text-[11px] font-bold tracking-[0.22em] text-highlight uppercase">
              <span className="h-px w-8 bg-highlight/70" aria-hidden />
              Koleksioni {new Date().getFullYear()}
            </p>
            <h1
              className="mt-6 animate-fade-up font-display text-[2.9rem] leading-[0.98] tracking-tight text-balance sm:text-6xl xl:text-7xl"
              style={{ animationDelay: "80ms" }}
            >
              Shtëpi që ndihet
              <br />
              <em className="text-highlight">si e juaja.</em>
            </h1>
            <p
              className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-white/70 sm:text-lg"
              style={{ animationDelay: "160ms" }}
            >
              Mobilje, dekor dhe vegla të përzgjedhura me kujdes. Origjinale, me garanci dhe te dera juaj brenda 48 orëve.
            </p>
            <div className="mt-9 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <Button asChild size="xl" variant="gold">
                <Link href="/shop">
                  Eksploro koleksionin <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Link href="/shop?on_sale=true">Shiko ofertat</Link>
              </Button>
            </div>
            <dl
              className="mt-12 grid max-w-md animate-fade-up grid-cols-3 gap-6 border-t border-white/12 pt-6"
              style={{ animationDelay: "320ms" }}
            >
              {[
                ["24–48h", "Dërgesë"],
                ["100%", "Origjinale"],
                ["48h", "Kthim"],
              ].map(([value, text]) => (
                <div key={text}>
                  <dt className="text-xs text-white/55">{text}</dt>
                  <dd className="mt-1 font-display text-3xl">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative min-h-[340px] overflow-hidden sm:min-h-[440px] lg:min-h-0">
            {heroImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt={heroProduct?.title ?? ""}
                  fetchPriority="high"
                  className={cn(
                    "absolute inset-0 size-full animate-in duration-1000 zoom-in-105 fade-in-0",
                    heroPhoto ? "object-cover" : "bg-sand object-contain p-12 mix-blend-multiply",
                  )}
                />
                {heroPhoto && (
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-ink lg:via-ink/10 lg:to-transparent"
                  />
                )}
                {heroProduct && (
                  <Link
                    href={`/products/${heroProduct.slug || heroProduct.id}`}
                    className="group absolute right-4 bottom-4 left-4 flex items-center gap-4 rounded-xl bg-card/95 p-3 text-foreground shadow-[var(--shadow-lift)] backdrop-blur transition-transform hover:-translate-y-0.5 sm:right-6 sm:bottom-6 sm:left-auto sm:w-80"
                  >
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-sand/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroProduct.images[0]}
                        alt=""
                        data-fit={imageFit(heroProduct.images[0])}
                        className="product-shot !p-1"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold tracking-[0.14em] text-gold-ink uppercase">
                        Në fokus
                      </span>
                      <span className="block truncate text-sm font-semibold">{heroProduct.title}</span>
                      <Price product={heroProduct} size="sm" />
                    </span>
                    <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                )}
              </>
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-[#1c302a]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/flux-wordmark.png" alt="" className="w-1/2 opacity-90 brightness-0 invert" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────────────── Trust strip ───────────────── */}
      <section className="container-page">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-5 border-b py-7 lg:grid-cols-4">
          {[
            { icon: Truck, title: "Transport falas", text: `Mbi ${formatPrice(SHOP.freeShippingThreshold)}` },
            { icon: Wallet, title: "Pagesë në dorëzim", text: "Paguani kur e pranoni" },
            { icon: BadgeCheck, title: "Garanci zyrtare", text: "Produkte 100% origjinale" },
            { icon: RotateCcw, title: "Kthim 48 orë", text: "Pa pyetje" },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3.5">
              <Icon className="size-6 shrink-0 text-gold-ink" strokeWidth={1.6} />
              <span>
                <span className="block text-sm font-bold">{title}</span>
                <span className="block text-xs text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────────────── Categories ───────────────── */}
      {categories.length > 0 && (
        <section className="container-page pt-20">
          <SectionHeader eyebrow="Kategoritë" title="Bli sipas kategorisë" href="/shop" cta="Të gjitha produktet" />
          <div
            className={cn(
              "mt-9 grid gap-5",
              categories.length === 2 && "lg:grid-cols-2",
              categories.length === 4 && "sm:grid-cols-2 lg:grid-cols-4",
              (categories.length === 3 || categories.length > 4) && "sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {categories.map((cat, i) => (
              <div key={cat.id} data-reveal style={delay(i * 80)}>
                <CategoryCard category={cat} variant={categories.length <= 2 ? "wide" : "compact"} className="h-full" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ───────────────── Promotions ───────────────── */}
      {(maxDiscount > 0 || list(newest).length > 0) && (
        <section className="container-page grid gap-5 pt-20 lg:grid-cols-2">
          {maxDiscount > 0 && (
            <PromoBanner
              href="/shop?on_sale=true"
              eyebrow="Oferta e javës"
              title={
                <>
                  Deri në <span className="text-highlight">−{maxDiscount}%</span>
                  <br />
                  në produkte të zgjedhura
                </>
              }
              cta="Bli me zbritje"
              image={saleAll[0]?.images?.[0]}
              tone="ink"
            />
          )}
          {list(newest).length > 0 && (
            <PromoBanner
              href="/shop?new=true"
              eyebrow="Sapo arritën"
              title={
                <>
                  Të rejat e sezonit,
                  <br />
                  gati për shtëpinë tuaj
                </>
              }
              cta="Zbulo të rejat"
              image={list(newest)[0]?.images?.[0]}
              tone="sand"
            />
          )}
        </section>
      )}

      {trending.length > 0 && (
        <ProductSection eyebrow="Trend tani" title="Më të kërkuarat" href="/shop?bestseller=true" cta="Shiko të gjitha">
          {trending.map((p, i) => (
            <ProductCard key={p.id} product={p} category={label(p)} priority={i < 2} />
          ))}
        </ProductSection>
      )}

      {onSale.length > 0 && (
        <ProductSection eyebrow="Oferta" title="Zbritjet e javës" href="/shop?on_sale=true" cta="Të gjitha zbritjet" sale>
          {onSale.map((p) => (
            <ProductCard key={p.id} product={p} category={label(p)} />
          ))}
        </ProductSection>
      )}

      {arrivals.length > 0 && (
        <ProductSection eyebrow="Sapo arritën" title="Të rejat" href="/shop?new=true" cta="Shiko të rejat">
          {arrivals.map((p) => (
            <ProductCard key={p.id} product={p} category={label(p)} />
          ))}
        </ProductSection>
      )}

      {/* ───────────────── Lifestyle ───────────────── */}
      {lifestyle.length > 0 && (
        <section className="container-page pt-24">
          <SectionHeader eyebrow="Frymëzim" title="Ide për çdo dhomë" href="/shop" cta="Shfleto dyqanin" />
          <div
            className={cn(
              "mt-9 grid gap-5",
              lifestyle.length === 3 && "lg:grid-cols-[1.5fr_1fr] lg:grid-rows-2",
              lifestyle.length === 2 && "md:grid-cols-2",
            )}
          >
            {lifestyle.map(({ product, photo }, i) => (
              <Link
                key={product.id}
                href={`/products/${product.slug || product.id}`}
                data-reveal
                style={delay(i * 100)}
                className={cn(
                  "group relative block min-h-[300px] overflow-hidden rounded-2xl bg-sand",
                  lifestyle.length === 3 && i === 0 && "lg:row-span-2 lg:min-h-[620px]",
                  lifestyle.length === 1 && "min-h-[420px] lg:min-h-[520px]",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={product.title}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white sm:inset-x-7 sm:bottom-7">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-[0.18em] text-highlight uppercase">
                      {label(product) ?? "Shiko produktin"}
                    </p>
                    <p className="mt-1.5 font-display text-3xl leading-tight sm:text-4xl">{product.title}</p>
                    <p className="mt-1 text-sm text-white/75">{formatPrice(unitPrice(product))}</p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-ink transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ───────────────── Why Flux Dekor ───────────────── */}
      <section className="container-page pt-24">
        <div className="grid gap-12 rounded-2xl bg-sand/60 px-6 py-14 sm:px-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16 lg:px-16 lg:py-20">
          <div data-reveal>
            <p className="eyebrow text-gold-ink">Pse Flux Dekor</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.02] text-balance sm:text-5xl">
              Blerje e sigurt, nga porosia te dera.
            </h2>
            <p className="mt-5 max-w-sm leading-relaxed text-muted-foreground">
              Jemi dyqan vendor. Ju flasim në gjuhën tuaj, ju dërgojmë shpejt dhe qëndrojmë pas çdo produkti që shesim.
            </p>
          </div>
          <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {PILLARS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} data-reveal style={delay(i * 90)}>
                <span className="grid size-12 place-items-center rounded-xl bg-card text-gold-ink shadow-[var(--shadow-soft)]">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 text-lg font-bold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────── How ordering works ───────────────── */}
      <section className="container-page pt-24">
        <div className="text-center" data-reveal>
          <p className="eyebrow">Si funksionon</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl">Porosia në tre hapa</h2>
        </div>
        <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          <span aria-hidden className="absolute top-7 right-[16%] left-[16%] hidden h-px bg-border md:block" />
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative text-center" data-reveal style={delay(i * 120)}>
              <span className="relative mx-auto grid size-14 place-items-center rounded-full border bg-background">
                <Icon className="size-6" strokeWidth={1.6} />
                <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-highlight text-[11px] font-bold text-highlight-foreground">
                  {i + 1}
                </span>
              </span>
              <p className="mt-5 text-lg font-bold">{title}</p>
              <p className="mx-auto mt-1 max-w-[260px] text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <RecentlyViewed />

      {/* ───────────────── Instagram + WhatsApp ───────────────── */}
      <section className="container-page grid gap-5 pt-24 lg:grid-cols-[1fr_1.15fr]">
        <a
          href={SHOP.contact.instagram}
          target="_blank"
          rel="noopener noreferrer"
          data-reveal
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-8 sm:p-10"
        >
          <div>
            <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white">
              <InstagramIcon className="size-6" />
            </span>
            <p className="mt-6 eyebrow">Instagram</p>
            <p className="mt-2 font-display text-4xl leading-tight">Frymëzim çdo ditë</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Produktet e reja, ide për dekorim dhe ofertat e para, së pari në Instagram.
            </p>
          </div>
          <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold">
            Na ndiqni
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </a>

        <div
          data-reveal
          style={delay(100)}
          className="relative overflow-hidden rounded-2xl bg-ink p-8 text-ink-foreground sm:p-10 lg:p-12"
        >
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-highlight/25 blur-3xl" />
          <p className="relative text-[11px] font-bold tracking-[0.2em] text-highlight uppercase">Këshillim falas</p>
          <h2 className="relative mt-4 font-display text-4xl leading-[1.05] text-balance sm:text-5xl">
            Nuk e gjeni atë që kërkoni?
          </h2>
          <p className="relative mt-4 max-w-md text-white/65">
            Ju ndihmojmë me dimensione, ngjyra apo produkte që nuk janë ende në faqe. Na shkruani, përgjigjemi shpejt.
          </p>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[#25d366] text-[#0b3d1f] hover:bg-[#25d366]/90">
              <a href={whatsappLink("Përshëndetje Flux Dekor! Kam një pyetje.")} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-5" /> Shkruaj në WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <a href={SHOP.contact.phoneHref}>Telefono {SHOP.contact.phone}</a>
            </Button>
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
  sale,
}: {
  eyebrow: string
  title: string
  href: string
  cta: string
  sale?: boolean
}) {
  return (
    <div className="flex items-end justify-between gap-6" data-reveal>
      <div>
        <p className={cn("eyebrow", sale && "text-sale")}>{eyebrow}</p>
        <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">{title}</h2>
      </div>
      <Link
        href={href}
        className="group inline-flex shrink-0 items-center gap-1.5 border-b border-foreground/30 pb-0.5 text-sm font-semibold transition-colors hover:border-foreground"
      >
        <span className="max-sm:sr-only">{cta}</span>
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </div>
  )
}

function ProductSection({
  children,
  ...header
}: {
  eyebrow: string
  title: string
  href: string
  cta: string
  sale?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="container-page pt-24">
      <SectionHeader {...header} />
      <div data-reveal style={delay(80)}>
        <ProductGrid className="mt-9">{children}</ProductGrid>
      </div>
    </section>
  )
}

function PromoBanner({
  href,
  eyebrow,
  title,
  cta,
  image,
  tone,
}: {
  href: string
  eyebrow: string
  title: React.ReactNode
  cta: string
  image?: string
  tone: "ink" | "sand"
}) {
  const dark = tone === "ink"
  const fit = imageFit(image)
  return (
    <Link
      href={href}
      data-reveal
      className={cn(
        "group relative grid min-h-[260px] overflow-hidden rounded-2xl sm:grid-cols-[1.25fr_1fr]",
        dark ? "bg-ink text-ink-foreground" : "bg-sand text-foreground",
      )}
    >
      <div className="relative z-10 flex flex-col justify-center p-7 sm:p-9">
        <p className={cn("text-[11px] font-bold tracking-[0.18em] uppercase", dark ? "text-highlight" : "text-gold-ink")}>
          {eyebrow}
        </p>
        <p className="mt-3 font-display text-3xl leading-[1.08] sm:text-[2.15rem]">{title}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
          {cta}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
      {image && (
        <div
          className={cn(
            "relative min-h-[200px] overflow-hidden",
            // Cut-outs often ship on white; give them a light stage instead of a white box.
            fit === "contain" && "m-4 rounded-xl bg-[#f3efe7] sm:ml-0",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            loading="lazy"
            className={cn(
              "absolute inset-0 size-full transition-transform duration-700 group-hover:scale-105",
              fit === "cover" ? "object-cover" : "object-contain p-6 mix-blend-multiply",
            )}
          />
        </div>
      )}
    </Link>
  )
}
