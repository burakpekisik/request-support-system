"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { ConversationTimeline } from "@/components/conversation-timeline"
import { TransferDialog } from "@/components/transfer-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { commonService } from "@/lib/api/common"
import { storage } from "@/lib/storage"
import { 
  getFullStaticUrl, 
  ATTACHMENT_VALID_EXTENSIONS, 
  ATTACHMENT_MAX_SIZE,
  StatusType,
  statusIdMap,
  statusIdReverseMap,
  statusOptions,
  PriorityType,
  priorityIdMap,
  priorityIdReverseMap,
  priorityOptions,
  getInitials,
  formatDate,
  formatFileSize,
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
  Send,
  Loader2,
  ArrowRightLeft,
  UserPlus,
  Clock,
  Play,
  MessageSquare,
  CheckCircle,
  XCircle,
  Ban,
  AlertCircle,
  X,
  FileText,
  File,
  Download,
  Image,
  Flag,
  Trash2,
} from "lucide-react"

interface OfficerRequestDetailProps {
  requestId: string
}

// Status icons mapping (icons need to stay here as they are React components)
const statusIcons: Record<StatusType, typeof Clock> = {
  pending: Clock,
  in_progress: Play,
  answered: MessageSquare,
  waiting_response: MessageSquare,
  resolved_successfully: CheckCircle,
  resolved_negatively: XCircle,
  cancelled: Ban,
}

export function OfficerRequestDetail({ requestId }: OfficerRequestDetailProps) {
  const [requestData, setRequestData] = useState<RequestDetail | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<StatusType>("pending")
  const [selectedPriority, setSelectedPriority] = useState<PriorityType>("normal")
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isTakeOwnershipOpen, setIsTakeOwnershipOpen] = useState(false)
  const [isTakingOwnership, setIsTakingOwnership] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if current user is the assigned officer
  const isAssignedToMe = requestData?.assignedOfficerId != null && 
    currentUserId != null && 
    requestData.assignedOfficerId === currentUserId

  // Check if request is assigned to another officer (not me)
  const isAssignedToOther = requestData?.assignedOfficerId != null && 
    currentUserId != null && 
    requestData.assignedOfficerId !== currentUserId

  // Check if request status is final (resolved or cancelled)
  const isFinal = requestData?.statusId != null && isFinalStatus(requestData.statusId)

  // Check if current user is the requester (created the request)
  const isRequester = requestData?.requesterId != null &&
    currentUserId != null &&
    requestData.requesterId === currentUserId

  // Can write response if assigned OR if requester AND status is not final
  const canWriteResponse = (isAssignedToMe || isRequester) && !isFinal

  // Can update status only if assigned officer (not requester)
  const canUpdateStatus = isAssignedToMe && !isRequester

  // Use constants for allowed extensions (remove leading dot for validation)
  const allowedExtensions = ATTACHMENT_VALID_EXTENSIONS.map(ext => ext.replace('.', ''))
  const maxFileSize = ATTACHMENT_MAX_SIZE

  // Get current user ID from localStorage using storage utility
  useEffect(() => {
    const userData = storage.getUserData()
    if (userData?.id) {
      setCurrentUserId(userData.id)
    }
  }, [])

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
        
        // Set initial status from request data
        const statusKey = statusIdMap[detail.statusId] || "pending"
        setSelectedStatus(statusKey)

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

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const validFiles: File[] = []
    const errors: string[] = []

    Array.from(files).forEach(file => {
      // Check file extension
      const extension = file.name.split('.').pop()?.toLowerCase() || ''
      if (!allowedExtensions.includes(extension)) {
        errors.push(`${file.name}: Invalid file type. Allowed: ${allowedExtensions.join(', ')}`)
        return
      }

      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File too large. Max size: 10MB`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
    }

    setAttachedFiles(prev => [...prev, ...validFiles])
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle cancel request
  const handleCancelRequest = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await commonService.cancelRequest(requestId)
      // Update request status locally
      setRequestData(prevData => {
        if (!prevData) return null
        return { ...prevData, statusId: result.newStatusId }
      })
      // Update selected status
      const statusKey = statusIdMap[result.newStatusId] || "cancelled"
      setSelectedStatus(statusKey)
      // Refresh timeline to show cancellation event
      const updatedTimeline = await commonService.getTimeline(requestId)
      setTimeline(updatedTimeline)
    } catch (err) {
      console.error('Failed to cancel request:', err)
      setError('Failed to cancel the request. Please try again.')
    } finally {
      setIsSubmitting(false)
      setIsCancelDialogOpen(false)
    }
  }

  // Handle take ownership
  const handleTakeOwnership = async () => {
    if (!requestData) return
    
    setIsTakingOwnership(true)
    setError(null)
    try {
      const result = await commonService.takeOwnership(requestId)
      
      // Refresh request data and timeline
      const [updatedDetail, updatedTimeline] = await Promise.all([
        commonService.getRequestDetail(requestId),
        commonService.getTimeline(requestId),
      ])
      
      setRequestData(updatedDetail)
      setTimeline(updatedTimeline)
      
      // Update status if changed
      const statusKey = statusIdMap[result.newStatusId] || "in_progress"
      setSelectedStatus(statusKey)
      
      setIsTakeOwnershipOpen(false)
    } catch (err) {
      console.error('Failed to take ownership:', err)
      setError('Failed to take ownership. Please try again.')
    } finally {
      setIsTakingOwnership(false)
    }
  }

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

  // Remove attached file
  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Get file icon based on extension (returns JSX, must stay in component)
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return <FileText className="w-4 h-4 text-red-500" />
    if (['png', 'jpg', 'jpeg'].includes(ext || '')) return <File className="w-4 h-4 text-blue-500" />
    if (ext === 'docx') return <FileText className="w-4 h-4 text-blue-600" />
    return <File className="w-4 h-4 text-muted-foreground" />
  }

  const handleSubmitReply = async () => {
    if (!reply.trim() || !requestData) return
    
    setIsSubmitting(true)
    setError(null)
    try {
      const newStatusId = statusIdReverseMap[selectedStatus] || requestData.statusId
      
      await commonService.addResponse(requestId, {
        newStatusId,
        comment: reply,
      }, attachedFiles.length > 0 ? attachedFiles : undefined)

      // Refresh timeline
      const updatedTimeline = await commonService.getTimeline(requestId)
      setTimeline(updatedTimeline)

      // Refresh request data if status changed
      if (newStatusId !== requestData.statusId) {
        const updatedDetail = await commonService.getRequestDetail(requestId)
        setRequestData(updatedDetail)
      }

      // Clear form
      setReply("")
      setAttachedFiles([])
    } catch (err) {
      console.error('Failed to submit response:', err)
      setError('Failed to submit response. Please try again.')
    } finally {
      setIsSubmitting(false)
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
        <Skeleton className="h-16 w-full" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !requestData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">Error Loading Request</h2>
        <p className="text-muted-foreground mb-4">{error || 'Request not found'}</p>
        <Button asChild>
          <Link href="/officer/assignments">Back to Assignments</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/officer/assignments">
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

      {/* Action Buttons - Only show if not requester, not assigned to another officer, and status is not final */}
      {!isRequester && !isAssignedToOther && !isFinal && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              {!isAssignedToMe && (
                <Button variant="outline" onClick={() => setIsTakeOwnershipOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Take Ownership
                </Button>
              )}
              {isAssignedToMe && (
                <Button variant="outline" onClick={() => setIsTransferOpen(true)}>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Transfer
                </Button>
              )}
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

          {/* Write Response - Show if assigned to current user OR if requester */}
          {canWriteResponse && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Write Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Write your response to the requester..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  {/* Status Selection in Response Section - Only for assigned officer, not requester */}
                  {canUpdateStatus && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Label className="text-sm font-medium mb-2 block">Update Status</Label>
                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as StatusType)}>
                          <SelectTrigger className="w-full sm:w-64">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => {
                              const StatusIcon = statusIcons[status.value]
                              return (
                                <SelectItem key={status.value} value={status.value}>
                                  <div className="flex items-center gap-2">
                                    <StatusIcon className={cn("w-4 h-4", status.color)} />
                                    <span>{status.label}</span>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Attached Files List */}
                  {attachedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Attached Files ({attachedFiles.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {attachedFiles.map((file, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="flex items-center gap-2 py-1.5 px-3"
                          >
                            {getFileIcon(file.name)}
                            <span className="max-w-[150px] truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(file.size)})
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAttachedFile(index)}
                              className="ml-1 hover:text-destructive transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      accept={ATTACHMENT_VALID_EXTENSIONS.join(',')}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      Attach File
                    </Button>
                    <Button onClick={handleSubmitReply} disabled={!reply.trim() || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Response
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <ConversationTimeline entries={timeline} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Meta Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requester Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
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
                  <p className="font-medium">{requestData.assignedOfficerName || 'Unassigned'}</p>
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

              {/* Priority - Dropdown if assigned officer, Badge if not */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  {isAssignedToMe && !isFinal ? (
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

          {/* Cancel Request Action - only for requester and non-final status */}
          {isRequester && !isFinal && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setIsCancelDialogOpen(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel Request
                </Button>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Transfer Dialog */}
      <TransferDialog open={isTransferOpen} onOpenChange={setIsTransferOpen} currentUnit={requestData.unitName} />

      {/* Take Ownership Confirmation Dialog */}
      <ConfirmationDialog
        open={isTakeOwnershipOpen}
        onOpenChange={setIsTakeOwnershipOpen}
        title="Take Ownership"
        description="Are you sure you want to take ownership of this request? You will be assigned as the responsible officer for this request."
        confirmLabel="Take Ownership"
        onConfirm={handleTakeOwnership}
        isLoading={isTakingOwnership}
      />

      {/* Cancel Request Confirmation Dialog */}
      <ConfirmationDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={handleCancelRequest}
        title="Are you sure you want to cancel this request?"
        description="This action cannot be undone. This will permanently cancel your request."
        confirmLabel="Yes, cancel request"
        isLoading={isSubmitting}
        variant="destructive"
      />
    </div>
  )
}
