import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" aria-label="Flux Dekor — Ballina" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 place-items-center overflow-hidden rounded-xl border transition-transform duration-300 group-hover:-rotate-3",
          inverted ? "border-white/15 bg-white" : "border-border bg-card",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/flux-removebg-preview.png" alt="" width={36} height={36} className="size-[150%] max-w-none object-contain" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[22px] leading-none", inverted ? "text-white" : "text-foreground")}>Flux</span>
        <span
          className={cn(
            "mt-0.5 text-[9px] font-semibold tracking-[0.32em] uppercase",
            inverted ? "text-white/60" : "text-muted-foreground",
          )}
        >
          Dekor
        </span>
      </span>
    </Link>
  )
}
