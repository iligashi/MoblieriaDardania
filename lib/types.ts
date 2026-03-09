// ============================================================
// Product Types (evolved from Furniture)
// ============================================================

export interface Product {
  id: string
  title: string
  slug: string
  category: string // legacy text category
  category_id: string | null
  short_description: string | null
  description: string
  price: number
  discount_price: number | null
  sku: string | null
  brand: string | null
  dimensions: {
    length: number
    width: number
    height: number
    unit: string
  } | null
  material: string | null
  color: string | null
  weight: number | null
  weight_unit: string | null
  stock: number
  images: string[]
  is_featured: boolean
  is_bestseller: boolean
  is_new: boolean
  is_active: boolean
  tags: string[]
  custom_fields: CustomField[]
  created_at: string
  updated_at: string
}

// Backwards compatibility alias
export type Furniture = Product

export interface ProductFormData {
  title: string
  slug: string
  category: string
  category_id: string
  short_description: string
  description: string
  price: number
  discount_price: number | null
  sku: string
  brand: string
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
  is_featured: boolean
  is_bestseller: boolean
  is_new: boolean
  is_active: boolean
  tags: string[]
}

// Backwards compatibility alias
export type FurnitureFormData = ProductFormData

// ============================================================
// Category Types
// ============================================================

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  image: string | null
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  children?: Category[]
}

// ============================================================
// Customer & Auth Types
// ============================================================

export interface Customer {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  customer_id: string
  label: string
  first_name: string | null
  last_name: string | null
  street: string
  city: string
  state: string | null
  postal_code: string | null
  country: string
  phone: string | null
  is_default: boolean
  created_at: string
}

// ============================================================
// Cart & Wishlist Types
// ============================================================

export interface CartItem {
  id: string
  customer_id: string | null
  session_id: string | null
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

export interface WishlistItem {
  id: string
  customer_id: string
  product_id: string
  created_at: string
  product?: Product
}

// ============================================================
// Order Types (expanded for multi-item checkout)
// ============================================================

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  // Legacy statuses
  | "in_progress"
  | "completed"

export interface Order {
  id: string
  order_number: string | null
  customer_id: string | null
  // Legacy single-item fields
  furniture_id: string | null
  furniture_title: string | null
  furniture_price: number | null
  // Customer info
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  customer_message: string | null
  // Checkout fields
  billing_address: Address | null
  shipping_address: Address | null
  subtotal: number | null
  shipping_cost: number
  total: number | null
  payment_method: string
  notes: string | null
  // Communication
  send_via_email: boolean
  send_via_whatsapp: boolean
  // Status
  status: OrderStatus
  created_at: string
  updated_at: string | null
  // Relations
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_title: string
  product_image: string | null
  price: number
  quantity: number
  subtotal: number
}

// ============================================================
// Hero Banner Types
// ============================================================

export interface HeroBanner {
  id: string
  title: string | null
  subtitle: string | null
  image_url: string
  link_url: string | null
  button_text: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

// ============================================================
// Custom Fields Types (unchanged)
// ============================================================

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
    options?: string[]
    min?: number
    max?: number
    step?: number
    rows?: number
    validation?: {
      pattern?: string
      required?: boolean
    }
  }
  displayOrder: number
  isRequired: boolean
  isVisible: boolean
}

export interface ProductWithCustomFields extends Product {
  customFields?: CustomField[]
}

// Backwards compatibility
export type FurnitureWithCustomFields = ProductWithCustomFields
