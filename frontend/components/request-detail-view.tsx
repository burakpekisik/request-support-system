"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { ConversationTimeline } from "@/components/conversation-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { commonService } from "@/lib/api/common"
import { 
  getFullStaticUrl, 
  ATTACHMENT_VALID_EXTENSIONS, 
  ATTACHMENT_MAX_SIZE,
  statusIdMap,
  getInitials,
  formatDate,
  formatFileSize,
  getPriorityColorClass
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
  AlertCircle,
  X,
  FileText,
  File,
  Trash2
} from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog";

interface RequestDetailViewProps {
  requestId: string
}

export function RequestDetailView({ requestId }: RequestDetailViewProps) {
  const [requestData, setRequestData] = useState<RequestDetail | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Use constants for allowed extensions (remove leading dot for validation)
  const allowedExtensions = ATTACHMENT_VALID_EXTENSIONS.map(ext => ext.replace('.', ''))
  const maxFileSize = ATTACHMENT_MAX_SIZE

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
      // Student can only add comments, not change status - use current status
      await commonService.addResponse(requestId, {
        newStatusId: requestData.statusId,
        comment: reply,
      }, attachedFiles.length > 0 ? attachedFiles : undefined)

      // Refresh timeline
      const updatedTimeline = await commonService.getTimeline(requestId)
      setTimeline(updatedTimeline)

      // Clear form
      setReply("")
      setAttachedFiles([])
    } catch (err) {
      console.error('Failed to submit reply:', err)
      setError('Failed to submit reply. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <Link href="/student/requests">Back to My Requests</Link>
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
          <Link href="/student/requests">Back to My Requests</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/student/requests">
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
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(requestData.requesterName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{requestData.requesterName}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(requestData.createdAt)}</span>
                  </div>
                  <p className="text-foreground">{requestData.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Write Reply */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Write Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Write your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  className="resize-none"
                />

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
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setIsCancelDialogOpen(true)}
                  disabled={requestData.statusId === statusIdMap.cancelled}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
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
