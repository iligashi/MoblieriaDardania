import Link from "next/link"
import type { CSSProperties } from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type CategoryCardData = {
  name: string
  slug: string
  description?: string | null
  color: string
  photo: string | null
  covers: string[]
  productCount: number
  children?: { id: string; name: string; slug: string }[]
}

export const productCountLabel = (n: number) => (n === 1 ? "1 produkt" : `${n} produkte`)

/** Sets the `--cat` custom property that every tinted surface below reads from. */
export const catStyle = (color: string) => ({ "--cat": color }) as CSSProperties

/** Photo, product collage, or monogram — whatever the category has. */
export function CategoryVisual({
  name,
  photo,
  covers,
  className,
}: Pick<CategoryCardData, "name" | "photo" | "covers"> & { className?: string }) {
  if (photo) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover/cat:scale-[1.04]"
        />
      </div>
    )
  }

  if (covers.length === 0) {
    return (
      <div className={cn("relative grid place-items-center overflow-hidden", className)} aria-hidden>
        <span className="font-display text-[9rem] leading-none text-[var(--cat)] opacity-25 select-none">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  const [main, ...rest] = covers
  return (
    <div
      className={cn(
        "relative grid gap-2.5 p-4 sm:p-5",
        rest.length ? "grid-cols-[1.45fr_1fr] grid-rows-2" : "grid-cols-1",
        className,
      )}
      aria-hidden
    >
      <Tile src={main} className={cn(rest.length && "row-span-2")} />
      {rest.map((src, i) => (
        <Tile key={src + i} src={src} className={cn(rest.length === 1 && "row-span-2")} />
      ))}
    </div>
  )
}

function Tile({ src, className }: { src: string; className?: string }) {
  return (
    <div className={cn("relative min-h-0 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(0_0_0/0.06)]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-contain p-3 transition-transform duration-700 group-hover/cat:scale-[1.06]"
      />
    </div>
  )
}

/**
 * Storefront category card. `wide` puts the text beside the visual once the
 * card itself is wide enough (container query), `compact` stacks them.
 * `preview` renders without links, for the admin editor.
 */
export function CategoryCard({
  category,
  variant = "compact",
  preview = false,
  className,
}: {
  category: CategoryCardData
  variant?: "wide" | "compact"
  preview?: boolean
  className?: string
}) {
  const href = `/shop?category=${category.slug}`
  const subs = category.children ?? []
  const wide = variant === "wide"

  return (
    <div className={cn("@container", className)}>
      <article
        style={catStyle(category.color)}
        className={cn(
          "group/cat relative isolate flex h-full flex-col overflow-hidden rounded-[1.75rem]",
          "bg-[color-mix(in_oklab,var(--cat)_10%,var(--card))] ring-1 ring-[color-mix(in_oklab,var(--cat)_20%,transparent)]",
          "transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]",
          wide && "@xl:flex-row-reverse",
        )}
      >
        <CategoryVisual
          name={category.name}
          photo={category.photo}
          covers={category.covers}
          className={cn("h-56 shrink-0", wide && "@xl:h-auto @xl:min-h-[340px] @xl:w-[48%]")}
        />

        <div className={cn("relative flex flex-1 flex-col p-6 sm:p-7", wide && "@xl:p-9")}>
          <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-[var(--cat)]" />
            {category.productCount > 0 ? productCountLabel(category.productCount) : "Së shpejti"}
            {subs.length > 0 && <span>· {subs.length} nënkategori</span>}
          </p>

          <h3 className={cn("mt-4 font-display text-4xl leading-[0.95] text-balance", wide && "@xl:mt-auto @xl:text-6xl")}>
            {preview ? (
              category.name || "Emri i kategorisë"
            ) : (
              <Link href={href} className="after:absolute after:inset-0 after:z-0 focus-visible:outline-none">
                {category.name}
              </Link>
            )}
          </h3>

          {category.description && (
            <p className="mt-2.5 line-clamp-2 max-w-md text-sm leading-relaxed text-muted-foreground">{category.description}</p>
          )}

          {subs.length > 0 && (
            <ul className="relative z-10 mt-4 flex flex-wrap gap-1.5">
              {subs.slice(0, 5).map((sub) => (
                <li key={sub.id}>
                  {preview ? (
                    <span className="inline-block rounded-full bg-card/85 px-3 py-1 text-xs font-medium ring-1 ring-black/5">
                      {sub.name}
                    </span>
                  ) : (
                    <Link
                      href={`/shop?category=${sub.slug}`}
                      className="inline-block rounded-full bg-card/85 px-3 py-1 text-xs font-medium ring-1 ring-black/5 transition-colors hover:bg-foreground hover:text-background"
                    >
                      {sub.name}
                    </Link>
                  )}
                </li>
              ))}
              {subs.length > 5 && (
                <li className="px-1.5 py-1 text-xs text-muted-foreground">+{subs.length - 5}</li>
              )}
            </ul>
          )}

          <span className="mt-6 inline-flex items-center gap-2.5 text-sm font-medium" aria-hidden>
            Shiko koleksionin
            <span className="grid size-8 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover/cat:translate-x-1">
              <ArrowRight className="size-4" />
            </span>
          </span>
        </div>
      </article>
    </div>
  )
}
