/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production"
const isPreview = process.env.VERCEL_ENV === "preview"

// The browser talks to Supabase directly for sign-in / sign-up.
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin
  } catch {
    return ""
  }
})()

// Vercel's preview toolbar (comments, feedback) only runs on preview deployments.
const vercelLive = isPreview ? "https://vercel.live" : ""

/**
 * Content Security Policy.
 * - Scripts: only from this origin. 'unsafe-inline' is required by Next.js's
 *   inline bootstrap scripts without per-request nonces (which would make every
 *   page dynamic); external script hosts are still blocked.
 * - Images: any https source, because product photos can be hosted anywhere.
 * - The site can't be framed, forms can only post to itself, plugins are off.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${vercelLive}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseOrigin.replace(/^https:/, "wss:")} ${vercelLive} ${isPreview ? "wss://ws-us3.pusher.com" : ""}`,
  `frame-src ${vercelLive || "'none'"}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
]
  .map((d) => d.replace(/\s+/g, " ").trim())
  .join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
]

const nextConfig = {
  poweredByHeader: false,
  images: {
    // Product images can be any URL an admin pastes, so they are served as-is.
    // This also keeps the Image Optimization API (and its attack surface) disabled.
    unoptimized: true,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/account/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      {
        // Personal data must never be cached by a shared cache or the browser's back/forward cache.
        source: "/api/:path((?!categories).*)",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
    ]
  },
}

export default nextConfig
