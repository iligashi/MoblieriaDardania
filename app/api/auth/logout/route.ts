import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  // Redirect on this site (the old code used the Supabase project URL as the base).
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 })
}
