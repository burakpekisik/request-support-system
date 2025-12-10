import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status =
  | "waiting"
  | "in_progress"
  | "waiting_response"
  | "resolved_successfully"
  | "resolved_negatively"
  | "cancelled"
  // Legacy status support
  | "pending"
  | "resolved"

interface StatusBadgeProps {
  status: Status
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  waiting: {
    label: "Waiting",
    className: "bg-warning/20 text-warning-foreground border-warning/30 hover:bg-warning/30",
  },
  pending: {
    label: "Waiting",
    className: "bg-warning/20 text-warning-foreground border-warning/30 hover:bg-warning/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-info/20 text-info border-info/30 hover:bg-info/30",
  },
  waiting_response: {
    label: "Waiting Response",
    className: "bg-orange-500/20 text-orange-600 border-orange-500/30 hover:bg-orange-500/30",
  },
  resolved_successfully: {
    label: "Resolved Successfully",
    className: "bg-success/20 text-success border-success/30 hover:bg-success/30",
  },
  resolved: {
    label: "Resolved Successfully",
    className: "bg-success/20 text-success border-success/30 hover:bg-success/30",
  },
  resolved_negatively: {
    label: "Resolved Negatively",
    className: "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-muted hover:bg-muted",
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.waiting
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
