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

// Custom Fields Types
export type FieldType = 
  | 'text' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'date' 
  | 'boolean' 
  | 'url' 
  | 'email'
  | 'color'
  | 'image'
  | 'rich-text'

export interface CustomField {
  id: string
  fieldType: FieldType
  fieldKey: string
  fieldLabel: string
  fieldValue?: string | number | boolean | string[]
  fieldOptions?: {
    placeholder?: string
    options?: string[] // for select fields
    min?: number
    max?: number
    step?: number
    rows?: number // for textarea
    validation?: {
      pattern?: string
      required?: boolean
    }
  }
  displayOrder: number
  isRequired: boolean
  isVisible: boolean
}

export interface FurnitureWithCustomFields extends Furniture {
  customFields?: CustomField[]
}
