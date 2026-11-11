import Link from "next/link"
import { LayoutGrid } from "lucide-react"
import { catStyle } from "@/components/category-card"
import { cn } from "@/lib/utils"
import type { CategorySummary } from "@/lib/catalog"

type Params = Record<string, string | undefined>

/** Keeps the shopper's other filters when switching category; always resets paging. */
function hrefFor(params: Params, slug: string | null) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v && k !== "category" && k !== "page") qs.set(k, v)
  if (slug) qs.set("category", slug)
  const s = qs.toString()
  return s ? `/shop?${s}` : "/shop"
}

/**
 * Category navigation above the shop grid: top-level categories as a
 * scrollable row of pills, then the sub-categories of the active one.
 */
export function CategoryRail({
  roots,
  activeSlug,
  params,
  allCount,
}: {
  roots: CategorySummary[]
  activeSlug: string | null
  params: Params
  allCount?: number
}) {
  if (roots.length === 0) return null

  const activeRoot =
    roots.find((r) => r.slug === activeSlug) ?? roots.find((r) => r.children.some((c) => c.slug === activeSlug)) ?? null

  return (
    <div className="space-y-3">
      <nav aria-label="Kategoritë" className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2 pb-1">
          <li>
            <Link
              href={hrefFor(params, null)}
              aria-current={!activeSlug ? "page" : undefined}
              className={cn(pill, !activeSlug ? pillActive : pillIdle)}
            >
              <span className="grid size-8 place-items-center rounded-full bg-muted text-foreground">
                <LayoutGrid className="size-4" />
              </span>
              Të gjitha
              {allCount != null && <Count active={!activeSlug}>{allCount}</Count>}
            </Link>
          </li>
          {roots.map((root) => {
            const active = activeRoot?.id === root.id
            return (
              <li key={root.id} style={catStyle(root.color)}>
                <Link
                  href={hrefFor(params, root.slug)}
                  aria-current={activeSlug === root.slug ? "page" : undefined}
                  className={cn(pill, active ? pillActive : pillIdle)}
                >
                  <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--cat)_22%,white)] ring-1 ring-black/5">
                    {root.photo || root.covers[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={root.photo ?? root.covers[0]}
                        alt=""
                        className={cn("absolute inset-0 size-full", root.photo ? "object-cover" : "bg-white object-contain p-1")}
                      />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-xs font-semibold text-[var(--cat)]">
                        {root.name.charAt(0)}
                      </span>
                    )}
                  </span>
                  {root.name}
                  <Count active={active}>{root.productCount}</Count>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {activeRoot && activeRoot.children.length > 0 && (
        <ul
          aria-label={`Nënkategoritë e ${activeRoot.name}`}
          style={catStyle(activeRoot.color)}
          className="flex flex-wrap items-center gap-1.5"
        >
          <li>
            <Link
              href={hrefFor(params, activeRoot.slug)}
              aria-current={activeSlug === activeRoot.slug ? "page" : undefined}
              className={cn(sub, activeSlug === activeRoot.slug ? subActive : subIdle)}
            >
              Të gjitha në {activeRoot.name}
            </Link>
          </li>
          {activeRoot.children.map((child) => (
            <li key={child.id}>
              <Link
                href={hrefFor(params, child.slug)}
                aria-current={activeSlug === child.slug ? "page" : undefined}
                className={cn(sub, activeSlug === child.slug ? subActive : subIdle)}
              >
                {child.name}
                <span className="text-xs text-muted-foreground tabular-nums">{child.productCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const pill =
  "inline-flex h-11 items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-1.5 text-sm font-medium whitespace-nowrap transition-colors"
const pillIdle = "bg-card hover:border-foreground/25"
const pillActive = "border-foreground bg-foreground text-background"

const sub = "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors"
const subIdle = "text-muted-foreground hover:bg-muted hover:text-foreground"
const subActive =
  "bg-[color-mix(in_oklab,var(--cat)_14%,var(--card))] font-medium text-foreground ring-1 ring-[color-mix(in_oklab,var(--cat)_45%,transparent)]"

function Count({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-px text-[11px] tabular-nums",
        active ? "bg-background/15 text-background" : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  )
}
