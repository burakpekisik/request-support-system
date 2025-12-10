import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const inboxItems = [
  {
    id: "1240",
    title: "Email System Not Receiving Messages",
    requester: "Zeynep Kaya",
    initials: "ZK",
    status: "pending" as const,
    priority: "High",
    date: "2 hours ago",
    unread: true,
  },
  {
    id: "1239",
    title: "Projector Not Working in Room 301",
    requester: "Ali Demir",
    initials: "AD",
    status: "pending" as const,
    priority: "Medium",
    date: "4 hours ago",
    unread: true,
  },
  {
    id: "1238",
    title: "Software Installation Request",
    requester: "Fatma Yıldız",
    initials: "FY",
    status: "in_progress" as const,
    priority: "Low",
    date: "Yesterday",
    unread: false,
  },
  {
    id: "1237",
    title: "Network Connectivity Issues",
    requester: "Emre Can",
    initials: "EC",
    status: "in_progress" as const,
    priority: "High",
    date: "Yesterday",
    unread: false,
  },
]

const priorityColors = {
  High: "bg-destructive/20 text-destructive border-destructive/30",
  Medium: "bg-warning/20 text-warning-foreground border-warning/30",
  Low: "bg-muted text-muted-foreground border-muted",
}

export function OfficerInboxPreview() {
  return (
    <div className="space-y-2">
      {inboxItems.map((item) => (
        <Link
          key={item.id}
          href={`/officer/requests/${item.id}`}
          className={cn(
            "flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors",
            item.unread && "bg-primary/5 border-primary/20",
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-secondary text-secondary-foreground">{item.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {item.unread && <div className="w-2 h-2 rounded-full bg-primary" />}
              <span className="font-medium truncate">{item.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {item.requester} • #{item.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs", priorityColors[item.priority as keyof typeof priorityColors])}
            >
              {item.priority}
            </Badge>
            <StatusBadge status={item.status} />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{item.date}</span>
        </Link>
      ))}
    </div>
  )
}
