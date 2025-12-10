import { StatsCard } from "@/components/stats-card"
import { OfficerInboxPreview } from "@/components/officer-inbox-preview"
import { Inbox, CheckCircle, Clock, ArrowRightLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OfficerDashboard() {
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
        <StatsCard title="New Requests" value={8} icon={Inbox} trend={{ value: 5, isPositive: false }} />
        <StatsCard title="In Progress" value={12} icon={Clock} />
        <StatsCard title="Resolved Today" value={5} icon={CheckCircle} trend={{ value: 20, isPositive: true }} />
        <StatsCard title="Transferred" value={2} icon={ArrowRightLeft} />
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
