"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { TransferDialog } from "@/components/transfer-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { MoreHorizontal, UserPlus, CheckCircle, ArrowRightLeft, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { officerService } from "@/lib/api/officer"
import { commonService } from "@/lib/api/common"
import { storage } from "@/lib/storage"
import type { RequestSummary, RequestFilters } from "@/lib/api/types"
import { statusMapping, priorityColors, getInitials, getRelativeTime, isFinalStatus, getFullStaticUrl } from "@/lib/constants"
import { LoadingState } from "@/components/loading-state"

interface OfficerInboxListProps {
  filters: RequestFilters;
}

export function OfficerInboxList({ filters }: OfficerInboxListProps) {
  const [requests, setRequests] = useState<RequestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const pageSize = 10
  
  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<RequestSummary | null>(null)
  const [isTakeOwnershipOpen, setIsTakeOwnershipOpen] = useState(false)
  const [isTakingOwnership, setIsTakingOwnership] = useState(false)
  const [isMarkResolvedOpen, setIsMarkResolvedOpen] = useState(false)
  const [isMarkingResolved, setIsMarkingResolved] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  // Get current user ID
  useEffect(() => {
    const userData = storage.getUserData()
    if (userData?.id) {
      setCurrentUserId(userData.id)
    }
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [filters.status, filters.priority, filters.search])

  useEffect(() => {
    loadInboxRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, filters.search, currentPage])

  const loadInboxRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await officerService.getInboxRequests({
        status: filters.status,
        priority: filters.priority,
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
      console.error("Failed to load inbox requests:", error)
      setError(error instanceof Error ? error.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  // Handle take ownership
  const handleTakeOwnership = async () => {
    if (!selectedRequest) return
    
    setIsTakingOwnership(true)
    try {
      await commonService.takeOwnership(selectedRequest.id)
      // Reload requests to get updated data
      await loadInboxRequests()
      setIsTakeOwnershipOpen(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Failed to take ownership:', error)
      setError(error instanceof Error ? error.message : 'Failed to take ownership')
    } finally {
      setIsTakingOwnership(false)
    }
  }

  // Handle mark as resolved
  const handleMarkAsResolved = async () => {
    if (!selectedRequest) return
    
    setIsMarkingResolved(true)
    try {
      await commonService.markAsResolved(selectedRequest.id)
      // Reload requests to get updated data
      await loadInboxRequests()
      setIsMarkResolvedOpen(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Failed to mark as resolved:', error)
      setError(error instanceof Error ? error.message : 'Failed to mark as resolved')
    } finally {
      setIsMarkingResolved(false)
    }
  }

  // Open dialogs with selected request
  const openTakeOwnershipDialog = (request: RequestSummary) => {
    setSelectedRequest(request)
    setIsTakeOwnershipOpen(true)
  }

  const openMarkResolvedDialog = (request: RequestSummary) => {
    setSelectedRequest(request)
    setIsMarkResolvedOpen(true)
  }

  const openTransferDialog = (request: RequestSummary) => {
    setSelectedRequest(request)
    setIsTransferOpen(true)
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
    <>
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {requests.map((item) => {
            const status = statusMapping[item.status] || "pending"
            const isUnread = status === "pending"
            const isAssignedToMe = item.assignedOfficerId === currentUserId
            const isAssignedToOther = item.assignedOfficerId !== null && item.assignedOfficerId !== currentUserId
            const canMarkAsResolved = isAssignedToMe && !isFinalStatus(item.statusId)
            
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors",
                  isUnread && "bg-primary/5",
                )}
              >
                <Avatar className="h-10 w-10 mt-1">
                  {item.requesterAvatarUrl && (
                    <AvatarImage src={getFullStaticUrl(item.requesterAvatarUrl) || undefined} />
                  )}
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
                          
                          {/* Hide all actions if assigned to another officer */}
                          {!isAssignedToOther && (
                            <>
                              {/* Show Assign to Me only if not already assigned to current user */}
                              {!isAssignedToMe && !isFinalStatus(item.statusId) && (
                                <DropdownMenuItem onClick={() => openTakeOwnershipDialog(item)}>
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Assign to Me
                                </DropdownMenuItem>
                              )}

                              {canMarkAsResolved || !isFinalStatus(item.statusId) &&  (
                                <DropdownMenuSeparator />
                              )}
                              
                              
                              {/* Show Mark as Resolved only if assigned to me AND status is not final */}
                              {canMarkAsResolved && (
                                <DropdownMenuItem onClick={() => openMarkResolvedDialog(item)}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Resolved
                                </DropdownMenuItem>
                              )}
                              
                              {/* Hide Transfer if status is final */}
                              {!isFinalStatus(item.statusId) && (
                                <DropdownMenuItem onClick={() => openTransferDialog(item)}>
                                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                                  Transfer
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, total)} of {total} requests
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
                if (pageNum >= totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-9"
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Take Ownership Confirmation Dialog */}
      <ConfirmationDialog
        open={isTakeOwnershipOpen}
        onOpenChange={setIsTakeOwnershipOpen}
        title="Assign to Me"
        description={`Are you sure you want to take ownership of "${selectedRequest?.title}"? You will be assigned as the responsible officer for this request.`}
        confirmLabel="Assign to Me"
        onConfirm={handleTakeOwnership}
        isLoading={isTakingOwnership}
      />

      {/* Mark as Resolved Confirmation Dialog */}
      <ConfirmationDialog
        open={isMarkResolvedOpen}
        onOpenChange={setIsMarkResolvedOpen}
        title="Mark as Resolved"
        description={`Are you sure you want to mark "${selectedRequest?.title}" as resolved? This will close the request.`}
        confirmLabel="Mark as Resolved"
        onConfirm={handleMarkAsResolved}
        isLoading={isMarkingResolved}
      />

      {/* Transfer Dialog */}
      <TransferDialog 
        open={isTransferOpen} 
        onOpenChange={setIsTransferOpen} 
        currentUnit={selectedRequest?.unitName || ''} 
        requestId={selectedRequest?.id}
        onTransferComplete={loadInboxRequests}
      />
    </>
  )
}
