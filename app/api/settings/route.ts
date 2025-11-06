import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is an admin
    const { data: adminData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all settings
    const { data, error } = await supabase.from("settings").select("*")

    if (error) throw error

    // Convert to key-value object
    const settings = data.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(settings)
  } catch (error) {
    console.error("[v0] Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is an admin
    const { data: adminData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body

    if (!key || !value) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 })
    }

    // Update or insert setting
    const { data, error } = await supabase
      .from("settings")
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "key",
        }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
