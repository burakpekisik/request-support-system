import { AdminRequestsTable } from "@/components/admin-requests-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Building2, FileText } from "lucide-react"
import { StatsCard } from "@/components/stats-card"

const units = [
  { name: "Information Technology", count: 45, pending: 12 },
  { name: "Student Affairs", count: 38, pending: 8 },
  { name: "Housing Services", count: 25, pending: 5 },
  { name: "Finance Department", count: 32, pending: 10 },
  { name: "Registrar", count: 28, pending: 6 },
  { name: "Facilities Management", count: 22, pending: 4 },
]

export default function AdminRequestsPage() {
  const totalRequests = units.reduce((acc, unit) => acc + unit.count, 0)
  const totalPending = units.reduce((acc, unit) => acc + unit.pending, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Requests</h1>
        <p className="text-muted-foreground">View and manage all requests across the system categorized by unit</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Requests"
          value={totalRequests.toString()}
          description="All requests in system"
          icon={FileText}
        />
        <StatsCard
          title="Pending Requests"
          value={totalPending.toString()}
          description="Awaiting resolution"
          icon={FileText}
          trend={{ value: 8, isPositive: false }}
        />
        <StatsCard
          title="Active Units"
          value={units.length.toString()}
          description="Departments handling requests"
          icon={Building2}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search all requests..." className="pl-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="waiting_response">Waiting Response</SelectItem>
            <SelectItem value="resolved_successfully">Resolved Successfully</SelectItem>
            <SelectItem value="resolved_negatively">Resolved Negatively</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.name} value={unit.name.toLowerCase().replace(/\s+/g, "-")}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs by Unit */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-2">
          <TabsTrigger value="all" className="gap-2">
            All Units
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{totalRequests}</span>
          </TabsTrigger>
          {units.map((unit) => (
            <TabsTrigger key={unit.name} value={unit.name.toLowerCase().replace(/\s+/g, "-")} className="gap-2">
              {unit.name}
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{unit.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <AdminRequestsTable filter="all" />
        </TabsContent>
        {units.map((unit) => (
          <TabsContent key={unit.name} value={unit.name.toLowerCase().replace(/\s+/g, "-")}>
            <AdminRequestsTable filter={unit.name} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
