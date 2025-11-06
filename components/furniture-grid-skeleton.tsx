import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function FurnitureGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-full overflow-hidden animate-pulse">
          <CardHeader className="p-0">
            <div className="relative aspect-square overflow-hidden bg-muted" />
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="h-5 bg-muted rounded flex-1" />
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="flex w-full items-center justify-between">
              <div className="h-7 w-24 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
