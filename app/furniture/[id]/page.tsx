import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ImageCarousel } from "@/components/image-carousel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Package, Ruler, Palette, Weight, ShoppingCart, Check, Truck, Shield } from "lucide-react"
import { CustomFieldsDisplay } from "@/components/dynamic-field-renderer"

export default async function FurnitureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: furniture, error } = await supabase.from("furniture").select("*").eq("id", id).single()

  if (error || !furniture) {
    notFound()
  }

  const mainImage = furniture.images?.[0] || "/placeholder.svg"

  return (
    <div className="min-h-screen bg-background">
      {/* Minimalist Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-xl border-b border-border/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Link href="/" className="text-sm font-bold tracking-tight">
            MOBILERIA DARDANIA
          </Link>
        </div>
      </header>

      <main className="pt-16">
        {/* Main Product Section - Two Column Layout */}
        <section className="container mx-auto px-6 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column - Product Image (2/3 width) */}
              <div className="lg:col-span-8">
                {furniture.images && furniture.images.length > 0 ? (
                  <ImageCarousel images={furniture.images} title={furniture.title} />
                ) : (
                  <div className="aspect-square rounded-2xl bg-muted/50 overflow-hidden">
                    <img
                      src={mainImage}
                      alt={furniture.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Right Column - Product Info Card (1/3 width) */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  {/* Product Title & Category */}
                  <div className="mb-6">
                    <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 capitalize">
                      {furniture.category}
                    </Badge>
                    <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4 text-foreground">
                      {furniture.title}
                    </h1>
                  </div>

                  {/* Purchase Card */}
                  <Card className="border border-border/50 shadow-xl bg-white">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Price Display */}
                        <div className="pb-6 border-b border-border/50">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Price</p>
                          <p className="text-4xl font-black text-foreground">
                            ${furniture.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                          <span className="text-sm font-medium text-muted-foreground">Availability</span>
                          {furniture.stock > 0 ? (
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">
                                {furniture.stock} in stock
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-destructive">Out of stock</span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          size="lg"
                          className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                          disabled={furniture.stock === 0}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {furniture.stock > 0 ? "Add to Cart" : "Out of Stock"}
                        </Button>

                        {/* Trust Badges */}
                        <div className="space-y-3 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Truck className="h-4 w-4 text-primary" />
                            <span>Free shipping on orders over $500</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4 text-primary" />
                            <span>Secure checkout & warranty included</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Description & Specifications Section */}
        <section className="container mx-auto px-6 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold mb-4 tracking-tight">About This Piece</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {furniture.description}
                </p>
              </div>

              <Separator />

              {/* Specifications Grid */}
              <div>
                <h2 className="text-2xl font-bold mb-6 tracking-tight">Specifications</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Ruler className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
                        <p className="text-lg font-bold text-foreground">
                          {furniture.dimensions.length} × {furniture.dimensions.width} × {furniture.dimensions.height} {furniture.dimensions.unit}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Weight className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Weight</p>
                        <p className="text-lg font-bold text-foreground">
                          {furniture.weight} {furniture.weight_unit}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Palette className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Color</p>
                        <p className="text-lg font-bold text-foreground capitalize">
                          {furniture.color}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Material</p>
                        <p className="text-lg font-bold text-foreground capitalize">
                          {furniture.material}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Fields Section */}
              {((furniture as any)?.customFields || (furniture as any)?.custom_fields) && 
               Array.isArray((furniture as any).customFields || (furniture as any).custom_fields) && 
               ((furniture as any).customFields || (furniture as any).custom_fields).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-2xl font-bold mb-6 tracking-tight">Additional Details</h2>
                    <CustomFieldsDisplay 
                      fields={(furniture as any).customFields || (furniture as any).custom_fields} 
                      values={((furniture as any).customFields || (furniture as any).custom_fields).reduce((acc: Record<string, any>, field: any) => {
                        acc[field.fieldKey] = field.fieldValue
                        return acc
                      }, {})}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
