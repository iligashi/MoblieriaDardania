import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon = PackageSearch,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { href: string; label: string }
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="grid size-16 place-items-center rounded-full bg-muted">
        <Icon className="size-7 text-muted-foreground" />
      </div>
      <h3 className="mt-5 font-display text-3xl">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && (
        <Button asChild className="mt-6">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
