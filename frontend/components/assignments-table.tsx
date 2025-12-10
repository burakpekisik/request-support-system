"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Clock } from "lucide-react"
import { officerService } from "@/lib/api/officer"
import type { RequestSummary, RequestFilters } from "@/lib/api/types"
import { statusMapping, priorityColors, getInitials, getRelativeTime } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AssignmentsTableProps {
  filters: RequestFilters;
}

export function AssignmentsTable({ filters }: AssignmentsTableProps) {
  const [requests, setRequests] = useState<RequestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAssignments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, filters.search])

  const loadAssignments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await officerService.getAssignedRequests({
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
      console.error("Failed to load assignments:", error)
      setError(error instanceof Error ? error.message : 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading assignments...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-destructive">Error loading assignments</div>
            <div className="text-sm text-muted-foreground">{error}</div>
            <Button onClick={loadAssignments} variant="outline" size="sm" className="mt-2">
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
            <div className="text-muted-foreground">No assignments found</div>
            <div className="text-sm text-muted-foreground">
              {filters.search || filters.status !== 'all' || filters.priority !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No requests assigned to you at the moment'}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const status = statusMapping[request.status] || "pending"
              
              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <p className="text-xs text-muted-foreground">
                        #{request.id} • {request.category}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {getInitials(request.requesterName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{request.requesterName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={status} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        priorityColors[request.priority as keyof typeof priorityColors] || priorityColors.Low
                      )}
                    >
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getRelativeTime(request.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {getRelativeTime(request.updatedAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/officer/requests/${request.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
