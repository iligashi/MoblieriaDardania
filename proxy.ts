import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

/**
 * CSRF defence in depth for the JSON API. Session cookies are SameSite=Lax
 * already; on top of that, any state-changing request a browser sends from
 * another site is rejected. Requests without browser headers (curl, server
 * to server) carry no session cookies, so they are left to the route's own
 * auth checks.
 */
function isCrossSiteWrite(request: NextRequest) {
  if (SAFE_METHODS.has(request.method)) return false

  const origin = request.headers.get("origin")
  if (origin) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
    try {
      return new URL(origin).host !== host
    } catch {
      return true
    }
  }
  return request.headers.get("sec-fetch-site") === "cross-site"
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/") && isCrossSiteWrite(request)) {
    return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 })
  }
  return updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)"],
}
