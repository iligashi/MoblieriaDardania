import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { CartProvider } from "@/components/providers/cart-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { WishlistProvider } from "@/components/providers/wishlist-provider"
import { LayoutShell } from "@/components/layout-shell"
import { SITE_URL } from "@/lib/site"
import "./globals.css"

const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist", display: "swap" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" })
const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

const description =
  "Mobilje, dekor dhe vegla pune për shtëpinë tuaj. Produkte origjinale me garanci, dërgesë në gjithë Kosovën dhe transport falas mbi 50 €."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Flux Dekor — Mobilje & dekor për shtëpinë tuaj",
    template: "%s · Flux Dekor",
  },
  description,
  applicationName: "Flux Dekor",
  keywords: ["mobilje", "dekor", "mobileri", "vegla pune", "Kosovë", "Flux Dekor", "dyqan online"],
  openGraph: {
    type: "website",
    locale: "sq_AL",
    siteName: "Flux Dekor",
    title: "Flux Dekor — Mobilje & dekor për shtëpinë tuaj",
    description,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: "Flux Dekor", description },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  alternates: { canonical: "/" },
}

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sq" className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-dvh font-sans">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <LayoutShell>{children}</LayoutShell>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  classNames: {
                    toast: "!rounded-2xl !border-border !bg-card !text-foreground !shadow-[var(--shadow-lift)]",
                    description: "!text-muted-foreground",
                  },
                }}
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
