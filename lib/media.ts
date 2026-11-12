/**
 * Product images arrive in two shapes: transparent cut-outs (PNG/SVG) that
 * should float on a sand background, and full photographs that should fill
 * the frame. Picking the fit per image keeps every card the same size and
 * stops photos from being letterboxed.
 */
export type ImageFit = "contain" | "cover"

export function imageFit(src: string | null | undefined): ImageFit {
  if (!src) return "contain"
  const path = src.split(/[?#]/)[0].toLowerCase()
  return /\.(png|svg|gif)$/.test(path) ? "contain" : "cover"
}

/** First image that is a real photograph, for hero and lifestyle slots. */
export function firstPhoto(images: (string | null | undefined)[]): string | null {
  return images.find((src): src is string => !!src && imageFit(src) === "cover") ?? null
}

/** Estimated delivery window in Kosovo: 1–2 working days, skipping Sundays. */
export function deliveryWindow(from: Date = new Date()): { start: Date; end: Date } {
  const addWorkingDays = (date: Date, days: number) => {
    const d = new Date(date)
    let added = 0
    while (added < days) {
      d.setDate(d.getDate() + 1)
      if (d.getDay() !== 0) added++
    }
    return d
  }
  return { start: addWorkingDays(from, 1), end: addWorkingDays(from, 2) }
}

// Spelled out here because many browsers ship without Albanian locale data
// and would silently fall back to English.
const DAYS = ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"]
const MONTHS = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"]

/** e.g. "e premte, 13 nëntor" */
export function formatDay(date: Date): string {
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`
}
