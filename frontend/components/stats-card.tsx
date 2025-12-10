import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  iconClassName?: string
}

export function StatsCard({ title, value, description, icon: Icon, trend, className, iconClassName }: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-card-foreground mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend && (
              <p className={cn("text-sm mt-1", trend.isPositive ? "text-success" : "text-destructive")}>
                {trend.isPositive ? "+" : "-"}
                {trend.value}% from last month
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl bg-primary/10", iconClassName)}>
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
