"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { officerService } from "@/lib/api/officer"
import type { RequestSummary } from "@/lib/api/types"
import { statusMapping, priorityColors, getInitials, getRelativeTime } from "@/lib/constants"
import { LoadingState } from "@/components/loading-state"

export function OfficerInboxPreview() {
  const [requests, setRequests] = useState<RequestSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInboxRequests()
  }, [])

  const loadInboxRequests = async () => {
    try {
      const data = await officerService.getRecentInboxRequests(5)
      setRequests(data)
    } catch (error) {
      console.error("Failed to load inbox requests:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading requests..." />
  }

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">No pending requests</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {requests.map((item) => {
        const status = statusMapping[item.status] || "pending"
        const isUnread = status === "pending"
        
        return (
          <Link
            key={item.id}
            href={`/officer/requests/${item.id}`}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors",
              isUnread && "bg-primary/5 border-primary/20",
            )}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {getInitials(item.requesterName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isUnread && <div className="w-2 h-2 rounded-full bg-primary" />}
                <span className="font-medium truncate">{item.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {item.requesterName} • #{item.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs", 
                  priorityColors[item.priority as keyof typeof priorityColors] || priorityColors.Low
                )}
              >
                {item.priority}
              </Badge>
              <StatusBadge status={status} />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {getRelativeTime(item.createdAt)}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
