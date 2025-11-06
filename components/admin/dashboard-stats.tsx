"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, TrendingUp, AlertTriangle, ShoppingCart, Layers } from "lucide-react"
import type { Furniture } from "@/lib/types"

interface DashboardStatsProps {
  furniture: Furniture[]
}

export function DashboardStats({ furniture }: DashboardStatsProps) {
  const totalItems = furniture.length
  const totalValue = furniture.reduce((sum, item) => sum + item.price * item.stock, 0)
  const lowStockItems = furniture.filter((item) => item.stock < 5).length
  const outOfStockItems = furniture.filter((item) => item.stock === 0).length
  const totalStock = furniture.reduce((sum, item) => sum + item.stock, 0)
  const categories = new Set(furniture.map((item) => item.category)).size

  const stats = [
    {
      title: "Total Items",
      value: totalItems,
      icon: Package,
      description: "Furniture pieces",
      trend: "+12%",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Total Inventory Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      description: "Current stock value",
      trend: "+8%",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Total Stock",
      value: totalStock,
      icon: ShoppingCart,
      description: "Units available",
      trend: "+5%",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Categories",
      value: categories,
      icon: Layers,
      description: "Active categories",
      trend: null,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Low Stock Alert",
      value: lowStockItems,
      icon: AlertTriangle,
      description: "Items below 5 units",
      trend: lowStockItems > 0 ? "Action needed" : null,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "Out of Stock",
      value: outOfStockItems,
      icon: TrendingUp,
      description: "Items unavailable",
      trend: outOfStockItems > 0 ? "Restock needed" : null,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              {stat.trend && (
                <div className={`text-xs mt-2 ${stat.trend.includes("needed") ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>
                  {stat.trend}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

