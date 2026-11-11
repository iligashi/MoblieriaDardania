import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth/admin"
import { parseJson, settingSchema } from "@/lib/validation"

export async function GET() {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  try {
    const { data, error } = await auth.db.from("settings").select("key, value")
    if (error) throw error

    const settings: Record<string, unknown> = {}
    for (const row of data || []) settings[row.key] = row.value
    return NextResponse.json(settings)
  } catch (error) {
    console.error("[settings] fetch failed:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const parsed = await parseJson(request, settingSchema)
  if ("error" in parsed) return parsed.error

  try {
    const value = [...new Set(parsed.data.value.map((v) => v.toLowerCase()))]
    const { data, error } = await auth.db
      .from("settings")
      .upsert({ key: parsed.data.key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("[settings] update failed:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
