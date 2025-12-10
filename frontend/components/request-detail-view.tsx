"use client"

import { useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { ConversationTimeline } from "@/components/conversation-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, User, Building2, Tag, Paperclip, Send, Loader2 } from "lucide-react"

interface RequestDetailViewProps {
  requestId: string
}

const requestData = {
  id: "1234",
  title: "Library Access Card Not Working",
  status: "in_progress" as const,
  category: "IT Support",
  unit: "Information Technology",
  priority: "Medium",
  createdAt: "December 5, 2024",
  assignedOfficer: "Mehmet Öztürk",
  description:
    "My library access card has stopped working since yesterday. I tried scanning it multiple times at different terminals but it always shows 'Invalid Card'. I need access to the library for my upcoming exams.",
}

export function RequestDetailView({ requestId }: RequestDetailViewProps) {
  const [reply, setReply] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          <Link href="/student/requests">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{requestData.title}</h1>
            <StatusBadge status={requestData.status} />
          </div>
          <p className="text-muted-foreground mt-1">Request #{requestId}</p>
        </div>
      </div>

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
                  <AvatarFallback className="bg-primary text-primary-foreground">AY</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Ahmet Yılmaz</span>
                    <span className="text-xs text-muted-foreground">{requestData.createdAt}</span>
                  </div>
                  <p className="text-foreground">{requestData.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <ConversationTimeline />
            </CardContent>
          </Card>

          {/* Reply Box */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Write your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
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
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
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
                  <p className="font-medium">{requestData.unit}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Officer</p>
                  <p className="font-medium">{requestData.assignedOfficer}</p>
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
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-warning/20 text-warning-foreground text-sm font-medium">
                {requestData.priority}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
