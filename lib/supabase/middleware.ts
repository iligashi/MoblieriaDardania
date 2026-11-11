import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_ADMIN_ROUTES = ["/admin/login"]
const PROTECTED_ACCOUNT_ROUTES = ["/account/orders", "/account/profile"]

function redirectTo(request: NextRequest, pathname: string, search = "") {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = search
  return NextResponse.redirect(url)
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ---- Admin area: must be signed in AND listed in admin_users.
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/")
  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (isAdminArea && !isPublicAdminRoute) {
    if (!user) return redirectTo(request, "/admin/login", `?next=${encodeURIComponent(pathname)}`)

    // RLS lets a user read only their own admin_users row, so this is a membership check.
    const { data: adminRow } = await supabase.from("admin_users").select("id").eq("id", user.id).maybeSingle()
    if (!adminRow) return redirectTo(request, "/admin/login", "?error=forbidden")
  }

  // ---- Customer account pages.
  if (!user && PROTECTED_ACCOUNT_ROUTES.some((route) => pathname.startsWith(route))) {
    return redirectTo(request, "/account/login", `?next=${encodeURIComponent(pathname)}`)
  }

  return supabaseResponse
}
