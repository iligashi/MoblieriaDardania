"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatPrice } from "@/lib/shop-config"

export type RevenuePoint = { date: string; revenue: number; orders: number }

const dayLabel = (iso: string) => new Date(iso).toLocaleDateString("sq-AL", { day: "numeric", month: "short" })

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Të ardhurat ditore për 30 ditët e fundit">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
          <XAxis
            dataKey="date"
            tickFormatter={dayLabel}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            width={56}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${Math.round(v)} €`}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ stroke: "var(--foreground)", strokeOpacity: 0.25, strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0].payload as RevenuePoint
              return (
                <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-[var(--shadow-soft)]">
                  <p className="text-muted-foreground">{dayLabel(p.date)}</p>
                  <p className="mt-0.5 font-semibold tabular-nums">{formatPrice(p.revenue)}</p>
                  <p className="text-muted-foreground tabular-nums">
                    {p.orders} {p.orders === 1 ? "porosi" : "porosi"}
                  </p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#rev-fill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
