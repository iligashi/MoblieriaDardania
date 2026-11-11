import { z } from "zod"
import { NextResponse } from "next/server"
import { SHOP } from "@/lib/shop-config"

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (value: unknown): value is string => typeof value === "string" && UUID_RE.test(value)

/**
 * Makes free text safe to embed in a PostgREST `or=(...)` / `ilike` filter.
 * Commas, parentheses, quotes, backslashes and wildcard characters would
 * otherwise let a visitor break the query or inject extra filter clauses.
 */
export function sanitizeSearch(input: string | null | undefined, maxLength = 80): string {
  if (!input) return ""
  return input
    .normalize("NFKC")
    .replace(/[,()"'\\%*:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
}

/** Slugs only ever contain lowercase letters, digits and dashes. */
export function sanitizeSlug(input: string | null | undefined): string {
  if (!input) return ""
  return input.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 120)
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}

export async function parseJson<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return { error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) }
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const path = issue?.path.join(".")
    return {
      error: NextResponse.json(
        { error: path ? `${path}: ${issue.message}` : issue?.message || "Invalid input" },
        { status: 400 },
      ),
    }
  }
  return { data: parsed.data }
}

// ------------------------------------------------------------------ schemas

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null))

const money = z.coerce.number().finite().min(0).max(1_000_000)

const customFieldSchema = z
  .object({
    id: z.string().max(100),
    fieldType: z.string().max(30),
    fieldKey: z.string().max(100),
    fieldLabel: z.string().max(200),
    fieldValue: z.unknown().optional(),
    fieldOptions: z.record(z.unknown()).optional(),
    displayOrder: z.coerce.number().int().min(0).max(1000),
    isRequired: z.boolean(),
    isVisible: z.boolean(),
  })
  .passthrough()

/** Every column an admin is allowed to write on `products`. Anything else is dropped. */
export const productSchema = z
  .object({
    title: z.string().trim().min(1, "Titulli eshte i detyrueshem").max(200),
    slug: z.string().trim().max(120).optional(),
    category: z.string().trim().max(120).default(""),
    category_id: z.string().regex(UUID_RE).nullish().transform((v) => v ?? null),
    short_description: nullableText(300),
    description: z.string().max(10_000).default(""),
    price: money,
    discount_price: money.nullish().transform((v) => (v ? v : null)),
    sku: nullableText(80),
    brand: nullableText(80),
    dimensions: z
      .object({
        length: z.coerce.number().min(0).max(100_000),
        width: z.coerce.number().min(0).max(100_000),
        height: z.coerce.number().min(0).max(100_000),
        unit: z.enum(["cm", "m", "in"]),
      })
      .nullish()
      .transform((v) => v ?? null),
    material: nullableText(80),
    color: nullableText(80),
    weight: z.coerce.number().min(0).max(100_000).nullish().transform((v) => (v ? v : null)),
    weight_unit: z.enum(["kg", "lb"]).nullish().transform((v) => v ?? "kg"),
    stock: z.coerce.number().int().min(0).max(1_000_000),
    images: z
      .array(
        z
          .string()
          .trim()
          .max(2048)
          .refine((v) => /^https?:\/\//i.test(v) || /^\/(?!\/)/.test(v), "URL e imazhit nuk eshte valide"),
      )
      .max(20)
      .default([]),
    is_featured: z.boolean().default(false),
    is_bestseller: z.boolean().default(false),
    is_new: z.boolean().default(true),
    is_active: z.boolean().default(true),
    tags: z.array(z.string().trim().max(50)).max(30).default([]),
    custom_fields: z.array(customFieldSchema).max(50).optional(),
    customFields: z.array(customFieldSchema).max(50).optional(),
  })
  .refine((p) => p.discount_price == null || p.discount_price < p.price, {
    message: "Cmimi me zbritje duhet te jete me i ulet se cmimi",
    path: ["discount_price"],
  })

export const productPatchSchema = z
  .object({
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    is_bestseller: z.boolean().optional(),
    is_new: z.boolean().optional(),
    stock: z.coerce.number().int().min(0).max(1_000_000).optional(),
  })
  .strict()

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().max(120).optional(),
  parent_id: z.string().regex(UUID_RE).nullish().transform((v) => v ?? null),
  image: z
    .string()
    .trim()
    .max(2048)
    .nullish()
    .refine((v) => !v || /^#[0-9a-f]{6}$/i.test(v) || /^https?:\/\//i.test(v), "Përdorni një ngjyrë #rrggbb ose një URL foto")
    .transform((v) => (v ? v : null)),
  description: nullableText(500),
  display_order: z.coerce.number().int().min(0).max(10_000).optional(),
  is_active: z.boolean().optional(),
})

export const categoryUpdateSchema = categorySchema.partial()

export const SETTINGS_KEYS = ["categories", "materials", "colors"] as const
export const settingSchema = z.object({
  key: z.enum(SETTINGS_KEYS),
  value: z.array(z.string().trim().min(1).max(60)).max(200),
})

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "in_progress",
  "completed",
] as const

export const orderStatusSchema = z.object({ status: z.enum(ORDER_STATUSES) })

const addressSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  street: z.string().trim().min(2).max(200),
  city: z.string().trim().min(1).max(80),
  postal_code: z.string().trim().max(20).optional().default(""),
  country: z.string().trim().max(60).optional().default("Kosove"),
  phone: z.string().trim().max(40),
})

/**
 * The checkout payload. Prices, subtotals and totals are deliberately NOT part
 * of it: the server looks every product up and computes the amounts itself.
 */
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().regex(UUID_RE),
        quantity: z.coerce.number().int().min(1).max(SHOP.maxQuantityPerItem),
      }),
    )
    .min(1, "Shporta eshte bosh")
    .max(50),
  customer_name: z.string().trim().min(2).max(160),
  customer_email: z
    .string()
    .trim()
    .email()
    .max(200)
    .nullish()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  customer_phone: z
    .string()
    .trim()
    .min(6, "Numri i telefonit nuk eshte valid")
    .max(40)
    .regex(/^[+\d\s()-]+$/, "Numri i telefonit nuk eshte valid"),
  shipping_address: addressSchema,
  billing_address: addressSchema.optional(),
  payment_method: z.enum(["cash_on_delivery", "bank_transfer"]).default("cash_on_delivery"),
  notes: z
    .string()
    .trim()
    .max(1000)
    .nullish()
    .transform((v) => (v ? v : null)),
})

export const cartAddSchema = z.object({
  product_id: z.string().regex(UUID_RE),
  quantity: z.coerce.number().int().min(1).max(SHOP.maxQuantityPerItem).default(1),
  session_id: z.string().regex(UUID_RE).optional().nullable(),
})

export const cartUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(SHOP.maxQuantityPerItem),
})
