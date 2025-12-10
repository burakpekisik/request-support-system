"use client"

import { useState } from "react"
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

const inboxItems = [
  {
    id: "1240",
    title: "Email System Not Receiving Messages",
    description: "My university email has stopped receiving new messages since yesterday morning...",
    requester: "Zeynep Kaya",
    initials: "ZK",
    status: "pending" as const,
    priority: "High",
    date: "Dec 7, 2024",
    time: "10:30 AM",
    unread: true,
  },
  {
    id: "1239",
    title: "Projector Not Working in Room 301",
    description: "The projector in lecture hall 301 is not displaying any image when connected...",
    requester: "Ali Demir",
    initials: "AD",
    status: "pending" as const,
    priority: "Medium",
    date: "Dec 7, 2024",
    time: "8:15 AM",
    unread: true,
  },
  {
    id: "1238",
    title: "Software Installation Request - MATLAB",
    description: "I need MATLAB installed on my department computer for research work...",
    requester: "Fatma Yıldız",
    initials: "FY",
    status: "in_progress" as const,
    priority: "Low",
    date: "Dec 6, 2024",
    time: "3:45 PM",
    unread: false,
  },
  {
    id: "1237",
    title: "Network Connectivity Issues in Building C",
    description: "Multiple computers in Building C, Floor 2 are experiencing intermittent network...",
    requester: "Emre Can",
    initials: "EC",
    status: "in_progress" as const,
    priority: "High",
    date: "Dec 6, 2024",
    time: "11:20 AM",
    unread: false,
  },
  {
    id: "1236",
    title: "Printer Setup Request",
    description: "Need to set up the new network printer in the faculty office...",
    requester: "Ayşe Şahin",
    initials: "AŞ",
    status: "pending" as const,
    priority: "Low",
    date: "Dec 5, 2024",
    time: "2:00 PM",
    unread: false,
  },
]

const priorityColors = {
  High: "bg-destructive/20 text-destructive border-destructive/30",
  Medium: "bg-warning/20 text-warning-foreground border-warning/30",
  Low: "bg-muted text-muted-foreground border-muted",
}

export function OfficerInboxList() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  return (
    <Card>
      <CardContent className="p-0 divide-y divide-border">
        {inboxItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors",
              item.unread && "bg-primary/5",
            )}
          >
            <Avatar className="h-10 w-10 mt-1">
              <AvatarFallback className="bg-secondary text-secondary-foreground">{item.initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.unread && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    <Link href={`/officer/requests/${item.id}`} className="font-medium hover:text-primary truncate">
                      {item.title}
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-2">{item.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.requester}</span>
                    <span>•</span>
                    <span>#{item.id}</span>
                    <span>•</span>
                    <span>
                      {item.date} at {item.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn("text-xs", priorityColors[item.priority as keyof typeof priorityColors])}
                  >
                    {item.priority}
                  </Badge>
                  <StatusBadge status={item.status} />

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
                        Take Ownership
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
                        Cancel Request
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
