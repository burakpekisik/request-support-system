"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { commonService } from "@/lib/api/common"
import type { RequestSummary, RequestFilters } from "@/lib/api/types"
import { statusMapping, getRelativeTime } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { LoadingState } from "@/components/loading-state"

interface RequestsTableProps {
  filters: RequestFilters;
}

export function RequestsTable({ filters }: RequestsTableProps) {
  const [requests, setRequests] = useState<RequestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.category, filters.search])

  const loadRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await commonService.getMyRequests({
        status: filters.status,
        category: filters.category,
        search: filters.search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 0,
        size: 50
      })
      setRequests(data)
    } catch (error) {
      console.error("Failed to load requests:", error)
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
            <Button onClick={loadRequests} variant="outline" size="sm" className="mt-2">
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
              {filters.search || filters.status !== 'all' || filters.category !== 'all' 
                ? 'Try adjusting your filters' 
                : 'You haven\'t created any requests yet'}
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
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
              <TableHead className="hidden xl:table-cell">Last Update</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const status = statusMapping[request.status] || "pending"
              
              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <Link href={`/requests/${request.id}`} className="text-primary hover:underline">
                      #{request.id}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    <Link href={`/requests/${request.id}`} className="hover:text-primary">
                      {request.title}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {request.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {request.unitName}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {getRelativeTime(request.createdAt)}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                    {getRelativeTime(request.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/requests/${request.id}`}>
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