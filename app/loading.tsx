import { ProductCardSkeleton, ProductGrid } from "@/components/product-card"

export default function Loading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-label="Duke u ngarkuar">
      <div className="h-9 w-56 animate-pulse rounded-xl bg-muted" />
      <div className="mt-3 h-4 w-40 animate-pulse rounded bg-muted" />
      <ProductGrid className="mt-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </ProductGrid>
    </div>
  )
}
