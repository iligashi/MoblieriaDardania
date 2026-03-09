import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Admin route protection
  const publicAdminRoutes = ["/admin/login", "/admin/signup", "/admin/signup-success"]
  const isPublicAdminRoute = publicAdminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (request.nextUrl.pathname.startsWith("/admin") && !user && !isPublicAdminRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  // Customer account route protection (optional - redirect to login)
  const protectedAccountRoutes = ["/account/orders", "/account/profile"]
  const isProtectedAccount = protectedAccountRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtectedAccount && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/account/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
