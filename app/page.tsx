import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ChevronRight, Truck, Shield, RotateCcw, ArrowRight, Sparkles } from "lucide-react"
import { ProductCard } from "@/components/product-card"

export default async function HomePage() {
  const supabase = await createClient()

  const [newResult, saleResult, bestsellerResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).eq("is_new", true).order("created_at", { ascending: false }).limit(8),
    supabase.from("products").select("*").eq("is_active", true).not("discount_price", "is", null).order("created_at", { ascending: false }).limit(8),
    supabase.from("products").select("*").eq("is_active", true).eq("is_bestseller", true).limit(8),
    supabase.from("categories").select("*").eq("is_active", true).is("parent_id", null).order("display_order").limit(8),
  ])

  const newProducts = newResult.data || []
  const saleProducts = saleResult.data || []
  const bestsellers = bestsellerResult.data || []
  const categories = categoriesResult.data || []

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[#1b1f22] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-28 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[#ffc21f]" />
              <span className="text-xs font-medium text-white/80">Transport falas mbi 50 EUR</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-4 tracking-tight">
              Gjithcka per
              <span className="block text-[#ffc21f]">shtepine tuaj</span>
            </h1>

            <p className="text-base sm:text-lg text-white/60 mb-8 max-w-lg leading-relaxed">
              Mobileri, dekorime, vegla pune dhe shume me teper. Produkte origjinale me garanci dhe dergese ne te gjithe Kosoven.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 h-12 px-7 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors"
              >
                Blej tani
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop?on_sale=true"
                className="inline-flex items-center gap-2 h-12 px-7 bg-white/10 hover:bg-white/15 text-white font-bold rounded-lg transition-colors backdrop-blur-sm border border-white/10"
              >
                Shiko zbritjet
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-3 divide-x divide-white/10">
              <div className="text-center px-2">
                <p className="text-lg sm:text-2xl font-black text-white">24-48h</p>
                <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">Dergese ne Kosove</p>
              </div>
              <div className="text-center px-2">
                <p className="text-lg sm:text-2xl font-black text-[#ffc21f]">100%</p>
                <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">Produkte origjinale</p>
              </div>
              <div className="text-center px-2">
                <p className="text-lg sm:text-2xl font-black text-white">48h</p>
                <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">Kthim pa pyetje</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Strip */}
      <section className="bg-[#f8f9fa] border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center justify-center gap-2.5 text-sm">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <span className="font-medium">Transport falas mbi 50 EUR</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-sm">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <span className="font-medium">Produkte origjinale me garanci</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-sm">
              <RotateCcw className="h-5 w-5 text-primary shrink-0" />
              <span className="font-medium">Kthim brenda 48 oreve</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Kategorite</h2>
            <Link href="/shop" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              Te gjitha <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative h-32 sm:h-40 rounded-xl overflow-hidden bg-[#f8f9fa] border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all"
              >
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                  />
                )}
                <div className="relative h-full flex items-end p-4">
                  <span className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sale Products */}
      {saleProducts.length > 0 && (
        <section className="bg-gradient-to-r from-red-50 to-orange-50 py-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Zbritjet me te medha</h2>
                <span className="hidden sm:inline-flex items-center h-6 px-2.5 rounded bg-red-600 text-white text-xs font-bold">
                  SALE
                </span>
              </div>
              <Link href="/shop?on_sale=true" className="text-sm font-medium text-red-600 hover:underline flex items-center gap-1">
                Shiko te gjitha <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Te rejat</h2>
              <span className="hidden sm:inline-flex items-center h-6 px-2.5 rounded bg-blue-600 text-white text-xs font-bold">
                NEW
              </span>
            </div>
            <Link href="/shop?new=true" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              Shiko te gjitha <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="bg-[#f8f9fa] py-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Me te shitura</h2>
              <Link href="/shop?bestseller=true" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Shiko te gjitha <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {bestsellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="container mx-auto px-4 py-10">
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Porosit tani ne WhatsApp</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Kontaktoni me ne direkt per porosi, pyetje, ose keshilla per produktet tona.
          </p>
          <a
            href="https://wa.me/38349514788"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-6 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Shkruaj ne WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}
