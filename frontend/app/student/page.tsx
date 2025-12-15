"use client"

import { useEffect, useState } from "react"
import { getStudentDashboardStats } from "@/lib/api/student"
import { StudentDashboardStats } from "@/lib/api/types"
import { StatsCard } from "@/components/stats-card"
import { RecentRequestsTable } from "@/components/recent-requests-table"
import { Clock, AlertCircle, CheckCircle, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await getStudentDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        // Optionally, set an error state here to show a message to the user
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your requests and activity</p>
        </div>
        <Button asChild>
          <Link href="/student/new-request">New Request</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading || !stats ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatsCard title="Active Requests" value={stats.activeRequests} icon={Clock} />
            <StatsCard title="Pending Review" value={stats.pendingReview} icon={AlertCircle} />
            <StatsCard
              title="Resolved"
              value={stats.resolvedRequests}
              icon={CheckCircle}
              description={`${stats.resolvedRequestsPercentage.toFixed(1)}% of all requests`}
            />
            <StatsCard title="Total Requests" value={stats.totalRequests} icon={FileText} />
          </>
        )}
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Requests</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/student/requests">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <RecentRequestsTable />
        </CardContent>
      </Card>
    </div>
  )
}
