"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Fades sections in as they enter the viewport. Any element with
 * `data-reveal` takes part; `style={{ "--reveal-delay": "120ms" }}` staggers.
 * Content stays visible without JavaScript or with reduced motion, because the
 * hidden state only applies once `reveal-ready` is set on <html>.
 */
export function RevealController() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return

    const root = document.documentElement
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    )

    const watch = () => {
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => {
        // Anything already on screen shows at once instead of flashing.
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.92) el.classList.add("is-visible")
        else observer.observe(el)
      })
    }

    watch()
    root.classList.add("reveal-ready")

    // Sections streamed in later (Suspense, client fetches) are picked up too.
    let frame = 0
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(watch)
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      mutations.disconnect()
    }
  }, [pathname])

  return null
}
