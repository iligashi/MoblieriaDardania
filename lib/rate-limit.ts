import "server-only"
import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

/** Limits per action: `limit` requests per `windowSeconds`, per client. */
export const RATE_LIMITS = {
  checkout: { limit: 5, windowSeconds: 600 },
  cart: { limit: 120, windowSeconds: 60 },
  wishlist: { limit: 60, windowSeconds: 60 },
  upload: { limit: 60, windowSeconds: 600 },
} as const

export type RateLimitAction = keyof typeof RATE_LIMITS

/**
 * The caller's IP as seen by Vercel's edge. `x-real-ip` is set by Vercel and
 * cannot be spoofed by the client; `x-forwarded-for` is the local fallback.
 */
export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")
  if (real) return real.trim()
  const forwarded = request.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim() || "unknown"
}

let warnedMissing = false

/**
 * Returns a 429 response when the client has exceeded the limit for `action`,
 * or null when the request may continue. IPs are hashed before storage.
 *
 * Fails open (allows the request) if the database function is missing or the
 * check errors, so a misconfiguration can never take checkout down.
 */
export async function rateLimit(request: Request, action: RateLimitAction, subject?: string): Promise<NextResponse | null> {
  const { limit, windowSeconds } = RATE_LIMITS[action]
  const who = subject ?? clientIp(request)
  const key = `${action}:${createHash("sha256").update(who).digest("hex").slice(0, 32)}`

  try {
    const { data, error } = await createServiceRoleClient().rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    })
    if (error) {
      if (!warnedMissing) {
        warnedMissing = true
        console.warn("[rate-limit] check_rate_limit unavailable — apply scripts/009_rate_limits_and_stock.sql:", error.message)
      }
      return null
    }
    if (data === false) {
      return NextResponse.json(
        { error: "Shumë kërkesa. Ju lutem provoni përsëri pas pak minutash." },
        { status: 429, headers: { "Retry-After": String(windowSeconds) } },
      )
    }
    return null
  } catch (error) {
    console.error("[rate-limit] check failed:", error)
    return null
  }
}
