"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { ConversationTimeline } from "@/components/conversation-timeline"
import { TransferDialog } from "@/components/transfer-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { commonService } from "@/lib/api/common"
import { 
  getFullStaticUrl, 
  StatusType,
  statusIdMap,
  PriorityType,
  priorityIdMap,
  priorityIdReverseMap,
  priorityOptions,
  getInitials,
  formatDate,
  formatFileSizeMb,
  getPriorityColorClass,
  isFinalStatus
} from "@/lib/constants"
import type { RequestDetail, TimelineEntry } from "@/lib/api/types"
import {
  ArrowLeft,
  Calendar,
  User,
  Building2,
  Tag,
  Paperclip,
  Loader2,
  UserPlus,
  ArrowRightLeft,
  AlertCircle,
  FileText,
  File,
  Download,
  Image,
  Flag,
} from "lucide-react"

interface AdminRequestDetailProps {
  requestId: string
}

export function AdminRequestDetail({ requestId }: AdminRequestDetailProps) {
  const [requestData, setRequestData] = useState<RequestDetail | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<PriorityType>("normal")
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)

  // Check if request status is final (resolved or cancelled)
  const isFinal = requestData?.statusId != null && isFinalStatus(requestData.statusId)

  // Fetch request data and timeline
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const [detail, timelineData] = await Promise.all([
          commonService.getRequestDetail(requestId),
          commonService.getTimeline(requestId),
        ])

        setRequestData(detail)
        setTimeline(timelineData)
        
        // Set initial priority from request data
        const priorityKey = priorityIdMap[detail.priorityId] || "normal"
        setSelectedPriority(priorityKey)
      } catch (err) {
        console.error('Failed to fetch request data:', err)
        setError('Failed to load request details. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [requestId])

  // Handle priority change
  const handlePriorityChange = async (newPriority: PriorityType) => {
    if (!requestData) return
    
    const newPriorityId = priorityIdReverseMap[newPriority]
    if (newPriorityId === requestData.priorityId) {
      setSelectedPriority(newPriority)
      return
    }

    setIsUpdatingPriority(true)
    setError(null)
    try {
      await commonService.updatePriority(requestId, newPriorityId)
      
      // Refresh request data and timeline
      const [updatedDetail, updatedTimeline] = await Promise.all([
        commonService.getRequestDetail(requestId),
        commonService.getTimeline(requestId),
      ])
      
      setRequestData(updatedDetail)
      setTimeline(updatedTimeline)
      setSelectedPriority(newPriority)
    } catch (err) {
      console.error('Failed to update priority:', err)
      setError('Failed to update priority. Please try again.')
      // Reset to current priority on error
      const currentPriorityKey = priorityIdMap[requestData.priorityId] || "normal"
      setSelectedPriority(currentPriorityKey)
    } finally {
      setIsUpdatingPriority(false)
    }
  }

  // Handle assign complete - refresh data
  const handleAssignComplete = async () => {
    try {
      const [updatedDetail, updatedTimeline] = await Promise.all([
        commonService.getRequestDetail(requestId),
        commonService.getTimeline(requestId),
      ])
      setRequestData(updatedDetail)
      setTimeline(updatedTimeline)
    } catch (err) {
      console.error('Failed to refresh data:', err)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !requestData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">Error Loading Request</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button asChild>
          <Link href="/admin/requests">Back to All Requests</Link>
        </Button>
      </div>
    )
  }

  if (!requestData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">Request Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested item could not be found.</p>
        <Button asChild>
          <Link href="/admin/requests">Back to All Requests</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/requests">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{requestData.title}</h1>
            <StatusBadge status={statusIdMap[requestData.statusId] || "pending"} />
            <div className={cn(
              "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium",
              getPriorityColorClass(requestData.priority)
            )}>
              {requestData.priority}
            </div>
          </div>
          <p className="text-muted-foreground mt-1">Request #{requestId}</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-destructive font-medium">Error</p>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      {/* Action Button - Assign/Transfer */}
      {!isFinal && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => setIsAssignOpen(true)}>
                {requestData.assignedOfficerId ? (
                  <>
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Transfer
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Conversation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Request */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  {requestData.requesterAvatarUrl && (
                    <AvatarImage src={getFullStaticUrl(requestData.requesterAvatarUrl) || undefined} />
                  )}
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {getInitials(requestData.requesterName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{requestData.requesterName}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(requestData.createdAt)}</span>
                  </div>
                  <p className="text-foreground">{requestData.description}</p>
                  
                  {/* Original Request Attachments */}
                  {requestData.attachments && requestData.attachments.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Attachments ({requestData.attachments.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {requestData.attachments.map((attachment) => {
                          const ext = attachment.fileName.split('.').pop()?.toLowerCase()
                          const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')
                          const isPdf = ext === 'pdf'
                          const isDoc = ext === 'docx' || ext === 'doc'
                          
                          return (
                            <a
                              key={attachment.id}
                              href={getFullStaticUrl(attachment.filePath) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                            >
                              {isImage ? (
                                <Image className="w-4 h-4 text-blue-500" />
                              ) : isPdf ? (
                                <FileText className="w-4 h-4 text-red-500" />
                              ) : isDoc ? (
                                <FileText className="w-4 h-4 text-blue-600" />
                              ) : (
                                <File className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="text-sm max-w-[150px] truncate">{attachment.fileName}</span>
                              {attachment.fileSizeMb && (
                                <span className="text-xs text-muted-foreground">
                                  ({formatFileSizeMb(attachment.fileSizeMb)})
                                </span>
                              )}
                              <Download className="w-3 h-3 text-muted-foreground" />
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Timeline */}
          {timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversation History</CardTitle>
              </CardHeader>
              <CardContent>
                <ConversationTimeline entries={timeline} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requester</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {requestData.requesterAvatarUrl && (
                    <AvatarImage src={getFullStaticUrl(requestData.requesterAvatarUrl) || undefined} />
                  )}
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {getInitials(requestData.requesterName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{requestData.requesterName}</p>
                  <p className="text-sm text-muted-foreground">{requestData.requesterEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Unit</p>
                  <p className="font-medium">{requestData.unitName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Officer</p>
                  <p className="font-medium">{requestData.assignedOfficerName || <span className="text-amber-600">Unassigned</span>}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium">{requestData.category}</p>
                </div>
              </div>

              {/* Priority - Dropdown for admin (not final status) */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  {!isFinal ? (
                    <Select 
                      value={selectedPriority} 
                      onValueChange={(value) => handlePriorityChange(value as PriorityType)}
                      disabled={isUpdatingPriority}
                    >
                      <SelectTrigger className="w-full h-8">
                        {isUpdatingPriority ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Updating...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Select priority" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <Flag className={cn("w-3 h-3", priority.color)} />
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                      getPriorityColorClass(requestData.priority)
                    )}>
                      {requestData.priority}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(requestData.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign/Transfer Dialog - Using TransferDialog with custom title */}
      <TransferDialog 
        open={isAssignOpen} 
        onOpenChange={setIsAssignOpen} 
        currentUnit={requestData.unitName}
        unitId={requestData.unitId}
        requestId={Number(requestId)}
        onTransferComplete={handleAssignComplete}
        title={requestData.assignedOfficerId ? "Transfer Request" : "Assign Request"}
        description={requestData.assignedOfficerId 
          ? "Transfer this request to another officer from this unit." 
          : "Assign this request to an officer from this unit."
        }
        disabledUserId={requestData.assignedOfficerId || requestData.requesterId}
      />
    </div>
  )
}
