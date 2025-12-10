"use client"

import { useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { ConversationTimeline } from "@/components/conversation-timeline"
import { TransferDialog } from "@/components/transfer-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"

interface OfficerRequestDetailProps {
  requestId: string
}

const statusOptions = [
  { value: "waiting", label: "Waiting", icon: Clock, color: "text-yellow-600" },
  { value: "in_progress", label: "In Progress", icon: Play, color: "text-blue-600" },
  { value: "waiting_response", label: "Waiting Response", icon: MessageSquare, color: "text-orange-600" },
  { value: "resolved_successfully", label: "Resolved Successfully", icon: CheckCircle, color: "text-green-600" },
  { value: "resolved_negatively", label: "Resolved Negatively", icon: XCircle, color: "text-red-600" },
  { value: "cancelled", label: "Cancelled", icon: Ban, color: "text-muted-foreground" },
]

const requestData = {
  id: "1240",
  title: "Email System Not Receiving Messages",
  status: "waiting" as const,
  category: "IT Support",
  unit: "Information Technology",
  priority: "High",
  createdAt: "December 7, 2024",
  requester: "Zeynep Kaya",
  requesterEmail: "zeynep.kaya@university.edu",
  description:
    "My university email has stopped receiving new messages since yesterday morning. I've checked my spam folder and it's empty. I need this fixed urgently as I'm expecting important course-related emails.",
}

export function OfficerRequestDetail({ requestId }: OfficerRequestDetailProps) {
  const [reply, setReply] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(requestData.status)
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  const handleSubmitReply = async () => {
    if (!reply.trim()) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setReply("")
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/officer/inbox">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{requestData.title}</h1>
            <StatusBadge status={selectedStatus} />
          </div>
          <p className="text-muted-foreground mt-1">Request #{requestId}</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Take Ownership
            </Button>
            <Button variant="outline" onClick={() => setIsTransferOpen(true)}>
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Transfer
            </Button>
            <div className="flex-1" />
            <Select defaultValue="high">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
                  <AvatarFallback className="bg-secondary text-secondary-foreground">ZK</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{requestData.requester}</span>
                    <span className="text-xs text-muted-foreground">{requestData.createdAt}</span>
                  </div>
                  <p className="text-foreground">{requestData.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                {/* Status Selection in Response Section */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium mb-2 block">Update Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <status.icon className={cn("w-4 h-4", status.color)} />
                              <span>{status.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
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

          {/* Conversation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <ConversationTimeline />
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
                  <AvatarFallback className="bg-secondary text-secondary-foreground">ZK</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{requestData.requester}</p>
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
                  <p className="font-medium">{requestData.unit}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Officer</p>
                  <p className="font-medium">Unassigned</p>
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
                  <p className="font-medium">{requestData.createdAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-destructive/20 text-destructive text-sm font-medium">
                {requestData.priority}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transfer Dialog */}
      <TransferDialog open={isTransferOpen} onOpenChange={setIsTransferOpen} currentUnit={requestData.unit} />
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}
