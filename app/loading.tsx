import { FurnitureGridSkeleton } from "@/components/furniture-grid-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div>
            <div className="h-9 w-64 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full max-w-md bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <div className="h-96 bg-muted rounded animate-pulse" />
          </aside>
          <div>
            <FurnitureGridSkeleton />
          </div>
        </div>
      </main>
    </div>
  )
}
