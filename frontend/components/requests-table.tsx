"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { commonService } from "@/lib/api/common"
import type { RequestSummary, RequestFilters } from "@/lib/api/types"
import { statusMapping, getRelativeTime, statusIdMap } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { LoadingState } from "@/components/loading-state"

interface RequestsTableProps {
  filters: RequestFilters;
  basePath?: string; // e.g., "/officer/requests" or "/student/requests"
}

export function RequestsTable({ filters, basePath = "/requests" }: RequestsTableProps) {
  const [requests, setRequests] = useState<RequestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [filters.status, filters.category, filters.search])

  useEffect(() => {
    loadRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.category, filters.search, currentPage])

  const loadRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await commonService.getMyRequests({
        status: filters.status,
        category: filters.category,
        search: filters.search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: currentPage,
        size: pageSize
      })
      setRequests(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
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
              const status = statusIdMap[request.statusId] || "pending"
              
              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <Link href={`${basePath}/${request.id}`} className="text-primary hover:underline">
                      #{request.id}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    <Link href={`${basePath}/${request.id}`} className="hover:text-primary">
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
                      <Link href={`${basePath}/${request.id}`}>
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
        
        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Showing {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, total)} of {total} requests
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(i)}
                  >
                    {i + 1}
                  </Button>
                )).slice(
                  Math.max(0, currentPage - 2),
                  Math.min(totalPages, currentPage + 3)
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}