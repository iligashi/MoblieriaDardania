import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ImageCarousel } from "@/components/image-carousel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Package, Ruler, Palette, Weight, Check, Truck, Shield } from "lucide-react"
import { CustomFieldsDisplay } from "@/components/dynamic-field-renderer"
import { OrderRequestButton } from "@/components/order-request-button"

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
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 active:bg-primary/20 touch-manipulation min-h-[44px]">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
          <Link href="/" className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-tight">
            <img
              src="/flux-removebg-preview.png"
              alt="Flux Dekor logo"
              className="h-6 w-6 sm:h-7 sm:w-7 rounded bg-white object-contain"
            />
            <span>FLUX DEKOR</span>
          </Link>
        </div>
      </header>

      <main className="pt-14 sm:pt-16">
        {/* Main Product Section - Two Column Layout */}
        <section className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
              {/* Left Column - Product Image (2/3 width) */}
              <div className="lg:col-span-8 order-1">
                {furniture.images && furniture.images.length > 0 ? (
                  <ImageCarousel images={furniture.images} title={furniture.title} />
                ) : (
                  <div className="aspect-square rounded-xl sm:rounded-2xl bg-muted/50 overflow-hidden">
                    <img
                      src={mainImage}
                      alt={furniture.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Right Column - Product Info Card (1/3 width) */}
              <div className="lg:col-span-4 order-2">
                <div className="lg:sticky lg:top-24">
                  {/* Product Title & Category */}
                  <div className="mb-4 sm:mb-6">
                    <Badge className="mb-2 sm:mb-3 bg-primary/10 text-primary border-primary/20 capitalize text-xs sm:text-sm">
                      {furniture.category}
                    </Badge>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 sm:mb-4 text-foreground">
                      {furniture.title}
                    </h1>
                  </div>

                  {/* Purchase Card */}
                  <Card className="border border-border/50 shadow-xl bg-white">
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4 sm:space-y-6">
                        {/* Price Display */}
                        <div className="pb-4 sm:pb-6 border-b border-border/50">
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Price</p>
                          <p className="text-3xl sm:text-4xl font-black text-foreground">
                            ${furniture.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground">Availability</span>
                          {furniture.stock > 0 ? (
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                              <span className="text-xs sm:text-sm font-semibold text-green-600">
                                {furniture.stock} in stock
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs sm:text-sm font-semibold text-destructive">Out of stock</span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <OrderRequestButton
                          furniture={{
                            id: furniture.id,
                            title: furniture.title,
                            price: Number(furniture.price),
                            stock: furniture.stock,
                            category: furniture.category,
                            images: furniture.images,
                          }}
                        />

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
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
                    {/* Description */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight">About This Piece</h2>
                      <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                        {furniture.description}
                      </p>
                    </div>

                    <Separator className="my-6 sm:my-8" />

                    {/* Specifications Grid */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 tracking-tight">Specifications</h2>
                      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Ruler className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Dimensions</p>
                              <p className="text-base sm:text-lg font-bold text-foreground break-words">
                                {furniture.dimensions.length} × {furniture.dimensions.width} × {furniture.dimensions.height} {furniture.dimensions.unit}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Weight className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Weight</p>
                              <p className="text-base sm:text-lg font-bold text-foreground">
                                {furniture.weight} {furniture.weight_unit}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Color</p>
                              <p className="text-base sm:text-lg font-bold text-foreground capitalize">
                                {furniture.color}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Material</p>
                              <p className="text-base sm:text-lg font-bold text-foreground capitalize">
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
                        <Separator className="my-6 sm:my-8" />
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 tracking-tight">Additional Details</h2>
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
