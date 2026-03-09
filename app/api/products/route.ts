import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const page = Number(searchParams.get("page")) || 1
    const limit = Math.min(Number(searchParams.get("limit")) || 16, 64)
    const category = searchParams.get("category")
    const categoryId = searchParams.get("category_id")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const color = searchParams.get("color")
    const material = searchParams.get("material")
    const brand = searchParams.get("brand")
    const sort = searchParams.get("sort") || "newest"
    const featured = searchParams.get("featured")
    const bestseller = searchParams.get("bestseller")
    const isNew = searchParams.get("new")
    const onSale = searchParams.get("on_sale")
    const inStock = searchParams.get("in_stock")

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true)

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`)
    }
    if (category) query = query.eq("category", category)
    if (categoryId) query = query.eq("category_id", categoryId)
    if (minPrice) query = query.gte("price", Number(minPrice))
    if (maxPrice) query = query.lte("price", Number(maxPrice))
    if (color) query = query.eq("color", color)
    if (material) query = query.eq("material", material)
    if (brand) query = query.eq("brand", brand)
    if (featured === "true") query = query.eq("is_featured", true)
    if (bestseller === "true") query = query.eq("is_bestseller", true)
    if (isNew === "true") query = query.eq("is_new", true)
    if (onSale === "true") query = query.not("discount_price", "is", null)
    if (inStock === "true") query = query.gt("stock", 0)

    // Sorting
    switch (sort) {
      case "price_asc":
        query = query.order("price", { ascending: true })
        break
      case "price_desc":
        query = query.order("price", { ascending: false })
        break
      case "name_asc":
        query = query.order("title", { ascending: true })
        break
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      limit,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Generate slug from title if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        + "-" + Date.now().toString(36)
    }

    // Map customFields to custom_fields
    const payload = {
      ...body,
      custom_fields: body.customFields || body.custom_fields || [],
    }
    delete payload.customFields

    const { data, error } = await supabase.from("products").insert([payload]).select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
