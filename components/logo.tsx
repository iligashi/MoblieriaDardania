import Link from "next/link"
import { cn } from "@/lib/utils"

/** The FLUX wordmark (cropped from the brand PNG) with a small "Dekor" tag. */
export function Wordmark({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-end gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/flux-wordmark.png"
        alt="Flux"
        width={410}
        height={145}
        className={cn("h-[22px] w-auto", inverted && "brightness-0 invert")}
      />
      <span
        className={cn(
          "mb-px text-[9px] leading-none font-semibold tracking-[0.32em] uppercase",
          inverted ? "text-white/60" : "text-muted-foreground",
        )}
      >
        Dekor
      </span>
    </span>
  )
}

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" aria-label="Flux Dekor — Ballina" className={cn("inline-flex items-center", className)}>
      <Wordmark inverted={inverted} />
    </Link>
  )
}
