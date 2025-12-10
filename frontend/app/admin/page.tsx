import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, FileText, CheckCircle, Clock, TrendingUp, Building2 } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={1247} icon={Users} trend={{ value: 12, isPositive: true }} />
        <StatsCard title="Total Requests" value={3842} icon={FileText} trend={{ value: 8, isPositive: true }} />
        <StatsCard title="Resolved This Month" value={892} icon={CheckCircle} trend={{ value: 15, isPositive: true }} />
        <StatsCard title="Pending Requests" value={156} icon={Clock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Requests by Unit</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/requests">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { unit: "Information Technology", count: 234, percentage: 35 },
                { unit: "Student Affairs", count: 156, percentage: 23 },
                { unit: "Finance Department", count: 98, percentage: 15 },
                { unit: "Housing Services", count: 87, percentage: 13 },
                { unit: "Facilities", count: 67, percentage: 10 },
              ].map((item) => (
                <div key={item.unit} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.unit}</span>
                    <span className="text-muted-foreground">{item.count} requests</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New request submitted", user: "Zeynep Kaya", time: "2 min ago", icon: FileText },
                { action: "Request resolved", user: "Mehmet Öztürk", time: "15 min ago", icon: CheckCircle },
                { action: "New user registered", user: "Ali Demir", time: "1 hour ago", icon: Users },
                { action: "Request transferred", user: "Fatma Yıldız", time: "2 hours ago", icon: Building2 },
                { action: "Priority updated", user: "Admin", time: "3 hours ago", icon: TrendingUp },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
