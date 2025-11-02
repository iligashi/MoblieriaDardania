export interface Furniture {
  id: string
  title: string
  category: string
  description: string
  price: number
  dimensions: {
    length: number
    width: number
    height: number
    unit: string
  }
  material: string
  color: string
  weight: number
  weight_unit: string
  stock: number
  images: string[]
  created_at: string
  updated_at: string
}

export interface FurnitureFormData {
  title: string
  category: string
  description: string
  price: number
  dimensions: {
    length: number
    width: number
    height: number
    unit: string
  }
  material: string
  color: string
  weight: number
  weight_unit: string
  stock: number
  images: string[]
}
