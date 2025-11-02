import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ImageCarousel } from "@/components/image-carousel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Package, Ruler, Palette, Weight } from "lucide-react"

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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Carousel */}
          <div>
            <ImageCarousel images={furniture.images} title={furniture.title} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold leading-tight">{furniture.title}</h1>
                <Badge variant="secondary" className="capitalize">
                  {furniture.category}
                </Badge>
              </div>
              <p className="text-4xl font-bold">${furniture.price.toFixed(2)}</p>
            </div>

            <Separator />

            <div>
              <h2 className="mb-2 text-lg font-semibold">Description</h2>
              <p className="leading-relaxed text-muted-foreground">{furniture.description}</p>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Ruler className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dimensions</p>
                    <p className="text-sm text-muted-foreground">
                      {furniture.dimensions.length} × {furniture.dimensions.width} × {furniture.dimensions.height}{" "}
                      {furniture.dimensions.unit}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Weight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Weight</p>
                    <p className="text-sm text-muted-foreground">
                      {furniture.weight} {furniture.weight_unit}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Color</p>
                    <p className="capitalize text-sm text-muted-foreground">{furniture.color}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Material</p>
                    <p className="capitalize text-sm text-muted-foreground">{furniture.material}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Availability:</span>
                {furniture.stock > 0 ? (
                  <Badge variant="default">{furniture.stock} in stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of stock</Badge>
                )}
              </div>

              <Button size="lg" className="w-full" disabled={furniture.stock === 0}>
                {furniture.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">Free shipping on orders over $500</p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Product Specifications</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="capitalize">{furniture.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Material</p>
                  <p className="capitalize">{furniture.material}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Color</p>
                  <p className="capitalize">{furniture.color}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Length</p>
                  <p>
                    {furniture.dimensions.length} {furniture.dimensions.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Width</p>
                  <p>
                    {furniture.dimensions.width} {furniture.dimensions.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Height</p>
                  <p>
                    {furniture.dimensions.height} {furniture.dimensions.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Weight</p>
                  <p>
                    {furniture.weight} {furniture.weight_unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock</p>
                  <p>{furniture.stock} units</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
