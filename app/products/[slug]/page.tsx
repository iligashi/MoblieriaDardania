import { cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BadgeCheck, ChevronRight, Headset, Ruler, RotateCcw, ShieldCheck, Truck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ImageCarousel } from "@/components/image-carousel"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { ProductCard, ProductGrid } from "@/components/product-card"
import { Price, discountPercent } from "@/components/price"
import { StockDot } from "@/components/stock-dot"
import { DeliveryEstimate, StickyAddToCart } from "@/components/product-purchase"
import { RecentlyViewed, TrackRecentlyViewed } from "@/components/recently-viewed"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { isUuid } from "@/lib/validation"
import { SHOP, formatPrice, unitPrice } from "@/lib/shop-config"
import { SITE_URL } from "@/lib/site"
import type { Category, CustomField, Product } from "@/lib/types"

const getProduct = cache(async (slug: string) => {
  const supabase = await createClient()
  const column = isUuid(slug) ? "id" : "slug"
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq(column, slug)
    .eq("is_active", true)
    .maybeSingle()
  return data as Product | null
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: "Produkti nuk u gjet" }
  const description = product.short_description || product.description?.slice(0, 160) || product.title
  const url = `/products/${product.slug || product.id}`
  return {
    title: product.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.title,
      description,
      url,
      images: product.images?.slice(0, 4).map((src) => ({ url: src })),
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const supabase = await createClient()
  const [categoryResult, relatedResult] = await Promise.all([
    product.category_id
      ? supabase.from("categories").select("*").eq("id", product.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
    (product.category_id
      ? supabase.from("products").select("*").eq("category_id", product.category_id)
      : supabase.from("products").select("*").eq("category", product.category)
    )
      .eq("is_active", true)
      .neq("id", product.id)
      .order("is_bestseller", { ascending: false })
      .limit(4),
  ])
  const category = categoryResult.data as Category | null
  const related = (relatedResult.data as Product[]) ?? []

  const off = discountPercent(product)
  const outOfStock = product.stock <= 0
  const customFields = (Array.isArray(product.custom_fields) ? product.custom_fields : []).filter(
    (f: CustomField) => f.isVisible && f.fieldValue !== undefined && f.fieldValue !== "",
  )

  const d = product.dimensions
  const hasDimensions = !!d && !!(d.length || d.width || d.height)
  const unit = d?.unit || "cm"

  const specs: [string, string][] = []
  if (hasDimensions) specs.push(["Dimensionet (G × Gj × L)", `${d!.length} × ${d!.width} × ${d!.height} ${unit}`])
  if (product.material) specs.push(["Materiali", product.material])
  if (product.color) specs.push(["Ngjyra", product.color])
  if (product.weight) specs.push(["Pesha", `${product.weight} ${product.weight_unit || "kg"}`])
  if (product.brand) specs.push(["Marka", product.brand])
  if (product.sku) specs.push(["SKU", product.sku])
  for (const f of customFields.sort((a, b) => a.displayOrder - b.displayOrder)) {
    const v = f.fieldValue
    specs.push([f.fieldLabel, typeof v === "boolean" ? (v ? "Po" : "Jo") : Array.isArray(v) ? v.join(", ") : String(v)])
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.short_description || product.description,
    sku: product.sku || undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: category?.name,
    image: product.images,
    color: product.color || undefined,
    material: product.material || undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug || product.id}`,
      priceCurrency: "EUR",
      price: unitPrice(product).toFixed(2),
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Ballina", item: SITE_URL },
      { name: "Dyqani", item: `${SITE_URL}/shop` },
      ...(category ? [{ name: category.name, item: `${SITE_URL}/shop?category=${category.slug}` }] : []),
      { name: product.title, item: `${SITE_URL}/products/${product.slug || product.id}` },
    ].map((entry, i) => ({ "@type": "ListItem", position: i + 1, ...entry })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbLd]).replace(/</g, "\\u003c") }}
      />
      <TrackRecentlyViewed productId={product.id} />

      <div className="container-page pt-5 lg:pt-8">
        <nav aria-label="Navigimi" className="flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
          <Link href="/" className="shrink-0 hover:text-foreground">
            Ballina
          </Link>
          <ChevronRight className="size-3 shrink-0" />
          <Link href="/shop" className="shrink-0 hover:text-foreground">
            Dyqani
          </Link>
          {category && (
            <>
              <ChevronRight className="size-3 shrink-0" />
              <Link href={`/shop?category=${category.slug}`} className="shrink-0 hover:text-foreground">
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="size-3 shrink-0" />
          <span className="truncate text-foreground">{product.title}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
          <ImageCarousel images={product.images ?? []} title={product.title} />

          <div className="lg:sticky lg:top-36 lg:self-start">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="text-[11px] font-bold tracking-[0.16em] text-gold-ink uppercase hover:underline"
                >
                  {category.name}
                </Link>
              )}
              {off > 0 && (
                <span className="rounded-md bg-sale px-2 py-0.5 text-xs font-bold text-sale-foreground">−{off}%</span>
              )}
              {product.is_new && <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">E re</span>}
              {product.is_bestseller && (
                <span className="rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-ink-foreground">Më e shitur</span>
              )}
            </div>

            <h1 className="mt-3 font-display text-[2.6rem] leading-[1.04] text-balance sm:text-5xl">{product.title}</h1>
            {product.brand && <p className="mt-2 text-sm text-muted-foreground">nga {product.brand}</p>}

            <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-1 border-y py-5">
              <Price product={product} size="lg" />
              {off > 0 && (
                <span className="mb-1 rounded-md bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                  Kurseni {formatPrice(product.price - unitPrice(product))}
                </span>
              )}
              <StockDot product={product} className="mb-1.5 ml-auto text-xs" />
            </div>

            {product.short_description && (
              <p className="mt-5 leading-relaxed text-muted-foreground">{product.short_description}</p>
            )}

            {(product.color || product.material) && (
              <dl className="mt-5 flex flex-wrap gap-2">
                {product.color && (
                  <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
                    <dt className="text-muted-foreground">Ngjyra</dt>
                    <dd className="font-semibold capitalize">{product.color}</dd>
                  </div>
                )}
                {product.material && (
                  <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
                    <dt className="text-muted-foreground">Materiali</dt>
                    <dd className="font-semibold capitalize">{product.material}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="mt-6 space-y-2.5">
              <AddToCartButton product={product} />
              <WhatsAppButton product={product} />
            </div>

            {!outOfStock && (
              <div className="mt-5">
                <DeliveryEstimate />
              </div>
            )}

            {hasDimensions && (
              <div className="mt-5 rounded-xl border bg-card p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Ruler className="size-4 text-gold-ink" /> Dimensionet
                </p>
                <dl className="mt-3 grid grid-cols-3 divide-x text-center">
                  {[
                    ["Gjatësia", d!.length],
                    ["Gjerësia", d!.width],
                    ["Lartësia", d!.height],
                  ].map(([k, v]) => (
                    <div key={k as string} className="px-2">
                      <dt className="text-[11px] text-muted-foreground">{k}</dt>
                      <dd className="mt-0.5 font-display text-2xl tabular-nums">
                        {v || "—"}
                        {v ? <span className="ml-0.5 font-sans text-xs text-muted-foreground">{unit}</span> : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <ul className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { icon: Truck, title: "Dërgesë 24–48h", text: `Falas mbi ${formatPrice(SHOP.freeShippingThreshold)}` },
                { icon: ShieldCheck, title: "Garanci zyrtare", text: "Produkt origjinal" },
                { icon: RotateCcw, title: "Kthim 48 orë", text: "Pa pyetje" },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-xl bg-muted/60 px-2 py-3">
                  <Icon className="mx-auto size-5 text-gold-ink" strokeWidth={1.7} />
                  <p className="mt-1.5 font-semibold">{title}</p>
                  <p className="text-muted-foreground">{text}</p>
                </li>
              ))}
            </ul>

            <Accordion type="multiple" defaultValue={["description"]} className="mt-6">
              {product.description && (
                <AccordionItem value="description">
                  <AccordionTrigger>Përshkrimi</AccordionTrigger>
                  <AccordionContent>
                    <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{product.description}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
              {specs.length > 0 && (
                <AccordionItem value="specs">
                  <AccordionTrigger>Specifikimet</AccordionTrigger>
                  <AccordionContent>
                    <dl className="divide-y rounded-xl border bg-card">
                      {specs.map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[1fr_1.4fr] gap-4 px-4 py-3 text-sm">
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="font-medium capitalize">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="shipping">
                <AccordionTrigger>Dërgesa dhe pagesa</AccordionTrigger>
                <AccordionContent className="space-y-2 leading-relaxed text-muted-foreground">
                  <p>
                    Dërgojmë në të gjithë Kosovën brenda 24–48 orëve. Transporti kushton {formatPrice(SHOP.shippingCost)} dhe
                    është falas për porosi mbi {formatPrice(SHOP.freeShippingThreshold)}.
                  </p>
                  <p>Paguani me para në dorë kur ta pranoni porosinë.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger>Garancia dhe kthimi</AccordionTrigger>
                <AccordionContent className="space-y-2 leading-relaxed text-muted-foreground">
                  <p>Të gjitha produktet janë origjinale dhe vijnë me garancinë zyrtare të prodhuesit.</p>
                  <p>Kthimi është i mundur brenda 48 orëve. Na kontaktoni dhe ju udhëzojmë.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <a
              href={SHOP.contact.phoneHref}
              className="mt-6 flex items-center gap-3 rounded-xl border bg-card p-4 text-sm transition-colors hover:border-foreground/25"
            >
              <span className="grid size-10 place-items-center rounded-full bg-muted">
                <Headset className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">Keni pyetje për këtë produkt?</span>
                <span className="text-muted-foreground">
                  Telefononi {SHOP.contact.phone} · çdo ditë {SHOP.contact.hours}
                </span>
              </span>
            </a>

            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <BadgeCheck className="size-4 text-success" /> Pagesë e sigurt në dorëzim, pa kartë.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page pt-24" data-reveal>
          <p className="eyebrow">Mund t&apos;ju pëlqejnë</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl">Produkte të ngjashme</h2>
          <ProductGrid className="mt-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} category={category?.name} />
            ))}
          </ProductGrid>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />

      <StickyAddToCart product={product} />
    </>
  )
}
