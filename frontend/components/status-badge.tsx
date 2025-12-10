import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status =
  | "pending"
  | "in_progress"
  | "answered"
  | "waiting_response"
  | "resolved_successfully"
  | "resolved_negatively"
  | "cancelled"

interface StatusBadgeProps {
  status: Status
}

// Database color codes: Pending(#6c757d), In Progress(#007bff), Answered(#17a2b8), 
// Waiting Response(#ffc107), Resolved Successfully(#28a745), Resolved Negatively(#dc3545), Cancelled(#dc3545)
const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-gray-500/20 text-gray-700 border-gray-500/30 hover:bg-gray-500/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30",
  },
  answered: {
    label: "Answered",
    className: "bg-cyan-500/20 text-cyan-700 border-cyan-500/30 hover:bg-cyan-500/30",
  },
  waiting_response: {
    label: "Waiting Response",
    className: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30",
  },
  resolved_successfully: {
    label: "Resolved Successfully",
    className: "bg-green-600/20 text-green-700 border-green-600/30 hover:bg-green-600/30",
  },
  resolved_negatively: {
    label: "Resolved Negatively",
    className: "bg-red-600/20 text-red-700 border-red-600/30 hover:bg-red-600/30",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-600/20 text-red-700 border-red-600/30 hover:bg-red-600/30",
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
