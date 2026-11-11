"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Diçka shkoi keq</p>
      <h1 className="mt-4 font-display text-5xl sm:text-6xl">Ndodhi një gabim</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Ju kërkojmë ndjesë. Provoni përsëri — nëse problemi vazhdon, na kontaktoni.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}>
          <RotateCcw /> Provo përsëri
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Ballina</Link>
        </Button>
      </div>
      {error.digest && <p className="mt-6 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>}
    </section>
  )
}
