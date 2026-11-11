import { createClient } from "@/lib/supabase/server"
import { isUuid } from "@/lib/validation"

export type CartOwner = { column: "customer_id"; value: string } | { column: "session_id"; value: string }

export const CART_SESSION_HEADER = "x-cart-session"

/**
 * Works out whose cart a request is about: the signed-in user, otherwise the
 * guest session id the browser sends in the `x-cart-session` header (or the
 * legacy `sessionId` query parameter). Returns null when neither is present.
 */
export async function resolveCartOwner(
  request: Request,
  bodySession?: string | null,
): Promise<{ owner: CartOwner | null; guestSession: string | null }> {
  const url = new URL(request.url)
  const headerSession = request.headers.get(CART_SESSION_HEADER)
  const querySession = url.searchParams.get("sessionId")
  const guestSession = isUuid(headerSession)
    ? headerSession
    : isUuid(bodySession)
      ? bodySession
      : isUuid(querySession)
        ? querySession
        : null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) return { owner: { column: "customer_id", value: user.id }, guestSession }
  if (guestSession) return { owner: { column: "session_id", value: guestSession }, guestSession }
  return { owner: null, guestSession: null }
}
