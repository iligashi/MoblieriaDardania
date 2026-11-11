"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const list = images.filter(Boolean).length ? images.filter(Boolean) : ["/placeholder.svg"]
  const [index, setIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const touchX = useRef<number | null>(null)
  const many = list.length > 1

  const go = useCallback((dir: 1 | -1) => setIndex((i) => (i + dir + list.length) % list.length), [list.length])

  useEffect(() => {
    if (!zoomOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1)
      if (e.key === "ArrowRight") go(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [zoomOpen, go])

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current == null) return
      const dx = e.changedTouches[0].clientX - touchX.current
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
      touchX.current = null
    },
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
      {many && (
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none sm:max-h-[640px] sm:w-20 sm:flex-col sm:overflow-y-auto">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Fotoja ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-muted/70 ring-1 transition-all sm:w-20",
                i === index ? "ring-2 ring-foreground" : "ring-border opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-contain p-1.5 mix-blend-multiply" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div
        className="group relative aspect-square flex-1 overflow-hidden rounded-[1.75rem] bg-muted/70 ring-1 ring-border/60 ring-inset"
        {...swipe}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={list[index]}
          src={list[index]}
          alt={`${title} — fotoja ${index + 1}`}
          className="absolute inset-0 size-full animate-in object-contain p-8 mix-blend-multiply duration-300 fade-in-0 sm:p-12"
        />
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          aria-label="Zmadho foton"
          className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-opacity hover:bg-card sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Expand className="size-4" />
        </button>
        {many && (
          <>
            <GalleryArrow side="left" onClick={() => go(-1)} />
            <GalleryArrow side="right" onClick={() => go(1)} />
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {list.map((_, i) => (
                <span
                  key={i}
                  className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-foreground" : "w-1.5 bg-foreground/25")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <DialogPrimitive.Root open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/95 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none sm:p-10"
            {...swipe}
          >
            <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={list[index]} alt={title} className="max-h-full max-w-full rounded-2xl bg-white object-contain" />
            <DialogPrimitive.Close
              className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Mbyll"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
            {many && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Fotoja e mëparshme"
                  className="absolute left-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Fotoja tjetër"
                  className="absolute right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="size-5" />
                </button>
                <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/70 tabular-nums">
                  {index + 1} / {list.length}
                </p>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}

function GalleryArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Fotoja e mëparshme" : "Fotoja tjetër"}
      className={cn(
        "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-opacity hover:bg-card sm:opacity-0 sm:group-hover:opacity-100",
        side === "left" ? "left-4" : "right-4",
      )}
    >
      <Icon className="size-4" />
    </button>
  )
}
