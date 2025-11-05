import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ImageCarousel } from "@/components/image-carousel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Package, Ruler, Palette, Weight, Sofa, Sparkles } from "lucide-react"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Link>
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <Sofa className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">Mobileria Dardania</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Carousel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ImageCarousel images={furniture.images} title={furniture.title} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-balance bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {furniture.title}
                </h1>
                <Badge
                  variant="secondary"
                  className="capitalize text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20"
                >
                  {furniture.category}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-bold text-foreground">${furniture.price.toFixed(2)}</p>
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="rounded-xl bg-gradient-to-br from-card to-secondary/30 p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Description
              </h2>
              <p className="leading-relaxed text-muted-foreground">{furniture.description}</p>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg group-hover:scale-110 transition-transform">
                    <Ruler className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
                    <p className="text-base font-semibold text-foreground">
                      {furniture.dimensions.length} × {furniture.dimensions.width} × {furniture.dimensions.height}{" "}
                      {furniture.dimensions.unit}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all border-primary/20 bg-gradient-to-br from-card to-accent/5">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-xl bg-gradient-to-br from-accent to-primary p-3 shadow-lg group-hover:scale-110 transition-transform">
                    <Weight className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Weight</p>
                    <p className="text-base font-semibold text-foreground">
                      {furniture.weight} {furniture.weight_unit}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all border-primary/20 bg-gradient-to-br from-card to-secondary/50">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg group-hover:scale-110 transition-transform">
                    <Palette className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Color</p>
                    <p className="capitalize text-base font-semibold text-foreground">{furniture.color}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all border-primary/20 bg-gradient-to-br from-card to-accent/5">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-xl bg-gradient-to-br from-accent to-primary p-3 shadow-lg group-hover:scale-110 transition-transform">
                    <Package className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Material</p>
                    <p className="capitalize text-base font-semibold text-foreground">{furniture.material}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="space-y-4 rounded-xl bg-gradient-to-br from-card to-secondary/30 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">Availability:</span>
                {furniture.stock > 0 ? (
                  <Badge className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    {furniture.stock} in stock
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="shadow-lg">
                    Out of stock
                  </Badge>
                )}
              </div>

              <Button
                size="lg"
                className="w-full text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary"
                disabled={furniture.stock === 0}
              >
                {furniture.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>

              <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Free shipping on orders over $500
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 lg:mt-16">
          <Card className="border-primary/20 bg-gradient-to-br from-card via-secondary/20 to-card shadow-xl">
            <CardContent className="p-8">
              <h2 className="mb-6 text-2xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Product Specifications
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="capitalize text-lg font-semibold">{furniture.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Material</p>
                  <p className="capitalize text-lg font-semibold">{furniture.material}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Color</p>
                  <p className="capitalize text-lg font-semibold">{furniture.color}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Length</p>
                  <p className="text-lg font-semibold">
                    {furniture.dimensions.length} {furniture.dimensions.unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Width</p>
                  <p className="text-lg font-semibold">
                    {furniture.dimensions.width} {furniture.dimensions.unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Height</p>
                  <p className="text-lg font-semibold">
                    {furniture.dimensions.height} {furniture.dimensions.unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Weight</p>
                  <p className="text-lg font-semibold">
                    {furniture.weight} {furniture.weight_unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Stock</p>
                  <p className="text-lg font-semibold">{furniture.stock} units</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
