import type { Furniture } from "@/lib/types"
import { FurnitureCard } from "./furniture-card"

interface FurnitureGridProps {
  furniture: Furniture[]
}

export function FurnitureGrid({ furniture }: FurnitureGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {furniture.map((item) => (
        <FurnitureCard key={item.id} furniture={item} />
      ))}
    </div>
  )
}
