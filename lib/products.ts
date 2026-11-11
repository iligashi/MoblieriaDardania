import type { z } from "zod"
import type { productSchema } from "@/lib/validation"

type ProductInput = z.infer<typeof productSchema>

/** Maps validated form input onto the exact set of writable `products` columns. */
export function toProductRow(input: ProductInput): Record<string, unknown> {
  return {
    title: input.title,
    category: input.category,
    category_id: input.category_id,
    short_description: input.short_description,
    description: input.description,
    price: input.price,
    discount_price: input.discount_price,
    sku: input.sku,
    brand: input.brand,
    dimensions: input.dimensions,
    material: input.material,
    color: input.color,
    weight: input.weight,
    weight_unit: input.weight_unit,
    stock: input.stock,
    images: input.images,
    is_featured: input.is_featured,
    is_bestseller: input.is_bestseller,
    is_new: input.is_new,
    is_active: input.is_active,
    tags: input.tags,
    custom_fields: input.custom_fields ?? input.customFields ?? [],
  }
}
