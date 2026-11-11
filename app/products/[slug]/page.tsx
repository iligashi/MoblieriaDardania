import { cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BadgeCheck, ChevronRight, RotateCcw, Truck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ImageCarousel } from "@/components/image-carousel"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { ProductCard, ProductGrid } from "@/components/product-card"
import { Price, discountPercent } from "@/components/price"
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
  const lowStock = !outOfStock && product.stock <= SHOP.lowStockThreshold
  const customFields = (Array.isArray(product.custom_fields) ? product.custom_fields : []).filter(
    (f: CustomField) => f.isVisible && f.fieldValue !== undefined && f.fieldValue !== "",
  )

  const specs: [string, string][] = []
  if (product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height)) {
    const d = product.dimensions
    specs.push(["Dimensionet (G × Gj × L)", `${d.length} × ${d.width} × ${d.height} ${d.unit || "cm"}`])
  }
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
    image: product.images,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug || product.id}`,
      priceCurrency: "EUR",
      price: unitPrice(product).toFixed(2),
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="container-page pt-6 lg:pt-10">
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

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <ImageCarousel images={product.images ?? []} title={product.title} />

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-wrap items-center gap-2">
              {off > 0 && (
                <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                  −{off}% zbritje
                </span>
              )}
              {product.is_new && <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">E re</span>}
              {product.is_bestseller && (
                <span className="rounded-full bg-highlight/40 px-2.5 py-1 text-xs font-semibold text-highlight-foreground">
                  Më e shitur
                </span>
              )}
            </div>

            {product.brand && (
              <p className="mt-4 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">{product.brand}</p>
            )}
            <h1 className="mt-2 font-display text-4xl leading-[1.05] text-balance sm:text-5xl">{product.title}</h1>

            <Price product={product} size="lg" className="mt-5" />
            {off > 0 && (
              <p className="mt-1 text-sm text-success">Kurseni {formatPrice(product.price - unitPrice(product))}</p>
            )}

            {product.short_description && (
              <p className="mt-5 leading-relaxed text-muted-foreground">{product.short_description}</p>
            )}

            <p className="mt-6 flex items-center gap-2 text-sm font-medium">
              <span
                className={
                  outOfStock
                    ? "size-2 rounded-full bg-destructive"
                    : lowStock
                      ? "size-2 animate-pulse rounded-full bg-warning"
                      : "size-2 rounded-full bg-success"
                }
              />
              {outOfStock ? "Momentalisht jo në stok" : lowStock ? `Vetëm ${product.stock} copë të mbetura` : "Në stok — gati për dërgesë"}
            </p>

            <div className="mt-5 space-y-2.5">
              <AddToCartButton product={product} />
              <WhatsAppButton product={product} />
            </div>

            <ul className="mt-6 grid gap-3 rounded-2xl border bg-card p-4 text-sm sm:grid-cols-3 sm:gap-2 lg:grid-cols-1 xl:grid-cols-3">
              <li className="flex items-center gap-2.5">
                <Truck className="size-4 shrink-0 text-primary" />
                <span>
                  Dërgesë 24–48 orë
                  <span className="block text-xs text-muted-foreground">
                    Falas mbi {formatPrice(SHOP.freeShippingThreshold)}
                  </span>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <BadgeCheck className="size-4 shrink-0 text-primary" />
                <span>
                  Origjinale
                  <span className="block text-xs text-muted-foreground">Me garanci</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <RotateCcw className="size-4 shrink-0 text-primary" />
                <span>
                  Kthim 48 orë
                  <span className="block text-xs text-muted-foreground">Pa pyetje</span>
                </span>
              </li>
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
                    <dl className="divide-y rounded-xl border">
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
                  <p>Paguani me para në dorë kur ta pranoni porosinë. Kthimi është i mundur brenda 48 orëve.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page pt-24">
          <p className="eyebrow">Mund t&apos;ju pëlqejnë</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl">Produkte të ngjashme</h2>
          <ProductGrid className="mt-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        </section>
      )}
    </>
  )
}
