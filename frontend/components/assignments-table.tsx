"use client"

import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Clock } from "lucide-react"

type Status =
  | "waiting"
  | "in_progress"
  | "waiting_response"
  | "resolved_successfully"
  | "resolved_negatively"
  | "cancelled"

interface Assignment {
  id: string
  title: string
  requester: string
  requesterInitials: string
  status: Status
  priority: "High" | "Medium" | "Low"
  category: string
  assignedDate: string
  lastActivity: string
}

const assignments: Assignment[] = [
  {
    id: "1240",
    title: "Email System Not Receiving Messages",
    requester: "Zeynep Kaya",
    requesterInitials: "ZK",
    status: "waiting",
    priority: "High",
    category: "IT Support",
    assignedDate: "Dec 7, 2024",
    lastActivity: "2 hours ago",
  },
  {
    id: "1238",
    title: "VPN Connection Issues",
    requester: "Ali Veli",
    requesterInitials: "AV",
    status: "in_progress",
    priority: "Medium",
    category: "IT Support",
    assignedDate: "Dec 6, 2024",
    lastActivity: "1 day ago",
  },
  {
    id: "1235",
    title: "Software Installation Request",
    requester: "Mehmet Demir",
    requesterInitials: "MD",
    status: "waiting_response",
    priority: "Low",
    category: "IT Support",
    assignedDate: "Dec 5, 2024",
    lastActivity: "3 days ago",
  },
  {
    id: "1230",
    title: "Printer Access Required",
    requester: "Fatma Celik",
    requesterInitials: "FC",
    status: "resolved_successfully",
    priority: "Low",
    category: "IT Support",
    assignedDate: "Dec 3, 2024",
    lastActivity: "5 days ago",
  },
  {
    id: "1228",
    title: "Password Reset for Lab Account",
    requester: "Ayse Yilmaz",
    requesterInitials: "AY",
    status: "resolved_negatively",
    priority: "Medium",
    category: "IT Support",
    assignedDate: "Dec 2, 2024",
    lastActivity: "6 days ago",
  },
  {
    id: "1225",
    title: "Network Access Request",
    requester: "Hasan Kara",
    requesterInitials: "HK",
    status: "cancelled",
    priority: "High",
    category: "IT Support",
    assignedDate: "Dec 1, 2024",
    lastActivity: "1 week ago",
  },
]

const priorityColors = {
  High: "text-destructive bg-destructive/10",
  Medium: "text-warning-foreground bg-warning/10",
  Low: "text-muted-foreground bg-muted",
}

export function AssignmentsTable() {
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
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      #{assignment.id} • {assignment.category}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {assignment.requesterInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assignment.requester}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={assignment.status} />
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${priorityColors[assignment.priority]}`}>
                    {assignment.priority}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{assignment.assignedDate}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {assignment.lastActivity}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/officer/requests/${assignment.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
