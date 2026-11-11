import { NextResponse } from "next/server"
import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

type ServerClient = Awaited<ReturnType<typeof createClient>>

export interface AdminContext {
  supabase: ServerClient
  /** Service-role client. Only handed out after the caller was verified as an admin. */
  db: ReturnType<typeof createServiceRoleClient>
  user: User
}

/**
 * Checks admin membership with the service-role client so the answer never
 * depends on how the RLS policies of `admin_users` are configured.
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const service = createServiceRoleClient()
  const { data, error } = await service.from("admin_users").select("id").eq("id", userId).maybeSingle()
  if (error) {
    console.error("[auth] admin lookup failed:", error.message)
    return false
  }
  return !!data
}

/**
 * For Route Handlers. Returns the admin context, or a ready-to-return
 * 401/403 response when the caller is not an authenticated admin.
 *
 *   const auth = await requireAdminApi()
 *   if (auth instanceof NextResponse) return auth
 */
export async function requireAdminApi(): Promise<AdminContext | NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!(await isAdminUser(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return { supabase, db: createServiceRoleClient(), user }
}

/** For Server Components / layouts under /admin. Redirects non-admins to the login page. */
export async function requireAdminPage(): Promise<AdminContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")
  if (!(await isAdminUser(user.id))) redirect("/admin/login?error=forbidden")
  return { supabase, db: createServiceRoleClient(), user }
}
