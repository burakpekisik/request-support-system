"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { MoreHorizontal, UserPlus, CheckCircle, XCircle, ArrowRightLeft, Eye } from "lucide-react"
import { officerService } from "@/lib/api/officer"
import type { RequestSummary, RequestFilters } from "@/lib/api/types"
import { statusMapping, priorityColors, getInitials, getRelativeTime } from "@/lib/constants"
import { LoadingState } from "@/components/loading-state"

interface OfficerInboxListProps {
  filters: RequestFilters;
}

export function OfficerInboxList({ filters }: OfficerInboxListProps) {
  const [requests, setRequests] = useState<RequestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInboxRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, filters.search])

  const loadInboxRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await officerService.getInboxRequests({
        status: filters.status,
        priority: filters.priority,
        search: filters.search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 0,
        size: 50
      })
      setRequests(data)
    } catch (error) {
      console.error("Failed to load inbox requests:", error)
      setError(error instanceof Error ? error.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading requests..." variant="card" />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-destructive">Error loading requests</div>
            <div className="text-sm text-muted-foreground">{error}</div>
            <Button onClick={loadInboxRequests} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-muted-foreground">No requests found</div>
            <div className="text-sm text-muted-foreground">
              {filters.search || filters.status !== 'all' || filters.priority !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No pending requests at the moment'}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0 divide-y divide-border">
        {requests.map((item) => {
          const status = statusMapping[item.status] || "pending"
          const isUnread = status === "pending"
          
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors",
                isUnread && "bg-primary/5",
              )}
            >
              <Avatar className="h-10 w-10 mt-1">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {getInitials(item.requesterName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isUnread && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      <Link href={`/officer/requests/${item.id}`} className="font-medium hover:text-primary truncate">
                        {item.title}
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">{item.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{item.requesterName}</span>
                      <span>•</span>
                      <span>#{item.id}</span>
                      <span>•</span>
                      <span>{getRelativeTime(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
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

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/officer/requests/${item.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Assign to Me
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          Transfer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="w-4 h-4 mr-2" />
                          Close Request
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
