import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ImageCarousel } from "@/components/image-carousel"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ChevronRight, Check, Truck, Shield, RotateCcw, Package, Ruler, Palette, Weight } from "lucide-react"
import { CustomFieldsDisplay } from "@/components/dynamic-field-renderer"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { ProductCard } from "@/components/product-card"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("products").select("title, short_description").or(`slug.eq.${slug},id.eq.${slug}`).single()
  return {
    title: data?.title || "Produkt",
    description: data?.short_description || data?.title,
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch by slug or ID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
  const query = isUUID
    ? supabase.from("products").select("*").eq("id", slug)
    : supabase.from("products").select("*").eq("slug", slug)

  const { data: product, error } = await query.single()

  if (error || !product) notFound()

  // Fetch related products
  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(4)

  const hasDiscount = product.discount_price && product.discount_price < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-[#f8f9fa] border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Ballina</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/shop" className="hover:text-foreground transition-colors">Dyqani</Link>
            {product.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href={`/shop?category=${product.category}`} className="hover:text-foreground transition-colors capitalize">
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Image Gallery */}
          <div>
            {product.images && product.images.length > 0 ? (
              <ImageCarousel images={product.images} title={product.title} />
            ) : (
              <div className="aspect-square rounded-xl bg-[#f8f9fa] flex items-center justify-center">
                <img src="/placeholder.svg" alt={product.title} className="h-2/3 w-2/3 object-contain" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* SKU & Brand */}
            <div className="flex items-center gap-3 mb-2">
              {product.sku && (
                <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
              )}
              {product.brand && (
                <Badge variant="outline" className="text-xs">{product.brand}</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-foreground">
                {(hasDiscount ? product.discount_price! : product.price).toFixed(2)} &euro;
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {product.price.toFixed(2)} &euro;
                  </span>
                  <Badge className="bg-red-600 text-white border-0">-{discountPercent}%</Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-1.5 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">Ka sasi ({product.stock} ne stok)</span>
                </div>
              ) : (
                <span className="text-sm font-medium text-destructive">Nuk ka ne stok</span>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {product.short_description}
              </p>
            )}

            <Separator className="mb-6" />

            {/* Add to Cart */}
            <div className="space-y-3 mb-6">
              <AddToCartButton product={product} />
              <WhatsAppButton product={product} />
            </div>

            {/* Trust Badges */}
            <div className="space-y-2.5 p-4 bg-[#f8f9fa] rounded-xl">
              <div className="flex items-center gap-2.5 text-sm">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <span>24-48 ore ne Kosove</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <span>Produkte origjinale me garanci</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <RotateCcw className="h-4 w-4 text-primary shrink-0" />
                <span>Kthim brenda 48 oreve</span>
              </div>
            </div>

            {/* Category */}
            <div className="mt-4 text-sm text-muted-foreground">
              <span>Kategori: </span>
              <Link href={`/shop?category=${product.category}`} className="text-primary hover:underline capitalize">
                {product.category}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs / Description */}
      <section className="bg-[#f8f9fa] border-t border-border/50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-xl font-bold mb-4">Pershkrimi</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}

            {/* Specifications */}
            {(product.dimensions || product.material || product.color || product.weight) && (
              <div>
                <h2 className="text-xl font-bold mb-4">Specifikimet</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {product.dimensions && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border/50">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Ruler className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Dimensionet</p>
                        <p className="text-sm font-semibold">
                          {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} {product.dimensions.unit}
                        </p>
                      </div>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border/50">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Weight className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pesha</p>
                        <p className="text-sm font-semibold">{product.weight} {product.weight_unit}</p>
                      </div>
                    </div>
                  )}
                  {product.color && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border/50">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Palette className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ngjyra</p>
                        <p className="text-sm font-semibold capitalize">{product.color}</p>
                      </div>
                    </div>
                  )}
                  {product.material && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border/50">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Materiali</p>
                        <p className="text-sm font-semibold capitalize">{product.material}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {product.custom_fields && Array.isArray(product.custom_fields) && product.custom_fields.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Detaje shtese</h2>
                <CustomFieldsDisplay
                  fields={product.custom_fields}
                  values={product.custom_fields.reduce((acc: Record<string, unknown>, field: { fieldKey: string; fieldValue?: unknown }) => {
                    acc[field.fieldKey] = field.fieldValue
                    return acc
                  }, {})}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related && related.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <h2 className="text-xl font-bold mb-6">Produkte te ngjashme</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
