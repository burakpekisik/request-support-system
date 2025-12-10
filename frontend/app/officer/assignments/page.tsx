"use client"

import { useEffect, useState } from "react"
import { AssignmentsTable } from "@/components/assignments-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ClipboardList, Clock, CheckCircle } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { officerService } from "@/lib/api/officer"
import type { OfficerAssignmentStats, RequestFilters } from "@/lib/api/types"

export default function OfficerAssignmentsPage() {
  const [stats, setStats] = useState<OfficerAssignmentStats>({
    totalAssigned: 0,
    pendingAction: 0,
    resolvedThisWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<RequestFilters>({
    status: "all",
    priority: "all",
    search: "",
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await officerService.getAssignmentStats()
      setStats(data)
    } catch (error) {
      console.error("Failed to load assignment stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }))
  }

  const handlePriorityChange = (value: string) => {
    setFilters(prev => ({ ...prev, priority: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Assignments</h1>
        <p className="text-muted-foreground">Requests assigned to you for handling</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          title="Total Assigned" 
          value={loading ? "-" : stats.totalAssigned} 
          description="All requests assigned to you" 
          icon={ClipboardList} 
        />
        <StatsCard
          title="Pending Action"
          value={loading ? "-" : stats.pendingAction}
          description="Require your attention"
          icon={Clock}
        />
        <StatsCard
          title="Resolved This Week"
          value={loading ? "-" : stats.resolvedThisWeek}
          description="Successfully handled"
          icon={CheckCircle}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search assignments..." 
            className="pl-9" 
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="waiting_response">Waiting Response</SelectItem>
            <SelectItem value="resolved_successfully">Resolved Successfully</SelectItem>
            <SelectItem value="resolved_negatively">Resolved Negatively</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AssignmentsTable filters={filters} />
    </div>
  )
}
