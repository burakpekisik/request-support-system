import { StatsCard } from "@/components/stats-card"
import { RecentRequestsTable } from "@/components/recent-requests-table"
import { Clock, CheckCircle, FileText, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StudentDashboard() {
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
        <StatsCard title="Active Requests" value={3} icon={Clock} trend={{ value: 12, isPositive: true }} />
        <StatsCard title="Pending Review" value={2} icon={AlertCircle} />
        <StatsCard title="Resolved" value={15} icon={CheckCircle} trend={{ value: 8, isPositive: true }} />
        <StatsCard title="Total Requests" value={20} icon={FileText} />
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
