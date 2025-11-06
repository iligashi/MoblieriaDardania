import type { Furniture } from "@/lib/types"
import { FurnitureCard } from "./furniture-card"

interface FurnitureGridProps {
  furniture: Furniture[]
}

export function FurnitureGrid({ furniture }: FurnitureGridProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {furniture.map((item, index) => (
        <div
          key={item.id}
          className={index === 0 ? "sm:col-span-2 lg:col-span-2" : ""}
        >
          <FurnitureCard furniture={item} featured={index === 0} />
        </div>
      ))}
    </div>
  )
}
