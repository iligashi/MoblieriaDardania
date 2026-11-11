import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | "…")[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…")
    out.push(p)
  })
  return out
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null

  const hrefFor = (page: number) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) if (v && k !== "page") params.set(k, v)
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const navBtn = "grid size-10 place-items-center rounded-full border bg-card transition-colors hover:border-foreground/30"

  return (
    <nav aria-label="Faqosja" className="flex items-center justify-center gap-1.5">
      {currentPage > 1 ? (
        <Link href={hrefFor(currentPage - 1)} className={navBtn} aria-label="Faqja e mëparshme">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(navBtn, "opacity-40")} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}
      {pageList(currentPage, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="w-6 text-center text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={cn(
              "grid size-10 place-items-center rounded-full text-sm font-medium tabular-nums transition-colors",
              p === currentPage ? "bg-ink text-ink-foreground" : "hover:bg-muted",
            )}
          >
            {p}
          </Link>
        ),
      )}
      {currentPage < totalPages ? (
        <Link href={hrefFor(currentPage + 1)} className={navBtn} aria-label="Faqja tjetër">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(navBtn, "opacity-40")} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  )
}
