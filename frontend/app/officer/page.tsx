"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/stats-card"
import { OfficerInboxPreview } from "@/components/officer-inbox-preview"
import { Inbox, CheckCircle, Clock, ArrowRightLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { officerService } from "@/lib/api/officer"
import type { OfficerDashboardStats } from "@/lib/api/types"

export default function OfficerDashboard() {
  const [stats, setStats] = useState<OfficerDashboardStats>({
    newRequests: 0,
    inProgress: 0,
    resolvedToday: 0,
    transferred: 0,
    newRequestsTrend: 0,
    resolvedTodayTrend: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const data = await officerService.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error("Failed to load dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Officer Dashboard</h1>
          <p className="text-muted-foreground">Manage incoming requests and assignments</p>
        </div>
        <Button asChild>
          <Link href="/officer/inbox">View Inbox</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="New Requests" 
          value={stats.newRequests} 
          icon={Inbox} 
          trend={stats.newRequestsTrend !== 0 ? { 
            value: Math.abs(stats.newRequestsTrend), 
            isPositive: stats.newRequestsTrend < 0 
          } : undefined} 
        />
        <StatsCard 
          title="In Progress" 
          value={stats.inProgress} 
          icon={Clock} 
        />
        <StatsCard 
          title="Resolved Today" 
          value={stats.resolvedToday} 
          icon={CheckCircle} 
          trend={stats.resolvedTodayTrend !== 0 ? { 
            value: Math.abs(stats.resolvedTodayTrend), 
            isPositive: stats.resolvedTodayTrend > 0 
          } : undefined} 
        />
        <StatsCard 
          title="Transferred" 
          value={stats.transferred} 
          icon={ArrowRightLeft} 
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Inbox</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/officer/inbox">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <OfficerInboxPreview />
        </CardContent>
      </Card>
    </div>
  )
}
